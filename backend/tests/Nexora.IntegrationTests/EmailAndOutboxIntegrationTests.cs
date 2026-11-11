using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Email.DTOs;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class EmailAndOutboxIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public EmailAndOutboxIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task GetEmailTemplates_ShouldReturnSeededTemplates()
    {
        var (client, _) = await CreateAuthenticatedAdminClientAsync();

        var response = await client.GetAsync("/api/v1/admin/email-templates");
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var templates = await response.Content.ReadFromJsonAsync<List<EmailTemplateDto>>();
        templates.ShouldNotBeNull();
        templates.ShouldContain(t => t.Key == "lead-auto-reply");
        templates.ShouldContain(t => t.Key == "lead-internal-notification");
    }

    [Fact]
    public async Task UpdateEmailTemplate_ShouldUpdateSubjectAndBody()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        var updateReq = new HttpRequestMessage(HttpMethod.Put, "/api/v1/admin/email-templates/lead-auto-reply")
        {
            Content = JsonContent.Create(new UpdateEmailTemplateRequest(
                Name: "Lead Auto-Reply (Updated)",
                SubjectTemplate: "Updated: Thank you {{lead.name}} for reaching out to Nexora!",
                BodyHtmlTemplate: "<h2>Updated Greeting</h2><p>Dear {{lead.name}}, we received your inquiry.</p>",
                BodyPlainTextTemplate: "Dear {{lead.name}}, we received your inquiry.",
                IsActive: true))
        };
        updateReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var response = await client.SendAsync(updateReq);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify updated
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var t = await db.EmailTemplates.FirstOrDefaultAsync(x => x.Key == "lead-auto-reply");
        t.ShouldNotBeNull();
        t.SubjectTemplate.ShouldContain("Updated:");
    }

    [Fact]
    public async Task UpdateEmailTemplate_ShouldRecordAuditLog()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        var updateReq = new HttpRequestMessage(HttpMethod.Put, "/api/v1/admin/email-templates/lead-auto-reply")
        {
            Content = JsonContent.Create(new UpdateEmailTemplateRequest(
                Name: "Lead Auto-Reply (Audit Test)",
                SubjectTemplate: "Audit Subject",
                BodyHtmlTemplate: "<p>Audit Body</p>",
                BodyPlainTextTemplate: "Audit Body",
                IsActive: true))
        };
        updateReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var response = await client.SendAsync(updateReq);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var audit = await db.AuditLogs
            .FirstOrDefaultAsync(a => a.ResourceType == "EmailTemplate" && a.ResourceId == "lead-auto-reply" && a.Action == "EmailTemplate.Updated");
        audit.ShouldNotBeNull();
        audit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task ProcessOutboxMessages_ShouldSendEmailsAndRecordLogs()
    {
        var uniqueEmail = $"prospect_{Guid.NewGuid():N}@globaltech.org";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var outbox = new OutboxMessage(
                eventType: "LeadReceived",
                payloadJson: System.Text.Json.JsonSerializer.Serialize(new
                {
                    leadId = Guid.NewGuid(),
                    email = uniqueEmail,
                    fullName = "Sundar Pichai",
                    company = "Global Tech",
                    phone = "+1 650 253 0000",
                    region = "us"
                }));

            db.OutboxMessages.Add(outbox);
            await db.SaveChangesAsync();
        }

        // Process Outbox via processor service
        using (var scope = _factory.Services.CreateScope())
        {
            var processor = scope.ServiceProvider.GetRequiredService<IOutboxProcessor>();
            var processed = await processor.ProcessPendingMessagesAsync();
            processed.ShouldBeGreaterThan(0);
        }

        // Verify OutboxMessage status & EmailLog rows in DB
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var msg = await db.OutboxMessages
                .Where(o => o.PayloadJson.Contains(uniqueEmail))
                .FirstOrDefaultAsync();

            msg.ShouldNotBeNull();
            msg.ProcessedAtUtc.ShouldNotBeNull();

            var logs = await db.EmailLogs
                .Where(l => l.RecipientEmail == uniqueEmail)
                .ToListAsync();

            logs.Count.ShouldBeGreaterThanOrEqualTo(1);
            logs[0].Status.ShouldBe(EmailDeliveryStatus.Sent);
            logs[0].TemplateKey.ShouldBe("lead-auto-reply");
        }
    }

    [Fact]
    public async Task TestSendEmail_ShouldDeliverTestEmail()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        var testReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/email-templates/test-send")
        {
            Content = JsonContent.Create(new SendTestEmailRequest(
                ToEmail: "tester@nexora.local",
                TemplateKey: "lead-auto-reply",
                Variables: new Dictionary<string, string> { ["lead.name"] = "Alice Tester" }))
        };
        testReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var response = await client.SendAsync(testReq);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify EmailLog created
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var log = await db.EmailLogs
            .OrderByDescending(l => l.SentAtUtc)
            .FirstOrDefaultAsync(l => l.RecipientEmail == "tester@nexora.local");

        log.ShouldNotBeNull();
        log.Status.ShouldBe(EmailDeliveryStatus.Sent);
    }

    private async Task<(HttpClient Client, string XsrfToken)> CreateAuthenticatedAdminClientAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var adminEmail = $"admin_email_{Guid.NewGuid():N}@nexora.local";
        var (_, _, _, token) = await idService.InviteUserAsync(adminEmail, "Admin Email Tester", Roles.Owner);
        await idService.ResetPasswordAsync(adminEmail, token!, "AdminPass@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });

        // Login as owner
        var loginRes = await client.PostAsJsonAsync("/api/v1/auth/login", new Nexora.Application.Identity.Models.LoginRequestDto(adminEmail, "AdminPass@123", false));
        loginRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Get CSRF token AFTER login
        var csrfRes = await client.GetAsync("/api/v1/auth/csrf");
        csrfRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var csrfData = await csrfRes.Content.ReadFromJsonAsync<CsrfResponse>();
        var xsrfToken = csrfData?.Token ?? string.Empty;

        return (client, xsrfToken);
    }

    private sealed record CsrfResponse(string Token, string HeaderName, string CookieName);
}
