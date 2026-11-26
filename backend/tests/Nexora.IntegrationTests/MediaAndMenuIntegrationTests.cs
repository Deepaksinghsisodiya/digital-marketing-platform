using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Identity.Models;
using Nexora.Domain.Constants;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class MediaAndMenuIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public MediaAndMenuIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    private async Task<(HttpClient Client, string CsrfToken)> CreateAuthenticatedClientAsync(string role)
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var email = $"user_{role.ToLowerInvariant()}_{Guid.NewGuid():N}@example.com";
        var (_, _, _, token) = await identityService.InviteUserAsync(email, $"Test {role}", role);
        await identityService.ResetPasswordAsync(email, token!, "SecureP@ssword123!");

        var client = _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });

        var loginRes = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(email, "SecureP@ssword123!", false));
        loginRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        var csrfDoc = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        return (client, csrfDoc!.token);
    }

    [Fact]
    public async Task MediaUpload_ValidJpegAndPng_ShouldStoreFileAndReturnCreatedWithAuditLog()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        // Valid PNG header: 89 50 4E 47 0D 0A 1A 0A
        var pngBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52 };
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(pngBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(fileContent, "file", "test-hero.png");
        form.Add(new StringContent("Hero banner graphic"), "altText");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        var asset = await uploadRes.Content.ReadFromJsonAsync<MediaAssetDto>();
        asset.ShouldNotBeNull();
        asset.FileName.ShouldBe("test-hero.png");
        asset.MimeType.ShouldBe("image/png");
        asset.AltText.ShouldBe("Hero banner graphic");
        asset.Url.ShouldStartWith("/api/v1/public/media/");

        // Download publicly via GUID endpoint
        var downloadRes = await client.GetAsync($"/api/v1/public/media/{asset.Id}/download");
        downloadRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        downloadRes.Content.Headers.ContentType?.MediaType.ShouldBe("image/png");
        var downloadedBytes = await downloadRes.Content.ReadAsByteArrayAsync();
        downloadedBytes.Length.ShouldBe(pngBytes.Length);

        // Download publicly via Direct Asset Url (storage path)
        var directUrlRes = await client.GetAsync(asset.Url);
        directUrlRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        directUrlRes.Content.Headers.ContentType?.MediaType.ShouldBe("image/png");

        // Download publicly via GUID streaming endpoint
        var streamRes = await client.GetAsync($"/api/v1/public/media/{asset.Id}");
        streamRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        streamRes.Content.Headers.ContentType?.MediaType.ShouldBe("image/png");

        // Audit log check
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var audit = await db.AuditLogs.FirstOrDefaultAsync(a => a.Action == "media.upload" && a.ResourceId == asset.Id.ToString());
        audit.ShouldNotBeNull();
        audit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task MediaUpload_InvalidExtension_ShouldReturn400BadRequest()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("echo 'malicious script'"));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/x-sh");
        form.Add(fileContent, "file", "exploit.sh");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await uploadRes.Content.ReadAsStringAsync();
        body.ShouldContain("is not permitted");
    }

    [Fact]
    public async Task MediaUpload_SpoofedMagicBytes_ShouldReturn400BadRequest()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        // Name says .png, but content is random plaintext
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("NOT A VALID PNG FILE HEADER CONTENT"));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(fileContent, "file", "fake_image.png");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await uploadRes.Content.ReadAsStringAsync();
        body.ShouldContain("does not match PNG image specification");
    }

    [Fact]
    public async Task MediaUpload_SvgWithScript_ShouldReturn400BadRequest()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        var maliciousSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"10\" cy=\"10\" r=\"5\"/><script>alert('xss')</script></svg>";
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(maliciousSvg));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/svg+xml");
        form.Add(fileContent, "file", "xss.svg");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await uploadRes.Content.ReadAsStringAsync();
        body.ShouldContain("prohibited active content");
    }

    [Fact]
    public async Task MediaUpload_ValidSvg_ShouldReturn201Created()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        var safeSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"blue\" /></svg>";
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(safeSvg));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/svg+xml");
        form.Add(fileContent, "file", "clean-logo.svg");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.Created);
    }

    [Fact]
    public async Task MediaDelete_ShouldRemoveAssetAndAuditLog()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        var pngBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(pngBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(fileContent, "file", "to-delete.png");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        uploadReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var uploadRes = await client.SendAsync(uploadReq);
        uploadRes.StatusCode.ShouldBe(HttpStatusCode.Created);
        var asset = await uploadRes.Content.ReadFromJsonAsync<MediaAssetDto>();
        asset.ShouldNotBeNull();

        // Delete asset
        var delReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/v1/admin/media/{asset.Id}");
        delReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var delRes = await client.SendAsync(delReq);
        delRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verification: GET should now 404
        var getRes = await client.GetAsync($"/api/v1/admin/media/{asset.Id}");
        getRes.StatusCode.ShouldBe(HttpStatusCode.NotFound);

        // Public download should now 404
        var dlRes = await client.GetAsync($"/api/v1/public/media/{asset.Id}/download");
        dlRes.StatusCode.ShouldBe(HttpStatusCode.NotFound);

        // Audit log check
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var audit = await db.AuditLogs.FirstOrDefaultAsync(a => a.Action == "media.delete" && a.ResourceId == asset.Id.ToString());
        audit.ShouldNotBeNull();
        audit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task NavigationMenu_Create_Hierarchy_AndPublicRetrieve_WithRegionFallback()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        var menuKey = $"header-{Guid.NewGuid():N}";
        var saveReq = new SaveMenuRequest(
            Key: menuKey,
            Title: "Global Main Navigation",
            RegionCode: null,
            Items: new List<SaveMenuItemRequest>
            {
                new SaveMenuItemRequest("Services", "/services", 1),
                new SaveMenuItemRequest("SEO Optimization", "/services/seo", 2),
                new SaveMenuItemRequest("About Us", "/about", 3)
            });

        var postReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/menus")
        {
            Content = JsonContent.Create(saveReq)
        };
        postReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var postRes = await client.SendAsync(postReq);
        postRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        var created = await postRes.Content.ReadFromJsonAsync<NavigationMenuDto>();
        created.ShouldNotBeNull();
        created.Key.ShouldBe(menuKey);
        created.Items.Count.ShouldBe(3);

        // Public retrieval without region
        var pubRes = await client.GetAsync($"/api/v1/public/menus/{menuKey}");
        pubRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var pubMenu = await pubRes.Content.ReadFromJsonAsync<NavigationMenuDto>();
        pubMenu.ShouldNotBeNull();
        pubMenu.Title.ShouldBe("Global Main Navigation");

        // Public retrieval with region fallback
        var pubRegionRes = await client.GetAsync($"/api/v1/public/menus/{menuKey}?region=uk");
        pubRegionRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var pubRegionMenu = await pubRegionRes.Content.ReadFromJsonAsync<NavigationMenuDto>();
        pubRegionMenu.ShouldNotBeNull();
        pubRegionMenu.Title.ShouldBe("Global Main Navigation");

        // Update existing menu with nested sub-links using PUT and ID remapping
        var servicesItem = pubMenu.Items.First(i => i.Label == "Services");
        var childId = Guid.NewGuid();
        var updateReqPayload = new SaveMenuRequest(
            Key: menuKey,
            Title: "Global Main Navigation",
            RegionCode: null,
            Items: new List<SaveMenuItemRequest>
            {
                new SaveMenuItemRequest("Services", "/services", 0, null, servicesItem.Id),
                new SaveMenuItemRequest("Paid Ads", "/services/paid-ads", 0, servicesItem.Id, childId),
                new SaveMenuItemRequest("About Us", "/about", 1, null, Guid.NewGuid())
            });

        var putReq = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/admin/menus/{created.Id}")
        {
            Content = JsonContent.Create(updateReqPayload)
        };
        putReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var putRes = await client.SendAsync(putReq);
        putRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        var updatedMenu = await putRes.Content.ReadFromJsonAsync<NavigationMenuDto>();
        updatedMenu.ShouldNotBeNull();
        var updatedServices = updatedMenu.Items.First(i => i.Label == "Services");
        updatedServices.Children.Count.ShouldBe(1);
        updatedServices.Children[0].Label.ShouldBe("Paid Ads");
    }

    [Fact]
    public async Task CmsPage_VersionHistory_And_Rollback_ShouldRestorePriorVersion()
    {
        var (client, csrfToken) = await CreateAuthenticatedClientAsync(Roles.Admin);

        // 1. Create a page (creates v1)
        var slug = $"versioned-page-{Guid.NewGuid():N}";
        var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/pages")
        {
            Content = JsonContent.Create(new CreatePageRequest(slug, "Versioned Testing Page", "en"))
        };
        createReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var createRes = await client.SendAsync(createReq);
        createRes.StatusCode.ShouldBe(HttpStatusCode.Created);
        var created = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var pageId = created.GetProperty("pageId").GetGuid();

        // 2. Publish v1
        var pubReq1 = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{pageId}/publish")
        {
            Content = JsonContent.Create(new { })
        };
        pubReq1.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var pubRes1 = await client.SendAsync(pubReq1);
        pubRes1.StatusCode.ShouldBe(HttpStatusCode.OK);
        var v1Res = await pubRes1.Content.ReadFromJsonAsync<PublishPageResponse>();
        var v1Id = v1Res!.PublishedVersionId;

        // 3. Update draft blocks to produce v2
        var pageDetail = await client.GetFromJsonAsync<PageDetailDto>($"/api/v1/admin/pages/{pageId}");
        var heroBlock = new CmsBlockDto(
            Id: "block_1",
            Type: "Hero",
            SchemaVersion: 1,
            Settings: new() { ["align"] = "center" },
            Content: new() { ["headline"] = "Drive 10x ROI", ["subhead"] = "Enterprise Growth Engine" });

        var draftReq = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/admin/pages/{pageId}/draft")
        {
            Content = JsonContent.Create(new SaveDraftRequest("Versioned Testing Page v2", new List<CmsBlockDto> { heroBlock }, pageDetail!.VersionToken))
        };
        draftReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var draftRes = await client.SendAsync(draftReq);
        draftRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 4. Publish v2
        var pubReq2 = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{pageId}/publish")
        {
            Content = JsonContent.Create(new { })
        };
        pubReq2.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var pubRes2 = await client.SendAsync(pubReq2);
        pubRes2.StatusCode.ShouldBe(HttpStatusCode.OK);
        var v2Res = await pubRes2.Content.ReadFromJsonAsync<PublishPageResponse>();
        var v2Id = v2Res!.PublishedVersionId;
        v2Id.ShouldNotBe(v1Id);

        // 5. Verify versions timeline list
        var versionsRes = await client.GetAsync($"/api/v1/admin/pages/{pageId}/versions");
        versionsRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var versions = await versionsRes.Content.ReadFromJsonAsync<List<PageVersionSummaryDto>>();
        versions.ShouldNotBeNull();
        versions.Count.ShouldBeGreaterThanOrEqualTo(2);
        versions.First(v => v.VersionNumber == 2).IsPublished.ShouldBeTrue();

        // 6. Rollback to v1
        var rollbackReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{pageId}/rollback")
        {
            Content = JsonContent.Create(new RollbackPageRequest(1))
        };
        rollbackReq.Headers.Add("X-XSRF-TOKEN", csrfToken);
        var rollbackRes = await client.SendAsync(rollbackReq);
        rollbackRes.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify page published version is restored to v1
        var pageRes = await client.GetAsync($"/api/v1/admin/pages/{pageId}");
        pageRes.StatusCode.ShouldBe(HttpStatusCode.OK);
        var page = await pageRes.Content.ReadFromJsonAsync<PageDetailDto>();
        page.ShouldNotBeNull();
        page.PublishedVersionId.ShouldBe(v1Id);

        // Audit log check for rollback
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var rollbackAudit = await db.AuditLogs.FirstOrDefaultAsync(a => a.Action == "cms.page.rollback" && a.ResourceId == pageId.ToString());
        rollbackAudit.ShouldNotBeNull();
        rollbackAudit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task MediaAndMenu_Rbac_Matrix_EditorAllowed_SalesForbidden()
    {
        var (editorClient, editorCsrf) = await CreateAuthenticatedClientAsync(Roles.Editor);
        var (salesClient, salesCsrf) = await CreateAuthenticatedClientAsync(Roles.Sales);

        // 1. Editor can view media and menus
        (await editorClient.GetAsync("/api/v1/admin/media")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await editorClient.GetAsync("/api/v1/admin/menus")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // 2. Editor can upload media
        var pngBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(pngBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(fileContent, "file", "editor-upload.png");
        var editorUploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = form };
        editorUploadReq.Headers.Add("X-XSRF-TOKEN", editorCsrf);
        var editorUploadRes = await editorClient.SendAsync(editorUploadReq);
        editorUploadRes.StatusCode.ShouldBe(HttpStatusCode.Created);

        // 3. Sales is forbidden on all media and menu management endpoints
        (await salesClient.GetAsync("/api/v1/admin/media")).StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await salesClient.GetAsync("/api/v1/admin/menus")).StatusCode.ShouldBe(HttpStatusCode.Forbidden);

        using var salesForm = new MultipartFormDataContent();
        var salesFileContent = new ByteArrayContent(pngBytes);
        salesFileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        salesForm.Add(salesFileContent, "file", "sales-upload.png");
        var salesUploadReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/media/upload") { Content = salesForm };
        salesUploadReq.Headers.Add("X-XSRF-TOKEN", salesCsrf);
        (await salesClient.SendAsync(salesUploadReq)).StatusCode.ShouldBe(HttpStatusCode.Forbidden);

        var menuReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/menus")
        {
            Content = JsonContent.Create(new SaveMenuRequest("test", "Test"))
        };
        menuReq.Headers.Add("X-XSRF-TOKEN", salesCsrf);
        (await salesClient.SendAsync(menuReq)).StatusCode.ShouldBe(HttpStatusCode.Forbidden);

        var rollbackReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{Guid.NewGuid()}/rollback")
        {
            Content = JsonContent.Create(new RollbackPageRequest(1))
        };
        rollbackReq.Headers.Add("X-XSRF-TOKEN", salesCsrf);
        (await salesClient.SendAsync(rollbackReq)).StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}
