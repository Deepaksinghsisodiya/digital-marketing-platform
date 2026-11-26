using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public enum InvoiceStatus
{
    Draft = 1,
    Sent = 2,
    Paid = 3,
    Overdue = 4,
    Cancelled = 5
}

public class ClientInvoice : BaseEntity<Guid>
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateTime DueDateUtc { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? PaidAtUtc { get; set; }
    public string? Description { get; set; }
}

public enum MilestoneStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3
}

public class ClientMilestone : BaseEntity<Guid>
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public MilestoneStatus Status { get; set; } = MilestoneStatus.Pending;
    public DateTime? DueDateUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}

public class ClientDocument : BaseEntity<Guid>
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public long FileSizeBytes { get; set; }
    public Guid? UploadedByUserId { get; set; }
}

public class ApiKey : BaseEntity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public string Scopes { get; set; } = "read";
    public Guid CreatedByUserId { get; set; }
    public DateTime? LastUsedAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
}
