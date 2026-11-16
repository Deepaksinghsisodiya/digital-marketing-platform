using System.Text.Json;

namespace Nexora.Application.Themes.Models;

public record ThemeSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    bool IsSystem,
    bool IsDefault,
    bool IsDeleted,
    bool HasDraft,
    int CurrentVersion,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record ThemeDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string ConfigJson,
    string? DraftConfigJson,
    bool IsSystem,
    bool IsDefault,
    bool IsDeleted,
    int CurrentVersion,
    string VersionToken,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record ThemeVersionDto(
    Guid Id,
    int VersionNumber,
    string ConfigJson,
    Guid? ChangedBy,
    DateTime ChangedAtUtc,
    string ChangeDescription);

public record ThemeSettingsDto(
    bool GlobalEngineEnabled,
    bool WebsiteThemeEnabled,
    string WebsiteThemeId,
    bool AdminThemeEnabled,
    string AdminThemeId,
    string FallbackThemeId,
    string VersionToken,
    DateTime? UpdatedAtUtc);

public record CreateThemeDto(
    string Name,
    string? Slug,
    string? Description,
    string? ConfigJson);

public record SaveThemeDraftDto(
    string ConfigJson,
    string? BaseVersionToken);

public record PublishThemeDto(string? ChangeDescription);

public record ActivateThemeDto(string Target);

public record RollbackThemeDto(int VersionNumber);

public record ImportThemeDto(
    string Name,
    string? Slug,
    string? Description,
    string ConfigJson);

public record UpdateThemeSettingsDto(
    bool? GlobalEngineEnabled,
    bool? WebsiteThemeEnabled,
    string? WebsiteThemeId,
    bool? AdminThemeEnabled,
    string? AdminThemeId,
    string? FallbackThemeId,
    string VersionToken = "");

public record PublicThemeDto(
    string App,
    string ThemeId,
    string Name,
    string Slug,
    int SchemaVersion,
    JsonElement Config,
    string Source,
    bool IsDefault);
