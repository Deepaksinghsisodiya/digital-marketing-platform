using Nexora.Application.Settings.Models;

namespace Nexora.Application.Common.Interfaces;

public interface ISiteSettingsService
{
    Task<SiteSettingsDto> GetSettingsAsync(CancellationToken ct = default);
    Task<PublicSiteSettingsDto> GetPublicSettingsAsync(CancellationToken ct = default);
    Task<(bool Success, string? Error, bool Conflict, SiteSettingsDto? Settings)> UpdateSettingsAsync(UpdateSiteSettingsDto dto, Guid actingUserId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> TestSmtpConnectionAsync(TestSmtpConnectionDto dto, CancellationToken ct = default);
}

