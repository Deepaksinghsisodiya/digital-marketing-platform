using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Nexora.Api.Authorization;
using Nexora.Api.Endpoints;
using Nexora.Api.Middleware;
using Nexora.Api.Options;
using Nexora.Api.Services;
using Nexora.Application;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Enums;
using Nexora.Infrastructure;
using Nexora.Infrastructure.Email;
using Nexora.Infrastructure.Identity;
using Nexora.Infrastructure.Persistence;
using Scalar.AspNetCore;
using Serilog;

// 0. Load .env file into environment if present by walking up directory tree
var searchDir = new DirectoryInfo(Directory.GetCurrentDirectory());
while (searchDir != null)
{
    var envPath = Path.Combine(searchDir.FullName, ".env");
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#')) continue;
            var idx = trimmed.IndexOf('=');
            if (idx > 0)
            {
                var key = trimmed.Substring(0, idx).Trim();
                var val = trimmed.Substring(idx + 1).Trim();
                if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
        break;
    }
    searchDir = searchDir.Parent;
}

var builder = WebApplication.CreateBuilder(args);

// 1. Serilog Structured Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] ({CorrelationId}) {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Add Clean Architecture Layers
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// 3. ProblemDetails
builder.Services.AddProblemDetails();

// 4. Reverse Proxy / Forwarded Headers Configuration
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// 5. CORS with explicit origins and credentials
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ];

builder.Services.AddCors(options =>
{
    options.AddPolicy("NexoraCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrWhiteSpace(origin)) return false;
                  if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                  {
                      return uri.Host is "localhost" or "127.0.0.1";
                  }
                  return false;
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Auth Foundation: Cookie Options Wiring
var authCookieOptions = builder.Configuration.GetSection(AuthCookieOptions.SectionName).Get<AuthCookieOptions>()
    ?? new AuthCookieOptions();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = authCookieOptions.CookieName;
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = authCookieOptions.Secure ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = authCookieOptions.SameSite.Equals("Strict", StringComparison.OrdinalIgnoreCase)
            ? SameSiteMode.Strict
            : SameSiteMode.Lax;

        if (!string.IsNullOrWhiteSpace(authCookieOptions.Domain))
        {
            options.Cookie.Domain = authCookieOptions.Domain;
        }

        options.ExpireTimeSpan = TimeSpan.FromMinutes(authCookieOptions.ExpireMinutes);
        options.SlidingExpiration = true;

        options.EventsType = null;
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            },
            OnValidatePrincipal = async context =>
            {
                var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    context.RejectPrincipal();
                    return;
                }

                var user = await userManager.FindByIdAsync(userIdClaim);
                if (user == null || user.Status != UserStatus.Active)
                {
                    context.RejectPrincipal();
                    return;
                }

                var stampClaim = context.Principal?.FindFirst(new ClaimsIdentityOptions().SecurityStampClaimType)?.Value;
                var currentStamp = await userManager.GetSecurityStampAsync(user);
                if (string.IsNullOrEmpty(stampClaim) || stampClaim != currentStamp)
                {
                    context.RejectPrincipal();
                }
            }
        };
    });

// 7. Dynamic Permission Authorization Policies
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
    {
        options.AddPolicy(permission, policy =>
            policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});

// 8. Rate Limiting Middleware Configuration
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("AuthRateLimit", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var permitLimit = builder.Configuration.GetValue("RateLimiting:PermitLimit", 100);
        var windowSeconds = builder.Configuration.GetValue("RateLimiting:WindowSeconds", 60);

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromSeconds(windowSeconds),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    options.AddPolicy("PublicFormRateLimit", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var permitLimit = builder.Configuration.GetValue("RateLimiting:PublicFormPermitLimit", 100);
        var windowSeconds = builder.Configuration.GetValue("RateLimiting:WindowSeconds", 60);

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromSeconds(windowSeconds),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

// 9. Antiforgery (CSRF)
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = ".Nexora.Antiforgery";
    options.Cookie.HttpOnly = false; // Accessible to script for header inclusion
    options.Cookie.SecurePolicy = authCookieOptions.Secure ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
});

// 10. OpenAPI with Security Scheme and CSRF documentation (Development only)
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "Nexora Platform API",
            Version = "v1",
            Description = "Nexora Digital Marketing Platform Backend API.\n\n" +
                          "### CSRF Protection Notice\n" +
                          "All mutating requests (POST, PUT, PATCH, DELETE) require antiforgery validation. " +
                          "First call `GET /api/v1/auth/csrf` to retrieve the CSRF token and cookie, " +
                          "then send the token in the `X-XSRF-TOKEN` request header with each mutating call."
        };

        document.Components ??= new Microsoft.OpenApi.OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[authCookieOptions.CookieName] = new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.ApiKey,
            In = Microsoft.OpenApi.ParameterLocation.Cookie,
            Name = authCookieOptions.CookieName,
            Description = $"ASP.NET Core Identity Application Cookie authentication (Cookie: {authCookieOptions.CookieName})"
        };

        return Task.CompletedTask;
    });
});

// 11. Verify Seed Admin Configuration
var configEmail = builder.Configuration["SEED_ADMIN_EMAIL"];
var seedEmail = !string.IsNullOrWhiteSpace(configEmail) ? configEmail : Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL");

var configPassword = builder.Configuration["SEED_ADMIN_PASSWORD"];
var seedPassword = !string.IsNullOrWhiteSpace(configPassword) ? configPassword : Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");

if (string.IsNullOrWhiteSpace(seedEmail) || string.IsNullOrWhiteSpace(seedPassword))
{
    if (builder.Environment.IsProduction())
    {
        throw new InvalidOperationException("CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be provided in production.");
    }
    Log.Warning("SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set. Admin seeding is skipped for development.");
}
else
{
    var atIdx = seedEmail.IndexOf('@');
    var maskedEmail = atIdx > 2 ? $"{seedEmail[..2]}***{seedEmail[atIdx..]}" : "***";
    Log.Information("Initial admin seed credentials verified for setup ({Email}).", maskedEmail);
}

var app = builder.Build();

// Pipeline Middlewares
app.UseForwardedHeaders();

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
    await next();
});

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("NexoraCorsPolicy");
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "Nexora Platform API v1");
        c.RoutePrefix = "swagger";
    });

    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseAuthentication();
app.UseAuthorization();

// CSRF Protection for mutating endpoints
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;
    var method = context.Request.Method;

    var isMutating = HttpMethods.IsPost(method) || HttpMethods.IsPut(method) || HttpMethods.IsPatch(method) || HttpMethods.IsDelete(method);
    var requiresCsrf = isMutating && (
        path.StartsWith("/api/v1/admin/", StringComparison.OrdinalIgnoreCase) ||
        path.Equals("/api/v1/auth/password/change", StringComparison.OrdinalIgnoreCase) ||
        path.Equals("/api/v1/auth/logout-everywhere", StringComparison.OrdinalIgnoreCase)
    );

    if (requiresCsrf)
    {
        var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
        if (!await antiforgery.IsRequestValidAsync(context))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"CSRF_TOKEN_INVALID\",\"message\":\"Antiforgery token validation failed. Include valid X-XSRF-TOKEN header and antiforgery cookie.\"}");
            return;
        }
    }

    await next();
});

app.UseMiddleware<MustChangePasswordMiddleware>();

// Health Endpoints
app.MapHealthEndpoints();

// Step 2 Module Endpoints
app.MapAuthEndpoints();
app.MapAdminUserEndpoints();
app.MapAdminAuditEndpoints();
app.MapSettingsEndpoints();
app.MapCmsEndpoints();
app.MapMediaEndpoints();
app.MapMenuEndpoints();
app.MapLeadEndpoints();
app.MapEmailEndpoints();
app.MapClientEndpoints();
app.MapBlogEndpoints();
app.MapLookupEndpoints();

// Dev-only: Test email via Mailpit (never exposed in production)
if (app.Environment.IsDevelopment())
{
    app.MapGet("/dev/test-email", async (IEmailSender emailSender, IOptions<SmtpOptions> smtpOptions, CancellationToken ct) =>
    {
        var configuredSenderEmail = !string.IsNullOrWhiteSpace(smtpOptions.Value.FromEmail) 
            ? smtpOptions.Value.FromEmail 
            : "noreply@nexora.local";
        var configuredSenderName = !string.IsNullOrWhiteSpace(smtpOptions.Value.FromName) 
            ? smtpOptions.Value.FromName 
            : "Nexora Platform";

        var message = new EmailMessage(
            To: [new EmailRecipient(configuredSenderEmail, configuredSenderName)],
            Subject: "Nexora Dev Test Email",
            BodyHtml: "<h1>Nexora</h1><p>This is a dev-only email test sent via Mailpit.</p>",
            BodyPlainText: "Nexora - Dev test email via Mailpit.");

        await emailSender.SendEmailAsync(message, ct);
        return Results.Ok(new { sent = true, to = configuredSenderEmail, subject = message.Subject });
    })
    .WithTags("Dev")
    .WithSummary("Send a test email to Mailpit (Development only).");
}

try
{
    Log.Information("Starting Nexora.Api host on {Environment}...", app.Environment.EnvironmentName);
    await StartupSeeder.SeedAsync(app.Services, app.Environment);
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Nexora.Api host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}

// Make Program accessible for IntegrationTests
public partial class Program { }
