using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class OutboxProcessor : IOutboxProcessor
{
    private readonly AppDbContext _context;
    private readonly IEmailTemplateService _templateService;
    private readonly IEmailSender _emailSender;
    private readonly ISiteSettingsService _settingsService;
    private readonly ILogger<OutboxProcessor> _logger;

    public OutboxProcessor(
        AppDbContext context,
        IEmailTemplateService templateService,
        IEmailSender emailSender,
        ISiteSettingsService settingsService,
        ILogger<OutboxProcessor> logger)
    {
        _context = context;
        _templateService = templateService;
        _emailSender = emailSender;
        _settingsService = settingsService;
        _logger = logger;
    }

    public async Task<int> ProcessPendingMessagesAsync(CancellationToken ct = default)
    {
        int totalProcessed = 0;

        while (!ct.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var cutoff = now.AddMinutes(-5);

            // Fetch unprocessed or lock-expired pending messages that are due for attempt
            var pending = await _context.OutboxMessages
                .Where(o => o.Status == OutboxMessageStatus.Pending
                         && (o.NextAttemptAtUtc == null || o.NextAttemptAtUtc <= now)
                         && (o.LockClaimedAtUtc == null || o.LockClaimedAtUtc < cutoff))
                .OrderBy(o => o.CreatedAtUtc)
                .Take(100)
                .ToListAsync(ct);

            if (pending.Count == 0) break;

            foreach (var message in pending)
            {
                message.MarkClaimed();
            }
            await _context.SaveChangesAsync(ct);

            foreach (var message in pending)
            {
                try
                {
                    if (message.EventType == "LeadReceived")
                    {
                        await ProcessLeadReceivedEventAsync(message.PayloadJson, ct);
                    }

                    message.MarkProcessed();
                    totalProcessed++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process outbox message {Id} of type {Type}", message.Id, message.EventType);
                    bool isOutcomeUnknown = ex is System.IO.IOException || ex is TimeoutException;
                    message.RecordFailure(ex.Message, isOutcomeUnknown: isOutcomeUnknown);
                }
            }

            await _context.SaveChangesAsync(ct);

            if (pending.Count < 100) break;
        }

        return totalProcessed;
    }

    private async Task ProcessLeadReceivedEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var email = root.GetProperty("email").GetString();
        var name = root.GetProperty("fullName").GetString() ?? "Valued Prospect";
        var company = root.TryGetProperty("company", out var c) ? c.GetString() ?? string.Empty : string.Empty;
        var region = root.TryGetProperty("region", out var r) ? r.GetString() ?? "in" : "in";
        var phone = root.TryGetProperty("phone", out var p) ? p.GetString() ?? string.Empty : string.Empty;

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";
        var supportEmail = settings?.SupportEmail ?? "support@nexora.digital";

        var vars = new Dictionary<string, string>
        {
            ["lead.name"] = name,
            ["lead.email"] = email ?? string.Empty,
            ["lead.company"] = company,
            ["lead.phone"] = phone,
            ["lead.region"] = region.ToUpperInvariant(),
            ["platform.companyName"] = companyName,
            ["platform.supportEmail"] = supportEmail
        };

        // 1. Auto-reply to lead
        if (!string.IsNullOrWhiteSpace(email))
        {
            try
            {
                var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("lead-auto-reply", vars, ct);
                var emailMsg = new EmailMessage(
                    To: [new EmailRecipient(email, name)],
                    Subject: subject,
                    BodyHtml: bodyHtml,
                    BodyPlainText: bodyPlain);

                await _emailSender.SendEmailAsync(emailMsg, ct);

                _context.EmailLogs.Add(new EmailLog(email, subject, "lead-auto-reply", EmailDeliveryStatus.Sent));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send auto-reply to {Email}", email);
                _context.EmailLogs.Add(new EmailLog(email, "Lead Auto-Reply", "lead-auto-reply", EmailDeliveryStatus.Failed, ex.Message));
            }
        }

        // 2. Internal team notification
        try
        {
            var (internalSubject, internalHtml, internalPlain) = await _templateService.RenderTemplateAsync("lead-internal-notification", vars, ct);
            var notifMsg = new EmailMessage(
                To: [new EmailRecipient(supportEmail, "Nexora Inbound Desk")],
                Subject: internalSubject,
                BodyHtml: internalHtml,
                BodyPlainText: internalPlain);

            await _emailSender.SendEmailAsync(notifMsg, ct);

            _context.EmailLogs.Add(new EmailLog(supportEmail, internalSubject, "lead-internal-notification", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send internal alert to {Email}", supportEmail);
            _context.EmailLogs.Add(new EmailLog(supportEmail, "Internal Alert", "lead-internal-notification", EmailDeliveryStatus.Failed, ex.Message));
        }
    }
}

