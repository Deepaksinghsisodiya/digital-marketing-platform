using Nexora.Domain.Entities;

namespace Nexora.Application.Blog.DTOs;

public record BlogPostSummaryDto(
    Guid Id,
    string Slug,
    string Title,
    string Excerpt,
    string Category,
    string Tags,
    string? CoverImageUrl,
    string AuthorName,
    BlogPostStatus Status,
    DateTime? PublishedAtUtc,
    DateTime CreatedAtUtc);

public record BlogPostDetailDto(
    Guid Id,
    string Slug,
    string Title,
    string Excerpt,
    string ContentHtml,
    string Category,
    string Tags,
    string? CoverImageUrl,
    string AuthorName,
    BlogPostStatus Status,
    DateTime? PublishedAtUtc,
    string? MetaTitle,
    string? MetaDescription,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record CreateBlogPostRequest(
    string Slug,
    string Title,
    string Excerpt,
    string ContentHtml,
    string Category = "Digital Marketing",
    string Tags = "",
    string? CoverImageUrl = null,
    string AuthorName = "Nexora Team",
    BlogPostStatus Status = BlogPostStatus.Draft,
    string? MetaTitle = null,
    string? MetaDescription = null);

public record UpdateBlogPostRequest(
    string Slug,
    string Title,
    string Excerpt,
    string ContentHtml,
    string Category,
    string Tags,
    string? CoverImageUrl,
    string AuthorName,
    BlogPostStatus Status,
    string? MetaTitle,
    string? MetaDescription);

