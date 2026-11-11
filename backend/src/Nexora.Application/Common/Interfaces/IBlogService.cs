using Nexora.Application.Blog.DTOs;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;

namespace Nexora.Application.Common.Interfaces;

public interface IBlogService
{
    // Public queries (published only)
    Task<PaginatedResult<BlogPostSummaryDto>> GetPublishedPostsAsync(
        int page,
        int pageSize,
        string? search,
        string? category,
        CancellationToken ct = default);

    Task<BlogPostDetailDto?> GetPublishedPostBySlugAsync(string slug, CancellationToken ct = default);

    // Admin queries & mutations
    Task<PaginatedResult<BlogPostSummaryDto>> GetAdminPostsAsync(
        int page,
        int pageSize,
        string? search,
        string? category,
        BlogPostStatus? status,
        CancellationToken ct = default);

    Task<BlogPostDetailDto?> GetPostByIdAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, Guid? PostId, string? Error)> CreatePostAsync(
        CreateBlogPostRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdatePostAsync(
        Guid id,
        UpdateBlogPostRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> DeletePostAsync(
        Guid id,
        Guid? actorUserId,
        CancellationToken ct = default);
}

