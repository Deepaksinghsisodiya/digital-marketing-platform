using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class NavigationMenu : BaseEntity
{
    public string Key { get; set; } = string.Empty; // e.g. "header", "footer"
    public string Title { get; set; } = string.Empty;
    public string? RegionCode { get; set; } // Optional region filter (e.g. "IN", "US")
    public ICollection<NavigationMenuItem> Items { get; set; } = new List<NavigationMenuItem>();
}

public sealed class NavigationMenuItem : BaseEntity
{
    public Guid MenuId { get; set; }
    public NavigationMenu Menu { get; set; } = null!;

    public string Label { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public Guid? ParentItemId { get; set; }
    public NavigationMenuItem? ParentItem { get; set; }
    public ICollection<NavigationMenuItem> Children { get; set; } = new List<NavigationMenuItem>();
}

