using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class ThemeVersion : BaseEntity
{
    public Guid ThemeId { get; set; }
    public Theme? Theme { get; set; }
    public int VersionNumber { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public Guid? ChangedBy { get; set; }
    public string ChangeDescription { get; set; } = string.Empty;
}
