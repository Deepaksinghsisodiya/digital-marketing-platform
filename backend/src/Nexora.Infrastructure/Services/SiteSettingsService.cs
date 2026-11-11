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

    public SiteSettingsService(AppDbContext context, IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
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

        return new PublicSiteSettingsDto(
            CompanyName: settings.CompanyName,
            SupportEmail: settings.SupportEmail,
            SupportPhone: settings.SupportPhone,
            DefaultRegion: settings.DefaultRegion,
            SupportedRegions: settings.SupportedRegions,
            TimeZoneId: settings.TimeZoneId,
            LogoMediaId: settings.LogoMediaId,
            SectionVisibilityJson: string.IsNullOrWhiteSpace(settings.SectionVisibilityJson) ? "{}" : settings.SectionVisibilityJson);
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
        settings.LogoMediaId = dto.LogoMediaId ?? settings.LogoMediaId;

        // SMTP settings
        if (dto.SmtpHost != null)
        {
            settings.SmtpHost = dto.SmtpHost;
            settings.SmtpPort = dto.SmtpPort ?? 1025;
            settings.SmtpUseSsl = dto.SmtpUseSsl ?? false;
            settings.SmtpUserName = dto.SmtpUserName;
            if (!string.IsNullOrWhiteSpace(dto.SmtpPassword))
            {
                settings.SmtpPassword = dto.SmtpPassword;
            }
            settings.SmtpFromEmail = dto.SmtpFromEmail ?? "";
            settings.SmtpFromName = dto.SmtpFromName ?? "";
            settings.SmtpIsConfigured = !string.IsNullOrWhiteSpace(settings.SmtpHost);
        }

        // Section visibility
        if (dto.SectionVisibilityJson != null)
        {
            settings.SectionVisibilityJson = dto.SectionVisibilityJson;
        }

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
            SmtpHost: entity.SmtpHost,
            SmtpPort: entity.SmtpPort,
            SmtpUseSsl: entity.SmtpUseSsl,
            SmtpUserName: entity.SmtpUserName,
            SmtpFromEmail: entity.SmtpFromEmail,
            SmtpFromName: entity.SmtpFromName,
            SmtpIsConfigured: entity.SmtpIsConfigured,
            SectionVisibilityJson: string.IsNullOrWhiteSpace(entity.SectionVisibilityJson) ? "{}" : entity.SectionVisibilityJson,
            VersionToken: Convert.ToBase64String(entity.Version),
            CreatedAtUtc: entity.CreatedAtUtc,
            UpdatedAtUtc: entity.UpdatedAtUtc);
    }
}
