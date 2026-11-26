using System.Net.Http.Json;
using Serilog.Core;
using Serilog.Events;

namespace Nexora.Api.Services;

/// <summary>
/// Lightweight centralized log forwarder for Seq / ELK / Datadog HTTP ingestion.
/// Activated when Seq:ServerUrl (or Logging:CentralizedEndpointUrl) is configured.
/// </summary>
public sealed class CentralizedLogSink : ILogEventSink
{
    private readonly string _endpointUrl;
    private readonly string? _apiKey;
    private static readonly HttpClient SharedClient = new() { Timeout = TimeSpan.FromSeconds(3) };

    public CentralizedLogSink(string endpointUrl, string? apiKey = null)
    {
        _endpointUrl = endpointUrl.TrimEnd('/');
        _apiKey = apiKey;
    }

    public void Emit(LogEvent logEvent)
    {
        var payload = new
        {
            timestamp = logEvent.Timestamp.UtcDateTime,
            level = logEvent.Level.ToString(),
            message = logEvent.RenderMessage(),
            exception = logEvent.Exception?.ToString()
        };

        _ = Task.Run(async () =>
        {
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Post, $"{_endpointUrl}/api/events/raw")
                {
                    Content = JsonContent.Create(new { Events = new[] { payload } })
                };
                if (!string.IsNullOrWhiteSpace(_apiKey))
                {
                    req.Headers.Add("X-Seq-ApiKey", _apiKey);
                }
                await SharedClient.SendAsync(req);
            }
            catch
            {
                // Non-blocking best-effort centralized log forwarding
            }
        });
    }
}
