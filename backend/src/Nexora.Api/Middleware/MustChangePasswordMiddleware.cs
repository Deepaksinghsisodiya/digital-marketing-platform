using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Nexora.Api.Middleware;

public class MustChangePasswordMiddleware
{
    private readonly RequestDelegate _next;

    private static readonly HashSet<string> AllowedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/v1/auth/me",
        "/api/v1/auth/password/change",
        "/api/v1/auth/logout",
        "/api/v1/auth/logout-everywhere",
        "/api/v1/auth/csrf",
        "/health/live",
        "/health/ready"
    };

    public MustChangePasswordMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var mustChange = context.User.FindFirst("MustChangePassword")?.Value;
            if (string.Equals(mustChange, "true", StringComparison.OrdinalIgnoreCase))
            {
                var path = context.Request.Path.Value ?? string.Empty;
                if (!AllowedPaths.Contains(path))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = MediaTypeNames.Application.Json;

                    var problem = new ProblemDetails
                    {
                        Status = StatusCodes.Status403Forbidden,
                        Title = "Password Change Required",
                        Detail = "You must change your password before accessing other platform resources.",
                        Instance = context.Request.Path
                    };
                    problem.Extensions["code"] = "MUST_CHANGE_PASSWORD";

                    await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
                    return;
                }
            }
        }

        await _next(context);
    }
}

