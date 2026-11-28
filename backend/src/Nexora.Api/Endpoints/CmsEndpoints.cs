using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Api.Endpoints;

public static class CmsEndpoints
{
    public static void MapCmsEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Admin CMS Page Endpoints
        var adminGroup = app.MapGroup("/api/v1/admin/pages")
            .WithTags("CMS Pages (Admin)")
            .RequireAuthorization();

        adminGroup.MapGet("/", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] int? status,
            [FromQuery] string? locale,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var result = await cmsService.GetPagesAsync(
                page ?? 1,
                pageSize ?? 20,
                search,
                status,
                locale,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetPages")
        .WithSummary("Paginated list of CMS pages.");

        adminGroup.MapGet("/{id:guid}", async (
            Guid id,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var page = await cmsService.GetPageByIdAsync(id, ct);
            if (page == null) return Results.NotFound(new { error = "Page not found." });
            return Results.Ok(page);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetPageById")
        .WithSummary("Retrieve CMS page details with current draft blocks.");

        adminGroup.MapPost("/", async (
            CreatePageRequest request,
            ICmsService cmsService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error, pageId) = await cmsService.CreatePageAsync(
                request,
                currentUser.UserId ?? Guid.Empty,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Created($"/api/v1/admin/pages/{pageId}", new { pageId });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("CreatePage")
        .WithSummary("Create new CMS page in draft state.");

        adminGroup.MapPut("/{id:guid}/draft", async (
            Guid id,
            SaveDraftRequest request,
            ICmsService cmsService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error, newToken) = await cmsService.SaveDraftAsync(
                id,
                request,
                currentUser.UserId ?? Guid.Empty,
                ct);

            if (!success)
            {
                if (error != null && error.Contains("409"))
                {
                    return Results.Conflict(new { error });
                }
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { success = true, versionToken = newToken });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("SavePageDraft")
        .WithSummary("Save updated draft blocks for CMS page with rowversion concurrency.");

        adminGroup.MapPost("/{id:guid}/publish", async (
            Guid id,
            ICmsService cmsService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error, response) = await cmsService.PublishPageAsync(
                id,
                currentUser.UserId ?? Guid.Empty,
                ct);

            if (!success)
            {
                if (error != null && error.Contains("Page not found", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.NotFound(new { error });
                }
                return Results.BadRequest(new { error });
            }
            return Results.Ok(response);
        })
        .RequireAuthorization(Permissions.PagesPublish)
        .WithName("PublishPage")
        .WithSummary("Publish current draft version to live site (Pages.Publish required).");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            ICmsService cmsService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await cmsService.ArchivePageAsync(
                id,
                currentUser.UserId ?? Guid.Empty,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true, message = "Page archived successfully." });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("ArchivePage")
        .WithSummary("Archive CMS page without destroying version history.");

        adminGroup.MapPost("/{id:guid}/preview-token", async (
            Guid id,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var preview = await cmsService.GeneratePreviewTokenAsync(id, TimeSpan.FromHours(4), ct);
            if (preview == null) return Results.NotFound(new { error = "Unable to create preview token." });
            return Results.Ok(preview);
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("GeneratePreviewToken")
        .WithSummary("Generate short-lived token to preview draft page.");

        adminGroup.MapGet("/{id:guid}/versions", async (
            Guid id,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var versions = await cmsService.GetPageVersionsAsync(id, ct);
            return Results.Ok(versions);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetPageVersions")
        .WithSummary("Retrieve history timeline of page versions.");

        adminGroup.MapPost("/{id:guid}/rollback", async (
            Guid id,
            [FromBody] RollbackPageRequest request,
            ICmsService cmsService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await cmsService.RollbackPageAsync(
                id,
                request.VersionNumber,
                currentUser.UserId ?? Guid.Empty,
                ct);

            if (!success)
            {
                if (error != null && error.Contains("not found", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.NotFound(new { error });
                }
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { success = true, versionNumber = request.VersionNumber });
        })
        .RequireAuthorization(Permissions.PagesPublish)
        .WithName("RollbackPageVersion")
        .WithSummary("Rollback page published content to a previous version number.");

        adminGroup.MapPost("/{id:guid}/schedule", async (
            Guid id,
            [FromBody] SchedulePagePublishDto dto,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var page = await db.Pages.FirstOrDefaultAsync(p => p.Id == id, ct);
            if (page == null) return Results.NotFound(new { error = "Page not found." });

            page.ScheduledPublishAtUtc = dto.ScheduledPublishAtUtc;
            await db.SaveChangesAsync(ct);

            return Results.Ok(new
            {
                page.Id,
                page.ScheduledPublishAtUtc,
                message = dto.ScheduledPublishAtUtc.HasValue
                    ? $"Page scheduled to publish at {dto.ScheduledPublishAtUtc.Value:O}."
                    : "Scheduled publish cleared."
            });
        })
        .RequireAuthorization(Permissions.PagesPublish)
        .WithName("SchedulePagePublish")
        .WithSummary("Schedule or clear automatic page publishing timestamp.");

        // 2. Public CMS Endpoints (Anonymous, Cached)
        var publicGroup = app.MapGroup("/api/v1/public")
            .WithTags("Public CMS");

        publicGroup.MapGet("/pages/published-sitemap", async (
            AppDbContext db,
            CancellationToken ct) =>
        {
            var pages = await db.Pages.AsNoTracking()
                .Where(p => p.Status == PageStatus.Published && !p.NoIndex)
                .Select(p => new
                {
                    p.Slug,
                    p.Locale,
                    p.UpdatedAtUtc
                })
                .ToListAsync(ct);

            return Results.Ok(pages);
        })
        .WithName("GetPublishedPagesForSitemap")
        .WithSummary("Retrieve all published pages with slugs and timestamps for dynamic XML sitemap generation.");

        publicGroup.MapGet("/pages/{slug}", async (
            string slug,
            [FromQuery] string? locale,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var page = await cmsService.GetPublishedPageBySlugAsync(slug, locale ?? "en", ct);
            if (page == null) return Results.NotFound(new { error = "Page not found." });
            return Results.Ok(page);
        })
        .WithName("GetPublicPage")
        .WithSummary("Fetch published page blocks and SEO metadata for website rendering.");

        publicGroup.MapGet("/preview/{token}", async (
            string token,
            ICmsService cmsService,
            CancellationToken ct) =>
        {
            var page = await cmsService.GetPageByPreviewTokenAsync(token, ct);
            if (page == null) return Results.NotFound(new { error = "Preview link expired or invalid." });
            return Results.Ok(page);
        })
        .WithName("GetPreviewPage")
        .WithSummary("Fetch draft page blocks using short-lived preview token.");

        publicGroup.MapGet("/search", async (
            [FromQuery] string? q,
            AppDbContext db,
            IConfiguration config,
            IHttpClientFactory httpClientFactory,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            {
                return Results.Ok(new { query = q ?? "", provider = "sql", results = Array.Empty<object>() });
            }

            var cleanQuery = q.Trim();
            var searchProvider = config["Search:Provider"];
            var searchEndpoint = config["Search:EndpointUrl"];
            var searchApiKey = config["Search:ApiKey"];

            if ((string.Equals(searchProvider, "Meilisearch", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(searchProvider, "Algolia", StringComparison.OrdinalIgnoreCase)) &&
                !string.IsNullOrWhiteSpace(searchEndpoint))
            {
                try
                {
                    using var client = httpClientFactory.CreateClient();
                    client.Timeout = TimeSpan.FromSeconds(3);
                    if (!string.IsNullOrWhiteSpace(searchApiKey))
                    {
                        client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {searchApiKey}");
                        client.DefaultRequestHeaders.TryAddWithoutValidation("X-Algolia-API-Key", searchApiKey);
                    }
                    var extRes = await client.PostAsJsonAsync(searchEndpoint, new { q = cleanQuery, query = cleanQuery, limit = 15 }, ct);
                    if (extRes.IsSuccessStatusCode)
                    {
                        var extJson = await extRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(ct);
                        return Results.Ok(new { query = cleanQuery, provider = searchProvider, raw = extJson });
                    }
                }
                catch
                {
                    // Fall back to SQL Server full-text search
                }
            }

            var matchedPages = await db.Pages.AsNoTracking()
                .Where(p => p.Status == PageStatus.Published && p.IsEnabled &&
                            (EF.Functions.Like(p.Title, $"%{cleanQuery}%") ||
                             EF.Functions.Like(p.Slug, $"%{cleanQuery}%") ||
                             EF.Functions.Like(p.MetaDescription, $"%{cleanQuery}%")))
                .Take(10)
                .Select(p => new
                {
                    Type = "Page",
                    Title = p.Title,
                    Slug = p.Slug,
                    Url = p.Slug == "home" ? "/" : $"/{p.Slug}",
                    Description = p.MetaDescription
                })
                .ToListAsync(ct);

            var matchedPosts = await db.BlogPosts.AsNoTracking()
                .Where(b => b.Status == BlogPostStatus.Published &&
                            (EF.Functions.Like(b.Title, $"%{cleanQuery}%") ||
                             EF.Functions.Like(b.Excerpt, $"%{cleanQuery}%") ||
                             EF.Functions.Like(b.Category, $"%{cleanQuery}%")))
                .Take(10)
                .Select(b => new
                {
                    Type = "Blog",
                    Title = b.Title,
                    Slug = b.Slug,
                    Url = $"/blog/{b.Slug}",
                    Description = (string?)b.Excerpt
                })
                .ToListAsync(ct);

            var allResults = matchedPages.Concat(matchedPosts).Take(15);
            return Results.Ok(new { query = cleanQuery, results = allResults });
        })
        .WithName("PublicGlobalSearch")
        .WithSummary("Universal keyword search across published CMS pages and blog posts.");
    }
}

public record SchedulePagePublishDto(DateTime? ScheduledPublishAtUtc);

