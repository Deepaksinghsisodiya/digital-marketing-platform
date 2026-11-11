using Nexora.Domain.Enums;

namespace Nexora.Application.Identity.Models;

public record UserProfileDto(
    Guid Id,
    string Email,
    string FullName,
    UserStatus Status,
    bool MustChangePassword,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions,
    DateTime CreatedAtUtc,
    DateTime? LastLoginAtUtc);

public record UserSummaryDto(
    Guid Id,
    string Email,
    string FullName,
    UserStatus Status,
    string Role,
    DateTime CreatedAtUtc,
    DateTime? LastLoginAtUtc);

public record LoginRequestDto(
    string Email,
    string Password,
    bool RememberMe = false);

public record ChangePasswordRequestDto(
    string? CurrentPassword,
    string NewPassword);

public record ForgotPasswordRequestDto(
    string Email);

public record ResetPasswordRequestDto(
    string Email,
    string Token,
    string NewPassword);

public record InviteUserRequestDto(
    string Email,
    string FullName,
    string Role);

public record UpdateUserRequestDto(
    string? Role,
    bool? IsSuspended,
    string? SuspensionReason);

public record RoleDto(
    string Name,
    string Description,
    IReadOnlyList<string> Permissions);

public record CreateRoleRequestDto(
    string RoleName,
    string? Description,
    IReadOnlyList<string> Permissions);

public record UpdateRolePermissionsRequestDto(
    IReadOnlyList<string> Permissions);

