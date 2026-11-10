using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
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
    public async Task Request_Should_IncludeCorrelationIdHeaderInResponse()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/health/live");
        request.Headers.Add("X-Correlation-Id", "test-corr-id-12345");

        var response = await _client.SendAsync(request);

        response.Headers.Contains("X-Correlation-Id").ShouldBeTrue();
        response.Headers.GetValues("X-Correlation-Id").First().ShouldBe("test-corr-id-12345");
    }

    [Fact]
    public async Task DevTestEmail_InProductionEnvironment_ShouldReturn404NotFound()
    {
        Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", "admin@nexora.local");
        Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", "Test_Seed_Password_123!");

        try
        {
            using var prodFactory = new WebApplicationFactory<Program>()
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

