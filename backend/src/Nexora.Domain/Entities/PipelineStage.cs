namespace Nexora.Domain.Entities;

public class PipelineStage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Category { get; set; } = "Lead"; // "Lead" | "Client" | "Task"
    public string StageKey { get; set; } = string.Empty;
    public int Value { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string ColorHex { get; set; } = "#3b82f6";
    public string? BadgeClass { get; set; }
    public int OrderIndex { get; set; }
    public bool IsSystem { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

