using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class WhatsAppEndpoints
{
    public static IEndpointRouteBuilder MapWhatsAppEndpoints(this IEndpointRouteBuilder app)
    {
        // Meta WhatsApp Cloud API Webhook Verification (GET)
        app.MapGet("/api/v1/webhooks/whatsapp", (
            [FromQuery(Name = "hub.mode")] string? mode,
            [FromQuery(Name = "hub.verify_token")] string? verifyToken,
            [FromQuery(Name = "hub.challenge")] string? challenge,
            IWhatsAppService whatsAppService) =>
        {
            if (whatsAppService.VerifyWebhookToken(mode, verifyToken) && !string.IsNullOrEmpty(challenge))
            {
                return Results.Text(challenge, "text/plain");
            }

            return Results.Unauthorized();
        })
        .WithTags("WhatsApp")
        .WithSummary("Meta WhatsApp Cloud API webhook verification challenge.")
        .AllowAnonymous();

        // Meta WhatsApp Cloud API Webhook Receiver (POST)
        app.MapPost("/api/v1/webhooks/whatsapp", async (
            HttpRequest request,
            IWhatsAppService whatsAppService,
            ILoggerFactory loggerFactory) =>
        {
            using var reader = new StreamReader(request.Body);
            var rawBody = await reader.ReadToEndAsync();
            var status = whatsAppService.GetConfigurationStatus();

            if (status.HasAppSecret)
            {
                var signature = request.Headers["X-Hub-Signature-256"].FirstOrDefault();
                if (!whatsAppService.VerifyWebhookSignature(rawBody, signature))
                {
                    return Results.Unauthorized();
                }
            }

            var logger = loggerFactory.CreateLogger("Nexora.WhatsAppWebhook");
            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                if (doc.RootElement.TryGetProperty("entry", out var entries))
                {
                    logger.LogInformation("Received Meta WhatsApp webhook payload with {EntryCount} entries.", entries.GetArrayLength());
                }
            }
            catch (JsonException)
            {
                return Results.BadRequest(new { error = "Invalid JSON payload." });
            }

            return Results.Ok(new { received = true });
        })
        .WithTags("WhatsApp")
        .WithSummary("Receive Meta WhatsApp Cloud API delivery status and opt-out webhooks.")
        .AllowAnonymous();

        // Admin WhatsApp Integration Status
        app.MapGet("/api/v1/admin/whatsapp/status", (IWhatsAppService whatsAppService) =>
        {
            return Results.Ok(whatsAppService.GetConfigurationStatus());
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithTags("WhatsApp")
        .WithSummary("Inspect Meta WhatsApp Cloud API configuration status.");

        return app;
    }
}
