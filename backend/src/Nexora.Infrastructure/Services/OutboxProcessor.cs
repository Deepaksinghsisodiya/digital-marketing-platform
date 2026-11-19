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
    private readonly IWebhookDispatcher _webhookDispatcher;
    private readonly ILogger<OutboxProcessor> _logger;

    public OutboxProcessor(
        AppDbContext context,
        IEmailTemplateService templateService,
        IEmailSender emailSender,
        ISiteSettingsService settingsService,
        IWebhookDispatcher webhookDispatcher,
        ILogger<OutboxProcessor> logger)
    {
        _context = context;
        _templateService = templateService;
        _emailSender = emailSender;
        _settingsService = settingsService;
        _webhookDispatcher = webhookDispatcher;
        _logger = logger;
    }

    public async Task<int> ProcessPendingMessagesAsync(CancellationToken ct = default)
    {
        int totalProcessed = 0;

        while (!ct.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var cutoff = now.AddMinutes(-5);

            // Atomic claim with UPDLOCK, READPAST inside a transaction to prevent duplicate claims by concurrent workers
            await using var tx = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted, ct);

            var pending = await _context.OutboxMessages
                .FromSqlInterpolated($@"
                    SELECT TOP (100) *
                    FROM OutboxMessages WITH (UPDLOCK, READPAST)
                    WHERE Status = {OutboxMessageStatus.Pending}
                      AND (NextAttemptAtUtc IS NULL OR NextAttemptAtUtc <= {now})
                      AND (LockClaimedAtUtc IS NULL OR LockClaimedAtUtc < {cutoff})
                    ORDER BY CreatedAtUtc")
                .ToListAsync(ct);

            if (pending.Count == 0)
            {
                await tx.RollbackAsync(ct);
                break;
            }

            foreach (var message in pending)
            {
                message.MarkClaimed();
            }
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            foreach (var message in pending)
            {
                try
                {
                    switch (message.EventType)
                    {
                        case "LeadReceived":
                            await ProcessLeadReceivedEventAsync(message.PayloadJson, ct);
                            break;
                        case "LeadWebhook":
                            await ProcessLeadWebhookEventAsync(message.PayloadJson, ct);
                            break;
                        case "ClientCreated":
                            await ProcessClientCreatedEventAsync(message.PayloadJson, ct);
                            break;
                        case "TaskAssigned":
                            await ProcessTaskAssignedEventAsync(message.PayloadJson, ct);
                            break;
                        case "TaskOverdueAlert":
                            await ProcessTaskOverdueAlertEventAsync(message.PayloadJson, ct);
                            break;
                        case "UserInvited":
                            await ProcessUserInvitedEventAsync(message.PayloadJson, ct);
                            break;
                        case "UserRoleUpdated":
                            await ProcessUserRoleUpdatedEventAsync(message.PayloadJson, ct);
                            break;
                        case "UserPasswordReset":
                            await ProcessUserPasswordResetEventAsync(message.PayloadJson, ct);
                            break;
                        default:
                            _logger.LogWarning("Unrecognized outbox event type {Type}. Marking skipped.", message.EventType);
                            break;
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

    private async Task ProcessClientCreatedEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var clientName = root.TryGetProperty("clientName", out var cn) ? cn.GetString() ?? "Valued Client" : "Valued Client";
        var contactEmail = root.TryGetProperty("contactEmail", out var ce) ? ce.GetString() : null;
        var industry = root.TryGetProperty("industry", out var ind) ? ind.GetString() ?? "General" : "General";
        var region = root.TryGetProperty("region", out var reg) ? reg.GetString() ?? "IN" : "IN";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";
        var supportEmail = settings?.SupportEmail ?? "support@nexora.digital";

        var vars = new Dictionary<string, string>
        {
            ["client.name"] = clientName,
            ["client.company"] = clientName,
            ["manager.name"] = "Nexora Client Success Team",
            ["manager.email"] = supportEmail,
            ["platform.companyName"] = companyName,
            ["support.email"] = supportEmail
        };

        // 1. Welcome onboarding email to client
        if (!string.IsNullOrWhiteSpace(contactEmail))
        {
            try
            {
                var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("client-welcome-onboarding", vars, ct);
                var emailMsg = new EmailMessage(
                    To: [new EmailRecipient(contactEmail, clientName)],
                    Subject: subject,
                    BodyHtml: bodyHtml,
                    BodyPlainText: bodyPlain);

                await _emailSender.SendEmailAsync(emailMsg, ct);
                _context.EmailLogs.Add(new EmailLog(contactEmail, subject, "client-welcome-onboarding", EmailDeliveryStatus.Sent));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send onboarding welcome email to client {Email}", contactEmail);
                _context.EmailLogs.Add(new EmailLog(contactEmail, "Client Onboarding Welcome", "client-welcome-onboarding", EmailDeliveryStatus.Failed, ex.Message));
            }
        }

        // 2. Alert to internal team
        try
        {
            var internalSubject = $"[New Client Onboarded] {clientName} ({industry} - {region.ToUpperInvariant()})";
            var internalHtml = $"<h2>New Client Account Created</h2><p><strong>Client:</strong> {clientName}</p><p><strong>Contact Email:</strong> {contactEmail}</p><p><strong>Industry:</strong> {industry}</p><p><strong>Region:</strong> {region.ToUpperInvariant()}</p>";
            var internalPlain = $"New Client Account Created:\nClient: {clientName}\nContact: {contactEmail}\nIndustry: {industry}\nRegion: {region}";

            var notifMsg = new EmailMessage(
                To: [new EmailRecipient(supportEmail, "Nexora Client Success Desk")],
                Subject: internalSubject,
                BodyHtml: internalHtml,
                BodyPlainText: internalPlain);

            await _emailSender.SendEmailAsync(notifMsg, ct);
            _context.EmailLogs.Add(new EmailLog(supportEmail, internalSubject, "client-internal-notification", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send internal client onboard alert to {Email}", supportEmail);
        }
    }

    private async Task ProcessTaskAssignedEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var assigneeEmail = root.TryGetProperty("assigneeEmail", out var ae) ? ae.GetString() : null;
        if (string.IsNullOrWhiteSpace(assigneeEmail)) return;

        var assigneeName = root.TryGetProperty("assigneeName", out var an) ? an.GetString() ?? assigneeEmail : assigneeEmail;
        var taskTitle = root.TryGetProperty("taskTitle", out var tt) ? tt.GetString() ?? "Task" : "Task";
        var priority = root.TryGetProperty("priority", out var pr) ? pr.GetString() ?? "Normal" : "Normal";
        var dueDate = root.TryGetProperty("dueDate", out var dd) ? dd.GetString() ?? "None" : "None";
        var clientName = root.TryGetProperty("clientName", out var cn) ? cn.GetString() ?? "General Task" : "General Task";
        var assignedBy = root.TryGetProperty("assignedBy", out var ab) ? ab.GetString() ?? "Administrator" : "Administrator";
        var actionUrl = root.TryGetProperty("actionUrl", out var au) ? au.GetString() ?? "http://localhost:5173/admin/tasks" : "http://localhost:5173/admin/tasks";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";

        var vars = new Dictionary<string, string>
        {
            ["user.name"] = assigneeName,
            ["task.title"] = taskTitle,
            ["task.priority"] = priority,
            ["task.due_date"] = dueDate,
            ["client.name"] = clientName,
            ["assigned_by"] = assignedBy,
            ["action.url"] = actionUrl,
            ["platform.companyName"] = companyName
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("task-assigned", vars, ct);
            var emailMsg = new EmailMessage(
                To: [new EmailRecipient(assigneeEmail, assigneeName)],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(emailMsg, ct);
            _context.EmailLogs.Add(new EmailLog(assigneeEmail, subject, "task-assigned", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send task assignment notification to {Email}", assigneeEmail);
            _context.EmailLogs.Add(new EmailLog(assigneeEmail, $"[Task Assigned] {taskTitle}", "task-assigned", EmailDeliveryStatus.Failed, ex.Message));
        }
    }

    private async Task ProcessTaskOverdueAlertEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var assigneeEmail = root.TryGetProperty("assigneeEmail", out var ae) ? ae.GetString() : null;
        if (string.IsNullOrWhiteSpace(assigneeEmail)) return;

        var assigneeName = root.TryGetProperty("assigneeName", out var an) ? an.GetString() ?? assigneeEmail : assigneeEmail;
        var taskTitle = root.TryGetProperty("taskTitle", out var tt) ? tt.GetString() ?? "Task" : "Task";
        var dueDate = root.TryGetProperty("dueDate", out var dd) ? dd.GetString() ?? "Past Due" : "Past Due";
        var clientName = root.TryGetProperty("clientName", out var cn) ? cn.GetString() ?? "General Task" : "General Task";
        var actionUrl = root.TryGetProperty("actionUrl", out var au) ? au.GetString() ?? "http://localhost:5173/admin/tasks" : "http://localhost:5173/admin/tasks";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";

        var vars = new Dictionary<string, string>
        {
            ["user.name"] = assigneeName,
            ["task.title"] = taskTitle,
            ["client.name"] = clientName,
            ["task.due_date"] = dueDate,
            ["action.url"] = actionUrl,
            ["platform.companyName"] = companyName
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("task-overdue-alert", vars, ct);
            var emailMsg = new EmailMessage(
                To: [new EmailRecipient(assigneeEmail, assigneeName)],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(emailMsg, ct);
            _context.EmailLogs.Add(new EmailLog(assigneeEmail, subject, "task-overdue-alert", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send task overdue alert to {Email}", assigneeEmail);
            _context.EmailLogs.Add(new EmailLog(assigneeEmail, $"⚠️ Overdue Task: {taskTitle}", "task-overdue-alert", EmailDeliveryStatus.Failed, ex.Message));
        }
    }

    private async Task ProcessUserInvitedEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var userEmail = root.TryGetProperty("userEmail", out var ue) ? ue.GetString() : null;
        if (string.IsNullOrWhiteSpace(userEmail)) return;

        var userName = root.TryGetProperty("userName", out var un) ? un.GetString() ?? userEmail : userEmail;
        var userRole = root.TryGetProperty("userRole", out var ur) ? ur.GetString() ?? "Staff" : "Staff";
        var inviteLink = root.TryGetProperty("inviteLink", out var il) ? il.GetString() ?? "" : "";
        var expiresHours = root.TryGetProperty("expiresHours", out var eh) ? eh.GetString() ?? "48" : "48";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";

        var vars = new Dictionary<string, string>
        {
            ["user.name"] = userName,
            ["user.role"] = userRole,
            ["invite.link"] = inviteLink,
            ["expires_hours"] = expiresHours,
            ["platform.companyName"] = companyName,
            ["support.email"] = settings?.SupportEmail ?? "support@nexora.digital"
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("user-invitation", vars, ct);
            var emailMsg = new EmailMessage(
                To: [new EmailRecipient(userEmail, userName)],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(emailMsg, ct);
            _context.EmailLogs.Add(new EmailLog(userEmail, subject, "user-invitation", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send invitation email to {Email}", userEmail);
            _context.EmailLogs.Add(new EmailLog(userEmail, "Invitation to Nexora Platform", "user-invitation", EmailDeliveryStatus.Failed, ex.Message));
        }
    }

    private async Task ProcessUserRoleUpdatedEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var userEmail = root.TryGetProperty("userEmail", out var ue) ? ue.GetString() : null;
        if (string.IsNullOrWhiteSpace(userEmail)) return;

        var userName = root.TryGetProperty("userName", out var un) ? un.GetString() ?? userEmail : userEmail;
        var userRole = root.TryGetProperty("userRole", out var ur) ? ur.GetString() ?? "Staff" : "Staff";
        var actionUrl = root.TryGetProperty("actionUrl", out var au) ? au.GetString() ?? "http://localhost:5173/admin" : "http://localhost:5173/admin";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";

        var vars = new Dictionary<string, string>
        {
            ["user.name"] = userName,
            ["user.role"] = userRole,
            ["action.url"] = actionUrl,
            ["platform.companyName"] = companyName
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("user-role-updated", vars, ct);
            var emailMsg = new EmailMessage(
                To: [new EmailRecipient(userEmail, userName)],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(emailMsg, ct);
            _context.EmailLogs.Add(new EmailLog(userEmail, subject, "user-role-updated", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send role update notification to {Email}", userEmail);
            _context.EmailLogs.Add(new EmailLog(userEmail, "Role Privileges Updated", "user-role-updated", EmailDeliveryStatus.Failed, ex.Message));
        }
    }

    private async Task ProcessUserPasswordResetEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;

        var userEmail = root.TryGetProperty("userEmail", out var ue) ? ue.GetString() : null;
        if (string.IsNullOrWhiteSpace(userEmail)) return;

        var userName = root.TryGetProperty("userName", out var un) ? un.GetString() ?? userEmail : userEmail;
        var resetLink = root.TryGetProperty("resetLink", out var rl) ? rl.GetString() ?? "" : "";

        var settings = await _settingsService.GetSettingsAsync(ct);
        var companyName = settings?.CompanyName ?? "Nexora Technologies";

        var vars = new Dictionary<string, string>
        {
            ["user.name"] = userName,
            ["reset.link"] = resetLink,
            ["platform.companyName"] = companyName,
            ["support.email"] = settings?.SupportEmail ?? "support@nexora.digital"
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await _templateService.RenderTemplateAsync("user-password-reset", vars, ct);
            var emailMsg = new EmailMessage(
                To: [new EmailRecipient(userEmail, userName)],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(emailMsg, ct);
            _context.EmailLogs.Add(new EmailLog(userEmail, subject, "user-password-reset", EmailDeliveryStatus.Sent));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send password reset email to {Email}", userEmail);
            _context.EmailLogs.Add(new EmailLog(userEmail, "Password Reset Request", "user-password-reset", EmailDeliveryStatus.Failed, ex.Message));
        }
    }

    private async Task ProcessLeadWebhookEventAsync(string payloadJson, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;
        var targetUrl = root.GetProperty("targetUrl").GetString();
        if (string.IsNullOrWhiteSpace(targetUrl)) return;

        var secret = root.TryGetProperty("secret", out var s) ? s.GetString() : null;

        var (success, error) = await _webhookDispatcher.DispatchLeadWebhookAsync(
            targetUrl,
            secret,
            payloadJson,
            ct);

        if (!success)
        {
            throw new InvalidOperationException($"Lead webhook delivery failed: {error}");
        }
    }
}
