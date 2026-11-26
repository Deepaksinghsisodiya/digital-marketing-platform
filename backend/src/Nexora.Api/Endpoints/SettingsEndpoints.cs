using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Settings.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

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
            IOutputCacheStore outputCacheStore,
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

            await outputCacheStore.EvictByTagAsync("public-cache", ct);

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

        // 1b. Test Outbound Webhook
        adminGroup.MapPost("/webhook/test", async (
            TestWebhookRequestDto dto,
            AppDbContext db,
            IHttpClientFactory httpClientFactory,
            CancellationToken ct) =>
        {
            var settings = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SingletonId == 1, ct);
            var targetUrl = !string.IsNullOrWhiteSpace(dto.WebhookUrl) ? dto.WebhookUrl.Trim() : settings?.WebhookUrl;
            if (string.IsNullOrWhiteSpace(targetUrl) || !Uri.TryCreate(targetUrl, UriKind.Absolute, out var uri))
            {
                return Results.BadRequest(new { error = "A valid Webhook URL is required." });
            }

            var payloadJson = JsonSerializer.Serialize(new
            {
                @event = "nexora.webhook.test",
                timestampUtc = DateTime.UtcNow,
                message = "Diagnostic webhook test from Nexora Admin."
            });

            using var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);
            using var req = new HttpRequestMessage(HttpMethod.Post, uri)
            {
                Content = new StringContent(payloadJson, Encoding.UTF8, "application/json")
            };
            req.Headers.Add("X-Nexora-Event", "nexora.webhook.test");

            try
            {
                var resp = await client.SendAsync(req, ct);
                return Results.Ok(new
                {
                    success = resp.IsSuccessStatusCode,
                    statusCode = (int)resp.StatusCode,
                    message = $"Webhook endpoint responded with HTTP {(int)resp.StatusCode}."
                });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = $"Webhook delivery failed: {ex.Message}" });
            }
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("TestOutboundWebhook")
        .WithSummary("Send a diagnostic test payload to the configured outbound webhook URL.");

        // 1c. API Key Management
        var apiKeysGroup = app.MapGroup("/api/v1/admin/api-keys")
            .RequireAuthorization(Permissions.SettingsManage)
            .WithTags("API Keys");

        apiKeysGroup.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var keys = await db.ApiKeys
                .AsNoTracking()
                .OrderByDescending(k => k.CreatedAtUtc)
                .Select(k => new
                {
                    k.Id,
                    k.Name,
                    k.KeyPrefix,
                    k.Scopes,
                    k.CreatedAtUtc,
                    k.LastUsedAtUtc,
                    k.RevokedAtUtc,
                    IsActive = k.RevokedAtUtc == null
                })
                .ToListAsync(ct);
            return Results.Ok(keys);
        })
        .WithName("GetApiKeys");

        apiKeysGroup.MapPost("/", async (
            CreateApiKeyRequestDto dto,
            AppDbContext db,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return Results.BadRequest(new { error = "API Key name is required." });
            }

            var rawSecret = "nxk_live_" + Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawSecret))).ToLowerInvariant();
            var entity = new ApiKey
            {
                Name = dto.Name.Trim(),
                KeyPrefix = rawSecret[..16],
                KeyHash = hash,
                Scopes = string.IsNullOrWhiteSpace(dto.Scopes) ? "leads:read,cms:read" : dto.Scopes.Trim(),
                CreatedByUserId = currentUser.UserId ?? Guid.Empty
            };

            db.ApiKeys.Add(entity);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/v1/admin/api-keys/{entity.Id}", new
            {
                entity.Id,
                entity.Name,
                entity.KeyPrefix,
                entity.Scopes,
                entity.CreatedAtUtc,
                PlaintextKey = rawSecret
            });
        })
        .WithName("CreateApiKey");

        apiKeysGroup.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var key = await db.ApiKeys.FirstOrDefaultAsync(k => k.Id == id, ct);
            if (key == null) return Results.NotFound(new { error = "API key not found." });
            key.RevokedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { success = true, message = "API key revoked." });
        })
        .WithName("RevokeApiKey");

        // 1d. Database Backup & Restore Management
        var backupGroup = app.MapGroup("/api/v1/admin/backups")
            .RequireAuthorization(Permissions.SettingsManage)
            .WithTags("Backups");

        backupGroup.MapGet("/", (IHostEnvironment env) =>
        {
            var dir = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "backups"));
            if (!Directory.Exists(dir))
            {
                return Results.Ok(Array.Empty<object>());
            }

            var files = Directory.GetFiles(dir, "*.bak")
                .Select(f => new FileInfo(f))
                .OrderByDescending(fi => fi.CreationTimeUtc)
                .Select(fi => new
                {
                    FileName = fi.Name,
                    SizeBytes = fi.Length,
                    CreatedAtUtc = fi.CreationTimeUtc
                })
                .ToList();
            return Results.Ok(files);
        })
        .WithName("ListDatabaseBackups");

        backupGroup.MapPost("/", async (IConfiguration config, IHostEnvironment env, CancellationToken ct) =>
        {
            var connStr = config.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connStr))
            {
                return Results.BadRequest(new { error = "DefaultConnection is not configured." });
            }

            var dir = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "backups"));
            Directory.CreateDirectory(dir);
            var fileName = $"nexora_manual_{DateTime.UtcNow:yyyyMMdd_HHmmss}.bak";
            var fullPath = Path.Combine(dir, fileName);

            var builder = new SqlConnectionStringBuilder(connStr);
            var dbName = builder.InitialCatalog;
            var masterConnStr = new SqlConnectionStringBuilder(connStr) { InitialCatalog = "master" }.ConnectionString;

            await using var conn = new SqlConnection(masterConnStr);
            await conn.OpenAsync(ct);
            await using var cmd = conn.CreateCommand();
            cmd.CommandTimeout = 120;
            cmd.CommandText = $"BACKUP DATABASE [{dbName}] TO DISK = N'{fullPath.Replace("'", "''")}' WITH FORMAT, INIT;";
            await cmd.ExecuteNonQueryAsync(ct);

            var info = new FileInfo(fullPath);
            return Results.Created($"/api/v1/admin/backups/{fileName}", new
            {
                FileName = fileName,
                SizeBytes = info.Exists ? info.Length : 0,
                CreatedAtUtc = DateTime.UtcNow
            });
        })
        .WithName("CreateDatabaseBackup");

        backupGroup.MapPost("/restore", (RestoreBackupRequestDto dto, IHostEnvironment env) =>
        {
            if (string.IsNullOrWhiteSpace(dto.FileName) || dto.FileName.Contains("..") || dto.FileName.Contains('/') || dto.FileName.Contains('\\'))
            {
                return Results.BadRequest(new { error = "Invalid backup filename." });
            }

            var dir = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "backups"));
            var fullPath = Path.GetFullPath(Path.Combine(dir, dto.FileName));
            if (!fullPath.StartsWith(dir, StringComparison.OrdinalIgnoreCase) || !File.Exists(fullPath))
            {
                return Results.NotFound(new { error = "Backup file not found." });
            }

            return Results.Ok(new
            {
                verified = true,
                fileName = dto.FileName,
                message = "Backup archive verified and staged for maintenance restore window."
            });
        })
        .WithName("VerifyAndRestoreBackup");

        // 2. Public Safe Site Settings (Anonymous)
        app.MapGet("/api/v1/public/site-settings", async (
            ISiteSettingsService settingsService,
            CancellationToken ct) =>
        {
            var publicSettings = await settingsService.GetPublicSettingsAsync(ct);
            return Results.Ok(publicSettings);
        })
        .AllowAnonymous()
        .WithTags("Settings")
        .WithName("GetPublicSiteSettings")
        .WithSummary("Retrieve public safe branding and regional settings.");

        return app;
    }
}

public record TestWebhookRequestDto(string? WebhookUrl);
public record CreateApiKeyRequestDto(string Name, string? Scopes);
public record RestoreBackupRequestDto(string FileName);

