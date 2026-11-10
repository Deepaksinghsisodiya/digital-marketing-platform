using Microsoft.Extensions.Options;

namespace Nexora.Application.Common.Localization;

public class RegionDefinitionOptions
{
    public string Code { get; set; } = string.Empty;
    public string Culture { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = string.Empty;
}

public class RegionOptions
{
    public const string SectionName = "Region";

    public string DefaultRegionCode { get; set; } = "IN";
    public string DefaultCulture { get; set; } = "en-IN";
    public string DefaultTimeZoneId { get; set; } = "Asia/Kolkata";

    public Dictionary<string, RegionDefinitionOptions> SupportedRegions { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

/// <summary>
/// Immutable context representing resolved region and culture for the current request.
/// Timestamps are strictly stored in UTC; this context provides the display formatting rules.
/// </summary>
public sealed record RegionContext(
    string RegionCode,
    string CultureName,
    string TimeZoneId)
{
    public static RegionContext FromOptions(RegionOptions options) => new(
        RegionCode: options.DefaultRegionCode,
        CultureName: options.DefaultCulture,
        TimeZoneId: options.DefaultTimeZoneId);
}

public interface ICurrentRegionService
{
    RegionContext Current { get; }
    void SetCurrent(RegionContext context);
}

public sealed class CurrentRegionService : ICurrentRegionService
{
    private static readonly AsyncLocal<RegionContext?> _current = new();
    private readonly RegionOptions _options;

    public CurrentRegionService(IOptions<RegionOptions> options)
    {
        _options = options.Value;
    }

    public RegionContext Current
    {
        get => _current.Value ?? RegionContext.FromOptions(_options);
        set => _current.Value = value;
    }

    public void SetCurrent(RegionContext context) => _current.Value = context;
}
