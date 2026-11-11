using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public sealed class PreviewToken : BaseEntity
{
    public Guid PageVersionId { get; set; }
    public PageVersion PageVersion { get; set; } = null!;

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public bool IsRevoked { get; set; } = false;
}

