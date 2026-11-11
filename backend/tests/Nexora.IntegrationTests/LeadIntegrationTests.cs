using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
public class LeadIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public LeadIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task SubmitForm_WithValidData_ShouldCreateLead_Activity_AndOutbox()
    {
        var client = _factory.CreateClient();
        var uniqueEmail = $"lead_{Guid.NewGuid():N}@enterprise.com";

        // Obtain fresh server-issued time-trap token
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        formDefRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();
        formDef.TimeTrapToken.ShouldNotBeNullOrWhiteSpace();

        var payload = new SubmitFormRequest(
            FullName: "Satya Nadella",
            Email: uniqueEmail,
            Phone: "+91 9876543210",
            Company: "Enterprise Cloud Corp",
            Region: "in",
            State: "Karnataka",
            PostalCode: "560001",
            CustomFields: new Dictionary<string, object?> { ["budget"] = "$50k-$100k" },
            UtmSource: "google",
            UtmCampaign: "performance_max_q4",
            ConsentGiven: true,
            ConsentWordingVersion: "v1.2",
            Honeypot: null,
            TimeTrapToken: formDef.TimeTrapToken);

        var response = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<SubmitFormResponse>();
        result.ShouldNotBeNull();
        result.Success.ShouldBeTrue();
        result.SubmissionId.ShouldNotBeNull();
        result.ReferenceNumber.ShouldNotBeNull();
        result.ReferenceNumber.ShouldStartWith("NEX-");

        // Verify in Database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var lead = await db.Leads
            .Include(l => l.Activities)
            .FirstOrDefaultAsync(l => l.Email == uniqueEmail);

        lead.ShouldNotBeNull();
        lead.FullName.ShouldBe("Satya Nadella");
        lead.Company.ShouldBe("Enterprise Cloud Corp");
        lead.Region.ShouldBe("in");
        lead.Status.ShouldBe(LeadStatus.New);
        lead.ConsentGiven.ShouldBeTrue();
        lead.ReferenceNumber.ShouldBe(result.ReferenceNumber);
        lead.TimeTrapNonce.ShouldNotBeNullOrWhiteSpace();
        lead.Activities.Count.ShouldBeGreaterThanOrEqualTo(1);

        // Verify OutboxMessage
        var outbox = await db.OutboxMessages
            .FirstOrDefaultAsync(o => o.EventType == "LeadReceived" && o.PayloadJson.Contains(uniqueEmail));
        outbox.ShouldNotBeNull();
    }

    [Fact]
    public async Task SubmitForm_WithoutConsent_ShouldReturn400BadRequest()
    {
        var client = _factory.CreateClient();
        var payload = new SubmitFormRequest(
            FullName: "No Consent User",
            Email: $"noconsent_{Guid.NewGuid():N}@test.com",
            ConsentGiven: false);

        var response = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SubmitForm_WithHoneypot_ShouldSilentlyReturn200_WithoutSavingLead()
    {
        var client = _factory.CreateClient();
        var honeypotEmail = $"bot_{Guid.NewGuid():N}@spambot.xyz";
        var payload = new SubmitFormRequest(
            FullName: "Spam Bot",
            Email: honeypotEmail,
            ConsentGiven: true,
            Honeypot: "I am a hidden bot trap");

        var response = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify lead NOT saved in database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Email == honeypotEmail);
        lead.ShouldBeNull();
    }

    [Fact]
    public async Task AdminLeads_Workflow_StatusUpdate_AndNotes_ShouldTrackActivity()
    {
        // 1. Submit lead as public user
        var client = _factory.CreateClient();
        var formDef = await (await client.GetAsync("/api/v1/public/forms/contact")).Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var email = $"flow_lead_{Guid.NewGuid():N}@test.com";
        var submitRes = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", new SubmitFormRequest(
            FullName: "Flow Lead",
            Email: email,
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken));
        submitRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var submitData = await submitRes.Content.ReadFromJsonAsync<SubmitFormResponse>();
        var leadId = submitData!.SubmissionId!.Value;

        // 2. Setup Sales user
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var salesEmail = $"sales_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await idService.InviteUserAsync(salesEmail, "Sales Agent", Roles.Sales);
        await idService.ResetPasswordAsync(salesEmail, token!, "SalesPass@123");

        var salesClient = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });
        await salesClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(salesEmail, "SalesPass@123", false));

        // 3. View lead
        var getRes = await salesClient.GetAsync($"/api/v1/admin/leads/{leadId}");
        getRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var detail = await getRes.Content.ReadFromJsonAsync<LeadDetailDto>();
        detail.ShouldNotBeNull();
        detail.Status.ShouldBe(LeadStatus.New);

        var csrf = await salesClient.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        csrf.ShouldNotBeNull();

        // 4. Update status to InProgress with CSRF
        var patchReq = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/admin/leads/{leadId}/status")
        {
            Content = JsonContent.Create(new UpdateLeadStatusRequest(LeadStatus.InProgress))
        };
        patchReq.Headers.Add("X-XSRF-TOKEN", csrf.token);
        var patchRes = await salesClient.SendAsync(patchReq);
        patchRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 5. Add internal note with CSRF
        var noteReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/leads/{leadId}/notes")
        {
            Content = JsonContent.Create(new AddLeadNoteRequest("Spoke on call. Client interested in Enterprise SEO."))
        };
        noteReq.Headers.Add("X-XSRF-TOKEN", csrf.token);
        var noteRes = await salesClient.SendAsync(noteReq);
        noteRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 6. Verify lead detail after updates
        var afterRes = await salesClient.GetAsync($"/api/v1/admin/leads/{leadId}");
        var afterDetail = await afterRes.Content.ReadFromJsonAsync<LeadDetailDto>();
        afterDetail.ShouldNotBeNull();
        afterDetail.Status.ShouldBe(LeadStatus.InProgress);
        afterDetail.Activities.Count.ShouldBeGreaterThanOrEqualTo(3); // Created, StatusChanged, NoteAdded
    }

    [Fact]
    public async Task AdminLeads_ExportCsv_ShouldReturnValidCsvStream()
    {
        // 1. Setup Sales user
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var salesEmail = $"sales_export_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await idService.InviteUserAsync(salesEmail, "Sales Exporter", Roles.Sales);
        await idService.ResetPasswordAsync(salesEmail, token!, "SalesPass@123");

        var salesClient = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });
        await salesClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(salesEmail, "SalesPass@123", false));

        // 2. Request CSV export
        var exportRes = await salesClient.GetAsync("/api/v1/admin/leads/export");
        exportRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        exportRes.Content.Headers.ContentType?.MediaType.ShouldBe("text/csv");

        var csv = await exportRes.Content.ReadAsStringAsync();
        csv.ShouldContain("ID,Date (UTC),Full Name,Email,Phone,Company,Region,State,Status,UTM Source,UTM Campaign");
    }

    [Fact]
    public async Task AdminLeads_ExportCsv_FormulaInjectionSanitization_ShouldPrefixFormulas()
    {
        using var scope = _factory.Services.CreateScope();
        var leadService = scope.ServiceProvider.GetRequiredService<ILeadService>();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var formDef = await leadService.GetPublicFormAsync("contact");

        // Submit malicious lead with Excel formula triggers
        var maliciousName = "=cmd|'/c calc'!A0";
        var maliciousCompany = "@SUM(1+1)*cmd";
        var payload = new SubmitFormRequest(
            FullName: maliciousName,
            Email: $"inject_{Guid.NewGuid():N}@safe.com",
            Phone: "+91 9988776655",
            Company: maliciousCompany,
            Region: "in",
            State: "Delhi",
            PostalCode: "110001",
            CustomFields: [],
            UtmSource: null,
            UtmCampaign: null,
            ConsentGiven: true,
            ConsentWordingVersion: "v1.0",
            Honeypot: null,
            TimeTrapToken: formDef!.TimeTrapToken);

        await leadService.SubmitFormAsync(
            formKey: "contact",
            request: payload,
            ipAddress: "127.0.0.1",
            userAgent: "Test");

        // Request export
        var salesEmail = $"sales_sec_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await idService.InviteUserAsync(salesEmail, "Security Auditor", Roles.Sales);
        await idService.ResetPasswordAsync(salesEmail, token!, "SalesPass@123");

        var salesClient = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { HandleCookies = true });
        await salesClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(salesEmail, "SalesPass@123", false));

        var exportRes = await salesClient.GetAsync("/api/v1/admin/leads/export");
        exportRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var csv = await exportRes.Content.ReadAsStringAsync();

        // Formula injection prefixes with single quote: "'=cmd" and "'@SUM"
        csv.ShouldContain("\"'=cmd|'/c calc'!A0\"");
        csv.ShouldContain("\"'@SUM(1+1)*cmd\"");
    }

    [Fact]
    public async Task PermissionMatrix_Leads_EditorForbidden_SalesAllowed_AnonymousUnauthorized()
    {
        // 1. Anonymous -> 401
        var anonClient = _factory.CreateClient();
        (await anonClient.GetAsync("/api/v1/admin/leads")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await anonClient.GetAsync("/api/v1/admin/leads/export")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);

        // 2. Editor -> 403 (Editor only has pages.* permissions, not leads.*)
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var editorEmail = $"editor_leads_{Guid.NewGuid():N}@example.com";
        var (_, _, _, eToken) = await idService.InviteUserAsync(editorEmail, "Editor User", Roles.Editor);
        await idService.ResetPasswordAsync(editorEmail, eToken!, "EditorPass@123");

        var editorClient = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });
        await editorClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(editorEmail, "EditorPass@123", false));

        (await editorClient.GetAsync("/api/v1/admin/leads")).StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await editorClient.GetAsync("/api/v1/admin/leads/export")).StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetPublicForm_ShouldReturnPublicDto_WithoutLeakingInternalSettings()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/public/forms/contact");
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var rawJson = await response.Content.ReadAsStringAsync();

        // Must contain public fields
        rawJson.ShouldContain("formKey");
        rawJson.ShouldContain("contact");
        rawJson.ShouldContain("timeTrapToken");
        rawJson.ShouldContain("schemaJson");

        // CRITICAL LEAK TEST: Must NOT contain internal settings, emails, or webhooks
        rawJson.ShouldNotContain("receiverEmails");
        rawJson.ShouldNotContain("contact-intake@example.com");
        rawJson.ShouldNotContain("notifyOnSubmission");
        rawJson.ShouldNotContain("webhookUrl");
    }

    [Fact]
    public async Task GetPublicForm_InactiveForm_ShouldReturn404NotFound()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inactiveKey = $"inactive_{Guid.NewGuid():N}";
        var inactiveForm = new FormDefinition(
            formKey: inactiveKey,
            name: "Inactive Form",
            schemaJson: "[]",
            settingsJson: "{}");
        inactiveForm.Update("Inactive Form", "[]", "{}", null, null, isActive: false);

        db.FormDefinitions.Add(inactiveForm);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/public/forms/{inactiveKey}");
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SubmitForm_Idempotency_SameKey_ShouldReturnOriginalResponse_WithoutDuplicateDbInsert()
    {
        var client = _factory.CreateClient();
        var idempotencyKey = $"idemp_{Guid.NewGuid():N}";
        var uniqueEmail = $"idemp_{Guid.NewGuid():N}@idemp.com";

        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Idempotent User",
            Email: uniqueEmail,
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken,
            IdempotencyKey: idempotencyKey);

        // First Submission
        var firstRes = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        firstRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var firstResult = await firstRes.Content.ReadFromJsonAsync<SubmitFormResponse>();
        firstResult.ShouldNotBeNull();
        firstResult.SubmissionId.ShouldNotBeNull();
        firstResult.ReferenceNumber.ShouldNotBeNull();

        // Second Submission with identical IdempotencyKey
        var secondRes = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        secondRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var secondResult = await secondRes.Content.ReadFromJsonAsync<SubmitFormResponse>();
        secondResult.ShouldNotBeNull();

        // Idempotent Match: exactly same SubmissionId and ReferenceNumber returned
        secondResult.SubmissionId.ShouldBe(firstResult.SubmissionId);
        secondResult.ReferenceNumber.ShouldBe(firstResult.ReferenceNumber);

        // Database must contain exactly ONE row for this idempotency key
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var count = await db.Leads.CountAsync(l => l.FormKey == "contact" && l.IdempotencyKey == idempotencyKey);
        count.ShouldBe(1);
    }

    [Fact]
    public async Task SubmitForm_WithTimeTrapToken_ShouldConsumeNonce_AndReplayAttemptShouldFail()
    {
        var client = _factory.CreateClient();

        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload1 = new SubmitFormRequest(
            FullName: "First Legitimate Submit",
            Email: $"replay1_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var firstRes = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload1);
        firstRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Attempting to reuse the exact same TimeTrapToken (nonce replay) must fail
        var payload2 = new SubmitFormRequest(
            FullName: "Replay Attempt Attack",
            Email: $"replay2_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var secondRes = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload2);
        secondRes.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var errJson = await secondRes.Content.ReadAsStringAsync();
        errJson.ShouldContain("Replay attack detected");
    }

    [Fact]
    public async Task SubmitForm_WithFastSubmission_ShouldRejectWith400()
    {
        // Enforce MinSubmissionSeconds: 5 with SkipTimeTrapMinAge: false
        using var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["SkipTimeTrapMinAge"] = "false",
                    ["SpamProtection:MinSubmissionSeconds"] = "5"
                });
            });
        });

        var client = customFactory.CreateClient();

        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Speedy Bot",
            Email: $"fast_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Submission completed too fast");
    }

    [Fact]
    public async Task SubmitForm_GeneratesUniqueReferenceNumber()
    {
        var client = _factory.CreateClient();

        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Ref Number Test",
            Email: $"ref_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await res.Content.ReadFromJsonAsync<SubmitFormResponse>();
        body.ShouldNotBeNull();
        body.ReferenceNumber.ShouldNotBeNull();
        body.ReferenceNumber.ShouldStartWith($"NEX-{DateTime.UtcNow:yyyyMMdd}-");
    }

    [Fact]
    public async Task SubmitForm_MapsToAllowlist_SanitizesCustomFields()
    {
        var client = _factory.CreateClient();

        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Alice Walker",
            Email: $"allowlist_{Guid.NewGuid():N}@test.com",
            Phone: "+91 9123456789",
            Company: "Acme Corp",
            Region: "in",
            State: "Maharashtra",
            PostalCode: "400001",
            CustomFields: new Dictionary<string, object?>
            {
                ["serviceOfInterest"] = "CustomValue123",
                ["budget"] = 42
            },
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.OK);

        var result = await res.Content.ReadFromJsonAsync<SubmitFormResponse>();
        result.ShouldNotBeNull();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var lead = await db.Leads.FindAsync(result.SubmissionId);

        lead.ShouldNotBeNull();
        lead.FullName.ShouldBe("Alice Walker");
        lead.State.ShouldBe("Maharashtra");
        lead.PostalCode.ShouldBe("400001");
        lead.CustomFieldsJson.ShouldContain("CustomValue123");
        lead.CustomFieldsJson.ShouldContain("42");
    }

    [Fact]
    public async Task LegacyEndpoint_PublicLeads_ShouldReturn404NotFound()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/v1/public/leads");
        res.StatusCode.ShouldBe(HttpStatusCode.NotFound);

        var postRes = await client.PostAsJsonAsync("/api/v1/public/leads", new { });
        postRes.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SubmitForm_UnknownFieldInPayload_ShouldRejectWith400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Malicious User",
            Email: $"mal_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken,
            CustomFields: new Dictionary<string, object?>
            {
                ["unauthorizedField"] = "Inject"
            });

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Unknown or unauthorized field 'unauthorizedField'");
    }

    [Fact]
    public async Task SubmitForm_WithWrongFormKeyInToken_ShouldRejectWith400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        // Pass contact's token to a hypothetical other form or manipulate token formKey
        var parts = formDef.TimeTrapToken!.Split(':');
        var tamperedKeyToken = $"other_form:{parts[1]}:{parts[2]}:{parts[3]}";

        var payload = new SubmitFormRequest(
            FullName: "Wrong FormKey User",
            Email: $"wrongkey_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: tamperedKeyToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SubmitForm_WithTamperedSignature_ShouldRejectWith400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var parts = formDef.TimeTrapToken!.Split(':');
        var tamperedSigToken = $"{parts[0]}:{parts[1]}:{parts[2]}:0000000000000000000000000000000000000000000000000000000000000000";

        var payload = new SubmitFormRequest(
            FullName: "Tampered Sig User",
            Email: $"tamp_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: tamperedSigToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Token signature verification failed");
    }

    [Fact]
    public async Task SubmitForm_WithExpiredToken_ShouldRejectWith400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        // Construct expired token (> 86400 seconds)
        var parts = formDef.TimeTrapToken!.Split(':');
        var expiredTs = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - 90000;
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes("Nexora_Dev_Spam_Token_Secret_2026_Secure_Key"));
        var sig = Convert.ToHexStringLower(hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes($"contact:{expiredTs}:{parts[2]}")));
        var expiredToken = $"contact:{expiredTs}:{parts[2]}:{sig}";

        var payload = new SubmitFormRequest(
            FullName: "Expired Token User",
            Email: $"expired_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: expiredToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Token has expired");
    }

    [Fact]
    public async Task SubmitForm_OversizedPayload_ShouldReturn413Or400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var hugeName = new string('A', 500); // Exceeds 200 char limit
        var payload = new SubmitFormRequest(
            FullName: hugeName,
            Email: $"huge_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("maximum allowed length");
    }

    [Fact]
    public async Task SubmitForm_SelectInvalidOption_ShouldRejectWith400()
    {
        var client = _factory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Invalid Option User",
            Email: $"invalidopt_{Guid.NewGuid():N}@test.com",
            Region: "invalid_overlong_region_code",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Invalid region format");
    }

    [Fact]
    public void SpamTokenSecret_MissingInProduction_ShouldThrow()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["SPAM_TOKEN_SECRET"] = ""
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var audit = scope.ServiceProvider.GetRequiredService<IAuditLogService>();
        var clientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
        var logger = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Logging.ILogger<Nexora.Infrastructure.Services.LeadService>>();

        // Create prod env mock
        var prodEnv = new Microsoft.Extensions.Hosting.Internal.HostingEnvironment
        {
            EnvironmentName = "Production"
        };

        var scoring = new Nexora.Application.Leads.Services.LeadScoringService();
        var dispatcher = scope.ServiceProvider.GetRequiredService<Nexora.Application.Common.Interfaces.IWebhookDispatcher>();
        var leadService = new Nexora.Infrastructure.Services.LeadService(db, audit, config, clientFactory, prodEnv, logger, scoring, dispatcher);

        Should.Throw<InvalidOperationException>(() =>
        {
            leadService.GenerateTimeTrapToken("contact");
        }).Message.ShouldContain("SPAM_TOKEN_SECRET is required in Production");
    }

    [Fact]
    public async Task SubmitForm_Turnstile_InvalidToken_ShouldReturn400BadRequest()
    {
        var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddHttpClient("Turnstile")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockHttpMessageHandler(_ =>
                        new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent("{\"success\":false,\"error-codes\":[\"invalid-input-response\"]}", System.Text.Encoding.UTF8, "application/json")
                        }));
            });
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["SpamProtection:EnforceTurnstile"] = "true",
                    ["SkipTurnstileVerification"] = "false",
                    ["TURNSTILE_SECRET_KEY"] = "dummy_secret_key"
                });
            });
        });

        var client = customFactory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Invalid Turnstile User",
            Email: $"badturnstile_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken,
            TurnstileToken: "bad_token_value");

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Turnstile verification failed");
    }

    [Fact]
    public async Task SubmitForm_Turnstile_OutageFailClosed_ShouldReturn503ServiceUnavailable()
    {
        var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddHttpClient("Turnstile")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockHttpMessageHandler(_ =>
                        new HttpResponseMessage(HttpStatusCode.InternalServerError)));
            });
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["SpamProtection:EnforceTurnstile"] = "true",
                    ["SkipTurnstileVerification"] = "false",
                    ["SpamProtection:FailClosed"] = "true",
                    ["TURNSTILE_SECRET_KEY"] = "dummy_secret_key"
                });
            });
        });

        var client = customFactory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Outage Turnstile User",
            Email: $"outage_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken,
            TurnstileToken: "token_during_outage");

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.ServiceUnavailable);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("temporarily unavailable");
    }

    [Fact]
    public async Task SubmitForm_Turnstile_HostnameMismatch_ShouldReturn400BadRequest()
    {
        var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddHttpClient("Turnstile")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockHttpMessageHandler(_ =>
                        new HttpResponseMessage(HttpStatusCode.OK)
                        {
                            Content = new StringContent("{\"success\":true,\"hostname\":\"unauthorized-domain.com\"}", System.Text.Encoding.UTF8, "application/json")
                        }));
            });
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["SpamProtection:EnforceTurnstile"] = "true",
                    ["SkipTurnstileVerification"] = "false",
                    ["TURNSTILE_SECRET_KEY"] = "dummy_secret_key"
                });
            });
        });

        var client = customFactory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Hostname Mismatch User",
            Email: $"hostmismatch_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken,
            TurnstileToken: "valid_token_wrong_host");

        var res = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("not in the allowed domain list");
    }

    [Fact]
    public async Task SubmitForm_PublicFormRateLimit_ShouldReturn429TooManyRequests()
    {
        var customFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["RateLimiting:PublicFormPermitLimit"] = "2",
                    ["RateLimiting:WindowSeconds"] = "60"
                });
            });
        });

        var client = customFactory.CreateClient();
        var formDefRes = await client.GetAsync("/api/v1/public/forms/contact");
        var formDef = await formDefRes.Content.ReadFromJsonAsync<PublicFormDto>();
        formDef.ShouldNotBeNull();

        var payload = new SubmitFormRequest(
            FullName: "Rate Limit User",
            Email: $"ratelimit_{Guid.NewGuid():N}@test.com",
            ConsentGiven: true,
            TimeTrapToken: formDef.TimeTrapToken);

        // First 2 requests succeed or return standard response
        var res1 = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res1.StatusCode.ShouldNotBe(HttpStatusCode.TooManyRequests);

        var res2 = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res2.StatusCode.ShouldNotBe(HttpStatusCode.TooManyRequests);

        // 3rd request from same client exceeds permit limit (2) and gets rejected with 429
        var res3 = await client.PostAsJsonAsync("/api/v1/public/forms/contact/submissions", payload);
        res3.StatusCode.ShouldBe(HttpStatusCode.TooManyRequests);
    }

    [Fact]
    public async Task SaveFormDefinition_SchemaValidation_DuplicateField_ShouldRejectWith400()
    {
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var adminEmail = $"admin_schema_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await idService.InviteUserAsync(adminEmail, "Schema Admin", Roles.Admin);
        await idService.ResetPasswordAsync(adminEmail, token!, "AdminPass@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(adminEmail, "AdminPass@123", false));

        var duplicateSchema = """
        [
            { "id": "firstName", "name": "firstName", "label": "First Name", "type": "text" },
            { "id": "firstName", "name": "firstName", "label": "Duplicate First Name", "type": "text" }
        ]
        """;

        var payload = new SaveFormDefinitionRequest(
            FormKey: $"dup_form_{Guid.NewGuid():N}",
            Name: "Duplicate Field Form",
            SchemaJson: duplicateSchema,
            SettingsJson: "{}");

        var csrf = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        var postReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/forms")
        {
            Content = JsonContent.Create(payload)
        };
        postReq.Headers.Add("X-XSRF-TOKEN", csrf!.token);

        var res = await client.SendAsync(postReq);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("Duplicate field name/id 'firstName'");
    }

    [Fact]
    public async Task SaveFormDefinition_SchemaValidation_InvalidFieldType_ShouldRejectWith400()
    {
        using var scope = _factory.Services.CreateScope();
        var idService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var adminEmail = $"admin_schema2_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await idService.InviteUserAsync(adminEmail, "Schema Admin 2", Roles.Admin);
        await idService.ResetPasswordAsync(adminEmail, token!, "AdminPass@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(adminEmail, "AdminPass@123", false));

        var invalidTypeSchema = """
        [
            { "id": "customInput", "name": "customInput", "label": "Weird Field", "type": "unsupported_magic_type" }
        ]
        """;

        var payload = new SaveFormDefinitionRequest(
            FormKey: $"invalid_type_form_{Guid.NewGuid():N}",
            Name: "Invalid Type Form",
            SchemaJson: invalidTypeSchema,
            SettingsJson: "{}");

        var csrf2 = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        var postReq2 = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/forms")
        {
            Content = JsonContent.Create(payload)
        };
        postReq2.Headers.Add("X-XSRF-TOKEN", csrf2!.token);

        var res = await client.SendAsync(postReq2);
        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.ShouldContain("has invalid type 'unsupported_magic_type'");
    }

    private sealed class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _handler;

        public MockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
        {
            _handler = handler;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_handler(request));
        }
    }
}
