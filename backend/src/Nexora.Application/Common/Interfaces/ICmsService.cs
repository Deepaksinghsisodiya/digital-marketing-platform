using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Models;

namespace Nexora.Application.Common.Interfaces;

public interface ICmsService
{
    Task<PaginatedResult<PageSummaryDto>> GetPagesAsync(
        int page,
        int pageSize,
        string? search,
        int? status,
        string? locale,
        CancellationToken ct = default);

    Task<PageDetailDto?> GetPageByIdAsync(Guid pageId, CancellationToken ct = default);

    Task<(bool Success, string? Error, Guid? PageId)> CreatePageAsync(
        CreatePageRequest request,
        Guid createdByUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error, string? NewVersionToken)> SaveDraftAsync(
        Guid pageId,
        SaveDraftRequest request,
        Guid actingUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error, PublishPageResponse? Response)> PublishPageAsync(
        Guid pageId,
        Guid actingUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> RollbackPageAsync(
        Guid pageId,
        int targetVersionNumber,
        Guid actingUserId,
        CancellationToken ct = default);

    Task<PreviewTokenDto?> GeneratePreviewTokenAsync(
        Guid pageId,
        TimeSpan? lifetime = null,
        CancellationToken ct = default);

    Task<PageDetailDto?> GetPublishedPageBySlugAsync(
        string slug,
        string locale = "en",
        CancellationToken ct = default);

    Task<PageDetailDto?> GetPageByPreviewTokenAsync(
        string token,
        CancellationToken ct = default);
}
