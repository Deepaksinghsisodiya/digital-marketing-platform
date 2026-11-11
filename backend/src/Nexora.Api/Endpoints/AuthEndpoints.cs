using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Identity.Models;
using Nexora.Infrastructure.Identity;

namespace Nexora.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .RequireRateLimiting("AuthRateLimit")
            .WithTags("Auth");

        // 1. Antiforgery / CSRF Token
        group.MapGet("/csrf", (IAntiforgery antiforgery, HttpContext httpContext) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(httpContext);
            return Results.Ok(new
            {
                token = tokens.RequestToken,
                headerName = tokens.HeaderName
            });
        })
        .WithName("GetCsrfToken")
        .WithSummary("Retrieve CSRF token for subsequent mutating requests.");

        // 2. Login
        group.MapPost("/login", async (
            LoginRequestDto request,
            IIdentityService identityService,
            UserManager<ApplicationUser> userManager,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var (success, error, userId, mustChangePassword) = await identityService.LoginAsync(
                request.Email,
                request.Password,
                request.RememberMe,
                ct);

            if (!success)
            {
                await auditLogService.LogAsync(
                    action: "auth.login.failed",
                    resourceType: "Auth",
                    resourceId: null,
                    outcome: "Failure",
                    actorUserId: null,
                    actorEmail: request.Email,
                    ipAddress: currentUser.IpAddress,
                    userAgent: currentUser.UserAgent,
                    correlationId: currentUser.CorrelationId,
                    metadata: new() { ["reason"] = error },
                    cancellationToken: ct);

                return Results.BadRequest(new { error });
            }

            // Fetch user for roles and security stamp
            var userObj = await userManager.FindByIdAsync(userId!.Value.ToString());
            var roles = userObj != null ? await userManager.GetRolesAsync(userObj) : [];
            var securityStamp = userObj != null ? await userManager.GetSecurityStampAsync(userObj) : string.Empty;

            // Issue custom claims on cookie including MustChangePassword & SecurityStamp
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId.Value.ToString()),
                new(ClaimTypes.Email, request.Email),
                new(new ClaimsIdentityOptions().SecurityStampClaimType, securityStamp),
                new("MustChangePassword", mustChangePassword ? "true" : "false")
            };
            foreach (var role in roles)
            {
                claims.Add(new(ClaimTypes.Role, role));
            }

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                new AuthenticationProperties
                {
                    IsPersistent = request.RememberMe,
                    ExpiresUtc = request.RememberMe ? DateTimeOffset.UtcNow.AddDays(14) : null
                });

            await auditLogService.LogAsync(
                action: "auth.login.success",
                resourceType: "Auth",
                resourceId: userId.ToString(),
                outcome: "Success",
                actorUserId: userId,
                actorEmail: request.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new
            {
                success = true,
                userId,
                mustChangePassword
            });
        })
        .WithName("Login")
        .WithSummary("Sign in with email and password.");

        // 3. Logout (current session only)
        group.MapPost("/logout", async (
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var userId = currentUser.UserId;
            var email = currentUser.Email;

            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await identityService.SignOutAsync();

            if (userId.HasValue)
            {
                await auditLogService.LogAsync(
                    action: "auth.logout",
                    resourceType: "Auth",
                    resourceId: userId.Value.ToString(),
                    outcome: "Success",
                    actorUserId: userId,
                    actorEmail: email,
                    ipAddress: currentUser.IpAddress,
                    userAgent: currentUser.UserAgent,
                    correlationId: currentUser.CorrelationId,
                    cancellationToken: ct);
            }

            return Results.Ok(new { success = true });
        })
        .WithName("Logout")
        .WithSummary("Sign out the current session.");

        // 4. Logout Everywhere (invalidates security stamp)
        group.MapPost("/logout-everywhere", async (
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var userId = currentUser.UserId;
            if (!userId.HasValue)
            {
                return Results.Unauthorized();
            }

            await identityService.SignOutEverywhereAsync(userId.Value, ct);
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            await auditLogService.LogAsync(
                action: "auth.logout.everywhere",
                resourceType: "Auth",
                resourceId: userId.Value.ToString(),
                outcome: "Success",
                actorUserId: userId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new { success = true, message = "All active sessions have been invalidated." });
        })
        .RequireAuthorization()
        .WithName("LogoutEverywhere")
        .WithSummary("Invalidate all active sessions across all devices.");

        // 5. Current Profile (Me)
        group.MapGet("/me", async (
            IIdentityService identityService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var userId = currentUser.UserId;
            if (!userId.HasValue)
            {
                return Results.Unauthorized();
            }

            var profile = await identityService.GetUserProfileAsync(userId.Value, ct);
            if (profile == null)
            {
                return Results.NotFound(new { error = "User profile not found." });
            }

            return Results.Ok(profile);
        })
        .RequireAuthorization()
        .WithName("GetCurrentUser")
        .WithSummary("Retrieve authenticated user profile, roles, and evaluated permissions.");

        // 6. Password Change
        group.MapPost("/password/change", async (
            ChangePasswordRequestDto request,
            IIdentityService identityService,
            UserManager<ApplicationUser> userManager,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var userId = currentUser.UserId;
            if (!userId.HasValue)
            {
                return Results.Unauthorized();
            }

            var (success, error) = await identityService.ChangePasswordAsync(
                userId.Value,
                request.CurrentPassword,
                request.NewPassword,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            // Refresh cookie with MustChangePassword = false and newly updated SecurityStamp
            var userObj = await userManager.FindByIdAsync(userId.Value.ToString());
            var roles = userObj != null ? await userManager.GetRolesAsync(userObj) : [];
            var newSecurityStamp = userObj != null ? await userManager.GetSecurityStampAsync(userObj) : string.Empty;

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId.Value.ToString()),
                new(ClaimTypes.Email, currentUser.Email ?? string.Empty),
                new(new ClaimsIdentityOptions().SecurityStampClaimType, newSecurityStamp),
                new("MustChangePassword", "false")
            };
            foreach (var role in roles)
            {
                claims.Add(new(ClaimTypes.Role, role));
            }

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

            await auditLogService.LogAsync(
                action: "auth.password.changed",
                resourceType: "Auth",
                resourceId: userId.Value.ToString(),
                outcome: "Success",
                actorUserId: userId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new { success = true, message = "Password changed successfully." });
        })
        .RequireAuthorization()
        .WithName("ChangePassword")
        .WithSummary("Change password for authenticated user.");

        // 7. Forgot Password (anti-enumeration)
        group.MapPost("/password/forgot", async (
            ForgotPasswordRequestDto request,
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            await identityService.ForgotPasswordAsync(request.Email, ct);

            await auditLogService.LogAsync(
                action: "auth.password.forgot_requested",
                resourceType: "Auth",
                resourceId: null,
                outcome: "Success",
                actorUserId: null,
                actorEmail: request.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            // Always return identical message regardless of whether email exists
            return Results.Ok(new
            {
                success = true,
                message = "If an active account exists with this email, password reset instructions have been sent."
            });
        })
        .WithName("ForgotPassword")
        .WithSummary("Request password reset link (anti-enumeration response).");

        // 8. Reset Password
        group.MapPost("/password/reset", async (
            ResetPasswordRequestDto request,
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await identityService.ResetPasswordAsync(
                request.Email,
                request.Token,
                request.NewPassword,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            await auditLogService.LogAsync(
                action: "auth.password.reset_completed",
                resourceType: "Auth",
                resourceId: null,
                outcome: "Success",
                actorUserId: null,
                actorEmail: request.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new { success = true, message = "Password has been successfully reset. Please log in." });
        })
        .WithName("ResetPassword")
        .WithSummary("Reset password using token received via email.");

        return app;
    }
}

