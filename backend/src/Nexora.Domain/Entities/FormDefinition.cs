using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public class FormDefinition : BaseEntity<Guid>
{
    public string FormKey { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Title { get; private set; }
    public string? Description { get; private set; }
    public string SchemaJson { get; private set; } = "[]";
    public string SettingsJson { get; private set; } = "{}";
    public bool IsActive { get; private set; } = true;
    public byte[] Version { get; private set; } = [];

    private FormDefinition() { }

    public FormDefinition(
        string formKey,
        string name,
        string schemaJson,
        string settingsJson,
        string? title = null,
        string? description = null)
    {
        Id = Guid.NewGuid();
        FormKey = formKey.Trim().ToLowerInvariant();
        Name = name.Trim();
        SchemaJson = schemaJson;
        SettingsJson = settingsJson;
        Title = title?.Trim();
        Description = description?.Trim();
        IsActive = true;
    }

    public void Update(
        string name,
        string schemaJson,
        string settingsJson,
        string? title,
        string? description,
        bool isActive)
    {
        Name = name.Trim();
        SchemaJson = schemaJson;
        SettingsJson = settingsJson;
        Title = title?.Trim();
        Description = description?.Trim();
        IsActive = isActive;
        MarkUpdated();
    }
}

