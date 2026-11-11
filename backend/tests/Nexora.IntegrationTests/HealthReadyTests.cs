using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

/// <summary>
/// Integration test for /health/ready endpoint against real SQL Server test database.
/// Connects to real SQL Server test database (e.g. MSSQLLocalDB nexora_test)
/// using ConnectionStrings:TestConnection enforced by NexoraTestWebApplicationFactory.
/// </summary>
[Collection("IntegrationTests")]
public class HealthReadyTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public HealthReadyTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task GetHealthReady_WithRealSqlServer_ShouldReturn200Healthy()
    {
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("Healthy");
        body.ShouldContain("sqlserver");
    }

    [Fact]
    public async Task GetHealthReady_WithoutDb_ShouldReturn503ServiceUnavailable()
    {
        // Unreachable local port with 1-second timeout
        var unreachableConn = "Server=127.0.0.1,65534;Database=nexora_down_test;Connect Timeout=1;TrustServerCertificate=True";

        using var unavailFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["SkipStartupSeed"] = "true",
                    ["ConnectionStrings:DefaultConnection"] = unreachableConn
                });
            });

            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(Microsoft.EntityFrameworkCore.DbContextOptions<Nexora.Infrastructure.Persistence.AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);
                services.AddDbContext<Nexora.Infrastructure.Persistence.AppDbContext>(opts => 
                    opts.UseSqlServer(unreachableConn));
            });
        });

        using var client = unavailFactory.CreateClient();
        var response = await client.GetAsync("/health/ready");

        response.StatusCode.ShouldBe(HttpStatusCode.ServiceUnavailable);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("Unhealthy");
    }
}
