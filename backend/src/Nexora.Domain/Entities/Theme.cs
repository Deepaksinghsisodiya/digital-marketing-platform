using System.ComponentModel.DataAnnotations;
using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class Theme : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ConfigJson { get; set; } = "{}";
    public string? DraftConfigJson { get; set; }
    public bool IsSystem { get; set; } = false;
    public bool IsDefault { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    public int CurrentVersion { get; set; } = 1;
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    [Timestamp]
    public byte[] Version { get; set; } = [];

    public ICollection<ThemeVersion> Versions { get; set; } = new List<ThemeVersion>();
}
