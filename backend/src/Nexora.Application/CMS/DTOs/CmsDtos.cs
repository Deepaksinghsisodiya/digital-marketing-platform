namespace Nexora.Application.CMS.DTOs;

public record CmsBlockDto(
    string Id,
    string Type,
    int SchemaVersion,
    Dictionary<string, object?> Settings,
    Dictionary<string, object?> Content,
    bool Enabled = true,
    string[]? RegionFilter = null);

public record PageSummaryDto(
    Guid Id,
    string Slug,
    string Locale,
    string Title,
    int Status,
    bool IsEnabled,
    Guid? PublishedVersionId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record PageDetailDto(
    Guid Id,
    string Slug,
    string Locale,
    string Title,
    int Status,
    bool IsEnabled,
    string? MetaTitle,
    string? MetaDescription,
    string? CanonicalUrl,
    bool NoIndex,
    string VersionToken,
    Guid? PublishedVersionId,
    IReadOnlyList<CmsBlockDto> Blocks,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    string? OgImageUrl = null);

public record CreatePageRequest(
    string Slug,
    string Title,
    string? Locale = "en",
    string? MetaTitle = null,
    string? MetaDescription = null,
    string? CanonicalUrl = null,
    bool NoIndex = false,
    string? OgImageUrl = null);

public record SaveDraftRequest(
    string Title,
    IReadOnlyList<CmsBlockDto> Blocks,
    string VersionToken,
    string? MetaTitle = null,
    string? MetaDescription = null,
    string? CanonicalUrl = null,
    bool NoIndex = false,
    string? Note = null,
    string? OgImageUrl = null);

public record PublishPageResponse(
    bool Success,
    Guid PublishedVersionId,
    int VersionNumber,
    string Message);

public record PreviewTokenDto(
    string Token,
    string PreviewUrl,
    DateTime ExpiresAtUtc);

public record MediaAssetDto(
    Guid Id,
    string StorageKey,
    string FileName,
    string MimeType,
    long SizeBytes,
    int? Width,
    int? Height,
    string AltText,
    string Url,
    DateTime CreatedAtUtc);

public record PageVersionSummaryDto(
    Guid Id,
    int VersionNumber,
    string? Note,
    bool IsPublished,
    DateTime CreatedAtUtc,
    DateTime? PublishedAtUtc,
    Guid? CreatedByUserId);

public record RollbackPageRequest(
    int VersionNumber);

public record NavigationMenuItemDto(
    Guid Id,
    string Label,
    string Url,
    int DisplayOrder,
    Guid? ParentItemId,
    IReadOnlyList<NavigationMenuItemDto> Children);

public record NavigationMenuDto(
    Guid Id,
    string Key,
    string Title,
    string? RegionCode,
    IReadOnlyList<NavigationMenuItemDto> Items);

public record SaveMenuItemRequest(
    string Label,
    string Url,
    int DisplayOrder,
    Guid? ParentItemId = null,
    Guid? Id = null);

public record SaveMenuRequest(
    string Key,
    string Title,
    string? RegionCode = null,
    IReadOnlyList<SaveMenuItemRequest>? Items = null);


