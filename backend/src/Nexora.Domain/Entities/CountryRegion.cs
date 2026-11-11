namespace Nexora.Domain.Entities;

public class CountryRegion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // "IN", "US", "AE", etc.
    public string Name { get; set; } = string.Empty; // "India", "United States", etc.
    public string CurrencyCode { get; set; } = "USD";
    public string CurrencySymbol { get; set; } = "$";
    public string FlagEmoji { get; set; } = "🌐";
    public string PhonePrefix { get; set; } = "+1";
    public string TaxLabel { get; set; } = "Tax";
    public bool IsDefault { get; set; }
    public bool IsEnabled { get; set; } = true;
    public int OrderIndex { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

