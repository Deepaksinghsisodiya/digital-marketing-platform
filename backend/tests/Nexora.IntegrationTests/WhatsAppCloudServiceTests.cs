using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Nexora.Application.Common.Interfaces;
using Nexora.Infrastructure.Services;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

public class WhatsAppCloudServiceTests
{
    [Fact]
    public async Task SendTemplateMessageAsync_Requires_Explicit_OptIn()
    {
        var service = new WhatsAppCloudService(
            new HttpClient(),
            Options.Create(new WhatsAppOptions()),
            NullLogger<WhatsAppCloudService>.Instance);

        var result = await service.SendTemplateMessageAsync(new SendWhatsAppTemplateRequest(
            RecipientPhoneE164: "+919876543210",
            TemplateName: "lead_welcome",
            HasExplicitOptIn: false));

        result.Success.ShouldBeFalse();
        result.Status.ShouldBe("Suppressed");
    }

    [Fact]
    public async Task SendTemplateMessageAsync_Returns_NotConfigured_When_Credentials_Missing()
    {
        var service = new WhatsAppCloudService(
            new HttpClient(),
            Options.Create(new WhatsAppOptions()),
            NullLogger<WhatsAppCloudService>.Instance);

        var result = await service.SendTemplateMessageAsync(new SendWhatsAppTemplateRequest(
            RecipientPhoneE164: "+919876543210",
            TemplateName: "lead_welcome",
            HasExplicitOptIn: true));

        result.Success.ShouldBeFalse();
        result.Status.ShouldBe("NotConfigured");
    }

    [Fact]
    public void VerifyWebhookToken_Validates_Subscribe_Mode_And_Token()
    {
        var service = new WhatsAppCloudService(
            new HttpClient(),
            Options.Create(new WhatsAppOptions { VerifyToken = "nexora-verify-secret" }),
            NullLogger<WhatsAppCloudService>.Instance);

        service.VerifyWebhookToken("subscribe", "nexora-verify-secret").ShouldBeTrue();
        service.VerifyWebhookToken("subscribe", "wrong-token").ShouldBeFalse();
        service.VerifyWebhookToken("unsubscribe", "nexora-verify-secret").ShouldBeFalse();
    }

    [Fact]
    public void VerifyWebhookSignature_Validates_HmacSha256()
    {
        const string secret = "meta-app-secret";
        const string payload = "{\"object\":\"whatsapp_business_account\",\"entry\":[]}";
        var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(payload));
        var header = "sha256=" + Convert.ToHexStringLower(hash);

        var service = new WhatsAppCloudService(
            new HttpClient(),
            Options.Create(new WhatsAppOptions { AppSecret = secret }),
            NullLogger<WhatsAppCloudService>.Instance);

        service.VerifyWebhookSignature(payload, header).ShouldBeTrue();
        service.VerifyWebhookSignature(payload, "sha256=deadbeef").ShouldBeFalse();
    }
}
