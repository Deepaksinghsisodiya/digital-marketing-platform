using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class MediaService : IMediaService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<MediaService> _logger;

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf"
    };

    private static readonly HashSet<string> DangerousExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".exe", ".dll", ".bat", ".cmd", ".sh", ".php", ".phtml", ".asp", ".aspx", ".jsp", ".js", ".vbs", ".ps1", ".jar"
    };

    public MediaService(
        AppDbContext context,
        IStorageService storageService,
        IAuditLogService auditLogService,
        ILogger<MediaService> logger)
    {
        _context = context;
        _storageService = storageService;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    public async Task<PaginatedResult<MediaAssetDto>> GetMediaAssetsAsync(
        int page,
        int pageSize,
        string? search,
        string? mimeType,
        CancellationToken ct = default)
    {
        var query = _context.MediaAssets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(a => a.FileName.Contains(term) || a.AltText.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(mimeType))
        {
            var mt = mimeType.Trim();
            query = query.Where(a => a.MimeType.StartsWith(mt));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new MediaAssetDto(
                a.Id,
                a.StorageKey,
                a.FileName,
                a.MimeType,
                a.SizeBytes,
                a.Width,
                a.Height,
                a.AltText,
                _storageService.GetPublicUrl(a.StorageKey),
                a.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<MediaAssetDto>(items, total, page, pageSize);
    }

    public async Task<MediaAssetDto?> GetMediaAssetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var a = await _context.MediaAssets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a == null) return null;

        return new MediaAssetDto(
            a.Id,
            a.StorageKey,
            a.FileName,
            a.MimeType,
            a.SizeBytes,
            a.Width,
            a.Height,
            a.AltText,
            _storageService.GetPublicUrl(a.StorageKey),
            a.CreatedAtUtc);
    }

    public async Task<(bool Success, string? Error, MediaAssetDto? Asset)> UploadMediaAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        long sizeBytes,
        string? altText,
        Guid? folderId,
        Guid? uploadedByUserId,
        CancellationToken ct = default)
    {
        // 1. Validate file size
        if (sizeBytes <= 0)
        {
            return (false, "File cannot be empty.", null);
        }

        if (sizeBytes > MaxFileSizeBytes)
        {
            return (false, "File size exceeds the 10MB limit.", null);
        }

        // 2. Validate extension
        var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext) || DangerousExtensions.Contains(ext) || !AllowedExtensions.Contains(ext))
        {
            return (false, $"File type '{ext}' is not permitted. Allowed: .jpg, .jpeg, .png, .webp, .svg, .pdf", null);
        }

        // 3. Inspect Magic Bytes / Content
        var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, ct);
        memoryStream.Position = 0;

        var header = new byte[Math.Min(16, (int)memoryStream.Length)];
        _ = await memoryStream.ReadAsync(header.AsMemory(0, header.Length), ct);
        memoryStream.Position = 0;

        var (isValidMagic, magicError) = ValidateMagicBytes(ext, header, memoryStream);
        if (!isValidMagic)
        {
            return (false, magicError, null);
        }
        memoryStream.Position = 0;

        // 4. Save to Storage
        var yearMonth = DateTime.UtcNow.ToString("yyyy/MM");
        var storageKey = $"{yearMonth}/{Guid.NewGuid():N}{ext}";

        var cleanMimeType = ResolveMimeType(ext, contentType);
        await _storageService.SaveAsync(storageKey, memoryStream, cleanMimeType, ct);

        // 5. Save to Database
        var asset = new MediaAsset
        {
            StorageKey = storageKey,
            FileName = Path.GetFileName(originalFileName),
            MimeType = cleanMimeType,
            SizeBytes = sizeBytes,
            AltText = altText?.Trim() ?? string.Empty,
            FolderId = folderId
        };

        _context.MediaAssets.Add(asset);
        await _context.SaveChangesAsync(ct);

        // 6. Audit Log
        await _auditLogService.LogAsync(
            action: "media.upload",
            resourceType: "MediaAsset",
            resourceId: asset.Id.ToString(),
            outcome: "Success",
            actorUserId: uploadedByUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new()
            {
                ["fileName"] = asset.FileName,
                ["storageKey"] = asset.StorageKey,
                ["sizeBytes"] = asset.SizeBytes.ToString()
            },
            cancellationToken: ct);

        var dto = new MediaAssetDto(
            asset.Id,
            asset.StorageKey,
            asset.FileName,
            asset.MimeType,
            asset.SizeBytes,
            asset.Width,
            asset.Height,
            asset.AltText,
            _storageService.GetPublicUrl(asset.StorageKey),
            asset.CreatedAtUtc);

        return (true, null, dto);
    }

    public async Task<bool> DeleteMediaAssetAsync(Guid id, Guid? actingUserId, CancellationToken ct = default)
    {
        var asset = await _context.MediaAssets.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (asset == null) return false;

        await _storageService.DeleteAsync(asset.StorageKey, ct);
        _context.MediaAssets.Remove(asset);
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "media.delete",
            resourceType: "MediaAsset",
            resourceId: id.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new() { ["storageKey"] = asset.StorageKey },
            cancellationToken: ct);

        return true;
    }

    public async Task<(Stream? Stream, string ContentType, string FileName)?> GetMediaDownloadAsync(Guid id, CancellationToken ct = default)
    {
        var asset = await _context.MediaAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct);
        if (asset == null) return null;

        var stream = await _storageService.OpenReadAsync(asset.StorageKey, ct);
        if (stream == null) return null;

        return (stream, asset.MimeType, asset.FileName);
    }

    private static (bool Valid, string? Error) ValidateMagicBytes(string ext, byte[] header, Stream stream)
    {
        if (ext is ".jpg" or ".jpeg")
        {
            if (header.Length < 3 || header[0] != 0xFF || header[1] != 0xD8 || header[2] != 0xFF)
            {
                return (false, "File content does not match JPEG image specification.");
            }
        }
        else if (ext == ".png")
        {
            byte[] pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
            if (header.Length < 8 || !header.Take(8).SequenceEqual(pngSig))
            {
                return (false, "File content does not match PNG image specification.");
            }
        }
        else if (ext == ".webp")
        {
            if (header.Length < 12) return (false, "File content too short for WEBP image.");
            var riff = Encoding.ASCII.GetString(header, 0, 4);
            var webp = Encoding.ASCII.GetString(header, 8, 4);
            if (riff != "RIFF" || webp != "WEBP")
            {
                return (false, "File content does not match WEBP image specification.");
            }
        }
        else if (ext == ".pdf")
        {
            if (header.Length < 4) return (false, "File content too short for PDF.");
            var pdfSig = Encoding.ASCII.GetString(header, 0, 4);
            if (!pdfSig.StartsWith("%PDF", StringComparison.Ordinal))
            {
                return (false, "File content does not match PDF document specification.");
            }
        }
        else if (ext == ".svg")
        {
            using var reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);
            var content = reader.ReadToEnd();
            stream.Position = 0;

            // Strict sanitization: reject SVG with active script tags or dangerous attributes
            if (Regex.IsMatch(content, @"<script[\s>]", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(content, @"javascript:", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(content, @"<foreignObject[\s>]", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(content, @"\bon\w+\s*=", RegexOptions.IgnoreCase))
            {
                return (false, "SVG file rejected: contains prohibited active content or script execution tags.");
            }
        }

        return (true, null);
    }

    private static string ResolveMimeType(string ext, string userContentType)
    {
        return ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".svg" => "image/svg+xml",
            ".pdf" => "application/pdf",
            _ => !string.IsNullOrWhiteSpace(userContentType) ? userContentType : "application/octet-stream"
        };
    }
}

