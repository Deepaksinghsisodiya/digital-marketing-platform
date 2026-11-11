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
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int? status,
            IIdentityService identityService,
            CancellationToken ct) =>
        {
            var p = !page.HasValue || page.Value <= 0 ? 1 : page.Value;
            var ps = !pageSize.HasValue || pageSize.Value <= 0 ? 20 : Math.Min(pageSize.Value, 100);

            var result = await identityService.GetUsersAsync(p, ps, search, role, status, ct);
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

        // 4. Delete User
        group.MapDelete("/users/{id:guid}", async (
            Guid id,
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

            var (success, error) = await identityService.DeleteUserAsync(id, actingUserId.Value, ct);
            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            await auditLogService.LogAsync(
                action: "users.deleted",
                resourceType: "User",
                resourceId: id.ToString(),
                outcome: "Success",
                actorUserId: actingUserId,
                actorEmail: currentUser.Email,
                ipAddress: currentUser.IpAddress,
                userAgent: currentUser.UserAgent,
                correlationId: currentUser.CorrelationId,
                cancellationToken: ct);

            return Results.Ok(new { success = true, message = "User successfully deleted." });
        })
        .RequireAuthorization(Permissions.UsersManage)
        .WithName("DeleteUser")
        .WithTags("Users")
        .WithSummary("Delete a user account.");

        // 6. List Roles
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

        // 7. Create Custom Role
        group.MapPost("/roles", async (
            CreateRoleRequestDto request,
            IIdentityService identityService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId ?? Guid.Empty;
            var (success, error) = await identityService.CreateRoleAsync(
                request.RoleName,
                request.Description,
                request.Permissions,
                actingUserId,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Created($"/api/v1/admin/roles/{request.RoleName}", new { message = $"Role '{request.RoleName}' created successfully." });
        })
        .RequireAuthorization(Permissions.RolesView)
        .WithName("CreateRole")
        .WithTags("Roles")
        .WithSummary("Create a new custom system role with granular permissions.");

        // 8. Update Role Permissions
        group.MapPut("/roles/{roleName}/permissions", async (
            string roleName,
            UpdateRolePermissionsRequestDto request,
            IIdentityService identityService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId ?? Guid.Empty;
            var (success, error) = await identityService.UpdateRolePermissionsAsync(
                roleName,
                request.Permissions,
                actingUserId,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { message = $"Permissions for role '{roleName}' updated successfully." });
        })
        .RequireAuthorization(Permissions.RolesView)
        .WithName("UpdateRolePermissions")
        .WithTags("Roles")
        .WithSummary("Update permissions granted to a system or custom role.");

        // 9. Delete Custom Role
        group.MapDelete("/roles/{roleName}", async (
            string roleName,
            IIdentityService identityService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var actingUserId = currentUser.UserId ?? Guid.Empty;
            var (success, error) = await identityService.DeleteRoleAsync(
                roleName,
                actingUserId,
                ct);

            if (!success)
            {
                return Results.BadRequest(new { error });
            }

            return Results.Ok(new { message = $"Role '{roleName}' deleted successfully." });
        })
        .RequireAuthorization(Permissions.RolesView)
        .WithName("DeleteRole")
        .WithTags("Roles")
        .WithSummary("Delete a custom role if no users are currently assigned.");

        // 10. List Permissions Catalog
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

