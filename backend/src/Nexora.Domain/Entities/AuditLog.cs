namespace Nexora.Domain.Entities;

/// <summary>
/// Append-only audit log.
/// Does not inherit BaseEntity (no UpdatedAtUtc needed for append-only logs).
/// Single TimestampUtc property.
/// Database trigger strictly forbids UPDATE and DELETE operations.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    public Guid? ActorUserId { get; set; }
    public string? ActorEmail { get; set; }

    public string Action { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string Outcome { get; set; } = "Success"; // Success, Failure, Forbidden

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string CorrelationId { get; set; } = string.Empty;

    public string? MetadataJson { get; set; }
}
