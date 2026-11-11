using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Email;

/// <summary>
/// SMTP Adapter using MailKit.
/// Uses dynamically configured SMTP from SiteSettings if present, falling back to SmtpOptions.
/// </summary>
public class MailKitEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MailKitEmailSender> _logger;
    private readonly IDataProtector? _protector;

    public MailKitEmailSender(
        IOptions<SmtpOptions> options,
        IServiceProvider serviceProvider,
        ILogger<MailKitEmailSender> logger,
        IDataProtectionProvider? dataProtectionProvider = null)
    {
        _options = options.Value;
        _serviceProvider = serviceProvider;
        _logger = logger;
        _protector = dataProtectionProvider?.CreateProtector("Nexora.SmtpCredentials");
    }

    public async Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        string host = _options.Host;
        int port = _options.Port;
        bool useSsl = _options.UseSsl;
        string? userName = _options.UserName;
        string? password = _options.Password;
        string fromEmail = _options.FromEmail;
        string fromName = _options.FromName;

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetService<AppDbContext>();
            if (db != null)
            {
                var settings = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SingletonId == 1, cancellationToken);
                if (settings != null && settings.SmtpIsConfigured && !string.IsNullOrWhiteSpace(settings.SmtpHost))
                {
                    host = settings.SmtpHost;
                    port = settings.SmtpPort;
                    useSsl = settings.SmtpUseSsl;
                    userName = settings.SmtpUserName;
                    password = settings.SmtpPassword;
                    if (!string.IsNullOrWhiteSpace(password) && password.StartsWith("enc:") && _protector != null)
                    {
                        try
                        {
                            password = _protector.Unprotect(password.Substring(4));
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to decrypt SMTP password from SiteSettings. Reverting to options fallback.");
                            password = _options.Password;
                        }
                    }
                    if (!string.IsNullOrWhiteSpace(settings.SmtpFromEmail)) fromEmail = settings.SmtpFromEmail;
                    if (!string.IsNullOrWhiteSpace(settings.SmtpFromName)) fromName = settings.SmtpFromName;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not query dynamic SiteSettings SMTP. Falling back to SmtpOptions.");
        }

        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogWarning("SMTP host is not configured. Email to {RecipientCount} recipients skipped.", message.To.Count);
            return;
        }

        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(fromName, fromEmail));

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
            var secureSocketOption = useSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            await client.ConnectAsync(host, port, secureSocketOption, cancellationToken);

            if (!string.IsNullOrWhiteSpace(userName) && !string.IsNullOrWhiteSpace(password))
            {
                await client.AuthenticateAsync(userName, password, cancellationToken);
            }

            await client.SendAsync(mimeMessage, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email with subject '{Subject}' successfully sent to {Count} recipient(s) via SMTP {Host}:{Port}.",
                message.Subject, message.To.Count, host, port);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email with subject '{Subject}' to {Count} recipient(s) via SMTP {Host}:{Port}.",
                message.Subject, message.To.Count, host, port);
            throw;
        }
    }
}
