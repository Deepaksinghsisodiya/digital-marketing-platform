using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public enum PageStatus
{
    Draft = 1,
    Published = 2,
    Archived = 3
}

public sealed class Page : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Locale { get; set; } = "en";
    public string Title { get; set; } = string.Empty;
    public PageStatus Status { get; set; } = PageStatus.Draft;
    public bool IsEnabled { get; set; } = true;
    public Guid? PublishedVersionId { get; set; }
    public PageVersion? PublishedVersion { get; set; }

    // SEO & Meta
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? CanonicalUrl { get; set; }
    public string? OgImageUrl { get; set; }
    public bool NoIndex { get; set; } = false;
    public DateTime? ScheduledPublishAtUtc { get; set; }

    // Concurrency Token for optimistic locking (409 conflict detection)
    public byte[] Version { get; set; } = [];

    // Navigation relation
    public ICollection<PageVersion> Versions { get; set; } = new List<PageVersion>();
}

