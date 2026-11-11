using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public class OutboxMessage : BaseEntity<Guid>
{
    public string EventType { get; private set; } = string.Empty;
    public string PayloadJson { get; private set; } = string.Empty;
    public DateTime? ProcessedAtUtc { get; private set; }
    public DateTime? LockClaimedAtUtc { get; private set; }
    public int RetryCount { get; private set; }
    public string? ErrorMessage { get; private set; }

    private OutboxMessage() { }

    public OutboxMessage(string eventType, string payloadJson)
    {
        Id = Guid.NewGuid();
        EventType = eventType.Trim();
        PayloadJson = payloadJson;
        CreatedAtUtc = DateTime.UtcNow;
        RetryCount = 0;
    }

    public void MarkClaimed()
    {
        LockClaimedAtUtc = DateTime.UtcNow;
    }

    public void MarkProcessed()
    {
        ProcessedAtUtc = DateTime.UtcNow;
        LockClaimedAtUtc = null;
        ErrorMessage = null;
    }

    public void RecordFailure(string error)
    {
        RetryCount++;
        ErrorMessage = error;
        LockClaimedAtUtc = null;
    }
}

