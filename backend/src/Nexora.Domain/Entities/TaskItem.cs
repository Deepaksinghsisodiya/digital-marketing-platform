namespace Nexora.Domain.Entities;

public enum TaskPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public enum TaskItemStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}

public class TaskItem
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime? DueDateUtc { get; private set; }
    public TaskPriority Priority { get; private set; } = TaskPriority.Medium;
    public TaskItemStatus Status { get; private set; } = TaskItemStatus.Pending;
    public Guid? ClientId { get; private set; }
    public Guid? LeadId { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; private set; }

    public Client? Client { get; private set; }
    public Lead? Lead { get; private set; }

    private TaskItem() { }

    public TaskItem(
        string title,
        string? description = null,
        DateTime? dueDateUtc = null,
        TaskPriority priority = TaskPriority.Medium,
        Guid? clientId = null,
        Guid? leadId = null,
        Guid? assignedToUserId = null)
    {
        Id = Guid.NewGuid();
        Title = title;
        Description = description;
        DueDateUtc = dueDateUtc;
        Priority = priority;
        Status = TaskItemStatus.Pending;
        ClientId = clientId;
        LeadId = leadId;
        AssignedToUserId = assignedToUserId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStatus(TaskItemStatus newStatus)
    {
        Status = newStatus;
        if (newStatus == TaskItemStatus.Completed)
        {
            CompletedAtUtc = DateTime.UtcNow;
        }
        else if (Status != TaskItemStatus.Completed)
        {
            CompletedAtUtc = null;
        }
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AssignTo(Guid? userId)
    {
        AssignedToUserId = userId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string title,
        string? description,
        DateTime? dueDateUtc,
        TaskPriority priority)
    {
        Title = title;
        Description = description;
        DueDateUtc = dueDateUtc;
        Priority = priority;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

