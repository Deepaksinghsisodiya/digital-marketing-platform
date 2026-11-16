using Nexora.Application.Themes.Models;

namespace Nexora.Application.Common.Interfaces;

public interface IThemeService
{
    Task<List<ThemeSummaryDto>> GetThemesAsync(bool includeDeleted = false, CancellationToken ct = default);

    Task<ThemeDetailDto?> GetThemeAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeDetailDto? Theme)> CreateThemeAsync(
        CreateThemeDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<(bool Success, string? Error, bool Conflict, ThemeDetailDto? Theme)> SaveDraftAsync(
        Guid id, SaveThemeDraftDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<(bool Success, string? Error)> DeleteThemeAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeDetailDto? Theme)> DuplicateThemeAsync(
        Guid id, string? newName, Guid actingUserId, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeVersionDto? Version)> PublishThemeAsync(
        Guid id, PublishThemeDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeSettingsDto? Settings)> ActivateThemeAsync(
        Guid id, ActivateThemeDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<List<ThemeVersionDto>> GetVersionsAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeDetailDto? Theme)> RollbackThemeAsync(
        Guid id, RollbackThemeDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<(bool Success, string? Error, ThemeDetailDto? Theme)> ImportThemeAsync(
        ImportThemeDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<string?> ExportThemeAsync(Guid id, CancellationToken ct = default);

    Task<ThemeSettingsDto> GetSettingsAsync(CancellationToken ct = default);

    Task<(bool Success, string? Error, bool Conflict, ThemeSettingsDto? Settings)> UpdateSettingsAsync(
        UpdateThemeSettingsDto dto, Guid actingUserId, CancellationToken ct = default);

    Task<PublicThemeDto> GetPublicThemeAsync(string app, CancellationToken ct = default);
}
