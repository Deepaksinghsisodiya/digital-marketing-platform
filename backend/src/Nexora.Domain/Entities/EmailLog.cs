using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public enum EmailDeliveryStatus
{
    Queued = 0,
    Sent = 1,
    Failed = 2
}

public class EmailLog : BaseEntity<Guid>
{
    public string RecipientEmail { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string? TemplateKey { get; private set; }
    public EmailDeliveryStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; }
    public DateTime? SentAtUtc { get; private set; }

    private EmailLog() { }

    public EmailLog(
        string recipientEmail,
        string subject,
        string? templateKey,
        EmailDeliveryStatus status,
        string? errorMessage = null)
    {
        Id = Guid.NewGuid();
        RecipientEmail = recipientEmail.Trim().ToLowerInvariant();
        Subject = subject.Trim();
        TemplateKey = templateKey?.Trim().ToLowerInvariant();
        Status = status;
        ErrorMessage = errorMessage;
        SentAtUtc = status == EmailDeliveryStatus.Sent ? DateTime.UtcNow : null;
    }
}

