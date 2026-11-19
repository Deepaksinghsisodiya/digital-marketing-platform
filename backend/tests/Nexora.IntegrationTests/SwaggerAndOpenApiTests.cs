using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class SwaggerAndOpenApiTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public SwaggerAndOpenApiTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
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

        // 2. Swagger UI /swagger/index.html
        var swaggerResponse = await client.GetAsync("/swagger/index.html");
        swaggerResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 3. Scalar API Reference /scalar/v1
        var scalarResponse = await client.GetAsync("/scalar/v1");
        scalarResponse.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 4. OpenAPI JSON /openapi/v1.json
        var openApiResponse = await client.GetAsync("/openapi/v1.json");
        openApiResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        var openApiBody = await openApiResponse.Content.ReadAsStringAsync();
        openApiBody.ShouldContain("Nexora Platform API");
        openApiBody.ShouldContain(".Nexora.Session");
    }

    [Fact]
    public async Task AuthCookie_NameAndOpenApiScheme_MustMatchConfiguredCookieName()
    {
        var client = _factory.CreateClient();
        var openApiResponse = await client.GetAsync("/openapi/v1.json");
        openApiResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        var openApiBody = await openApiResponse.Content.ReadAsStringAsync();

        // Scheme name must match configured session cookie name (.Nexora.Session)
        openApiBody.ShouldContain("\"name\": \".Nexora.Session\"");
        openApiBody.ShouldContain("\"in\": \"cookie\"");
    }

    [Fact]
    public async Task InProduction_SwaggerAndScalar_ShouldReturn404NotFound()
    {
        Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", "admin@example.com");
        Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", "Prod_Seed_Password_123!");

        try
        {
            using var prodFactory = new NexoraTestWebApplicationFactory()
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

            var rootResponse = await prodClient.GetAsync("/");
            rootResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        }
        finally
        {
            Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", null);
            Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", null);
        }
    }
}
