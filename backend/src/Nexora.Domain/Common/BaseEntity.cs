namespace Nexora.Domain.Common;

/// <summary>
/// Base entity representing the core DDD entity foundation.
/// Single-tenant baseline: no OrganizationId or tenant discriminator.
/// Layering allows tenant context or multi-tenancy to be layered in later without breaking domain entities.
/// </summary>
public abstract class BaseEntity<TId>
{
    public TId Id { get; protected set; } = default!;
    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; protected set; }

    public void MarkUpdated()
    {
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

public abstract class BaseEntity : BaseEntity<Guid>
{
    protected BaseEntity()
    {
        Id = Guid.NewGuid();
    }
}

