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
    string? LogoUrl,
    string SmtpHost,
    int SmtpPort,
    bool SmtpUseSsl,
    string? SmtpUserName,
    string? SmtpFromEmail,
    string? SmtpFromName,
    bool SmtpIsConfigured,
    string SectionVisibilityJson,
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
    Guid? LogoMediaId,
    string? LogoUrl,
    string SectionVisibilityJson);

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
    string? SmtpHost = null,
    int? SmtpPort = null,
    bool? SmtpUseSsl = null,
    string? SmtpUserName = null,
    string? SmtpPassword = null,
    string? SmtpFromEmail = null,
    string? SmtpFromName = null,
    string? SectionVisibilityJson = null,
    string VersionToken = "");

public record TestSmtpConnectionDto(
    string Host,
    int Port,
    bool UseSsl,
    string? UserName,
    string? Password,
    string FromEmail,
    string FromName,
    string RecipientEmail);
