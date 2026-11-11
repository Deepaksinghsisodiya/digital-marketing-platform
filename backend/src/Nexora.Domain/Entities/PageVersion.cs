using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class PageVersion : BaseEntity
{
    public Guid PageId { get; set; }
    public Page Page { get; set; } = null!;

    public int VersionNumber { get; set; }
    public int SchemaVersion { get; set; } = 1;

    // Ordered blocks serialized as JSON with SQL Server ISJSON check constraint
    public string ContentJson { get; set; } = "[]";

    public string? Note { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
}

