using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

public class SwaggerAndOpenApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SwaggerAndOpenApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task InDevelopment_SwaggerAndScalar_ShouldReturn200OK()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        // 1. Root redirect to /swagger
        var rootResponse = await client.GetAsync("/");
        rootResponse.StatusCode.ShouldBe(HttpStatusCode.Redirect);
        rootResponse.Headers.Location?.ToString().ShouldBe("/swagger");

        // 2. Swagger UI endpoint
        var swaggerResponse = await client.GetAsync("/swagger/index.html");
        swaggerResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 3. Scalar UI endpoint
        var scalarResponse = await client.GetAsync("/scalar/v1");
        scalarResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 4. OpenAPI JSON specification
        var openApiResponse = await client.GetAsync("/openapi/v1.json");
        openApiResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jsonContent = await openApiResponse.Content.ReadAsStringAsync();
        jsonContent.ShouldContain("CSRF Protection Notice");
    }

    [Fact]
    public async Task InProduction_SwaggerAndScalar_ShouldReturn404NotFound()
    {
        Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", "admin@example.com");
        Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", "Prod_Seed_Password_123!");

        try
        {
            using var prodFactory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    builder.UseEnvironment("Production");
                });

            using var prodClient = prodFactory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

            var swaggerResponse = await prodClient.GetAsync("/swagger/index.html");
            swaggerResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);

            var scalarResponse = await prodClient.GetAsync("/scalar/v1");
            scalarResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);

            var openApiResponse = await prodClient.GetAsync("/openapi/v1.json");
            openApiResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", null);
            Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", null);
        }
    }
}

