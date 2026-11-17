using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Nexora.Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        // Live probe: signifies process is up
        app.MapGet("/health", () => Results.Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "Nexora.Api"
        }))
        .WithName("HealthRoot")
        .WithTags("Health")
        .Produces(StatusCodes.Status200OK);

        app.MapGet("/health/live", () => Results.Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "Nexora.Api"
        }))
        .WithName("HealthLive")
        .WithTags("Health")
        .Produces(StatusCodes.Status200OK);

        // Ready probe: signifies database and external dependencies are reachable
        app.MapGet("/health/ready", async (HealthCheckService healthCheckService, CancellationToken ct) =>
        {
            var report = await healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"), ct);

            var response = new
            {
                status = report.Status.ToString(),
                totalDurationMs = report.TotalDuration.TotalMilliseconds,
                entries = report.Entries.Select(e => new
                {
                    key = e.Key,
                    status = e.Value.Status.ToString(),
                    durationMs = e.Value.Duration.TotalMilliseconds,
                    description = e.Value.Description ?? e.Value.Status.ToString()
                })
            };

            return report.Status == HealthStatus.Healthy
                ? Results.Ok(response)
                : Results.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
        })
        .WithName("HealthReady")
        .WithTags("Health")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status503ServiceUnavailable);

        return app;
    }
}

