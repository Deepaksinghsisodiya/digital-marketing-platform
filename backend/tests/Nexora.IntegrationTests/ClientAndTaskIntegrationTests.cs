using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Clients.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Application.Identity.Models;
using Nexora.Application.Leads.DTOs;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class ClientAndTaskIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public ClientAndTaskIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task CreateClient_ShouldCreateClient_PrimaryContact_AndAuditLog()
    {
        var (client, xsrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);
        var uniqueEmail = $"corp_{Guid.NewGuid():N}@cliententerprise.com";

        var payload = new CreateClientRequest(
            Name: "Apex Cloud Solutions",
            PrimaryContactEmail: uniqueEmail,
            PrimaryContactPhone: "+91 9988776655",
            Website: "https://apexcloud.example",
            Industry: "Information Technology",
            Region: "in",
            BillingAddress: "Cyber City, DLF Phase 2, Gurugram",
            TaxId: "06AAACA1234A1Z5",
            Notes: "High-value enterprise target account.");

        var req = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/clients")
        {
            Content = JsonContent.Create(payload)
        };
        req.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var response = await client.SendAsync(req);
        response.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Verify in DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var savedClient = await db.Clients
            .Include(c => c.Contacts)
            .Include(c => c.Activities)
            .FirstOrDefaultAsync(c => c.PrimaryContactEmail == uniqueEmail);

        savedClient.ShouldNotBeNull();
        savedClient.Name.ShouldBe("Apex Cloud Solutions");
        savedClient.Region.ShouldBe("in");
        savedClient.Contacts.Count.ShouldBe(1);
        savedClient.Contacts.First().IsPrimary.ShouldBeTrue();
        savedClient.Activities.Count.ShouldBeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task UpdateClient_ShouldUpdateClientDetails_AndRecordAuditLog()
    {
        var (client, xsrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);
        var uniqueEmail = $"corp_update_{Guid.NewGuid():N}@enterprise.com";

        // Create client first
        var createPayload = new CreateClientRequest(
            Name: "Initial Client Name",
            PrimaryContactEmail: uniqueEmail,
            PrimaryContactPhone: "+91 9900112233",
            Website: "https://initial.example",
            Industry: "Technology",
            Region: "in",
            BillingAddress: "Sector 29, Gurugram",
            TaxId: "06AABB1234C1Z1",
            Notes: "Initial note.");

        var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/clients")
        {
            Content = JsonContent.Create(createPayload)
        };
        createReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var createResp = await client.SendAsync(createReq);
        createResp.StatusCode.ShouldBe(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var savedClient = await db.Clients.FirstAsync(c => c.PrimaryContactEmail == uniqueEmail);

        // Update client
        var updatePayload = new UpdateClientRequest(
            Name: "Updated Client Name Enterprise",
            Website: "https://updated.example",
            Industry: "FinTech",
            Region: "us",
            BillingAddress: "Wall Street, New York",
            TaxId: "US-123456789",
            Notes: "Updated note after expansion.");

        var updateReq = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/admin/clients/{savedClient.Id}")
        {
            Content = JsonContent.Create(updatePayload)
        };
        updateReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var updateResp = await client.SendAsync(updateReq);
        updateResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify update in DB
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var updated = await verifyDb.Clients.FindAsync(savedClient.Id);
        updated.ShouldNotBeNull();
        updated.Name.ShouldBe("Updated Client Name Enterprise");
        updated.Industry.ShouldBe("FinTech");

        // Verify audit log
        var audit = await verifyDb.AuditLogs
            .FirstOrDefaultAsync(a => a.ResourceType == "Client" && a.ResourceId == savedClient.Id.ToString() && a.Action == "Client.Updated");
        audit.ShouldNotBeNull();
        audit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task ConvertLeadToClient_ShouldTransitionLead_CreateClient_AndInitialTask()
    {
        var (client, xsrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);
        var leadEmail = $"lead_convert_{Guid.NewGuid():N}@convert.com";

        // 1. Submit lead via public endpoint
        var pubClient = _factory.CreateClient();
        var formDefRes = await pubClient.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var submitRes = await pubClient.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", new SubmitFormRequest(
            FullName: "Satish Kumar",
            Email: leadEmail,
            Phone: "+91 9123456780",
            Company: "Zenith Retailers",
            Region: "in",
            State: "Maharashtra",
            PostalCode: "400001",
            CustomFields: new Dictionary<string, object?> { ["budget"] = "$25k-$50k" },
            UtmSource: "linkedin",
            UtmCampaign: "enterprise_q4",
            ConsentGiven: true,
            ConsentWordingVersion: "v1.0",
            Honeypot: null,
            TimeTrapToken: formDef.TimeTrapToken));

        submitRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        Guid leadId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var lead = await db.Leads.FirstAsync(l => l.Email == leadEmail);
            leadId = lead.Id;
        }

        // 2. Convert lead to client
        var convertReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/leads/{leadId}/convert")
        {
            Content = JsonContent.Create(new ConvertLeadToClientRequest(
                ClientName: "Zenith Retail Enterprises Pvt Ltd",
                Industry: "E-Commerce & Retail",
                TaxId: "27AABCT1334M1ZV",
                InitialTaskTitle: "Send Master Services Agreement",
                InitialTaskDueDateUtc: DateTime.UtcNow.AddDays(3)))
        };
        convertReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var convertRes = await client.SendAsync(convertReq);
        convertRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 3. Verify in DB
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var updatedLead = await db.Leads
                .Include(l => l.Activities)
                .FirstAsync(l => l.Id == leadId);

            updatedLead.Status.ShouldBe(LeadStatus.Closed);
            updatedLead.Activities.ShouldContain(a => a.ActivityType == "ConvertedToClient");

            var newClient = await db.Clients
                .Include(c => c.Contacts)
                .Include(c => c.Tasks)
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.ConvertedFromLeadId == leadId);

            newClient.ShouldNotBeNull();
            newClient.Name.ShouldBe("Zenith Retail Enterprises Pvt Ltd");
            newClient.Industry.ShouldBe("E-Commerce & Retail");
            newClient.Contacts.Count.ShouldBe(1);
            newClient.Contacts.First().FullName.ShouldBe("Satish Kumar");

            newClient.Tasks.Count.ShouldBe(1);
            newClient.Tasks.First().Title.ShouldBe("Send Master Services Agreement");
            newClient.Tasks.First().Priority.ShouldBe(TaskPriority.High);
        }

        // 4. Duplicate conversion attempt should fail with 400
        var dupReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/leads/{leadId}/convert")
        {
            Content = JsonContent.Create(new ConvertLeadToClientRequest())
        };
        dupReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);

        var dupRes = await client.SendAsync(dupReq);
        dupRes.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Tasks_Create_And_FilterOverdue_ShouldFunctionCorrectly()
    {
        var (client, xsrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        // Create overdue task
        var overdueReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/tasks")
        {
            Content = JsonContent.Create(new CreateTaskRequest(
                Title: "Urgent Review Overdue Contract",
                DueDateUtc: DateTime.UtcNow.AddDays(-2),
                Priority: TaskPriority.Urgent))
        };
        overdueReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var createOverdueRes = await client.SendAsync(overdueReq);
        createOverdueRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Create future task
        var futureReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/tasks")
        {
            Content = JsonContent.Create(new CreateTaskRequest(
                Title: "Future Follow-up Discussion",
                DueDateUtc: DateTime.UtcNow.AddDays(5),
                Priority: TaskPriority.Medium))
        };
        futureReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var createFutureRes = await client.SendAsync(futureReq);
        createFutureRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Query overdue only
        var overdueQueryRes = await client.GetAsync("/api/v1/admin/tasks?overdueOnly=true");
        overdueQueryRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        var tasks = await overdueQueryRes.Content.ReadFromJsonAsync<PaginatedResult<TaskItemDto>>();
        tasks.ShouldNotBeNull();
        tasks.Items.ShouldContain(t => t.Title == "Urgent Review Overdue Contract");
        tasks.Items.ShouldNotContain(t => t.Title == "Future Follow-up Discussion");
    }

    [Fact]
    public async Task PermissionMatrix_ClientsAndTasks_EditorForbidden_SalesAllowed()
    {
        // 1. Editor should get 403 Forbidden
        var (editorClient, editorXsrf) = await CreateAuthenticatedClientAsync(Roles.Editor);

        var editorGetClients = await editorClient.GetAsync("/api/v1/admin/clients");
        editorGetClients.StatusCode.ShouldBe(HttpStatusCode.Forbidden);

        var editorGetTasks = await editorClient.GetAsync("/api/v1/admin/tasks");
        editorGetTasks.StatusCode.ShouldBe(HttpStatusCode.Forbidden);

        // 2. Sales should get 200 OK
        var (salesClient, salesXsrf) = await CreateAuthenticatedClientAsync(Roles.Sales);

        var salesGetClients = await salesClient.GetAsync("/api/v1/admin/clients");
        salesGetClients.StatusCode.ShouldBe(HttpStatusCode.OK);

        var salesGetTasks = await salesClient.GetAsync("/api/v1/admin/tasks");
        salesGetTasks.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    private async Task<(HttpClient Client, string XsrfToken)> CreateAuthenticatedClientAsync(string role)
    {
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var email = $"crm_user_{Guid.NewGuid():N}@nexora.local";
        var (_, _, _, token) = await idService.InviteUserAsync(email, "CRM User", role);
        await idService.ResetPasswordAsync(email, token!, "SecurePass@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });

        // Login
        var loginRes = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(email, "SecurePass@123", false));
        loginRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Obtain CSRF token after login
        var csrfRes = await client.GetAsync("/api/v1/auth/csrf");
        csrfRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var csrfData = await csrfRes.Content.ReadFromJsonAsync<CsrfResponse>();
        var xsrfToken = csrfData?.Token ?? string.Empty;

        return (client, xsrfToken);
    }

    private sealed record CsrfResponse(string Token, string HeaderName, string CookieName);
}

