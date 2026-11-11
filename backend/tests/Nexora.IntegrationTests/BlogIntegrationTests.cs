using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Blog.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Entities;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class BlogIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public BlogIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task BlogPost_Lifecycle_DraftPublishAndRetrieve_ShouldSucceed()
    {
        using var scope = _factory.Services.CreateScope();
        var blogService = scope.ServiceProvider.GetRequiredService<IBlogService>();
        var actingUserId = Guid.NewGuid();

        var slug = $"blog-post-{Guid.NewGuid():N}";
        var title = "The Future of AI in Digital Marketing 2026";
        var content = "<p>Artificial intelligence is transforming B2B pipeline velocity and ROI tracking.</p>";

        // 1. Create Post as Draft
        var createReq = new CreateBlogPostRequest(
            Slug: slug,
            Title: title,
            Excerpt: "An executive briefing on AI in marketing.",
            ContentHtml: content,
            Category: "AI Marketing",
            Tags: "ai, b2b, growth",
            CoverImageUrl: null,
            AuthorName: "Nexora Growth Lab",
            Status: BlogPostStatus.Draft);

        var (success, postId, err) = await blogService.CreatePostAsync(createReq, actingUserId);
        success.ShouldBeTrue(err);
        postId.ShouldNotBeNull();

        // 2. Verify draft is NOT visible to public
        var publicPost = await blogService.GetPublishedPostBySlugAsync(slug);
        publicPost.ShouldBeNull();

        // 3. Verify admin can retrieve the post
        var adminPost = await blogService.GetPostByIdAsync(postId!.Value);
        adminPost.ShouldNotBeNull();
        adminPost.Title.ShouldBe(title);
        adminPost.Status.ShouldBe(BlogPostStatus.Draft);

        // 4. Publish the post
        var updateReq = new UpdateBlogPostRequest(
            Slug: slug,
            Title: title,
            Excerpt: "Updated briefing.",
            ContentHtml: content,
            Category: "AI Marketing",
            Tags: "ai, growth",
            CoverImageUrl: null,
            AuthorName: "Nexora Growth Lab",
            Status: BlogPostStatus.Published,
            MetaTitle: "AI Marketing in 2026",
            MetaDescription: "How AI transforms B2B growth.");

        var (updateSuccess, updateErr) = await blogService.UpdatePostAsync(postId.Value, updateReq, actingUserId);
        updateSuccess.ShouldBeTrue(updateErr);

        // 5. Verify published post is now visible to public
        var publishedPost = await blogService.GetPublishedPostBySlugAsync(slug);
        publishedPost.ShouldNotBeNull();
        publishedPost.Slug.ShouldBe(slug);
        publishedPost.Status.ShouldBe(BlogPostStatus.Published);

        // 6. Verify in published list
        var publishedList = await blogService.GetPublishedPostsAsync(1, 10, search: "Future of AI", category: "AI Marketing");
        publishedList.Items.ShouldContain(p => p.Slug == slug);

        // 7. Delete post
        var (delSuccess, delErr) = await blogService.DeletePostAsync(postId.Value, actingUserId);
        delSuccess.ShouldBeTrue(delErr);

        // 8. Post should no longer be in public listing
        var postAfterDel = await blogService.GetPublishedPostBySlugAsync(slug);
        postAfterDel.ShouldBeNull();
    }
}
