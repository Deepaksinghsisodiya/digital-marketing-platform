using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Common.Interfaces;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class WebhookDispatcherIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public WebhookDispatcherIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task WebhookDispatcher_InvalidUrl_ShouldFailGracefully()
    {
        using var scope = _factory.Services.CreateScope();
        var dispatcher = scope.ServiceProvider.GetRequiredService<IWebhookDispatcher>();

        var (success, error) = await dispatcher.DispatchLeadWebhookAsync(
            "not_a_valid_url",
            "secret_123",
            new { test = "payload" });

        success.ShouldBeFalse();
        error.ShouldNotBeNull();
        error.ShouldContain("Invalid webhook URL");
    }

    [Fact]
    public async Task WebhookDispatcher_EmptyUrl_ShouldFailGracefully()
    {
        using var scope = _factory.Services.CreateScope();
        var dispatcher = scope.ServiceProvider.GetRequiredService<IWebhookDispatcher>();

        var (success, error) = await dispatcher.DispatchLeadWebhookAsync(
            "",
            "secret_123",
            new { test = "payload" });

        success.ShouldBeFalse();
        error.ShouldNotBeNull();
        error.ShouldContain("empty");
    }
}
