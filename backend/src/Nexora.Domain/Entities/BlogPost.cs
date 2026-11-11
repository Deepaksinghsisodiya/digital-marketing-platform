namespace Nexora.Domain.Entities;

public enum BlogPostStatus
{
    Draft = 1,
    Published = 2,
    Archived = 3
}

public class BlogPost
{
    public Guid Id { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Excerpt { get; private set; } = string.Empty;
    public string ContentHtml { get; private set; } = string.Empty;
    public string Category { get; private set; } = "Digital Marketing";
    public string Tags { get; private set; } = string.Empty;
    public string? CoverImageUrl { get; private set; }
    public string AuthorName { get; private set; } = "Nexora Team";
    public BlogPostStatus Status { get; private set; } = BlogPostStatus.Draft;
    public DateTime? PublishedAtUtc { get; private set; }
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; private set; }
    public byte[] Version { get; private set; } = [];

    private BlogPost() { }

    public BlogPost(
        string slug,
        string title,
        string excerpt,
        string contentHtml,
        string category = "Digital Marketing",
        string tags = "",
        string? coverImageUrl = null,
        string authorName = "Nexora Team",
        BlogPostStatus status = BlogPostStatus.Draft,
        string? metaTitle = null,
        string? metaDescription = null)
    {
        Id = Guid.NewGuid();
        Slug = slug.Trim().ToLowerInvariant();
        Title = title.Trim();
        Excerpt = excerpt.Trim();
        ContentHtml = contentHtml;
        Category = category.Trim();
        Tags = tags.Trim();
        CoverImageUrl = coverImageUrl?.Trim();
        AuthorName = authorName.Trim();
        Status = status;
        if (status == BlogPostStatus.Published)
        {
            PublishedAtUtc = DateTime.UtcNow;
        }
        MetaTitle = metaTitle?.Trim();
        MetaDescription = metaDescription?.Trim();
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void Update(
        string slug,
        string title,
        string excerpt,
        string contentHtml,
        string category,
        string tags,
        string? coverImageUrl,
        string authorName,
        BlogPostStatus status,
        string? metaTitle,
        string? metaDescription)
    {
        Slug = slug.Trim().ToLowerInvariant();
        Title = title.Trim();
        Excerpt = excerpt.Trim();
        ContentHtml = contentHtml;
        Category = category.Trim();
        Tags = tags.Trim();
        CoverImageUrl = coverImageUrl?.Trim();
        AuthorName = authorName.Trim();

        if (status == BlogPostStatus.Published && Status != BlogPostStatus.Published)
        {
            PublishedAtUtc = DateTime.UtcNow;
        }
        else if (status != BlogPostStatus.Published)
        {
            PublishedAtUtc = null;
        }

        Status = status;
        MetaTitle = metaTitle?.Trim();
        MetaDescription = metaDescription?.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

