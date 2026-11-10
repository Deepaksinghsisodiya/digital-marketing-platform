using Nexora.Application.Common.Models;

namespace Nexora.Application.Common.Interfaces;

/// <summary>
/// Email sender abstraction.
/// Implementations:
/// 1. Local/Self-hosted: MailKit SmtpAdapter (Mailpit in development)
/// 2. Production: External HTTPS API or authenticated external SMTP adapter (documented in architecture)
/// </summary>
public interface IEmailSender
{
    Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

