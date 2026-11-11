using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class CmsIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public CmsIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task CreatePage_DraftVsPublished_AndConcurrency_ShouldBehaveCorrectly()
    {
        using var scope = _factory.Services.CreateScope();
        var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
        var actingAdminId = Guid.NewGuid();

        var slug = $"test-page-{Guid.NewGuid():N}";
        var req = new CreatePageRequest(slug, "Test Marketing Page", "en");

        // 1. Create Page
        var (createSuccess, createErr, pageId) = await cmsService.CreatePageAsync(req, actingAdminId);
        createSuccess.ShouldBeTrue(createErr);
        pageId.ShouldNotBeNull();

        // 2. Draft is NOT visible on public endpoint
        var publicDraft = await cmsService.GetPublishedPageBySlugAsync(slug, "en");
        publicDraft.ShouldBeNull();

        // 3. Admin can retrieve draft
        var adminDetail = await cmsService.GetPageByIdAsync(pageId!.Value);
        adminDetail.ShouldNotBeNull();
        adminDetail.Status.ShouldBe(1); // Draft
        adminDetail.Blocks.Count.ShouldBe(0);

        // 4. Save Draft with Hero and CTA blocks
        var heroBlock = new CmsBlockDto(
            Id: "block_1",
            Type: "Hero",
            SchemaVersion: 1,
            Settings: new() { ["align"] = "center" },
            Content: new() { ["headline"] = "Drive 10x ROI", ["subhead"] = "Enterprise Growth Engine" });

        var draftReq = new SaveDraftRequest(
            Title: "Test Marketing Page v2",
            Blocks: [heroBlock],
            VersionToken: adminDetail.VersionToken);

        var (saveSuccess, saveErr, newToken) = await cmsService.SaveDraftAsync(pageId.Value, draftReq, actingAdminId);
        saveSuccess.ShouldBeTrue(saveErr);
        newToken.ShouldNotBeNull();

        // 5. Stale version token triggers 409 Concurrency Conflict
        var staleDraftReq = new SaveDraftRequest(
            Title: "Test Marketing Page Stale",
            Blocks: [heroBlock],
            VersionToken: adminDetail.VersionToken); // Old token!

        var (staleSuccess, staleErr, _) = await cmsService.SaveDraftAsync(pageId.Value, staleDraftReq, actingAdminId);
        staleSuccess.ShouldBeFalse();
        staleErr.ShouldContain("409");

        // 6. Generate Preview Token for internal draft testing
        var preview = await cmsService.GeneratePreviewTokenAsync(pageId.Value);
        preview.ShouldNotBeNull();
        preview.PreviewUrl.ShouldContain(preview.Token);

        // Preview endpoint successfully returns draft content marked NoIndex
        var previewPage = await cmsService.GetPageByPreviewTokenAsync(preview.Token);
        previewPage.ShouldNotBeNull();
        previewPage.NoIndex.ShouldBeTrue();
        previewPage.Blocks.Count.ShouldBe(1);
        previewPage.Blocks[0].Type.ShouldBe("Hero");

        // 7. Publish Page
        var (pubSuccess, pubErr, pubRes) = await cmsService.PublishPageAsync(pageId.Value, actingAdminId);
        pubSuccess.ShouldBeTrue(pubErr);
        pubRes.ShouldNotBeNull();
        pubRes.VersionNumber.ShouldBe(2);

        // 8. Public endpoint now serves published content
        var publishedPage = await cmsService.GetPublishedPageBySlugAsync(slug, "en");
        publishedPage.ShouldNotBeNull();
        publishedPage.Status.ShouldBe(2); // Published
        publishedPage.Blocks.Count.ShouldBe(1);
        publishedPage.Blocks[0].Content["headline"]?.ToString().ShouldBe("Drive 10x ROI");
    }

    [Fact]
    public async Task SaveDraft_ShouldPersistDraftVersion()
    {
        using var scope = _factory.Services.CreateScope();
        var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
        var actingAdminId = Guid.NewGuid();

        var slug = $"draft-save-{Guid.NewGuid():N}";
        var (_, _, pageId) = await cmsService.CreatePageAsync(new CreatePageRequest(slug, "Draft Title", "en"), actingAdminId);
        var page = await cmsService.GetPageByIdAsync(pageId!.Value);

        var block = new CmsBlockDto("b1", "RichText", 1, [], new() { ["body"] = "Updated body draft" });
        var (ok, err, newToken) = await cmsService.SaveDraftAsync(pageId.Value, new SaveDraftRequest("Draft Title v2", [block], page!.VersionToken), actingAdminId);

        ok.ShouldBeTrue(err);
        newToken.ShouldNotBeNull();

        var updated = await cmsService.GetPageByIdAsync(pageId.Value);
        updated!.Blocks.Count.ShouldBe(1);
        updated.Blocks[0].Content["body"]?.ToString().ShouldBe("Updated body draft");
    }

    [Fact]
    public async Task PublishPage_ShouldRecordAuditLog_AndIncrementVersion()
    {
        using var scope = _factory.Services.CreateScope();
        var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var actingAdminId = Guid.NewGuid();

        var slug = $"audit-pub-{Guid.NewGuid():N}";
        var (_, _, pageId) = await cmsService.CreatePageAsync(new CreatePageRequest(slug, "Audit Page", "en"), actingAdminId);
        var page = await cmsService.GetPageByIdAsync(pageId!.Value);

        var (pubOk, pubErr, res) = await cmsService.PublishPageAsync(pageId.Value, actingAdminId);
        pubOk.ShouldBeTrue(pubErr);
        res!.VersionNumber.ShouldBeGreaterThan(0);

        // Verify audit log recorded
        var audit = await db.AuditLogs
            .FirstOrDefaultAsync(a => a.ResourceType == "Page" && a.ResourceId == pageId.Value.ToString() && a.Action == "cms.page.publish");
        audit.ShouldNotBeNull();
        audit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task Rollback_ShouldRevertToPreviousVersion_AndRecordAuditLog()
    {
        using var scope = _factory.Services.CreateScope();
        var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var actingAdminId = Guid.NewGuid();

        var slug = $"rollback-{Guid.NewGuid():N}";
        var (_, _, pageId) = await cmsService.CreatePageAsync(new CreatePageRequest(slug, "V1 Title", "en"), actingAdminId);
        var p1 = await cmsService.GetPageByIdAsync(pageId!.Value);
        await cmsService.PublishPageAsync(pageId.Value, actingAdminId);

        // Version 2 draft and publish
        var b2 = new CmsBlockDto("b2", "Hero", 1, [], new() { ["headline"] = "V2 Headline" });
        var p2 = await cmsService.GetPageByIdAsync(pageId.Value);
        await cmsService.SaveDraftAsync(pageId.Value, new SaveDraftRequest("V2 Title", [b2], p2!.VersionToken), actingAdminId);
        await cmsService.PublishPageAsync(pageId.Value, actingAdminId);

        // Rollback to version 1
        var (rollOk, rollErr) = await cmsService.RollbackPageAsync(pageId.Value, 1, actingAdminId);
        rollOk.ShouldBeTrue(rollErr);

        // Verify audit log recorded
        var rollbackAudit = await db.AuditLogs
            .FirstOrDefaultAsync(a => a.ResourceType == "Page" && a.ResourceId == pageId.Value.ToString() && a.Action == "cms.page.rollback");
        rollbackAudit.ShouldNotBeNull();
        rollbackAudit.Outcome.ShouldBe("Success");
    }

    [Fact]
    public async Task PublicGetPublishedPage_DraftSlug_ShouldReturn404NotFound()
    {
        using var scope = _factory.Services.CreateScope();
        var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
        var actingAdminId = Guid.NewGuid();

        var slug = $"unpublished-draft-{Guid.NewGuid():N}";
        await cmsService.CreatePageAsync(new CreatePageRequest(slug, "Never Published", "en"), actingAdminId);

        var client = _factory.CreateClient();
        var resp = await client.GetAsync($"/api/v1/public/pages/{slug}");
        resp.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }
}
