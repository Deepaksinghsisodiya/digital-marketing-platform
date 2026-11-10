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
            LogoMediaId: settings.LogoMediaId);
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

        settings.CompanyName = dto.CompanyName;
        settings.LegalName = dto.LegalName;
        settings.SupportEmail = dto.SupportEmail;
        settings.SupportPhone = dto.SupportPhone;
        settings.Address = dto.Address;
        settings.DefaultRegion = dto.DefaultRegion;
        settings.SupportedRegions = dto.SupportedRegions;
        settings.TimeZoneId = dto.TimeZoneId;
        settings.LogoMediaId = dto.LogoMediaId;
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
            VersionToken: Convert.ToBase64String(entity.Version),
            CreatedAtUtc: entity.CreatedAtUtc,
            UpdatedAtUtc: entity.UpdatedAtUtc);
    }
}
