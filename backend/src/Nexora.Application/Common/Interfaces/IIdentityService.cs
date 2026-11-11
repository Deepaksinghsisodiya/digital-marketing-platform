using Nexora.Application.Common.Models;
using Nexora.Application.Identity.Models;

namespace Nexora.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string? Error, Guid? UserId, bool MustChangePassword)> LoginAsync(string email, string password, bool rememberMe, CancellationToken ct = default);
    Task SignOutAsync();
    Task SignOutEverywhereAsync(Guid userId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
    Task<(bool Success, string? ResetToken, string? Email, string? FullName)> ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task<(bool Success, string? Error)> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken ct = default);
    Task<(bool Success, string? Error, Guid? UserId, string? InviteToken)> InviteUserAsync(string email, string fullName, string role, CancellationToken ct = default);
    Task<(bool Success, string? Error)> UpdateUserAsync(Guid targetUserId, string? newRole, bool? isSuspended, string? suspensionReason, Guid actingUserId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> DeleteUserAsync(Guid targetUserId, Guid actingUserId, CancellationToken ct = default);
    Task<UserProfileDto?> GetUserProfileAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken ct = default);
    Task<PaginatedResult<UserSummaryDto>> GetUsersAsync(int page, int pageSize, string? search, string? role, int? status, CancellationToken ct = default);
    Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default);
    Task<(bool Success, string? Error)> CreateRoleAsync(string roleName, string? description, IReadOnlyList<string> permissions, Guid actingUserId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> UpdateRolePermissionsAsync(string roleName, IReadOnlyList<string> permissions, Guid actingUserId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> DeleteRoleAsync(string roleName, Guid actingUserId, CancellationToken ct = default);
}

