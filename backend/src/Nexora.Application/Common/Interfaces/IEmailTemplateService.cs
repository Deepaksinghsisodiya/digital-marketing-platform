using Nexora.Application.Email.DTOs;

namespace Nexora.Application.Common.Interfaces;

public interface IEmailTemplateService
{
    Task<(string Subject, string BodyHtml, string? BodyPlainText)> RenderTemplateAsync(
        string templateKey,
        Dictionary<string, string> variables,
        CancellationToken ct = default);

    Task<IReadOnlyList<EmailTemplateDto>> GetTemplatesAsync(CancellationToken ct = default);

    Task<EmailTemplateDto?> GetTemplateByKeyAsync(string key, CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdateTemplateAsync(
        string key,
        UpdateEmailTemplateRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> SendTestEmailAsync(
        string toEmail,
        string templateKey,
        Dictionary<string, string>? testVariables,
        CancellationToken ct = default);

    Task<IReadOnlyList<EmailLogDto>> GetRecentEmailLogsAsync(int count = 50, CancellationToken ct = default);
}

