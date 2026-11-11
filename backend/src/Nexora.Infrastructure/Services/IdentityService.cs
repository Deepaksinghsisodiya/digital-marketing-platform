using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Application.Identity.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Enums;
using Nexora.Infrastructure.Identity;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly AppDbContext _context;
    private readonly IEmailSender _emailSender;
    private readonly IMemoryCache _memoryCache;
    private readonly IAuditLogService _auditLogService;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IConfiguration _configuration;
    private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;
    private readonly IEmailTemplateService? _emailTemplateService;
    private readonly ILogger<IdentityService> _logger;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<ApplicationRole> roleManager,
        AppDbContext context,
        IEmailSender emailSender,
        IMemoryCache memoryCache,
        IAuditLogService auditLogService,
        IDateTimeProvider dateTimeProvider,
        IConfiguration configuration,
        Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor,
        ILogger<IdentityService> logger,
        IEmailTemplateService? emailTemplateService = null)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _context = context;
        _emailSender = emailSender;
        _memoryCache = memoryCache;
        _auditLogService = auditLogService;
        _dateTimeProvider = dateTimeProvider;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        _emailTemplateService = emailTemplateService;
    }

    public async Task<(bool Success, string? Error, Guid? UserId, bool MustChangePassword)> LoginAsync(
        string email,
        string password,
        bool rememberMe,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, "Invalid email or password.", null, false);
        }

        if (user.Status == UserStatus.Suspended)
        {
            return (false, $"Account is suspended. Reason: {user.SuspensionReason ?? "Administrative action"}", null, false);
        }

        if (user.Status == UserStatus.Invited)
        {
            return (false, "Account invitation has not been completed. Please set your password using the invitation link.", null, false);
        }

        var isLockedOut = await _userManager.IsLockedOutAsync(user);
        if (isLockedOut)
        {
            return (false, "Account is temporarily locked due to multiple failed login attempts. Please try again later.", null, false);
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!passwordValid)
        {
            await _userManager.AccessFailedAsync(user);
            return (false, "Invalid email or password.", null, false);
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        user.LastLoginAtUtc = _dateTimeProvider.UtcNow;
        await _userManager.UpdateAsync(user);

        return (true, null, user.Id, user.MustChangePassword);
    }

    public Task SignOutAsync()
    {
        return Task.CompletedTask;
    }

    public async Task SignOutEverywhereAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user != null)
        {
            await _userManager.UpdateSecurityStampAsync(user);
            _memoryCache.Remove($"UserPerms_{userId}");
        }
    }

    public async Task<(bool Success, string? Error)> ChangePasswordAsync(
        Guid userId,
        string? currentPassword,
        string newPassword,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return (false, "User not found.");
        }

        IdentityResult result;
        if (string.IsNullOrWhiteSpace(currentPassword) && user.MustChangePassword)
        {
            // Initial setup bypass: If account was flagged for forced initial password change and user does not have existing password
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(currentPassword))
            {
                return (false, "Current password is required.");
            }
            result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        }

        if (!result.Succeeded)
        {
            return (false, string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        user.MustChangePassword = false;
        await _userManager.UpdateAsync(user);
        await _userManager.UpdateSecurityStampAsync(user);

        _memoryCache.Remove($"UserPerms_{userId}");
        return (true, null);
    }

    public async Task<(bool Success, string? ResetToken, string? Email, string? FullName)> ForgotPasswordAsync(
        string email,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || user.Status == UserStatus.Suspended)
        {
            // Anti-enumeration: Return success so attacker cannot verify whether email exists
            return (true, null, null, null);
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var clientBaseUrl = _configuration["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5201";

        // URL fragment to ensure token is never leaked via HTTP Referer header or access logs
        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(user.Email ?? string.Empty);
        var resetLink = $"{clientBaseUrl}/auth/reset-password#token={encodedToken}&email={encodedEmail}";

        string subject = "Reset Your Nexora Account Password";
        string bodyHtml = $"<h3>Password Reset Request</h3><p>Hello {user.FullName},</p><p>Click below to reset your password:</p><p><a href=\"{resetLink}\">Reset Password</a></p>";
        string bodyPlain = $"Hello {user.FullName},\n\nReset your password using the link:\n{resetLink}";

        if (_emailTemplateService != null)
        {
            try
            {
                var vars = new Dictionary<string, string>
                {
                    ["user.name"] = user.FullName,
                    ["reset.link"] = resetLink,
                    ["expires_minutes"] = "30",
                    ["platform.companyName"] = "Nexora Platform",
                    ["support.email"] = "support@nexora.local"
                };
                var rendered = await _emailTemplateService.RenderTemplateAsync("user-password-reset", vars, ct);
                if (!string.IsNullOrWhiteSpace(rendered.Subject))
                {
                    subject = rendered.Subject;
                    bodyHtml = rendered.BodyHtml;
                    bodyPlain = rendered.BodyPlainText;
                }
            }
            catch
            {
                // Fallback to default format if template not loaded
            }
        }

        var emailMessage = new EmailMessage(
            To: [new EmailRecipient(user.Email!, user.FullName)],
            Subject: subject,
            BodyHtml: bodyHtml,
            BodyPlainText: bodyPlain);

        try
        {
            await _emailSender.SendEmailAsync(emailMessage, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deliver password reset email to {Email}", user.Email);
        }
        return (true, token, user.Email, user.FullName);
    }

    public async Task<(bool Success, string? Error)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword,
        CancellationToken ct = default)
    {
        _context.ChangeTracker.Clear();
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || user.Status == UserStatus.Suspended)
        {
            return (false, "Invalid or expired reset token.");
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
        {
            return (false, string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        // If user was invited or MustChangePassword was set, transition to Active and clear flag
        if (user.Status == UserStatus.Invited || user.MustChangePassword)
        {
            user.Status = UserStatus.Active;
            user.MustChangePassword = false;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return (false, string.Join("; ", updateResult.Errors.Select(e => e.Description)));
            }
        }

        _memoryCache.Remove($"UserPerms_{user.Id}");
        return (true, null);
    }

    public async Task<(bool Success, string? Error, Guid? UserId, string? InviteToken)> InviteUserAsync(
        string email,
        string fullName,
        string role,
        CancellationToken ct = default)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing != null)
        {
            return (false, "A user with this email already exists.", null, null);
        }

        if (!Roles.All.Contains(role))
        {
            return (false, $"Invalid role: {role}.", null, null);
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            FullName = fullName,
            Status = UserStatus.Invited,
            MustChangePassword = false,
            CreatedAtUtc = _dateTimeProvider.UtcNow,
            EmailConfirmed = true
        };

        // Create passwordless user
        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            return (false, string.Join("; ", createResult.Errors.Select(e => e.Description)), null, null);
        }

        await _userManager.AddToRoleAsync(user, role);

        // Generate password setup token (using password reset provider)
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var clientBaseUrl = _configuration["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5201";

        // URL fragment keeps token private
        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(email);
        var inviteLink = $"{clientBaseUrl}/auth/setup-password#token={encodedToken}&email={encodedEmail}";

        string subject = "Invitation to Nexora Digital Marketing Platform";
        string bodyHtml = $"<h3>Welcome to Nexora</h3><p>Hello {fullName},</p><p>You have been invited as a <strong>{role}</strong>.</p><p><a href=\"{inviteLink}\">Set your password</a> to activate your account.</p>";
        string bodyPlain = $"Hello {fullName},\n\nYou have been invited to Nexora as {role}.\nSet your password at:\n{inviteLink}";

        if (_emailTemplateService != null)
        {
            try
            {
                var vars = new Dictionary<string, string>
                {
                    ["user.name"] = fullName,
                    ["user.role"] = role,
                    ["invite.link"] = inviteLink,
                    ["expires_hours"] = "48",
                    ["platform.companyName"] = "Nexora Platform",
                    ["support.email"] = "support@nexora.local"
                };
                var rendered = await _emailTemplateService.RenderTemplateAsync("user-invitation", vars, ct);
                if (!string.IsNullOrWhiteSpace(rendered.Subject))
                {
                    subject = rendered.Subject;
                    bodyHtml = rendered.BodyHtml;
                    bodyPlain = rendered.BodyPlainText;
                }
            }
            catch
            {
                // Fallback to default format if template not loaded
            }
        }

        var emailMessage = new EmailMessage(
            To: [new EmailRecipient(email, fullName)],
            Subject: subject,
            BodyHtml: bodyHtml,
            BodyPlainText: bodyPlain);

        try
        {
            await _emailSender.SendEmailAsync(emailMessage, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deliver user invitation email to {Email}", email);
        }
        return (true, null, user.Id, token);
    }

    public async Task<(bool Success, string? Error)> ResendInvitationAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return (false, "User not found.");
        }

        if (user.Status != UserStatus.Invited)
        {
            return (false, "User has already accepted their invitation or is active.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? Roles.Editor;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var clientBaseUrl = _configuration["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5201";

        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(user.Email ?? string.Empty);
        var inviteLink = $"{clientBaseUrl}/auth/setup-password#token={encodedToken}&email={encodedEmail}";

        string subject = "Reminder: Invitation to Nexora Digital Marketing Platform";
        string bodyHtml = $"<h3>Welcome to Nexora</h3><p>Hello {user.FullName},</p><p>This is a reminder that you have been invited as a <strong>{role}</strong>.</p><p><a href=\"{inviteLink}\">Set your password</a> to activate your account.</p>";
        string bodyPlain = $"Hello {user.FullName},\n\nThis is a reminder that you have been invited to Nexora as {role}.\nSet your password at:\n{inviteLink}";

        if (_emailTemplateService != null)
        {
            try
            {
                var vars = new Dictionary<string, string>
                {
                    ["user.name"] = user.FullName ?? user.Email ?? "Team Member",
                    ["user.role"] = role,
                    ["invite.link"] = inviteLink,
                    ["expires_hours"] = "48",
                    ["platform.companyName"] = "Nexora Platform",
                    ["support.email"] = "support@nexora.local"
                };
                var rendered = await _emailTemplateService.RenderTemplateAsync("user-invitation", vars, ct);
                if (!string.IsNullOrWhiteSpace(rendered.Subject))
                {
                    subject = rendered.Subject;
                    bodyHtml = rendered.BodyHtml;
                    bodyPlain = rendered.BodyPlainText ?? bodyPlain;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Template render failed for user-invitation reminder, using built-in fallback");
            }
        }

        var emailMessage = new EmailMessage(
            To: [new EmailRecipient(user.Email!, user.FullName ?? user.Email!)],
            Subject: subject,
            BodyHtml: bodyHtml,
            BodyPlainText: bodyPlain
        );

        try
        {
            await _emailSender.SendEmailAsync(emailMessage, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deliver reminder invitation email to {Email}", user.Email);
            return (false, "Failed to send email. Please verify SMTP settings.");
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> SendPasswordResetLinkAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return (false, "User not found.");
        }

        if (string.IsNullOrWhiteSpace(user.Email))
        {
            return (false, "User does not have a valid email address.");
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var clientBaseUrl = _configuration["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5201";

        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(user.Email);
        var resetLink = $"{clientBaseUrl}/auth/reset-password#token={encodedToken}&email={encodedEmail}";

        string subject = "Reset Your Password - Nexora Platform";
        string bodyHtml = $"<h3>Password Reset Request</h3><p>Hello {user.FullName},</p><p>An administrator requested a password reset for your Nexora account.</p><p><a href=\"{resetLink}\">Click here to reset your password</a>.</p><p>If you did not expect this, you can safely ignore this email.</p>";
        string bodyPlain = $"Hello {user.FullName},\n\nAn administrator requested a password reset for your Nexora account.\nReset your password at:\n{resetLink}";

        if (_emailTemplateService != null)
        {
            try
            {
                var vars = new Dictionary<string, string>
                {
                    ["user.name"] = user.FullName ?? user.Email,
                    ["reset.link"] = resetLink,
                    ["expires_hours"] = "24",
                    ["platform.companyName"] = "Nexora Platform",
                    ["support.email"] = "support@nexora.local"
                };
                var rendered = await _emailTemplateService.RenderTemplateAsync("password-reset", vars, ct);
                if (!string.IsNullOrWhiteSpace(rendered.Subject))
                {
                    subject = rendered.Subject;
                    bodyHtml = rendered.BodyHtml;
                    bodyPlain = rendered.BodyPlainText ?? bodyPlain;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Template render failed for password-reset, using built-in fallback");
            }
        }

        var emailMessage = new EmailMessage(
            To: [new EmailRecipient(user.Email, user.FullName ?? user.Email)],
            Subject: subject,
            BodyHtml: bodyHtml,
            BodyPlainText: bodyPlain
        );

        try
        {
            await _emailSender.SendEmailAsync(emailMessage, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deliver admin-initiated password reset email to {Email}", user.Email);
            return (false, "Failed to send email. Please verify SMTP settings.");
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> UpdateUserAsync(
        Guid targetUserId,
        string? newRole,
        bool? isSuspended,
        string? suspensionReason,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        _context.ChangeTracker.Clear();

        // 1. Self-Action Protection
        if (targetUserId == actingUserId)
        {
            if (isSuspended == true)
            {
                return (false, "You cannot suspend your own account.");
            }
        }

        var user = await _userManager.FindByIdAsync(targetUserId.ToString());
        if (user == null)
        {
            return (false, "User not found.");
        }

        if (targetUserId == actingUserId)
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (newRole != null && currentRoles.Contains(Roles.Owner) && newRole != Roles.Owner)
            {
                return (false, "You cannot demote your own Owner role.");
            }
        }

        // 2. Last-Owner Protection
        var userRoles = await _userManager.GetRolesAsync(user);
        var isCurrentOwner = userRoles.Contains(Roles.Owner);
        if (isCurrentOwner && (isSuspended == true || (newRole != null && newRole != Roles.Owner)))
        {
            var totalActiveOwners = await (from u in _context.Users
                                           join ur in _context.UserRoles on u.Id equals ur.UserId
                                           join r in _context.Roles on ur.RoleId equals r.Id
                                           where r.Name == Roles.Owner && u.Status == UserStatus.Active
                                           select u.Id).Distinct().CountAsync(ct);

            if (totalActiveOwners <= 1)
            {
                return (false, "Cannot demote or suspend the last active Owner.");
            }
        }

        // 3. Apply Role Change
        if (newRole != null && !userRoles.Contains(newRole))
        {
            if (!Roles.All.Contains(newRole))
            {
                return (false, $"Invalid role: {newRole}.");
            }

            await _userManager.RemoveFromRolesAsync(user, userRoles);
            await _userManager.AddToRoleAsync(user, newRole);

            // Evict cache immediately so next request gets new permissions without re-login!
            _memoryCache.Remove($"UserPerms_{targetUserId}");
        }

        // 4. Apply Suspension
        if (isSuspended.HasValue)
        {
            if (isSuspended.Value && user.Status != UserStatus.Suspended)
            {
                user.Status = UserStatus.Suspended;
                user.SuspendedAtUtc = _dateTimeProvider.UtcNow;
                user.SuspensionReason = suspensionReason ?? "Administrative suspension";
                user.SecurityStamp = Guid.NewGuid().ToString(); // Force terminate active sessions atomically

                var res = await _userManager.UpdateAsync(user);
                if (!res.Succeeded)
                {
                    return (false, string.Join("; ", res.Errors.Select(e => e.Description)));
                }
                _memoryCache.Remove($"UserPerms_{targetUserId}");
            }
            else if (!isSuspended.Value && user.Status == UserStatus.Suspended)
            {
                user.Status = UserStatus.Active;
                user.SuspendedAtUtc = null;
                user.SuspensionReason = null;
                user.SecurityStamp = Guid.NewGuid().ToString();

                var res = await _userManager.UpdateAsync(user);
                if (!res.Succeeded)
                {
                    return (false, string.Join("; ", res.Errors.Select(e => e.Description)));
                }
                _memoryCache.Remove($"UserPerms_{targetUserId}");
            }
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteUserAsync(
        Guid targetUserId,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        _context.ChangeTracker.Clear();
        if (targetUserId == actingUserId)
        {
            return (false, "You cannot delete your own account.");
        }

        var user = await _userManager.FindByIdAsync(targetUserId.ToString());
        if (user == null)
        {
            return (false, "User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains(Roles.Owner))
        {
            var activeOwnersCount = await (from u in _context.Users
                                           join ur in _context.UserRoles on u.Id equals ur.UserId
                                           join r in _context.Roles on ur.RoleId equals r.Id
                                           where r.Name == Roles.Owner && u.Status == UserStatus.Active
                                           select u.Id).Distinct().CountAsync(ct);

            if (activeOwnersCount <= 1)
            {
                return (false, "Cannot delete the last active Owner.");
            }
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return (false, string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        _memoryCache.Remove($"UserPerms_{targetUserId}");
        return (true, null);
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await GetUserPermissionsAsync(userId, ct);

        return new UserProfileDto(
            Id: user.Id,
            Email: user.Email ?? string.Empty,
            FullName: user.FullName,
            Status: user.Status,
            MustChangePassword: user.MustChangePassword,
            Roles: roles.ToList(),
            Permissions: permissions,
            CreatedAtUtc: user.CreatedAtUtc,
            LastLoginAtUtc: user.LastLoginAtUtc);
    }

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken ct = default)
    {
        var cacheKey = $"UserPerms_{userId}";
        if (_memoryCache.TryGetValue(cacheKey, out IReadOnlyList<string>? cached) && cached != null)
        {
            return cached;
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.Status != UserStatus.Active)
        {
            return [];
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains(Roles.Owner))
        {
            // Owner automatically has all permissions in the catalog
            _memoryCache.Set(cacheKey, Permissions.All, TimeSpan.FromMinutes(10));
            return Permissions.All;
        }

        var rolePermissions = await (from rp in _context.RolePermissions
                                     join r in _context.Roles on rp.RoleId equals r.Id
                                     where roles.Contains(r.Name!)
                                     select rp.PermissionKey)
                                     .Distinct()
                                     .ToListAsync(ct);

        _memoryCache.Set(cacheKey, (IReadOnlyList<string>)rolePermissions, TimeSpan.FromMinutes(10));
        return rolePermissions;
    }

    public async Task<PaginatedResult<UserSummaryDto>> GetUsersAsync(
        int page,
        int pageSize,
        string? search,
        string? role,
        int? status,
        CancellationToken ct = default)
    {
        var query = from u in _context.Users
                    join ur in _context.UserRoles on u.Id equals ur.UserId into userRoles
                    from ur in userRoles.DefaultIfEmpty()
                    join r in _context.Roles on ur.RoleId equals r.Id into roles
                    from r in roles.DefaultIfEmpty()
                    select new { User = u, RoleName = r != null ? r.Name : string.Empty };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(x => x.User.FullName.ToLower().Contains(searchLower) ||
                                     (x.User.Email != null && x.User.Email.ToLower().Contains(searchLower)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(x => x.RoleName == role);
        }

        if (status.HasValue)
        {
            var s = (UserStatus)status.Value;
            query = query.Where(x => x.User.Status == s);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.User.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UserSummaryDto(
                x.User.Id,
                x.User.Email ?? string.Empty,
                x.User.FullName,
                x.User.Status,
                x.RoleName ?? string.Empty,
                x.User.CreatedAtUtc,
                x.User.LastLoginAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<UserSummaryDto>(items, total, page, pageSize);
    }

    public async Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default)
    {
        var roles = await _roleManager.Roles.ToListAsync(ct);
        var rolePermissions = await _context.RolePermissions.ToListAsync(ct);

        var list = new List<RoleDto>();
        foreach (var r in roles)
        {
            var perms = r.Name == Roles.Owner
                ? Permissions.All
                : rolePermissions.Where(rp => rp.RoleId == r.Id).Select(rp => rp.PermissionKey).ToList();

            list.Add(new RoleDto(r.Name ?? string.Empty, r.Description, perms));
        }

        return list;
    }

    public async Task<(bool Success, string? Error)> CreateRoleAsync(
        string roleName,
        string? description,
        IReadOnlyList<string> permissions,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(roleName))
        {
            return (false, "Role name is required.");
        }

        roleName = roleName.Trim();
        if (await _roleManager.RoleExistsAsync(roleName))
        {
            return (false, $"Role '{roleName}' already exists.");
        }

        var newRole = new ApplicationRole
        {
            Name = roleName,
            NormalizedName = roleName.ToUpperInvariant(),
            Description = description ?? $"Custom {roleName} role",
            IsSystemRole = false
        };

        var res = await _roleManager.CreateAsync(newRole);
        if (!res.Succeeded)
        {
            return (false, res.Errors.FirstOrDefault()?.Description ?? "Failed to create role.");
        }

        var validPerms = permissions.Where(p => Permissions.All.Contains(p)).Distinct().ToList();
        foreach (var p in validPerms)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = newRole.Id,
                PermissionKey = p
            });
        }
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "role.created",
            resourceType: "Role",
            resourceId: newRole.Id.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new Dictionary<string, object?> { ["RoleName"] = roleName, ["PermissionsCount"] = validPerms.Count },
            cancellationToken: ct);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> UpdateRolePermissionsAsync(
        string roleName,
        IReadOnlyList<string> permissions,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role == null)
        {
            return (false, $"Role '{roleName}' not found.");
        }

        if (role.Name == Roles.Owner)
        {
            return (false, "Owner role permissions are system immutable and cannot be restricted.");
        }

        var existingPerms = await _context.RolePermissions
            .Where(rp => rp.RoleId == role.Id)
            .ToListAsync(ct);
        _context.RolePermissions.RemoveRange(existingPerms);

        var validPerms = permissions.Where(p => Permissions.All.Contains(p)).Distinct().ToList();
        foreach (var p in validPerms)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = role.Id,
                PermissionKey = p
            });
        }
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "role.permissions_updated",
            resourceType: "Role",
            resourceId: role.Id.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new Dictionary<string, object?> { ["RoleName"] = roleName, ["PermissionsCount"] = validPerms.Count },
            cancellationToken: ct);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteRoleAsync(
        string roleName,
        Guid actingUserId,
        CancellationToken ct = default)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role == null)
        {
            return (false, $"Role '{roleName}' not found.");
        }

        var systemRoles = new[] { Roles.Owner, Roles.Admin, Roles.Editor, Roles.Sales };
        if (systemRoles.Contains(role.Name) || role.IsSystemRole)
        {
            return (false, $"System role '{role.Name}' cannot be deleted.");
        }

        var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
        if (usersInRole.Count > 0)
        {
            return (false, $"Cannot delete role '{role.Name}' because {usersInRole.Count} user(s) are currently assigned to it. Reassign users first.");
        }

        var existingPerms = await _context.RolePermissions
            .Where(rp => rp.RoleId == role.Id)
            .ToListAsync(ct);
        _context.RolePermissions.RemoveRange(existingPerms);

        await _roleManager.DeleteAsync(role);
        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "role.deleted",
            resourceType: "Role",
            resourceId: role.Id.ToString(),
            outcome: "Success",
            actorUserId: actingUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"),
            metadata: new Dictionary<string, object?> { ["RoleName"] = roleName },
            cancellationToken: ct);

        return (true, null);
    }
}
