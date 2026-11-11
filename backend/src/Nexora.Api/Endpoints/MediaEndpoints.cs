using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Api.Endpoints;

public static class MediaEndpoints
{
    public static void MapMediaEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Admin Media Asset Endpoints
        var adminGroup = app.MapGroup("/api/v1/admin/media")
            .WithTags("Media Library (Admin)")
            .RequireAuthorization();

        adminGroup.MapGet("/", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] string? mimeType,
            IMediaService mediaService,
            CancellationToken ct) =>
        {
            var result = await mediaService.GetMediaAssetsAsync(
                page ?? 1,
                pageSize ?? 20,
                search,
                mimeType,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetMediaAssets")
        .WithSummary("Paginated list of uploaded media library assets.");

        adminGroup.MapGet("/{id:guid}", async (
            Guid id,
            IMediaService mediaService,
            CancellationToken ct) =>
        {
            var asset = await mediaService.GetMediaAssetByIdAsync(id, ct);
            if (asset == null) return Results.NotFound(new { error = "Media asset not found." });
            return Results.Ok(asset);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetMediaAssetById")
        .WithSummary("Retrieve media asset metadata by ID.");

        adminGroup.MapPost("/upload", async (
            IFormFile file,
            [FromForm] string? altText,
            [FromForm] Guid? folderId,
            IMediaService mediaService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            if (file == null || file.Length == 0)
            {
                return Results.BadRequest(new { error = "No file was uploaded." });
            }

            using var stream = file.OpenReadStream();
            var (success, error, asset) = await mediaService.UploadMediaAsync(
                stream,
                file.FileName,
                file.ContentType,
                file.Length,
                altText,
                folderId,
                currentUser.UserId,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Created($"/api/v1/admin/media/{asset!.Id}", asset);
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .DisableAntiforgery() // Antiforgery handled via Bearer / Cookie auth in API clients
        .WithName("UploadMedia")
        .WithSummary("Upload and validate image or document to media storage.");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            IMediaService mediaService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var deleted = await mediaService.DeleteMediaAssetAsync(id, currentUser.UserId, ct);
            if (!deleted) return Results.NotFound(new { error = "Media asset not found." });
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("DeleteMediaAsset")
        .WithSummary("Delete media asset from database and file storage.");

        // 2. Public Media Download / Streaming Endpoints
        var publicGroup = app.MapGroup("/api/v1/public/media")
            .WithTags("Public Media");

        publicGroup.MapGet("/{id:guid}/download", async (
            Guid id,
            IMediaService mediaService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var file = await mediaService.GetMediaDownloadAsync(id, ct);
            if (file == null || file.Value.Stream == null)
            {
                return Results.NotFound(new { error = "Media asset file not found." });
            }

            httpContext.Response.Headers.CacheControl = "public, max-age=86400";
            return Results.File(
                file.Value.Stream,
                file.Value.ContentType,
                file.Value.FileName,
                enableRangeProcessing: true);
        })
        .WithName("DownloadPublicMedia")
        .WithSummary("Download or stream publicly accessible media asset.");

        publicGroup.MapGet("/{id:guid}", async (
            Guid id,
            IMediaService mediaService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var file = await mediaService.GetMediaDownloadAsync(id, ct);
            if (file == null || file.Value.Stream == null)
            {
                return Results.NotFound(new { error = "Media asset file not found." });
            }

            httpContext.Response.Headers.CacheControl = "public, max-age=86400";
            return Results.File(
                file.Value.Stream,
                file.Value.ContentType,
                enableRangeProcessing: true);
        })
        .WithName("StreamPublicMedia")
        .WithSummary("Stream publicly accessible media asset directly.");

        publicGroup.MapGet("/{*path}", async (
            string path,
            AppDbContext db,
            IStorageService storage,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return Results.NotFound(new { error = "Path is required." });
            }

            // Clean path: trim leading/trailing slashes and strip optional /download suffix
            var cleanKey = path.Trim('/', '\\');
            var isDownload = false;
            if (cleanKey.EndsWith("/download", StringComparison.OrdinalIgnoreCase))
            {
                cleanKey = cleanKey[..^9].TrimEnd('/', '\\');
                isDownload = true;
            }

            var normalizedKeyForward = cleanKey.Replace('\\', '/');
            var normalizedKeyBackward = cleanKey.Replace('/', '\\');

            httpContext.Response.Headers.CacheControl = "public, max-age=86400";

            // 1. If path is a GUID, find asset by ID
            if (Guid.TryParse(cleanKey, out var assetId))
            {
                var byIdAsset = await db.MediaAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == assetId, ct);
                if (byIdAsset != null)
                {
                    var stream = await storage.OpenReadAsync(byIdAsset.StorageKey, ct);
                    if (stream != null)
                    {
                        return isDownload
                            ? Results.File(stream, byIdAsset.MimeType, byIdAsset.FileName, enableRangeProcessing: true)
                            : Results.File(stream, byIdAsset.MimeType, enableRangeProcessing: true);
                    }
                }
            }

            // 2. Try finding asset by StorageKey
            var asset = await db.MediaAssets.AsNoTracking().FirstOrDefaultAsync(
                a => a.StorageKey == normalizedKeyForward || a.StorageKey == normalizedKeyBackward, ct);
            if (asset != null)
            {
                var stream = await storage.OpenReadAsync(asset.StorageKey, ct);
                if (stream != null)
                {
                    return isDownload
                        ? Results.File(stream, asset.MimeType, asset.FileName, enableRangeProcessing: true)
                        : Results.File(stream, asset.MimeType, enableRangeProcessing: true);
                }
            }

            // 3. Direct read from storage
            var directStream = await storage.OpenReadAsync(normalizedKeyForward, ct) 
                ?? await storage.OpenReadAsync(normalizedKeyBackward, ct);
            if (directStream != null)
            {
                var ext = System.IO.Path.GetExtension(cleanKey)?.ToLowerInvariant();
                var mime = ext switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".webp" => "image/webp",
                    ".svg" => "image/svg+xml",
                    ".pdf" => "application/pdf",
                    _ => "application/octet-stream"
                };
                return isDownload
                    ? Results.File(directStream, mime, System.IO.Path.GetFileName(cleanKey), enableRangeProcessing: true)
                    : Results.File(directStream, mime, enableRangeProcessing: true);
            }

            return Results.NotFound(new { error = "Media asset file not found." });
        })
        .WithName("DownloadPublicMediaByPath")
        .WithSummary("Download or stream publicly accessible media asset by storage path or legacy key.");
    }
}

