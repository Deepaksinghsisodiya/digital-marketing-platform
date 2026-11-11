using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class MediaAsset : BaseEntity
{
    public string StorageKey { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string AltText { get; set; } = string.Empty;
    public Guid? FolderId { get; set; }
    public MediaFolder? Folder { get; set; }
}

public sealed class MediaFolder : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentFolderId { get; set; }
    public MediaFolder? ParentFolder { get; set; }
    public ICollection<MediaFolder> SubFolders { get; set; } = new List<MediaFolder>();
    public ICollection<MediaAsset> Assets { get; set; } = new List<MediaAsset>();
}

