namespace Nexora.Application.Email.DTOs;

public record EmailTemplateDto(
    Guid Id,
    string Key,
    string Name,
    string SubjectTemplate,
    string BodyHtmlTemplate,
    string? BodyPlainTextTemplate,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record UpdateEmailTemplateRequest(
    string Name,
    string SubjectTemplate,
    string BodyHtmlTemplate,
    string? BodyPlainTextTemplate = null,
    bool IsActive = true);

public record SendTestEmailRequest(
    string ToEmail,
    string TemplateKey,
    Dictionary<string, string>? Variables = null);

public record EmailLogDto(
    Guid Id,
    string RecipientEmail,
    string Subject,
    string? TemplateKey,
    int Status,
    string? ErrorMessage,
    DateTime? SentAtUtc,
    DateTime CreatedAtUtc);

