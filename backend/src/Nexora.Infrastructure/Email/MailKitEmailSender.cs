using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;

namespace Nexora.Infrastructure.Email;

/// <summary>
/// SMTP Adapter using MailKit.
/// Used in local development with Mailpit, or in production with external SMTP provider.
/// </summary>
public class MailKitEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;
    private readonly ILogger<MailKitEmailSender> _logger;

    public MailKitEmailSender(IOptions<SmtpOptions> options, ILogger<MailKitEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            _logger.LogWarning("SMTP host is not configured. Email to {RecipientCount} recipients skipped.", message.To.Count);
            return;
        }

        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));

        foreach (var recipient in message.To)
        {
            mimeMessage.To.Add(new MailboxAddress(recipient.Name ?? recipient.Email, recipient.Email));
        }

        mimeMessage.Subject = message.Subject;

        var builder = new BodyBuilder
        {
            HtmlBody = message.BodyHtml
        };

        if (!string.IsNullOrWhiteSpace(message.BodyPlainText))
        {
            builder.TextBody = message.BodyPlainText;
        }

        mimeMessage.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            var secureSocketOption = _options.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            await client.ConnectAsync(_options.Host, _options.Port, secureSocketOption, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_options.UserName) && !string.IsNullOrWhiteSpace(_options.Password))
            {
                await client.AuthenticateAsync(_options.UserName, _options.Password, cancellationToken);
            }

            await client.SendAsync(mimeMessage, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email with subject '{Subject}' successfully sent to {Count} recipient(s).",
                message.Subject, message.To.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email with subject '{Subject}' to {Count} recipient(s).",
                message.Subject, message.To.Count);
            throw;
        }
    }
}

