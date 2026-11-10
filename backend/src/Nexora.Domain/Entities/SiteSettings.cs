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

    [Timestamp]
    public byte[] Version { get; set; } = [];

    public Guid? UpdatedByUserId { get; set; }
}
