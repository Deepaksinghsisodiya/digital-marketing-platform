using Microsoft.EntityFrameworkCore;
using Nexora.Application.Blog.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class BlogService : IBlogService
{
    private readonly AppDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public BlogService(AppDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<PaginatedResult<BlogPostSummaryDto>> GetPublishedPostsAsync(
        int page,
        int pageSize,
        string? search,
        string? category,
        CancellationToken ct = default)
    {
        var query = _context.BlogPosts
            .AsNoTracking()
            .Where(p => p.Status == BlogPostStatus.Published);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p => p.Title.Contains(s) || p.Excerpt.Contains(s) || p.Tags.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var c = category.Trim();
            query = query.Where(p => p.Category == c);
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(p => p.PublishedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostSummaryDto(
                p.Id,
                p.Slug,
                p.Title,
                p.Excerpt,
                p.Category,
                p.Tags,
                p.CoverImageUrl,
                p.AuthorName,
                p.Status,
                p.PublishedAtUtc,
                p.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<BlogPostSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<BlogPostDetailDto?> GetPublishedPostBySlugAsync(string slug, CancellationToken ct = default)
    {
        var s = slug.Trim().ToLowerInvariant();
        var post = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == s && p.Status == BlogPostStatus.Published, ct);

        if (post == null) return null;

        return new BlogPostDetailDto(
            post.Id,
            post.Slug,
            post.Title,
            post.Excerpt,
            post.ContentHtml,
            post.Category,
            post.Tags,
            post.CoverImageUrl,
            post.AuthorName,
            post.Status,
            post.PublishedAtUtc,
            post.MetaTitle,
            post.MetaDescription,
            post.CreatedAtUtc,
            post.UpdatedAtUtc);
    }

    public async Task<PaginatedResult<BlogPostSummaryDto>> GetAdminPostsAsync(
        int page,
        int pageSize,
        string? search,
        string? category,
        BlogPostStatus? status,
        CancellationToken ct = default)
    {
        var query = _context.BlogPosts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p => p.Title.Contains(s) || p.Slug.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var c = category.Trim();
            query = query.Where(p => p.Category == c);
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostSummaryDto(
                p.Id,
                p.Slug,
                p.Title,
                p.Excerpt,
                p.Category,
                p.Tags,
                p.CoverImageUrl,
                p.AuthorName,
                p.Status,
                p.PublishedAtUtc,
                p.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<BlogPostSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<BlogPostDetailDto?> GetPostByIdAsync(Guid id, CancellationToken ct = default)
    {
        var post = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (post == null) return null;

        return new BlogPostDetailDto(
            post.Id,
            post.Slug,
            post.Title,
            post.Excerpt,
            post.ContentHtml,
            post.Category,
            post.Tags,
            post.CoverImageUrl,
            post.AuthorName,
            post.Status,
            post.PublishedAtUtc,
            post.MetaTitle,
            post.MetaDescription,
            post.CreatedAtUtc,
            post.UpdatedAtUtc);
    }

    public async Task<(bool Success, Guid? PostId, string? Error)> CreatePostAsync(
        CreateBlogPostRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Slug))
            return (false, null, "Title and Slug are required.");

        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _context.BlogPosts.AnyAsync(p => p.Slug == slug, ct);
        if (exists) return (false, null, "A blog post with this slug already exists.");

        var post = new BlogPost(
            slug: slug,
            title: request.Title.Trim(),
            excerpt: request.Excerpt.Trim(),
            contentHtml: request.ContentHtml,
            category: request.Category,
            tags: request.Tags,
            coverImageUrl: request.CoverImageUrl,
            authorName: request.AuthorName,
            status: request.Status,
            metaTitle: request.MetaTitle,
            metaDescription: request.MetaDescription);

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "BlogPost.Created",
            resourceType: "BlogPost",
            resourceId: post.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["slug"] = post.Slug, ["status"] = post.Status.ToString() },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, post.Id, null);
    }

    public async Task<(bool Success, string? Error)> UpdatePostAsync(
        Guid id,
        UpdateBlogPostRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var post = await _context.BlogPosts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post == null) return (false, "Post not found.");

        var newSlug = request.Slug.Trim().ToLowerInvariant();
        if (newSlug != post.Slug)
        {
            var conflict = await _context.BlogPosts.AnyAsync(p => p.Slug == newSlug && p.Id != id, ct);
            if (conflict) return (false, "A blog post with this slug already exists.");
        }

        post.Update(
            slug: newSlug,
            title: request.Title.Trim(),
            excerpt: request.Excerpt.Trim(),
            contentHtml: request.ContentHtml,
            category: request.Category,
            tags: request.Tags,
            coverImageUrl: request.CoverImageUrl,
            authorName: request.AuthorName,
            status: request.Status,
            metaTitle: request.MetaTitle,
            metaDescription: request.MetaDescription);

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "BlogPost.Updated",
            resourceType: "BlogPost",
            resourceId: post.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["slug"] = post.Slug, ["status"] = post.Status.ToString() },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeletePostAsync(
        Guid id,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var post = await _context.BlogPosts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post == null) return (false, "Post not found.");

        _context.BlogPosts.Remove(post);
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "BlogPost.Deleted",
            resourceType: "BlogPost",
            resourceId: id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["slug"] = post.Slug },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }
}

