using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public class EmailTemplate : BaseEntity<Guid>
{
    public string Key { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string SubjectTemplate { get; private set; } = string.Empty;
    public string BodyHtmlTemplate { get; private set; } = string.Empty;
    public string? BodyPlainTextTemplate { get; private set; }
    public bool IsActive { get; private set; } = true;
    public byte[] Version { get; private set; } = [];

    private EmailTemplate() { }

    public EmailTemplate(
        string key,
        string name,
        string subjectTemplate,
        string bodyHtmlTemplate,
        string? bodyPlainTextTemplate = null)
    {
        Id = Guid.NewGuid();
        Key = key.Trim().ToLowerInvariant();
        Name = name.Trim();
        SubjectTemplate = subjectTemplate.Trim();
        BodyHtmlTemplate = bodyHtmlTemplate.Trim();
        BodyPlainTextTemplate = bodyPlainTextTemplate?.Trim();
        IsActive = true;
    }

    public void Update(
        string name,
        string subjectTemplate,
        string bodyHtmlTemplate,
        string? bodyPlainTextTemplate,
        bool isActive)
    {
        Name = name.Trim();
        SubjectTemplate = subjectTemplate.Trim();
        BodyHtmlTemplate = bodyHtmlTemplate.Trim();
        BodyPlainTextTemplate = bodyPlainTextTemplate?.Trim();
        IsActive = isActive;
        MarkUpdated();
    }
}

