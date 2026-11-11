using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Models;

namespace Nexora.Application.Common.Interfaces;

public interface IMediaService
{
    Task<PaginatedResult<MediaAssetDto>> GetMediaAssetsAsync(int page, int pageSize, string? search, string? mimeType, CancellationToken ct = default);
    Task<MediaAssetDto?> GetMediaAssetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(bool Success, string? Error, MediaAssetDto? Asset)> UploadMediaAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        long sizeBytes,
        string? altText,
        Guid? folderId,
        Guid? uploadedByUserId,
        CancellationToken ct = default);
    Task<bool> DeleteMediaAssetAsync(Guid id, Guid? actingUserId, CancellationToken ct = default);
    Task<(Stream? Stream, string ContentType, string FileName)?> GetMediaDownloadAsync(Guid id, CancellationToken ct = default);
}

