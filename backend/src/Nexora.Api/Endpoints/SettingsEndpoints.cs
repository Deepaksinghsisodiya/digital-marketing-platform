using Nexora.Application.Common.Interfaces;
using Nexora.Application.Settings.Models;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Admin Settings
        var adminGroup = app.MapGroup("/api/v1/admin/settings")
            .RequireAuthorization()
            .WithTags("Settings");

        adminGroup.MapGet("/", async (
            ISiteSettingsService settingsService,
            CancellationToken ct) =>
        {
            var settings = await settingsService.GetSettingsAsync(ct);
            return Results.Ok(settings);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetAdminSettings")
        .WithSummary("Retrieve full site settings including version token.");

        adminGroup.MapPatch("/", async (
            UpdateSiteSettingsDto request,
            ISiteSettingsService settingsService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue)
            {
                return Results.Unauthorized();
            }

            var (success, error, conflict, updated) = await settingsService.UpdateSettingsAsync(
                request,
                actingUserId.Value,
                ct);

            if (conflict)
            {
                return Results.Conflict(new { error, code = "CONCURRENCY_CONFLICT" });
            }

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            await auditLogService.LogAsync(
                action: "settings.updated",
                resourceType: "SiteSettings",
                resourceId: updated!.Id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new()
                {
                    ["companyName"] = request.CompanyName,
                    ["defaultRegion"] = request.DefaultRegion
                },
                cancellationToken: ct);

            return Results.Ok(updated);
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("UpdateAdminSettings")
        .WithSummary("Update site settings with optimistic concurrency version check.");

        adminGroup.MapPost("/smtp/test", async (
            TestSmtpConnectionDto dto,
            ISiteSettingsService settingsService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Host) || string.IsNullOrWhiteSpace(dto.RecipientEmail))
            {
                return Results.BadRequest(new { error = "Host and RecipientEmail are required." });
            }

            var (success, error) = await settingsService.TestSmtpConnectionAsync(dto, ct);
            if (!success)
            {
                return Results.BadRequest(new { error = $"SMTP Test Failed: {error}" });
            }

            return Results.Ok(new { message = $"SMTP connection successful! Diagnostic email delivered to {dto.RecipientEmail} via {dto.Host}:{dto.Port}." });
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("TestSmtpConnection")
        .WithSummary("Test SMTP connection and deliver diagnostic email.");

        // 2. Public Safe Site Settings (Anonymous)
        app.MapGet("/api/v1/public/site-settings", async (
            ISiteSettingsService settingsService,
            CancellationToken ct) =>
        {
            var publicSettings = await settingsService.GetPublicSettingsAsync(ct);
            return Results.Ok(publicSettings);
        })
        .CacheOutput("PublicCache")
        .AllowAnonymous()
        .WithTags("Settings")
        .WithName("GetPublicSiteSettings")
        .WithSummary("Retrieve public safe branding and regional settings.");

        return app;
    }
}

