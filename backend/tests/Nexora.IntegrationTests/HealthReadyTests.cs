using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

/// <summary>
/// Integration test for /health/ready endpoint against real SQL Server instance.
/// Connects to real SQL Server database (e.g. MSSQLLocalDB or standard SQL Server)
/// using ConnectionStrings:DefaultConnection from configuration / environment.
/// </summary>
public class HealthReadyTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthReadyTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHealthReady_WithRealSqlServer_ShouldReturn200Healthy()
    {
        // Connection string from env or fallback to LocalDB
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? Environment.GetEnvironmentVariable("INTEGRATION_DB_CONNECTION")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=nexora_dev;Trusted_Connection=True;TrustServerCertificate=True";

        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", connectionString);

        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("Healthy");
        body.ShouldContain("sqlserver");
    }
}
