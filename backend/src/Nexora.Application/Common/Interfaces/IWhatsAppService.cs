namespace Nexora.Application.Common.Interfaces;

public sealed record WhatsAppConfigurationStatus(
    bool IsConfigured,
    bool HasAccessToken,
    bool HasPhoneNumberId,
    bool HasVerifyToken,
    bool HasAppSecret,
    string ApiVersion);

public sealed record WhatsAppSendResult(
    bool Success,
    string Status,
    string? MessageId = null,
    string? Error = null);

public sealed record SendWhatsAppTemplateRequest(
    string RecipientPhoneE164,
    string TemplateName,
    string LanguageCode = "en_US",
    IReadOnlyList<string>? BodyParameters = null,
    bool HasExplicitOptIn = false);

public interface IWhatsAppService
{
    WhatsAppConfigurationStatus GetConfigurationStatus();

    bool VerifyWebhookToken(string? mode, string? verifyToken);

    bool VerifyWebhookSignature(string payload, string? signatureHeader);

    Task<WhatsAppSendResult> SendTemplateMessageAsync(
        SendWhatsAppTemplateRequest request,
        CancellationToken ct = default);
}
