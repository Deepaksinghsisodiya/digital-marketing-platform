using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nexora.Application.Common.Interfaces;

namespace Nexora.Infrastructure.Services;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";
    public string? AccessToken { get; set; }
    public string? PhoneNumberId { get; set; }
    public string? VerifyToken { get; set; }
    public string? AppSecret { get; set; }
    public string ApiVersion { get; set; } = "v21.0";
}

public sealed class WhatsAppCloudService(
    HttpClient httpClient,
    IOptions<WhatsAppOptions> options,
    ILogger<WhatsAppCloudService> logger) : IWhatsAppService
{
    private readonly WhatsAppOptions _options = options.Value;

    public WhatsAppConfigurationStatus GetConfigurationStatus()
    {
        var hasToken = !string.IsNullOrWhiteSpace(_options.AccessToken);
        var hasPhoneId = !string.IsNullOrWhiteSpace(_options.PhoneNumberId);
        var hasVerify = !string.IsNullOrWhiteSpace(_options.VerifyToken);
        var hasSecret = !string.IsNullOrWhiteSpace(_options.AppSecret);
        var version = string.IsNullOrWhiteSpace(_options.ApiVersion) ? "v21.0" : _options.ApiVersion.Trim();

        return new WhatsAppConfigurationStatus(
            IsConfigured: hasToken && hasPhoneId,
            HasAccessToken: hasToken,
            HasPhoneNumberId: hasPhoneId,
            HasVerifyToken: hasVerify,
            HasAppSecret: hasSecret,
            ApiVersion: version);
    }

    public bool VerifyWebhookToken(string? mode, string? verifyToken)
    {
        if (!string.Equals(mode, "subscribe", StringComparison.Ordinal))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(_options.VerifyToken) || string.IsNullOrWhiteSpace(verifyToken))
        {
            return false;
        }

        var expected = Encoding.UTF8.GetBytes(_options.VerifyToken);
        var actual = Encoding.UTF8.GetBytes(verifyToken);
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    public bool VerifyWebhookSignature(string payload, string? signatureHeader)
    {
        if (string.IsNullOrWhiteSpace(_options.AppSecret))
        {
            // Cannot verify HMAC without AppSecret
            return false;
        }

        if (string.IsNullOrWhiteSpace(signatureHeader) || !signatureHeader.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var expectedHex = signatureHeader["sha256=".Length..].Trim();
        var keyBytes = Encoding.UTF8.GetBytes(_options.AppSecret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var hash = HMACSHA256.HashData(keyBytes, payloadBytes);
        var actualHex = Convert.ToHexStringLower(hash);

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedHex.ToLowerInvariant()),
            Encoding.UTF8.GetBytes(actualHex));
    }

    public async Task<WhatsAppSendResult> SendTemplateMessageAsync(
        SendWhatsAppTemplateRequest request,
        CancellationToken ct = default)
    {
        if (!request.HasExplicitOptIn)
        {
            return new WhatsAppSendResult(false, "Suppressed", Error: "Explicit WhatsApp opt-in consent is required.");
        }

        var status = GetConfigurationStatus();
        if (!status.IsConfigured)
        {
            return new WhatsAppSendResult(false, "NotConfigured", Error: "Meta WhatsApp Cloud API credentials (AccessToken / PhoneNumberId) are not configured.");
        }

        var normalizedPhone = new string(request.RecipientPhoneE164.Where(char.IsDigit).ToArray());
        if (normalizedPhone.Length < 8)
        {
            return new WhatsAppSendResult(false, "InvalidRecipient", Error: "Recipient phone number must be a valid E.164 number.");
        }

        var url = $"https://graph.facebook.com/{status.ApiVersion}/{_options.PhoneNumberId}/messages";
        var components = request.BodyParameters is { Count: > 0 }
            ? new object[]
            {
                new
                {
                    type = "body",
                    parameters = request.BodyParameters.Select(p => new { type = "text", text = p }).ToArray()
                }
            }
            : Array.Empty<object>();

        var payload = new
        {
            messaging_product = "whatsapp",
            to = normalizedPhone,
            type = "template",
            template = new
            {
                name = request.TemplateName,
                language = new { code = request.LanguageCode },
                components
            }
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);

        try
        {
            using var response = await httpClient.SendAsync(httpRequest, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("WhatsApp Cloud API returned {StatusCode} for template {Template}.", (int)response.StatusCode, request.TemplateName);
                return new WhatsAppSendResult(false, "ProviderError", Error: $"Meta API returned HTTP {(int)response.StatusCode}.");
            }

            string? messageId = null;
            try
            {
                using var doc = JsonDocument.Parse(body);
                if (doc.RootElement.TryGetProperty("messages", out var messagesEl) && messagesEl.GetArrayLength() > 0)
                {
                    messageId = messagesEl[0].GetProperty("id").GetString();
                }
            }
            catch
            {
                // Ignore non-standard response body parsing
            }

            logger.LogInformation("WhatsApp template {Template} accepted by Meta Cloud API (MessageId={MessageId}).", request.TemplateName, messageId);
            return new WhatsAppSendResult(true, "Accepted", MessageId: messageId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "WhatsApp Cloud API request failed.");
            return new WhatsAppSendResult(false, "NetworkError", Error: "Failed to reach Meta WhatsApp Cloud API.");
        }
    }
}
