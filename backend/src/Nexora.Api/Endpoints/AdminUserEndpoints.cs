using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Identity.Models;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class AdminUserEndpoints
{
    public static IEndpointRouteBuilder MapAdminUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin")
            .RequireAuthorization();

        // 1. List Users
        group.MapGet("/users", async (
            [FromQuery] int page,
            [FromQuery] int pageSize,
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int? status,
            IIdentityService identityService,
            CancellationToken ct) =>
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

            var result = await identityService.GetUsersAsync(page, pageSize, search, role, status, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.UsersView)
        .WithName("GetUsers")
        .WithTags("Users")
        .WithSummary("Retrieve paginated list of platform users.");

        // 2. Invite User
        group.MapPost("/users/invite", async (
            InviteUserRequestDto request,
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error, userId, inviteToken) = await identityService.InviteUserAsync(
                request.Email,
                request.FullName,
                request.Role,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            await auditLogService.LogAsync(
                action: "users.invited",
                resourceType: "User",
                resourceId: userId.ToString(),
                outcome: "Success",
                actorUserId: currentUser.UserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new() { ["invitedEmail"] = request.Email, ["assignedRole"] = request.Role },
                cancellationToken: ct);

            return Results.Ok(new
            {
                success = true,
                userId,
                message = "Invitation link sent successfully to recipient."
            });
        })
        .RequireAuthorization(Permissions.UsersManage)
        .WithName("InviteUser")
        .WithTags("Users")
        .WithSummary("Invite a new team member with assigned role.");

        // 3. Update User (Role change or Suspend/Unsuspend)
        group.MapPatch("/users/{id:guid}", async (
            Guid id,
            UpdateUserRequestDto request,
            IIdentityService identityService,
            IAuditLogService auditLogService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId;
            if (!actingUserId.HasValue)
            {
                return Results.Unauthorized();
            }

            var (success, error) = await identityService.UpdateUserAsync(
                id,
                request.Role,
                request.IsSuspended,
                request.SuspensionReason,
                actingUserId.Value,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            await auditLogService.LogAsync(
                action: "users.updated",
                resourceType: "User",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                metadata: new()
                {
                    ["updatedRole"] = request.Role,
                    ["isSuspended"] = request.IsSuspended,
                    ["suspensionReason"] = request.SuspensionReason
                },
                cancellationToken: ct);

            return Results.Ok(new { success = true, message = "User successfully updated." });
        })
        .RequireAuthorization(Permissions.UsersManage)
        .WithName("UpdateUser")
        .WithTags("Users")
        .WithSummary("Update user role or suspend/unsuspend account.");

        // 4. List Roles
        group.MapGet("/roles", async (
            IIdentityService identityService,
            CancellationToken ct) =>
        {
            var roles = await identityService.GetRolesAsync(ct);
            return Results.Ok(roles);
        })
        .RequireAuthorization(Permissions.RolesView)
        .WithName("GetRoles")
        .WithTags("Roles")
        .WithSummary("List all system roles and their assigned permissions.");

        // 5. List Permissions Catalog
        group.MapGet("/permissions", () =>
        {
            return Results.Ok(Permissions.All);
        })
        .RequireAuthorization(Permissions.RolesView)
        .WithName("GetPermissions")
        .WithTags("Roles")
        .WithSummary("List all permissions defined in the platform catalog.");

        return app;
    }
}

