using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Email.DTOs;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class EmailEndpoints
{
    public static void MapEmailEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin")
            .WithTags("Email & Notifications")
            .RequireAuthorization();

        // 1. Get all email templates
        group.MapGet("/email-templates", async (
            IEmailTemplateService templateService,
            CancellationToken ct) =>
        {
            var templates = await templateService.GetTemplatesAsync(ct);
            return Results.Ok(templates);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetEmailTemplates")
        .WithSummary("List all transactional email templates.");

        // 2. Get email template by key
        group.MapGet("/email-templates/{key}", async (
            string key,
            IEmailTemplateService templateService,
            CancellationToken ct) =>
        {
            var template = await templateService.GetTemplateByKeyAsync(key, ct);
            if (template == null) return Results.NotFound(new { error = "Template not found." });
            return Results.Ok(template);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetEmailTemplateByKey")
        .WithSummary("Get a specific email template by key.");

        // 3. Update email template
        group.MapPut("/email-templates/{key}", async (
            string key,
            [FromBody] UpdateEmailTemplateRequest request,
            ClaimsPrincipal user,
            IEmailTemplateService templateService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await templateService.UpdateTemplateAsync(key, request, userId, ct);
            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { message = "Template updated successfully." });
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("UpdateEmailTemplate")
        .WithSummary("Update subject, body, or active state of an email template.");

        // 4. Test send an email template
        group.MapPost("/email-templates/test-send", async (
            [FromBody] SendTestEmailRequest request,
            IEmailTemplateService templateService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.ToEmail) || string.IsNullOrWhiteSpace(request.TemplateKey))
            {
                return Results.BadRequest(new { error = "ToEmail and TemplateKey are required." });
            }

            var (success, error) = await templateService.SendTestEmailAsync(
                request.ToEmail,
                request.TemplateKey,
                request.Variables,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { message = $"Test email sent to {request.ToEmail}." });
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("TestSendEmailTemplate")
        .WithSummary("Send a test email using a configured template.");

        // 5. Get recent email logs
        group.MapGet("/email-logs", async (
            [FromQuery] int? count,
            IEmailTemplateService templateService,
            CancellationToken ct) =>
        {
            var logs = await templateService.GetRecentEmailLogsAsync(count ?? 50, ct);
            return Results.Ok(logs);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetEmailLogs")
        .WithSummary("View recent outbound email delivery logs.");

        // 6. Trigger pending outbox processing manually
        group.MapPost("/outbox/process", async (
            IOutboxProcessor outboxProcessor,
            CancellationToken ct) =>
        {
            var processed = await outboxProcessor.ProcessPendingMessagesAsync(ct);
            return Results.Ok(new { processedCount = processed });
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("ProcessOutbox")
        .WithSummary("Manually trigger outbox queue processing.");
    }
}
