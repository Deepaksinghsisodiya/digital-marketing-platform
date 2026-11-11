using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public class LeadActivity : BaseEntity<Guid>
{
    public Guid LeadId { get; private set; }
    public string ActivityType { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? MetadataJson { get; private set; }
    public Guid? ActorUserId { get; private set; }

    public Lead? Lead { get; private set; }

    private LeadActivity() { }

    public LeadActivity(
        Guid leadId,
        string activityType,
        string description,
        string? metadataJson = null,
        Guid? actorUserId = null)
    {
        Id = Guid.NewGuid();
        LeadId = leadId;
        ActivityType = activityType.Trim();
        Description = description.Trim();
        MetadataJson = metadataJson;
        ActorUserId = actorUserId;
    }
}

