namespace Nexora.Application.Common.Models;

public record EmailRecipient(string Email, string? Name = null);

public record EmailMessage(
    IReadOnlyCollection<EmailRecipient> To,
    string Subject,
    string BodyHtml,
    string? BodyPlainText = null,
    string? ReplyTo = null);

