using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class HealthEndpointTests
{
    private readonly HttpClient _client;
    private readonly NexoraTestWebApplicationFactory _factory;

    public HealthEndpointTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealthLive_Should_Return200Healthy()
    {
        var response = await _client.GetAsync("/health/live");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<HealthLiveResponse>();
        content.ShouldNotBeNull();
        content.Status.ShouldBe("Healthy");
        content.Service.ShouldBe("Nexora.Api");
    }

    [Fact]
    public async Task HealthLive_ShouldIncludeSecurityHeaders()
    {
        var response = await _client.GetAsync("/health/live");

        response.Headers.Contains("X-Content-Type-Options").ShouldBeTrue();
        response.Headers.GetValues("X-Content-Type-Options").ShouldContain("nosniff");
        response.Headers.Contains("X-Frame-Options").ShouldBeTrue();
        response.Headers.GetValues("X-Frame-Options").ShouldContain("DENY");
        response.Headers.Contains("Referrer-Policy").ShouldBeTrue();
        response.Headers.GetValues("Referrer-Policy").ShouldContain("strict-origin-when-cross-origin");
    }

    [Fact]
    public async Task DevTestEmail_InDevelopment_ShouldBeAvailable()
    {
        // /dev/test-email is gated by IsDevelopment()
        var response = await _client.GetAsync("/dev/test-email");

        // May return 200 (if SMTP server available) or 500/etc., but NOT 404
        response.StatusCode.ShouldNotBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DevTestEmail_InProductionEnvironment_ShouldReturn404NotFound()
    {
        Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", "admin@nexora.local");
        Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", "Test_Seed_Password_123!");

        try
        {
            using var prodFactory = new NexoraTestWebApplicationFactory()
                .WithWebHostBuilder(builder =>
                {
                    builder.UseEnvironment("Production");
                });

            using var prodClient = prodFactory.CreateClient();
            var response = await prodClient.GetAsync("/dev/test-email");

            response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", null);
            Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", null);
        }
    }

    private sealed record HealthLiveResponse(string Status, DateTime Timestamp, string Service);
}
