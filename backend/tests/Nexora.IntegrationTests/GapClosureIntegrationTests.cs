using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class GapClosureIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public GapClosureIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task ApiKeys_CreateListRevoke_ShouldWorkEndToEnd()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/api-keys")
        {
            Content = JsonContent.Create(new { name = "CI Integration Key", scopes = "leads:read,cms:read" })
        };
        createReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var createRes = await client.SendAsync(createReq);
        createRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetGuid();
        created.GetProperty("plaintextKey").GetString()!.ShouldStartWith("nxk_live_");

        var listRes = await client.GetAsync("/api/v1/admin/api-keys");
        listRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var listJson = await listRes.Content.ReadAsStringAsync();
        listJson.ShouldContain("CI Integration Key");

        var delReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/v1/admin/api-keys/{id}");
        delReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var delRes = await client.SendAsync(delReq);
        delRes.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ClientCrmExtensions_InvoicesMilestonesDocumentsPortal_ShouldWorkEndToEnd()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        // Create client
        var createClientReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/clients")
        {
            Content = JsonContent.Create(new
            {
                name = "Acme GapClosure Corp",
                primaryContactEmail = $"acme_{Guid.NewGuid():N}@acme.test",
                region = "in"
            })
        };
        createClientReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var clientRes = await client.SendAsync(createClientReq);
        clientRes.StatusCode.ShouldBe(HttpStatusCode.Created);
        var clientPayload = await clientRes.Content.ReadFromJsonAsync<JsonElement>();
        var clientId = clientPayload.GetProperty("clientId").GetGuid();

        // Create invoice
        var invReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/clients/{clientId}/invoices")
        {
            Content = JsonContent.Create(new { amount = 125000m, currency = "INR", status = 3, description = "Q4 Retainer" })
        };
        invReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var invRes = await client.SendAsync(invReq);
        invRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Create milestone
        var msReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/clients/{clientId}/milestones")
        {
            Content = JsonContent.Create(new { title = "Phase 1 Funnel Launch", status = 2 })
        };
        msReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var msRes = await client.SendAsync(msReq);
        msRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Create document
        var docReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/clients/{clientId}/documents")
        {
            Content = JsonContent.Create(new { title = "MSA Agreement", fileUrl = "https://nexora.local/msa.pdf", category = "Contract" })
        };
        docReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var docRes = await client.SendAsync(docReq);
        docRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // Generate portal link & access public portal
        var portalReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/clients/{clientId}/portal-link")
        {
            Content = JsonContent.Create(new { enabled = true })
        };
        portalReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var portalRes = await client.SendAsync(portalReq);
        portalRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var portalJson = await portalRes.Content.ReadFromJsonAsync<JsonElement>();
        var portalToken = portalJson.GetProperty("portalToken").GetString();
        portalToken.ShouldNotBeNullOrWhiteSpace();

        var anonClient = _factory.CreateClient();
        var publicPortalRes = await anonClient.GetAsync($"/api/v1/public/client-portal/{portalToken}");
        publicPortalRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var publicBody = await publicPortalRes.Content.ReadAsStringAsync();
        publicBody.ShouldContain("Acme GapClosure Corp");
        publicBody.ShouldContain("Phase 1 Funnel Launch");

        // Dashboard analytics should reflect invoice revenue
        var analyticsRes = await client.GetAsync("/api/v1/admin/dashboard/analytics");
        analyticsRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var analyticsJson = await analyticsRes.Content.ReadFromJsonAsync<JsonElement>();
        analyticsJson.GetProperty("revenue").GetProperty("totalPaid").GetDecimal().ShouldBeGreaterThanOrEqualTo(125000m);
    }

    [Fact]
    public async Task LeadsBulkAndFollowUp_ShouldPersistInDatabase()
    {
        var (client, xsrfToken) = await CreateAuthenticatedAdminClientAsync();

        Guid leadId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var lead = new Lead("contact", "Bulk Test User", $"bulk_{Guid.NewGuid():N}@corp.com", null, "Corp", "in", null, null, "{}", true, "v1");
            db.Leads.Add(lead);
            await db.SaveChangesAsync();
            leadId = lead.Id;
        }

        // Schedule follow-up
        var followReq = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/admin/leads/{leadId}/follow-up")
        {
            Content = JsonContent.Create(new { nextFollowUpAtUtc = DateTime.UtcNow.AddDays(2), followUpNote = "Send revised proposal" })
        };
        followReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var followRes = await client.SendAsync(followReq);
        followRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Bulk status update
        var bulkReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/leads/bulk")
        {
            Content = JsonContent.Create(new { leadIds = new[] { leadId }, action = "status", status = (int)LeadStatus.Qualified })
        };
        bulkReq.Headers.Add("X-XSRF-TOKEN", xsrfToken);
        var bulkRes = await client.SendAsync(bulkReq);
        bulkRes.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task BackupsList_ShouldReturnOk()
    {
        var (client, _) = await CreateAuthenticatedAdminClientAsync();
        var res = await client.GetAsync("/api/v1/admin/backups");
        res.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    private async Task<(HttpClient Client, string XsrfToken)> CreateAuthenticatedAdminClientAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var adminEmail = $"admin_gap_{Guid.NewGuid():N}@nexora.local";
        var (_, _, _, token) = await idService.InviteUserAsync(adminEmail, "Admin Gap Tester", Roles.Owner);
        await idService.ResetPasswordAsync(adminEmail, token!, "AdminPass@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        var loginRes = await client.PostAsJsonAsync("/api/v1/auth/login", new Nexora.Application.Identity.Models.LoginRequestDto(adminEmail, "AdminPass@123", false));
        loginRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        var csrfRes = await client.GetAsync("/api/v1/auth/csrf");
        csrfRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var csrfData = await csrfRes.Content.ReadFromJsonAsync<CsrfResponse>();
        return (client, csrfData?.Token ?? string.Empty);
    }

    private sealed record CsrfResponse(string Token, string HeaderName, string CookieName);
}
