using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexora.Application.Common.Interfaces;

namespace Nexora.Infrastructure.Services;

public class WebhookDispatcher : IWebhookDispatcher
{
    private readonly HttpClient _httpClient;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<WebhookDispatcher> _logger;

    public WebhookDispatcher(
        HttpClient httpClient,
        IHostEnvironment environment,
        ILogger<WebhookDispatcher> logger)
    {
        _httpClient = httpClient;
        _environment = environment;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error)> DispatchLeadWebhookAsync(
        string targetUrl,
        string? secret,
        object payload,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            return (false, "Target webhook URL is empty.");
        }

        if (!Uri.TryCreate(targetUrl.Trim(), UriKind.Absolute, out var uri))
        {
            return (false, "Invalid webhook URL format.");
        }

        // SSRF Guard 1: Require HTTPS in non-Development environments
        var isDev = _environment.IsDevelopment();
        if (!uri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            if (!isDev || !uri.Scheme.Equals(Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Webhook dispatch rejected: insecure scheme '{Scheme}'.", uri.Scheme);
                return (false, "Webhooks require HTTPS scheme for transmission security.");
            }
        }

        // SSRF Guard 2: Reject private / loopback IP addresses in non-Development
        try
        {
            var addresses = await Dns.GetHostAddressesAsync(uri.DnsSafeHost, ct);
            if (addresses.Length == 0)
            {
                return (false, $"Could not resolve DNS hostname '{uri.DnsSafeHost}'.");
            }

            foreach (var ip in addresses)
            {
                if (IsDisallowedIpAddress(ip, isDev))
                {
                    _logger.LogWarning("Webhook SSRF check blocked IP: {IP} for target {Url}", ip, targetUrl);
                    return (false, $"Webhook target resolves to disallowed network address: {ip}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DNS resolution failed during SSRF validation for {Host}", uri.DnsSafeHost);
            return (false, $"DNS resolution error: {ex.Message}");
        }

        // Serialize Payload & Compute HMAC-SHA256 signature
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var payloadBytes = Encoding.UTF8.GetBytes(json);

        var keyBytes = Encoding.UTF8.GetBytes(secret ?? "nexora_default_webhook_secret");
        using var hmac = new HMACSHA256(keyBytes);
        var signatureHash = Convert.ToHexString(hmac.ComputeHash(payloadBytes)).ToLowerInvariant();

        using var request = new HttpRequestMessage(HttpMethod.Post, uri);
        request.Content = new ByteArrayContent(payloadBytes);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        request.Headers.Add("X-Nexora-Signature", $"sha256={signatureHash}");
        request.Headers.Add("X-Nexora-Event", "lead.created");
        request.Headers.UserAgent.ParseAdd("Nexora-Marketing-Webhook/2.0");

        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(8));

            var response = await _httpClient.SendAsync(request, timeoutCts.Token);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook successfully delivered to {Url} (Status: {StatusCode})", targetUrl, (int)response.StatusCode);
                return (true, null);
            }

            var errBody = await response.Content.ReadAsStringAsync(ct);
            _logger.LogWarning("Webhook delivery failed with HTTP {StatusCode}: {Body}", (int)response.StatusCode, errBody);
            return (false, $"Webhook target returned HTTP status {(int)response.StatusCode}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook HTTP transmission exception to {Url}", targetUrl);
            return (false, $"Webhook transmission error: {ex.Message}");
        }
    }

    private static bool IsDisallowedIpAddress(IPAddress ip, bool isDevelopment)
    {
        // Loopback is permitted in development (e.g. localhost testing with Mailpit/webhook mocks)
        if (IPAddress.IsLoopback(ip))
        {
            return !isDevelopment;
        }

        if (ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal)
        {
            return true;
        }

        var bytes = ip.GetAddressBytes();
        if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
        {
            // 10.0.0.0/8
            if (bytes[0] == 10) return !isDevelopment;
            // 172.16.0.0/12
            if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return !isDevelopment;
            // 192.168.0.0/16
            if (bytes[0] == 192 && bytes[1] == 168) return !isDevelopment;
            // 169.254.0.0/16 (Link-local / Cloud metadata service e.g. 169.254.169.254)
            if (bytes[0] == 169 && bytes[1] == 254) return true;
            // 0.0.0.0/8
            if (bytes[0] == 0) return true;
        }

        return false;
    }
}

