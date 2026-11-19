using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Blog.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;

namespace Nexora.Api.Endpoints;

public static class BlogEndpoints
{
    public static void MapBlogEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Public Blog Endpoints (Published posts only)
        var publicGroup = app.MapGroup("/api/v1/public/posts")
            .WithTags("Blog & Content (Public)")
            .AllowAnonymous();

        publicGroup.MapGet("/", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] string? category,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var result = await blogService.GetPublishedPostsAsync(
                page ?? 1,
                pageSize ?? 12,
                search,
                category,
                ct);

            return Results.Ok(result);
        })
        .CacheOutput("PublicCache")
        .WithName("GetPublishedPosts")
        .WithSummary("Paginated list of published blog posts.");

        publicGroup.MapGet("/{slug}", async (
            string slug,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var post = await blogService.GetPublishedPostBySlugAsync(slug, ct);
            if (post == null) return Results.NotFound(new { error = "Post not found." });
            return Results.Ok(post);
        })
        .CacheOutput("PublicCache")
        .WithName("GetPublishedPostBySlug")
        .WithSummary("Get published blog post by slug.");

        // 2. Admin Blog Endpoints
        var adminGroup = app.MapGroup("/api/v1/admin/posts")
            .WithTags("Blog & Content (Admin)")
            .RequireAuthorization();

        adminGroup.MapGet("/", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] BlogPostStatus? status,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var result = await blogService.GetAdminPostsAsync(
                page ?? 1,
                pageSize ?? 20,
                search,
                category,
                status,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetAdminPosts")
        .WithSummary("List all blog posts including drafts and archived.");

        adminGroup.MapGet("/{id:guid}", async (
            Guid id,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var post = await blogService.GetPostByIdAsync(id, ct);
            if (post == null) return Results.NotFound(new { error = "Post not found." });
            return Results.Ok(post);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetPostById")
        .WithSummary("Get blog post by ID.");

        adminGroup.MapPost("/", async (
            [FromBody] CreateBlogPostRequest request,
            ClaimsPrincipal user,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, postId, error) = await blogService.CreatePostAsync(request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Created($"/api/v1/admin/posts/{postId}", new { postId });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("CreateBlogPost")
        .WithSummary("Create a new blog post.");

        adminGroup.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] UpdateBlogPostRequest request,
            ClaimsPrincipal user,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await blogService.UpdatePostAsync(id, request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Post updated successfully." });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("UpdateBlogPost")
        .WithSummary("Update an existing blog post.");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal user,
            IBlogService blogService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await blogService.DeletePostAsync(id, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Post deleted successfully." });
        })
        .RequireAuthorization(Permissions.PagesPublish)
        .WithName("DeleteBlogPost")
        .WithSummary("Delete a blog post.");
    }
}

