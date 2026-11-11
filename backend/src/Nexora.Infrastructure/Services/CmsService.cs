using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public sealed class CmsService : ICmsService
{
    private readonly AppDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IAuditLogService _auditLogService;

    public CmsService(
        AppDbContext context,
        IDateTimeProvider dateTimeProvider,
        IAuditLogService auditLogService)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
        _auditLogService = auditLogService;
    }

    public async Task<PaginatedResult<PageSummaryDto>> GetPagesAsync(
        int page,
        int pageSize,
        string? search,
        int? status,
        string? locale,
        CancellationToken ct = default)
    {
        var query = _context.Pages.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p => p.Title.Contains(s) || p.Slug.Contains(s));
        }

        if (status.HasValue)
        {
            query = query.Where(p => (int)p.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(locale))
        {
            query = query.Where(p => p.Locale == locale);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PageSummaryDto(
                p.Id,
                p.Slug,
                p.Locale,
                p.Title,
                (int)p.Status,
                p.IsEnabled,
                p.PublishedVersionId,
                p.CreatedAtUtc,
                p.UpdatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<PageSummaryDto>(items, total, page, pageSize);
    }

    public async Task<PageDetailDto?> GetPageByIdAsync(Guid pageId, CancellationToken ct = default)
    {
        var page = await _context.Pages
            .AsNoTracking()
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == pageId, ct);

        if (page == null) return null;

        var latestVersion = page.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        var blocks = DeserializeBlocks(latestVersion?.ContentJson);

        return new PageDetailDto(
            page.Id,
            page.Slug,
            page.Locale,
            page.Title,
            (int)page.Status,
            page.IsEnabled,
            page.MetaTitle,
            page.MetaDescription,
            page.CanonicalUrl,
            page.NoIndex,
            Convert.ToBase64String(page.Version),
            page.PublishedVersionId,
            blocks,
            page.CreatedAtUtc,
            page.UpdatedAtUtc);
    }

    public async Task<(bool Success, string? Error, Guid? PageId)> CreatePageAsync(
        CreatePageRequest request,
        Guid createdByUserId,
        CancellationToken ct = default)
    {
        var normalizedSlug = request.Slug.Trim().ToLowerInvariant().Trim('/');
        var locale = string.IsNullOrWhiteSpace(request.Locale) ? "en" : request.Locale.Trim();

        var exists = await _context.Pages
            .AnyAsync(p => p.Slug == normalizedSlug && p.Locale == locale, ct);

        if (exists)
        {
            return (false, $"A page with slug '{normalizedSlug}' already exists for locale '{locale}'.", null);
        }

        var page = new Page
        {
            Slug = normalizedSlug,
            Locale = locale,
            Title = request.Title.Trim(),
            Status = PageStatus.Draft,
            IsEnabled = true,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            CanonicalUrl = request.CanonicalUrl,
            NoIndex = request.NoIndex
        };

        var initialVersion = new PageVersion
        {
            PageId = page.Id,
            VersionNumber = 1,
            SchemaVersion = 1,
            ContentJson = "[]",
            CreatedByUserId = createdByUserId,
            Note = "Initial page creation"
        };

        _context.Pages.Add(page);
        _context.PageVersions.Add(initialVersion);
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "cms.page.create",
            resourceType: "Page",
            resourceId: page.Id.ToString(),
            outcome: "Success",
            actorUserId: createdByUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new() { ["slug"] = normalizedSlug, ["locale"] = locale },
            cancellationToken: ct);

        return (true, null, page.Id);
    }

    public async Task<(bool Success, string? Error, string? NewVersionToken)> SaveDraftAsync(
        Guid pageId,
        SaveDraftRequest request,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var page = await _context.Pages.FirstOrDefaultAsync(p => p.Id == pageId, ct);
        if (page == null)
        {
            return (false, "Page not found.", null);
        }

        var clientToken = Convert.FromBase64String(request.VersionToken);
        if (!page.Version.SequenceEqual(clientToken))
        {
            return (false, "Concurrency conflict (409): Page has been modified by another editor.", null);
        }

        page.Title = request.Title.Trim();
        page.MetaTitle = request.MetaTitle;
        page.MetaDescription = request.MetaDescription;
        page.CanonicalUrl = request.CanonicalUrl;
        page.NoIndex = request.NoIndex;
        page.MarkUpdated();

        var lastVersionNumber = await _context.PageVersions
            .Where(v => v.PageId == pageId)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var jsonContent = JsonSerializer.Serialize(request.Blocks);

        var newDraftVersion = new PageVersion
        {
            PageId = pageId,
            VersionNumber = lastVersionNumber + 1,
            SchemaVersion = 1,
            ContentJson = jsonContent,
            CreatedByUserId = actingUserId,
            Note = request.Note ?? "Draft updated"
        };

        _context.PageVersions.Add(newDraftVersion);

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return (false, "Concurrency conflict (409): Page was modified during save.", null);
        }

        await _auditLogService.LogAsync(
            action: "cms.page.save_draft",
            resourceType: "Page",
            resourceId: pageId.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new() { ["versionNumber"] = newDraftVersion.VersionNumber.ToString() },
            cancellationToken: ct);

        return (true, null, Convert.ToBase64String(page.Version));
    }

    public async Task<(bool Success, string? Error, PublishPageResponse? Response)> PublishPageAsync(
        Guid pageId,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var page = await _context.Pages
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == pageId, ct);

        if (page == null)
        {
            return (false, "Page not found.", null);
        }

        var latestVersion = page.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        if (latestVersion == null)
        {
            return (false, "No version available to publish.", null);
        }

        var now = _dateTimeProvider.UtcNow;
        latestVersion.PublishedAtUtc = now;

        page.PublishedVersionId = latestVersion.Id;
        page.Status = PageStatus.Published;
        page.MarkUpdated();

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "cms.page.publish",
            resourceType: "Page",
            resourceId: pageId.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new() { ["versionId"] = latestVersion.Id.ToString(), ["versionNumber"] = latestVersion.VersionNumber.ToString() },
            cancellationToken: ct);

        return (true, null, new PublishPageResponse(true, latestVersion.Id, latestVersion.VersionNumber, "Page published successfully."));
    }

    public async Task<(bool Success, string? Error)> RollbackPageAsync(
        Guid pageId,
        int targetVersionNumber,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var page = await _context.Pages
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == pageId, ct);

        if (page == null) return (false, "Page not found.");

        var targetVersion = page.Versions.FirstOrDefault(v => v.VersionNumber == targetVersionNumber);
        if (targetVersion == null)
        {
            return (false, $"Version {targetVersionNumber} not found.");
        }

        page.PublishedVersionId = targetVersion.Id;
        page.Status = PageStatus.Published;
        page.MarkUpdated();

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "cms.page.rollback",
            resourceType: "Page",
            resourceId: pageId.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new() { ["targetVersion"] = targetVersionNumber.ToString() },
            cancellationToken: ct);

        return (true, null);
    }

    public async Task<PreviewTokenDto?> GeneratePreviewTokenAsync(
        Guid pageId,
        TimeSpan? lifetime = null,
        CancellationToken ct = default)
    {
        var page = await _context.Pages
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == pageId, ct);

        if (page == null) return null;

        var latestVersion = page.Versions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        if (latestVersion == null) return null;

        var tokenString = Guid.NewGuid().ToString("N");
        var expiresAt = _dateTimeProvider.UtcNow.Add(lifetime ?? TimeSpan.FromHours(4));

        var preview = new PreviewToken
        {
            PageVersionId = latestVersion.Id,
            Token = tokenString,
            ExpiresAtUtc = expiresAt
        };

        _context.PreviewTokens.Add(preview);
        await _context.SaveChangesAsync(ct);

        var previewUrl = $"/preview/{tokenString}";
        return new PreviewTokenDto(tokenString, previewUrl, expiresAt);
    }

    public async Task<PageDetailDto?> GetPublishedPageBySlugAsync(
        string slug,
        string locale = "en",
        CancellationToken ct = default)
    {
        var normalized = slug.Trim().ToLowerInvariant().Trim('/');
        var page = await _context.Pages
            .AsNoTracking()
            .Include(p => p.PublishedVersion)
            .FirstOrDefaultAsync(p => p.Slug == normalized && p.Locale == locale && p.Status == PageStatus.Published && p.IsEnabled, ct);

        // If specific regional locale is not found, fallback to default English ("en") or any published version of that slug
        if (page == null)
        {
            page = await _context.Pages
                .AsNoTracking()
                .Include(p => p.PublishedVersion)
                .FirstOrDefaultAsync(p => p.Slug == normalized && (p.Locale == "en" || p.Locale == "en-IN" || p.Locale == "en-US") && p.Status == PageStatus.Published && p.IsEnabled, ct)
                ?? await _context.Pages
                    .AsNoTracking()
                    .Include(p => p.PublishedVersion)
                    .FirstOrDefaultAsync(p => p.Slug == normalized && p.Status == PageStatus.Published && p.IsEnabled, ct);
        }

        if (page == null || page.PublishedVersion == null)
        {
            return null;
        }

        var blocks = DeserializeBlocks(page.PublishedVersion.ContentJson);

        return new PageDetailDto(
            page.Id,
            page.Slug,
            page.Locale,
            page.Title,
            (int)page.Status,
            page.IsEnabled,
            page.MetaTitle,
            page.MetaDescription,
            page.CanonicalUrl,
            page.NoIndex,
            Convert.ToBase64String(page.Version),
            page.PublishedVersionId,
            blocks,
            page.CreatedAtUtc,
            page.UpdatedAtUtc);
    }

    public async Task<PageDetailDto?> GetPageByPreviewTokenAsync(
        string token,
        CancellationToken ct = default)
    {
        var now = _dateTimeProvider.UtcNow;
        var preview = await _context.PreviewTokens
            .AsNoTracking()
            .Include(pt => pt.PageVersion)
            .ThenInclude(pv => pv.Page)
            .FirstOrDefaultAsync(pt => pt.Token == token && !pt.IsRevoked && pt.ExpiresAtUtc > now, ct);

        if (preview == null || preview.PageVersion == null || preview.PageVersion.Page == null)
        {
            return null;
        }

        var page = preview.PageVersion.Page;
        var blocks = DeserializeBlocks(preview.PageVersion.ContentJson);

        return new PageDetailDto(
            page.Id,
            page.Slug,
            page.Locale,
            page.Title,
            (int)page.Status,
            page.IsEnabled,
            page.MetaTitle,
            page.MetaDescription,
            page.CanonicalUrl,
            NoIndex: true,
            Convert.ToBase64String(page.Version),
            preview.PageVersion.Id,
            blocks,
            page.CreatedAtUtc,
            page.UpdatedAtUtc);
    }

    private static IReadOnlyList<CmsBlockDto> DeserializeBlocks(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<CmsBlockDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
