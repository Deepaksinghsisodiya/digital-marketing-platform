using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Themes.Models;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class ThemeEndpoints
{
    public static IEndpointRouteBuilder MapThemeEndpoints(this IEndpointRouteBuilder app)
    {
        var adminGroup = app.MapGroup("/api/v1/admin/themes")
            .RequireAuthorization()
            .WithTags("Dynamic Themes");

        adminGroup.MapGet("/", async (IThemeService themeService, bool? includeDeleted, CancellationToken ct) =>
        {
            var themes = await themeService.GetThemesAsync(includeDeleted ?? false, ct);
            return Results.Ok(themes);
        })
        .RequireAuthorization(Permissions.ThemesView)
        .WithName("GetThemes")
        .WithSummary("List all themes (system and custom).");

        adminGroup.MapGet("/{id:guid}", async (Guid id, IThemeService themeService, CancellationToken ct) =>
        {
            var theme = await themeService.GetThemeAsync(id, ct);
            return theme == null ? Results.NotFound(new { error = "Theme not found." }) : Results.Ok(theme);
        })
        .RequireAuthorization(Permissions.ThemesView)
        .WithName("GetThemeById")
        .WithSummary("Retrieve a theme including its draft configuration.");

        // Theme settings must be registered before the guid-constrained detail routes to stay unambiguous.
        adminGroup.MapGet("/settings", async (IThemeService themeService, CancellationToken ct) =>
        {
            var settings = await themeService.GetSettingsAsync(ct);
            return Results.Ok(settings);
        })
        .RequireAuthorization(Permissions.ThemesView)
        .WithName("GetThemeSettings")
        .WithSummary("Retrieve global/website/admin theme engine toggles and assignments.");

        adminGroup.MapPut("/settings", async (
            UpdateThemeSettingsDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, conflict, settings) = await themeService.UpdateSettingsAsync(request, actingUserId.Value, ct);
            if (conflict) return Results.Conflict(new { error, code = "CONCURRENCY_CONFLICT" });
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.settings.updated",
                resourceType: "ThemeSettings",
                resourceId: "1",
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new()
                {
                    ["globalEngineEnabled"] = settings!.GlobalEngineEnabled,
                    ["websiteThemeEnabled"] = settings.WebsiteThemeEnabled,
                    ["websiteThemeId"] = settings.WebsiteThemeId,
                    ["adminThemeEnabled"] = settings.AdminThemeEnabled,
                    ["adminThemeId"] = settings.AdminThemeId,
                    ["fallbackThemeId"] = settings.FallbackThemeId
                },
                cancellationToken: ct);

            return Results.Ok(settings);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("UpdateThemeSettings")
        .WithSummary("Update theme engine toggles and per-app assignments.");

        adminGroup.MapPost("/", async (
            CreateThemeDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, theme) = await themeService.CreateThemeAsync(request, actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.created",
                resourceType: "Theme",
                resourceId: theme!.Id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["name"] = theme.Name, ["slug"] = theme.Slug },
                cancellationToken: ct);

            return Results.Created($"/api/v1/admin/themes/{theme.Id}", theme);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("CreateTheme")
        .WithSummary("Create a new custom theme (optionally from a base configuration).");

        adminGroup.MapPut("/{id:guid}/draft", async (
            Guid id,
            SaveThemeDraftDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, conflict, theme) = await themeService.SaveDraftAsync(id, request, actingUserId.Value, ct);
            if (conflict) return Results.Conflict(new { error, code = "CONCURRENCY_CONFLICT" });
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.draft.saved",
                resourceType: "Theme",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(theme);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("SaveThemeDraft")
        .WithSummary("Persist the editable draft of a custom theme.");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error) = await themeService.DeleteThemeAsync(id, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.deleted",
                resourceType: "Theme",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("DeleteTheme")
        .WithSummary("Soft-delete a custom theme (blocked for system/default/active themes).");

        adminGroup.MapPost("/{id:guid}/duplicate", async (
            Guid id,
            DuplicateThemeRequest? request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, theme) = await themeService.DuplicateThemeAsync(id, request?.NewName, actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.duplicated",
                resourceType: "Theme",
                resourceId: theme!.Id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["sourceThemeId"] = id, ["name"] = theme.Name },
                cancellationToken: ct);

            return Results.Created($"/api/v1/admin/themes/{theme.Id}", theme);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("DuplicateTheme")
        .WithSummary("Duplicate any theme (including protected system presets) into a custom theme.");

        adminGroup.MapPost("/{id:guid}/publish", async (
            Guid id,
            PublishThemeDto? request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, version) = await themeService.PublishThemeAsync(id, request ?? new PublishThemeDto(null), actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.published",
                resourceType: "Theme",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["versionNumber"] = version!.VersionNumber },
                cancellationToken: ct);

            return Results.Ok(version);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("PublishTheme")
        .WithSummary("Publish the current draft, creating an immutable version snapshot.");

        adminGroup.MapPost("/{id:guid}/activate", async (
            Guid id,
            ActivateThemeDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, settings) = await themeService.ActivateThemeAsync(id, request, actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.activated",
                resourceType: "Theme",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["target"] = request.Target },
                cancellationToken: ct);

            return Results.Ok(settings);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("ActivateTheme")
        .WithSummary("Assign a published theme to the website, admin, or both.");

        adminGroup.MapGet("/{id:guid}/versions", async (Guid id, IThemeService themeService, CancellationToken ct) =>
        {
            var versions = await themeService.GetVersionsAsync(id, ct);
            return Results.Ok(versions);
        })
        .RequireAuthorization(Permissions.ThemesView)
        .WithName("GetThemeVersions")
        .WithSummary("List immutable published versions for a theme.");

        adminGroup.MapPost("/{id:guid}/rollback", async (
            Guid id,
            RollbackThemeDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, theme) = await themeService.RollbackThemeAsync(id, request, actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.rolledback",
                resourceType: "Theme",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["versionNumber"] = request.VersionNumber },
                cancellationToken: ct);

            return Results.Ok(theme);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("RollbackTheme")
        .WithSummary("Restore a previous published version as the current configuration.");

        adminGroup.MapPost("/import", async (
            ImportThemeDto request,
            IThemeService themeService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue) return Results.Unauthorized();

            var (success, error, theme) = await themeService.ImportThemeAsync(request, actingUserId.Value, ct);
            if (!success) return Results.BadRequest(new { error });

            await auditLogService.LogAsync(
                action: "theme.imported",
                resourceType: "Theme",
                resourceId: theme!.Id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Created($"/api/v1/admin/themes/{theme.Id}", theme);
        })
        .RequireAuthorization(Permissions.ThemesManage)
        .WithName("ImportTheme")
        .WithSummary("Import a theme from a validated JSON configuration.");

        adminGroup.MapGet("/{id:guid}/export", async (Guid id, IThemeService themeService, CancellationToken ct) =>
        {
            var json = await themeService.ExportThemeAsync(id, ct);
            if (json == null) return Results.NotFound(new { error = "Theme not found." });

            var bytes = Encoding.UTF8.GetBytes(json);
            return Results.File(bytes, "application/json", $"nexora-theme-{id}.json");
        })
        .RequireAuthorization(Permissions.ThemesView)
        .WithName("ExportTheme")
        .WithSummary("Export the published theme configuration as a JSON file.");

        // Public theme endpoint (no auth, no drafts, cacheable with ETag)
        app.MapGet("/api/v1/public/theme", async (
            IThemeService themeService,
            HttpContext httpContext,
            string? app,
            CancellationToken ct) =>
        {
            var resolvedApp = string.Equals(app, "admin", StringComparison.OrdinalIgnoreCase) ? "admin" : "website";
            var dto = await themeService.GetPublicThemeAsync(resolvedApp, ct);

            var payload = JsonSerializer.Serialize(dto, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var etag = ComputeEtag(payload);
            httpContext.Response.Headers.ETag = etag;
            if (resolvedApp == "admin")
            {
                httpContext.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
                httpContext.Response.Headers.Pragma = "no-cache";
            }
            else
            {
                httpContext.Response.Headers.CacheControl = "no-cache, must-revalidate";
            }

            var ifNoneMatch = httpContext.Request.Headers.IfNoneMatch.ToString();
            if (!string.IsNullOrEmpty(ifNoneMatch) && ifNoneMatch.Contains(etag, StringComparison.Ordinal))
            {
                return Results.StatusCode(StatusCodes.Status304NotModified);
            }

            return Results.Content(payload, "application/json");
        })
        .AllowAnonymous()
        .WithTags("Dynamic Themes")
        .WithName("GetPublicTheme")
        .WithSummary("Resolve the published theme for the website or admin app.");

        return app;
    }

    private static string ComputeEtag(string payload)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return $"\"{Convert.ToBase64String(hash)[..24]}\"";
    }

    public sealed record DuplicateThemeRequest(string? NewName);
}
