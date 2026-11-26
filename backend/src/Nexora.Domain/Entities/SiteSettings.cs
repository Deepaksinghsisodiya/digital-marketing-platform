using System.ComponentModel.DataAnnotations;
using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

/// <summary>
/// Singleton site settings for branding, regional configuration, and platform defaults.
/// Database check constraint enforces SingletonId == 1.
/// Concurrency is handled via SQL Server byte[] rowversion mapped to Version.
/// Defaults are populated by startup seeder from config/env - no hardcoded defaults in code/db.
/// </summary>
public class SiteSettings : BaseEntity
{
    public int SingletonId { get; set; } = 1;

    public string CompanyName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string SupportEmail { get; set; } = string.Empty;
    public string SupportPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public string DefaultRegion { get; set; } = string.Empty;
    public string[] SupportedRegions { get; set; } = [];
    public string TimeZoneId { get; set; } = string.Empty;

    public Guid? LogoMediaId { get; set; }
    public Guid? FaviconMediaId { get; set; }

    // SMTP Email Server Configuration
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 1025;
    public bool SmtpUseSsl { get; set; } = false;
    public string? SmtpUserName { get; set; }
    public string? SmtpPassword { get; set; }
    public string SmtpFromEmail { get; set; } = string.Empty;
    public string SmtpFromName { get; set; } = string.Empty;
    public bool SmtpIsConfigured { get; set; } = false;

    // Website Section Visibility & Theme Tokens
    public string SectionVisibilityJson { get; set; } = "{}";
    public string ThemeTokensJson { get; set; } = "{}";
    public bool GlobalThemeEngineEnabled { get; set; } = true;
    public bool WebsiteThemeEnabled { get; set; } = true;
    public string WebsiteThemeId { get; set; } = "cyber-emerald";
    public bool AdminThemeEnabled { get; set; } = true;
    public string AdminThemeId { get; set; } = "cyber-emerald";
    public string FallbackThemeId { get; set; } = "cyber-emerald";
    public string SocialLinksJson { get; set; } = "{}";
    public string TrackingCodesJson { get; set; } = "{}";
    public string? BookingUrl { get; set; }
    public string AnnouncementBarJson { get; set; } = "{}";
    public string RedirectRulesJson { get; set; } = "[]";
    public string? WebhookUrl { get; set; }
    public string? WebhookSecret { get; set; }
    public string? CustomDomain { get; set; }
    public string? SslStatus { get; set; } = "Pending";

    [Timestamp]
    public byte[] Version { get; set; } = [];

    public Guid? UpdatedByUserId { get; set; }
}
