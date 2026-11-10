namespace Nexora.Application.Settings.Models;

public record SiteSettingsDto(
    Guid Id,
    string CompanyName,
    string LegalName,
    string SupportEmail,
    string SupportPhone,
    string Address,
    string DefaultRegion,
    string[] SupportedRegions,
    string TimeZoneId,
    Guid? LogoMediaId,
    string VersionToken,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record PublicSiteSettingsDto(
    string CompanyName,
    string SupportEmail,
    string SupportPhone,
    string DefaultRegion,
    string[] SupportedRegions,
    string TimeZoneId,
    Guid? LogoMediaId);

public record UpdateSiteSettingsDto(
    string CompanyName,
    string LegalName,
    string SupportEmail,
    string SupportPhone,
    string Address,
    string DefaultRegion,
    string[] SupportedRegions,
    string TimeZoneId,
    Guid? LogoMediaId,
    string VersionToken);

