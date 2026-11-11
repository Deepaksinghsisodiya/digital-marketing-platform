namespace Nexora.Application.Common.Interfaces;

public interface IWebhookDispatcher
{
    Task<(bool Success, string? Error)> DispatchLeadWebhookAsync(
        string targetUrl,
        string? secret,
        object payload,
        CancellationToken ct = default);
}

