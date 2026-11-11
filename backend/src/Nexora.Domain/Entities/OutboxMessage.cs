using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public enum OutboxMessageStatus
{
    Pending = 0,
    Processing = 1,
    Processed = 2,
    DeadLetter = 3,
    DeliveryOutcomeUnknown = 4
}

public class OutboxMessage : BaseEntity<Guid>
{
    public string EventType { get; private set; } = string.Empty;
    public string PayloadJson { get; private set; } = string.Empty;
    public OutboxMessageStatus Status { get; private set; } = OutboxMessageStatus.Pending;
    public DateTime? ProcessedAtUtc { get; private set; }
    public DateTime? LockClaimedAtUtc { get; private set; }
    public DateTime? NextAttemptAtUtc { get; private set; }
    public int RetryCount { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string? DeadLetterReason { get; private set; }

    private OutboxMessage() { }

    public OutboxMessage(string eventType, string payloadJson)
    {
        Id = Guid.NewGuid();
        EventType = eventType.Trim();
        PayloadJson = payloadJson;
        CreatedAtUtc = DateTime.UtcNow;
        Status = OutboxMessageStatus.Pending;
        RetryCount = 0;
    }

    public void MarkClaimed()
    {
        Status = OutboxMessageStatus.Processing;
        LockClaimedAtUtc = DateTime.UtcNow;
    }

    public void MarkProcessed()
    {
        Status = OutboxMessageStatus.Processed;
        ProcessedAtUtc = DateTime.UtcNow;
        LockClaimedAtUtc = null;
        ErrorMessage = null;
    }

    public void RecordFailure(string error, bool isOutcomeUnknown = false)
    {
        RetryCount++;
        ErrorMessage = error;
        LockClaimedAtUtc = null;

        if (isOutcomeUnknown)
        {
            Status = OutboxMessageStatus.DeliveryOutcomeUnknown;
            DeadLetterReason = "Delivery outcome unknown after connection established; flagged to prevent duplicate transmission.";
            return;
        }

        if (RetryCount >= 5)
        {
            Status = OutboxMessageStatus.DeadLetter;
            DeadLetterReason = $"Exceeded maximum retry limit (5). Last error: {error}";
        }
        else
        {
            Status = OutboxMessageStatus.Pending;
            // Exponential backoff: 10s, 20s, 40s, 80s
            NextAttemptAtUtc = DateTime.UtcNow.AddSeconds(Math.Pow(2, RetryCount) * 10);
        }
    }

    public void MarkDeadLetter(string reason)
    {
        Status = OutboxMessageStatus.DeadLetter;
        DeadLetterReason = reason;
        LockClaimedAtUtc = null;
    }
}

