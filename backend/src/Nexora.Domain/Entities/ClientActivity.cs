namespace Nexora.Domain.Entities;

public class ClientActivity
{
    public Guid Id { get; private set; }
    public Guid ClientId { get; private set; }
    public string ActivityType { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Guid? ActorUserId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Client? Client { get; private set; }

    private ClientActivity() { }

    public ClientActivity(
        Guid clientId,
        string activityType,
        string description,
        Guid? actorUserId = null)
    {
        Id = Guid.NewGuid();
        ClientId = clientId;
        ActivityType = activityType;
        Description = description;
        ActorUserId = actorUserId;
        CreatedAtUtc = DateTime.UtcNow;
    }
}

