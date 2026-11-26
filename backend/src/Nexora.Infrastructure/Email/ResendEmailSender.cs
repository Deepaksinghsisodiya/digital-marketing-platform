using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;

namespace Nexora.Infrastructure.Email;

/// <summary>
/// Production HTTP Email Adapter using Resend REST API (https://api.resend.com/emails).
/// Activated when Email:Provider = "Resend" and Resend:ApiKey is configured.
/// </summary>
public class ResendEmailSender : IEmailSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ResendEmailSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Resend:ApiKey is not configured.");
        }

        var fromEmail = _configuration["Resend:FromEmail"]
            ?? _configuration["Smtp:FromEmail"]
            ?? "noreply@nexora.local";
        var fromName = _configuration["Resend:FromName"]
            ?? _configuration["Smtp:FromName"]
            ?? "Nexora Platform";

        var payload = new
        {
            from = $"{fromName} <{fromEmail}>",
            to = message.To.Select(r => r.Email).ToArray(),
            subject = message.Subject,
            html = message.BodyHtml,
            text = string.IsNullOrWhiteSpace(message.BodyPlainText) ? null : message.BodyPlainText
        };

        var client = _httpClientFactory.CreateClient("Resend");
        client.BaseAddress = new Uri("https://api.resend.com/");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var response = await client.PostAsJsonAsync("emails", payload, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {StatusCode}: {Body}", (int)response.StatusCode, body);
            throw new InvalidOperationException($"Resend delivery failed with status {(int)response.StatusCode}.");
        }

        _logger.LogInformation("Resend email delivered to {RecipientCount} recipients.", message.To.Count);
    }
}
