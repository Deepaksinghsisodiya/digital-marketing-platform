using System.Net;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Application.Email.DTOs;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly AppDbContext _context;
    private readonly IEmailSender _emailSender;
    private readonly IAuditLogService _auditLogService;

    private static readonly Regex VariableRegex = new(@"\{\{([a-zA-Z0-9_\.]+)\}\}", RegexOptions.Compiled);

    public EmailTemplateService(
        AppDbContext context,
        IEmailSender emailSender,
        IAuditLogService auditLogService)
    {
        _context = context;
        _emailSender = emailSender;
        _auditLogService = auditLogService;
    }

    public async Task<(string Subject, string BodyHtml, string? BodyPlainText)> RenderTemplateAsync(
        string templateKey,
        Dictionary<string, string> variables,
        CancellationToken ct = default)
    {
        var template = await _context.EmailTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Key == templateKey.Trim().ToLowerInvariant(), ct);

        if (template == null)
        {
            throw new InvalidOperationException($"Email template '{templateKey}' was not found.");
        }

        var renderedSubject = ReplaceVariables(template.SubjectTemplate, variables, isHtml: false);
        var renderedHtml = ReplaceVariables(template.BodyHtmlTemplate, variables, isHtml: true);
        var renderedPlain = template.BodyPlainTextTemplate != null
            ? ReplaceVariables(template.BodyPlainTextTemplate, variables, isHtml: false)
            : null;

        return (renderedSubject, renderedHtml, renderedPlain);
    }

    public async Task<IReadOnlyList<EmailTemplateDto>> GetTemplatesAsync(CancellationToken ct = default)
    {
        return await _context.EmailTemplates
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new EmailTemplateDto(
                t.Id,
                t.Key,
                t.Name,
                t.SubjectTemplate,
                t.BodyHtmlTemplate,
                t.BodyPlainTextTemplate,
                t.IsActive,
                t.CreatedAtUtc,
                t.UpdatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task<EmailTemplateDto?> GetTemplateByKeyAsync(string key, CancellationToken ct = default)
    {
        var t = await _context.EmailTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == key.Trim().ToLowerInvariant(), ct);

        if (t == null) return null;

        return new EmailTemplateDto(
            t.Id,
            t.Key,
            t.Name,
            t.SubjectTemplate,
            t.BodyHtmlTemplate,
            t.BodyPlainTextTemplate,
            t.IsActive,
            t.CreatedAtUtc,
            t.UpdatedAtUtc);
    }

    public async Task<(bool Success, string? Error)> UpdateTemplateAsync(
        string key,
        UpdateEmailTemplateRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(x => x.Key == key.Trim().ToLowerInvariant(), ct);

        if (template == null) return (false, "Template not found.");

        template.Update(
            request.Name,
            request.SubjectTemplate,
            request.BodyHtmlTemplate,
            request.BodyPlainTextTemplate,
            request.IsActive);

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "EmailTemplate.Updated",
            resourceType: "EmailTemplate",
            resourceId: template.Key,
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["name"] = template.Name },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> SendTestEmailAsync(
        string toEmail,
        string templateKey,
        Dictionary<string, string>? testVariables,
        CancellationToken ct = default)
    {
        var vars = testVariables ?? new Dictionary<string, string>
        {
            ["lead.name"] = "Jane Doe",
            ["lead.email"] = toEmail,
            ["lead.company"] = "Test Corp",
            ["lead.phone"] = "+1 555-0199",
            ["lead.region"] = "US",
            ["platform.companyName"] = "Nexora Platform"
        };

        try
        {
            var (subject, bodyHtml, bodyPlain) = await RenderTemplateAsync(templateKey, vars, ct);

            var message = new EmailMessage(
                To: [new EmailRecipient(toEmail, "Test Recipient")],
                Subject: subject,
                BodyHtml: bodyHtml,
                BodyPlainText: bodyPlain);

            await _emailSender.SendEmailAsync(message, ct);

            var log = new EmailLog(
                recipientEmail: toEmail,
                subject: subject,
                templateKey: templateKey,
                status: EmailDeliveryStatus.Sent);
            _context.EmailLogs.Add(log);
            await _context.SaveChangesAsync(ct);

            return (true, null);
        }
        catch (Exception ex)
        {
            var log = new EmailLog(
                recipientEmail: toEmail,
                subject: $"[Failed Test] {templateKey}",
                templateKey: templateKey,
                status: EmailDeliveryStatus.Failed,
                errorMessage: ex.Message);
            _context.EmailLogs.Add(log);
            await _context.SaveChangesAsync(ct);

            return (false, ex.Message);
        }
    }

    public async Task<IReadOnlyList<EmailLogDto>> GetRecentEmailLogsAsync(int count = 50, CancellationToken ct = default)
    {
        return await _context.EmailLogs
            .AsNoTracking()
            .OrderByDescending(l => l.CreatedAtUtc)
            .Take(count)
            .Select(l => new EmailLogDto(
                l.Id,
                l.RecipientEmail,
                l.Subject,
                l.TemplateKey,
                (int)l.Status,
                l.ErrorMessage,
                l.SentAtUtc,
                l.CreatedAtUtc))
            .ToListAsync(ct);
    }

    private static string ReplaceVariables(string template, Dictionary<string, string> variables, bool isHtml)
    {
        if (string.IsNullOrEmpty(template)) return string.Empty;

        return VariableRegex.Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            if (variables.TryGetValue(key, out var val))
            {
                return isHtml ? WebUtility.HtmlEncode(val) : val;
            }
            return match.Value; // leave unchanged if unknown variable
        });
    }
}

