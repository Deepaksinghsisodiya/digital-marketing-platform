using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Settings.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class SiteSettingsService : ISiteSettingsService
{
    private readonly AppDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IDataProtector? _protector;

    public SiteSettingsService(
        AppDbContext context,
        IDateTimeProvider dateTimeProvider,
        IDataProtectionProvider? dataProtectionProvider = null)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
        _protector = dataProtectionProvider?.CreateProtector("Nexora.SmtpCredentials");
    }

    public async Task<SiteSettingsDto> GetSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _context.SiteSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SingletonId == 1, ct)
            ?? throw new InvalidOperationException("SiteSettings singleton row not found in database.");

        return MapToDto(settings);
    }

    public async Task<PublicSiteSettingsDto> GetPublicSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _context.SiteSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SingletonId == 1, ct)
            ?? throw new InvalidOperationException("SiteSettings singleton row not found in database.");

        var logoUrl = settings.LogoMediaId.HasValue
            ? $"/api/v1/public/media/{settings.LogoMediaId.Value}/download"
            : null;
        var faviconUrl = settings.FaviconMediaId.HasValue
            ? $"/api/v1/public/media/{settings.FaviconMediaId.Value}/download"
            : null;

        return new PublicSiteSettingsDto(
            CompanyName: settings.CompanyName,
            SupportEmail: settings.SupportEmail,
            SupportPhone: settings.SupportPhone,
            DefaultRegion: settings.DefaultRegion,
            SupportedRegions: settings.SupportedRegions,
            TimeZoneId: settings.TimeZoneId,
            LogoMediaId: settings.LogoMediaId,
            LogoUrl: logoUrl,
            FaviconMediaId: settings.FaviconMediaId,
            FaviconUrl: faviconUrl,
            SectionVisibilityJson: string.IsNullOrWhiteSpace(settings.SectionVisibilityJson) ? "{}" : settings.SectionVisibilityJson,
            ThemeTokensJson: string.IsNullOrWhiteSpace(settings.ThemeTokensJson) ? "{}" : settings.ThemeTokensJson,
            SocialLinksJson: string.IsNullOrWhiteSpace(settings.SocialLinksJson) ? "{}" : settings.SocialLinksJson,
            TrackingCodesJson: string.IsNullOrWhiteSpace(settings.TrackingCodesJson) ? "{}" : settings.TrackingCodesJson,
            BookingUrl: settings.BookingUrl,
            AnnouncementBarJson: string.IsNullOrWhiteSpace(settings.AnnouncementBarJson) ? "{}" : settings.AnnouncementBarJson);
    }

    public async Task<(bool Success, string? Error, bool Conflict, SiteSettingsDto? Settings)> UpdateSettingsAsync(
        UpdateSiteSettingsDto dto,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var settings = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.SingletonId == 1, ct);

        if (settings == null)
        {
            return (false, "SiteSettings singleton record not found.", false, null);
        }

        byte[] originalVersion;
        try
        {
            originalVersion = Convert.FromBase64String(dto.VersionToken);
        }
        catch (FormatException)
        {
            return (false, "Invalid VersionToken format.", false, null);
        }

        // Set original rowversion to trigger EF Core optimistic concurrency check
        _context.Entry(settings).Property(s => s.Version).OriginalValue = originalVersion;

        settings.CompanyName = dto.CompanyName ?? settings.CompanyName;
        settings.LegalName = dto.LegalName ?? settings.LegalName ?? string.Empty;
        settings.SupportEmail = dto.SupportEmail ?? settings.SupportEmail;
        settings.SupportPhone = dto.SupportPhone ?? settings.SupportPhone;
        settings.Address = dto.Address ?? settings.Address ?? string.Empty;
        settings.DefaultRegion = dto.DefaultRegion ?? settings.DefaultRegion;
        settings.SupportedRegions = dto.SupportedRegions ?? settings.SupportedRegions;
        settings.TimeZoneId = dto.TimeZoneId ?? settings.TimeZoneId;
        settings.LogoMediaId = dto.LogoMediaId;

        // SMTP settings
        if (dto.SmtpHost != null)
        {
            settings.SmtpHost = dto.SmtpHost;
            settings.SmtpPort = dto.SmtpPort ?? 1025;
            settings.SmtpUseSsl = dto.SmtpUseSsl ?? false;
            settings.SmtpUserName = dto.SmtpUserName;
            if (!string.IsNullOrWhiteSpace(dto.SmtpPassword))
            {
                settings.SmtpPassword = _protector != null
                    ? "enc:" + _protector.Protect(dto.SmtpPassword)
                    : dto.SmtpPassword;
            }
            settings.SmtpFromEmail = dto.SmtpFromEmail ?? "";
            settings.SmtpFromName = dto.SmtpFromName ?? "";
            settings.SmtpIsConfigured = !string.IsNullOrWhiteSpace(settings.SmtpHost);
        }

        // Section visibility & Theme tokens
        if (dto.SectionVisibilityJson != null)
        {
            settings.SectionVisibilityJson = dto.SectionVisibilityJson;
        }
        if (dto.FaviconMediaId.HasValue) settings.FaviconMediaId = dto.FaviconMediaId;
        if (dto.ThemeTokensJson != null) settings.ThemeTokensJson = dto.ThemeTokensJson;
        if (dto.SocialLinksJson != null) settings.SocialLinksJson = dto.SocialLinksJson;
        if (dto.TrackingCodesJson != null) settings.TrackingCodesJson = dto.TrackingCodesJson;
        if (dto.BookingUrl != null) settings.BookingUrl = dto.BookingUrl;
        if (dto.AnnouncementBarJson != null) settings.AnnouncementBarJson = dto.AnnouncementBarJson;

        settings.UpdatedByUserId = actingUserId;
        settings.MarkUpdated();

        try
        {
            await _context.SaveChangesAsync(ct);
            return (true, null, false, MapToDto(settings));
        }
        catch (DbUpdateConcurrencyException)
        {
            return (false, "Site settings were modified by another administrator. Please refresh and retry.", true, null);
        }
    }

    public async Task<(bool Success, string? Error)> TestSmtpConnectionAsync(TestSmtpConnectionDto dto, CancellationToken ct = default)
    {
        try
        {
            using var client = new MailKit.Net.Smtp.SmtpClient();
            var secureOption = dto.UseSsl
                ? MailKit.Security.SecureSocketOptions.SslOnConnect
                : MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable;

            await client.ConnectAsync(dto.Host, dto.Port, secureOption, ct);

            if (!string.IsNullOrWhiteSpace(dto.UserName) && !string.IsNullOrWhiteSpace(dto.Password))
            {
                await client.AuthenticateAsync(dto.UserName, dto.Password, ct);
            }

            var message = new MimeKit.MimeMessage();
            message.From.Add(new MimeKit.MailboxAddress(dto.FromName, dto.FromEmail));
            message.To.Add(new MimeKit.MailboxAddress(dto.RecipientEmail, dto.RecipientEmail));
            message.Subject = "Nexora Platform: SMTP Connection Diagnostic Test";
            message.Body = new MimeKit.TextPart("plain")
            {
                Text = $"Success! This test email verifies that your SMTP server ({dto.Host}:{dto.Port}) is connected and authenticating properly."
            };

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    private static SiteSettingsDto MapToDto(SiteSettings entity)
    {
        var logoUrl = entity.LogoMediaId.HasValue
            ? $"/api/v1/public/media/{entity.LogoMediaId.Value}/download"
            : null;
        var faviconUrl = entity.FaviconMediaId.HasValue
            ? $"/api/v1/public/media/{entity.FaviconMediaId.Value}/download"
            : null;

        return new SiteSettingsDto(
            Id: entity.Id,
            CompanyName: entity.CompanyName,
            LegalName: entity.LegalName,
            SupportEmail: entity.SupportEmail,
            SupportPhone: entity.SupportPhone,
            Address: entity.Address,
            DefaultRegion: entity.DefaultRegion,
            SupportedRegions: entity.SupportedRegions,
            TimeZoneId: entity.TimeZoneId,
            LogoMediaId: entity.LogoMediaId,
            LogoUrl: logoUrl,
            FaviconMediaId: entity.FaviconMediaId,
            FaviconUrl: faviconUrl,
            SmtpHost: entity.SmtpHost,
            SmtpPort: entity.SmtpPort,
            SmtpUseSsl: entity.SmtpUseSsl,
            SmtpUserName: entity.SmtpUserName,
            SmtpFromEmail: entity.SmtpFromEmail,
            SmtpFromName: entity.SmtpFromName,
            SmtpIsConfigured: entity.SmtpIsConfigured,
            SectionVisibilityJson: string.IsNullOrWhiteSpace(entity.SectionVisibilityJson) ? "{}" : entity.SectionVisibilityJson,
            ThemeTokensJson: string.IsNullOrWhiteSpace(entity.ThemeTokensJson) ? "{}" : entity.ThemeTokensJson,
            SocialLinksJson: string.IsNullOrWhiteSpace(entity.SocialLinksJson) ? "{}" : entity.SocialLinksJson,
            TrackingCodesJson: string.IsNullOrWhiteSpace(entity.TrackingCodesJson) ? "{}" : entity.TrackingCodesJson,
            BookingUrl: entity.BookingUrl,
            AnnouncementBarJson: string.IsNullOrWhiteSpace(entity.AnnouncementBarJson) ? "{}" : entity.AnnouncementBarJson,
            VersionToken: Convert.ToBase64String(entity.Version),
            CreatedAtUtc: entity.CreatedAtUtc,
            UpdatedAtUtc: entity.UpdatedAtUtc);
    }
}
