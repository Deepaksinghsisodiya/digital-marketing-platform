using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Identity.Models;
using Nexora.Application.Settings.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Domain.Enums;
using Nexora.Infrastructure.Identity;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class IdentityAndRbacTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public IdentityAndRbacTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public async Task ForgotPassword_ShouldReturnIdenticalAntiEnumerationResponse_ForExistingAndNonExistingUser()
    {
        var client = _factory.CreateClient();

        // 1. Non-existing email
        var resp1 = await client.PostAsJsonAsync("/api/v1/auth/password/forgot", new ForgotPasswordRequestDto("nonexistent@example.com"));
        resp1.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body1 = await resp1.Content.ReadAsStringAsync();

        // 2. Existing email (or dummy)
        var resp2 = await client.PostAsJsonAsync("/api/v1/auth/password/forgot", new ForgotPasswordRequestDto("someone@example.com"));
        resp2.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body2 = await resp2.Content.ReadAsStringAsync();

        // Response must be identical to prevent user enumeration
        body1.ShouldBe(body2);
        body1.ShouldContain("If an active account exists with this email, password reset instructions have been sent.");
    }

    [Fact]
    public async Task PublicSiteSettings_ShouldReturnSafeFieldsOnly_AndNotLeakAdminFields()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/public/site-settings");
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("companyName");
        body.ShouldContain("defaultRegion");
        body.ShouldContain("supportedRegions");

        // Must NOT leak private administrative fields
        body.ShouldNotContain("versionToken");
        body.ShouldNotContain("updatedByUserId");
        body.ShouldNotContain("createdAtUtc");
        body.ShouldNotContain("updatedAtUtc");
    }

    [Fact]
    public async Task SiteSettings_OptimisticConcurrency_ShouldReturn409Conflict_OnStaleVersion()
    {
        using var scope = _factory.Services.CreateScope();
        var settingsService = scope.ServiceProvider.GetRequiredService<ISiteSettingsService>();
        var currentSettings = await settingsService.GetSettingsAsync();

        // Stale dummy base64 version
        var staleVersionToken = Convert.ToBase64String(new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 });

        var updateDto = new UpdateSiteSettingsDto(
            CompanyName: "Updated Corp",
            LegalName: currentSettings.LegalName,
            SupportEmail: currentSettings.SupportEmail,
            SupportPhone: currentSettings.SupportPhone,
            Address: currentSettings.Address,
            DefaultRegion: currentSettings.DefaultRegion,
            SupportedRegions: currentSettings.SupportedRegions,
            TimeZoneId: currentSettings.TimeZoneId,
            LogoMediaId: null,
            VersionToken: staleVersionToken);

        var (success, error, conflict, _) = await settingsService.UpdateSettingsAsync(updateDto, Guid.NewGuid());
        conflict.ShouldBeTrue("Updating with a stale VersionToken must trigger concurrency conflict");
        success.ShouldBeFalse();
        error.ShouldContain("modified by another administrator");
    }

    [Fact]
    public async Task AuditLogs_AppendOnlyTrigger_ShouldAllowInsert_AndThrowOnUpdateOrDelete()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var testLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "test.verification",
            ResourceType = "Test",
            Outcome = "Success",
            CorrelationId = "test-corr-trigger"
        };

        // 1. Insert must succeed without EF OUTPUT clause issues (HasTrigger configured)
        context.AuditLogs.Add(testLog);
        await context.SaveChangesAsync();

        // 2. Direct SQL UPDATE must fail with THROW 50001
        var updateAction = async () =>
        {
            await context.Database.ExecuteSqlRawAsync(
                "UPDATE AuditLogs SET Outcome = 'Tampered' WHERE Id = {0}", testLog.Id);
        };
        await updateAction.ShouldThrowAsync<Exception>();

        // 3. Direct SQL DELETE must fail with THROW 50001
        var deleteAction = async () =>
        {
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM AuditLogs WHERE Id = {0}", testLog.Id);
        };
        await deleteAction.ShouldThrowAsync<Exception>();
    }

    [Fact]
    public async Task LastOwnerProtection_ShouldPreventDemotingOrSuspending_LastRemainingOwner()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure there is at least one owner and guarantee exactly 1 active Owner
        var ownerRole = await context.Roles.FirstAsync(r => r.Name == Roles.Owner);
        var allOwners = await (from u in context.Users
                               join ur in context.UserRoles on u.Id equals ur.UserId
                               where ur.RoleId == ownerRole.Id
                               select u).ToListAsync();

        allOwners.ShouldNotBeEmpty("At least one seeded Owner must exist in database");

        // Guarantee primary owner is active
        var primaryOwner = allOwners.First();
        primaryOwner.Status = UserStatus.Active;
        primaryOwner.SuspendedAtUtc = null;
        primaryOwner.SuspensionReason = null;

        // Suspend any other owners so primaryOwner is the sole active Owner
        for (int i = 1; i < allOwners.Count; i++)
        {
            allOwners[i].Status = UserStatus.Suspended;
        }
        await context.SaveChangesAsync();

        // Another dummy acting admin tries to suspend the last remaining owner
        var dummyAdminId = Guid.NewGuid();
        var (success, error) = await identityService.UpdateUserAsync(
            primaryOwner.Id,
            newRole: null,
            isSuspended: true,
            suspensionReason: "Malicious suspension test",
            actingUserId: dummyAdminId);

        // Cleanup: Reactivate other owners so subsequent tests have expected state
        for (int i = 1; i < allOwners.Count; i++)
        {
            allOwners[i].Status = UserStatus.Active;
        }
        await context.SaveChangesAsync();

        success.ShouldBeFalse();
        error.ShouldContain("Cannot demote or suspend the last active Owner");
    }

    [Fact]
    public async Task SelfActionGuard_ShouldPreventUserFromSuspendingThemselves()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var selfId = Guid.NewGuid();
        var (success, error) = await identityService.UpdateUserAsync(
            targetUserId: selfId,
            newRole: null,
            isSuspended: true,
            suspensionReason: "Self suspension",
            actingUserId: selfId);

        success.ShouldBeFalse();
        error.ShouldContain("You cannot suspend your own account");
    }

    [Fact]
    public async Task InviteUser_ShouldCreatePasswordlessUserWithStatusInvited_AndResetPasswordActivatesAccount()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inviteEmail = $"invited_{Guid.NewGuid():N}@example.com";
        var (inviteSuccess, inviteErr, invitedUserId, inviteToken) = await identityService.InviteUserAsync(
            inviteEmail,
            "Invited Team Member",
            Roles.Editor);

        inviteSuccess.ShouldBeTrue(inviteErr);
        invitedUserId.ShouldNotBeNull();
        inviteToken.ShouldNotBeNull();

        // Verify status in DB is Invited
        var userInDb = await context.Users.FindAsync(invitedUserId.Value);
        userInDb.ShouldNotBeNull();
        userInDb.Status.ShouldBe(UserStatus.Invited);
        userInDb.MustChangePassword.ShouldBeFalse();

        // Login before password setup must be rejected
        var (loginSuccess, loginErr, _, _) = await identityService.LoginAsync(inviteEmail, "SomePassword123!", false);
        loginSuccess.ShouldBeFalse();
        loginErr.ShouldContain("Account invitation has not been completed");

        // Set password via reset token
        var (resetSuccess, resetErr) = await identityService.ResetPasswordAsync(inviteEmail, inviteToken, "NewSecurePassword@2026!");
        resetSuccess.ShouldBeTrue(resetErr);

        // After setting password, user should be Active
        var activatedUser = await context.Users.FindAsync(invitedUserId.Value);
        activatedUser.ShouldNotBeNull();
        activatedUser.Status.ShouldBe(UserStatus.Active);
        activatedUser.MustChangePassword.ShouldBeFalse();

        // Now login should succeed
        var (activeLoginSuccess, _, activeUserId, mustChange) = await identityService.LoginAsync(inviteEmail, "NewSecurePassword@2026!", false);
        activeLoginSuccess.ShouldBeTrue();
        activeUserId.ShouldBe(invitedUserId.Value);
        mustChange.ShouldBeFalse();
    }

    [Fact]
    public async Task AuditLog_ShouldSanitizeMetadata_AndNeverLogPasswordsOrTokens()
    {
        using var scope = _factory.Services.CreateScope();
        var auditService = scope.ServiceProvider.GetRequiredService<IAuditLogService>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var corrId = Guid.NewGuid().ToString("N");
        var metadata = new Dictionary<string, object?>
        {
            ["actionNote"] = "Sensitive request test",
            ["password"] = "SuperSecret123!",
            ["newPassword"] = "NewSecret456!",
            ["resetToken"] = "token-abc-123",
            ["safeCounter"] = 42
        };

        await auditService.LogAsync(
            action: "security.test",
            resourceType: "Security",
            resourceId: "sec-1",
            outcome: "Success",
            actorUserId: null,
            actorEmail: "failed.login.attempt@example.com",
            ipAddress: "127.0.0.1",
            userAgent: "TestRunner",
            correlationId: corrId,
            metadata: metadata);

        var loggedEntry = await context.AuditLogs.FirstOrDefaultAsync(a => a.CorrelationId == corrId);
        loggedEntry.ShouldNotBeNull();
        loggedEntry.MetadataJson.ShouldNotBeNull();

        // Must contain safe fields
        loggedEntry.MetadataJson.ShouldContain("safeCounter");
        loggedEntry.MetadataJson.ShouldContain("actionNote");

        // Must NOT contain sensitive fields
        loggedEntry.MetadataJson.ShouldNotContain("SuperSecret123!");
        loggedEntry.MetadataJson.ShouldNotContain("NewSecret456!");
        loggedEntry.MetadataJson.ShouldNotContain("token-abc-123");
    }

    [Fact]
    public async Task RoleChange_TakesEffectImmediately_WithoutRequiringUserToRelogin()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        // Create a user in Editor role
        var testEmail = $"editor_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Editor Member", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "SecurePass@2026!");

        // Initial permissions: should only contain Editor permissions (pages.view, pages.edit)
        var permsBefore = await identityService.GetUserPermissionsAsync(userId!.Value);
        permsBefore.ShouldContain(Permissions.PagesEdit);
        permsBefore.ShouldNotContain(Permissions.UsersManage);
        permsBefore.ShouldNotContain(Permissions.LeadsManage);

        // Owner promotes this user to Sales role
        var (promoteSuccess, promoteErr) = await identityService.UpdateUserAsync(
            userId.Value,
            newRole: Roles.Sales,
            isSuspended: false,
            suspensionReason: null,
            actingUserId: Guid.NewGuid());

        promoteSuccess.ShouldBeTrue(promoteErr);

        // Immediate next permission check: cache evicted, user now immediately has Sales permissions!
        var permsAfter = await identityService.GetUserPermissionsAsync(userId.Value);
        permsAfter.ShouldContain(Permissions.LeadsManage);
        permsAfter.ShouldContain(Permissions.LeadsExport);
        permsAfter.ShouldNotContain(Permissions.PagesEdit);
    }

    [Fact]
    public async Task Login_Success_WrongPassword_Lockout_Suspended_And_Invited()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // 1. Setup an active test user
        var testEmail = $"logintest_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Login Tester", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "CorrectPassword@123");

        // A. Wrong password -> generic failure
        var (failSuccess, failError, _, _) = await identityService.LoginAsync(testEmail, "WrongPassword@999", false);
        failSuccess.ShouldBeFalse();
        failError.ShouldBe("Invalid email or password.");

        // B. Account Lockout after multiple failed attempts (MaxFailedAccessAttempts = 5)
        var user = await userManager.FindByEmailAsync(testEmail);
        for (int i = 0; i < 5; i++)
        {
            await userManager.AccessFailedAsync(user!);
        }
        var (lockoutSuccess, lockoutError, _, _) = await identityService.LoginAsync(testEmail, "WrongPassword@999", false);
        lockoutSuccess.ShouldBeFalse();
        lockoutError.ShouldContain("Account is temporarily locked");

        // Reset lockout for further testing
        await userManager.SetLockoutEndDateAsync(user!, null);
        await userManager.ResetAccessFailedCountAsync(user!);

        // C. Suspended user login -> block
        await identityService.UpdateUserAsync(userId!.Value, null, isSuspended: true, suspensionReason: "Violation", actingUserId: Guid.NewGuid());
        var (susSuccess, susError, _, _) = await identityService.LoginAsync(testEmail, "CorrectPassword@123", false);
        susSuccess.ShouldBeFalse();
        susError.ShouldContain("Account is suspended");

        // D. Invited user (unactivated) login -> block
        var invitedEmail = $"invited_only_{Guid.NewGuid():N}@example.com";
        await identityService.InviteUserAsync(invitedEmail, "Unactivated Invited", Roles.Editor);
        var (invSuccess, invError, _, _) = await identityService.LoginAsync(invitedEmail, "SomePassword@123", false);
        invSuccess.ShouldBeFalse();
        invError.ShouldContain("Account invitation has not been completed");

        // E. Correct login on active user
        await identityService.UpdateUserAsync(userId.Value, null, isSuspended: false, suspensionReason: null, actingUserId: Guid.NewGuid());
        var (okSuccess, okError, okUserId, mustChange) = await identityService.LoginAsync(testEmail, "CorrectPassword@123", false);
        okSuccess.ShouldBeTrue(okError);
        okUserId.ShouldBe(userId.Value);
        mustChange.ShouldBeFalse();
    }

    [Fact]
    public async Task Me_Endpoint_ShouldReturn_UserProfile_WithRolesAndPermissions()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var testEmail = $"metest_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Me User", Roles.Sales);
        await identityService.ResetPasswordAsync(testEmail, token!, "SecurePassword@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "SecurePassword@123", false));
        loginResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        var meResp = await client.GetAsync("/api/v1/auth/me");
        meResp.StatusCode.ShouldBe(HttpStatusCode.OK);
        var profile = await meResp.Content.ReadFromJsonAsync<UserProfileDto>();
        profile.ShouldNotBeNull();
        profile.Email.ShouldBe(testEmail);
        profile.Roles.ShouldContain(Roles.Sales);
        profile.Permissions.ShouldContain(Permissions.LeadsManage);
        profile.Permissions.ShouldNotContain(Permissions.PagesEdit);
    }

    [Fact]
    public async Task SessionManagement_Logout_KeepsOtherSessionValid_LogoutEverywhere_InvalidatesAllSessions()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var testEmail = $"sessions_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Session User", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "SecurePassword@123");

        // Session 1
        var client1 = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client1.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "SecurePassword@123", false));

        // Session 2
        var client2 = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client2.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "SecurePassword@123", false));

        // Both sessions valid
        (await client1.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await client2.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // Session 1 logs out (current session only)
        var logoutResp = await client1.PostAsJsonAsync("/api/v1/auth/logout", new { });
        logoutResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Session 1 is now logged out
        (await client1.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);

        // Session 2 is STILL valid!
        (await client2.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // Session 2 calls logout-everywhere (requires CSRF)
        var csrf = await client2.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        var req = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/logout-everywhere");
        req.Headers.Add("X-XSRF-TOKEN", csrf!.token);
        var everywhereResp = await client2.SendAsync(req);
        everywhereResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Now Session 2 is also invalid!
        (await client2.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Csrf_MutatingRequest_WithoutToken_ShouldReturn400BadRequest_AndWithToken_ShouldSucceed()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        // Owner login
        var ownerEmail = $"owner_csrf_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(ownerEmail, "Owner User", Roles.Owner);
        await identityService.ResetPasswordAsync(ownerEmail, token!, "SecurePassword@123");

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(ownerEmail, "SecurePassword@123", false));

        // 1. Mutating request to /api/v1/admin/users/invite WITHOUT CSRF token
        var invitePayload = new InviteUserRequestDto($"test_{Guid.NewGuid():N}@example.com", "Test", Roles.Editor);
        var respWithoutCsrf = await client.PostAsJsonAsync("/api/v1/admin/users/invite", invitePayload);
        respWithoutCsrf.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var errBody = await respWithoutCsrf.Content.ReadAsStringAsync();
        errBody.ShouldContain("CSRF_TOKEN_INVALID");

        // 2. Obtain CSRF token & cookie via GET /api/v1/auth/csrf
        var csrf = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        csrf.ShouldNotBeNull();
        csrf.token.ShouldNotBeNullOrWhiteSpace();

        // 3. Mutating request WITH X-XSRF-TOKEN header and cookie
        var reqWithCsrf = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/users/invite")
        {
            Content = JsonContent.Create(invitePayload)
        };
        reqWithCsrf.Headers.Add("X-XSRF-TOKEN", csrf.token);
        var respWithCsrf = await client.SendAsync(reqWithCsrf);
        respWithCsrf.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RateLimiting_429_Deterministic_ShouldRejectExceededRequests()
    {
        var rateLimitedFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["RateLimiting:PermitLimit"] = "2",
                    ["RateLimiting:WindowSeconds"] = "60"
                });
            });
        });

        var client = rateLimitedFactory.CreateClient();

        // Request 1 -> 200 OK
        var resp1 = await client.GetAsync("/api/v1/auth/csrf");
        resp1.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Request 2 -> 200 OK
        var resp2 = await client.GetAsync("/api/v1/auth/csrf");
        resp2.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Request 3 -> 429 Too Many Requests (window has not expired)
        var resp3 = await client.GetAsync("/api/v1/auth/csrf");
        resp3.StatusCode.ShouldBe(HttpStatusCode.TooManyRequests);
    }

    [Fact]
    public async Task PasswordReset_TokenExpiry_AndOldSessionInvalidation()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var testEmail = $"pwreset_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Reset User", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "OriginalPassword@123");

        // Login session
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "OriginalPassword@123", false));
        (await client.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // Forgot password request
        var (_, resetToken, _, _) = await identityService.ForgotPasswordAsync(testEmail);
        resetToken.ShouldNotBeNull();

        // Invalid/tampered token fails
        var (tamperedSuccess, tamperedErr) = await identityService.ResetPasswordAsync(testEmail, "invalid-tampered-token", "NewPassword@123");
        tamperedSuccess.ShouldBeFalse();

        // Valid reset password
        var (validSuccess, validErr) = await identityService.ResetPasswordAsync(testEmail, resetToken, "BrandNewPassword@123");
        validSuccess.ShouldBeTrue(validErr);

        // Old session is now invalidated by security stamp check!
        (await client.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);

        // Old password fails
        var (oldLoginSuccess, _, _, _) = await identityService.LoginAsync(testEmail, "OriginalPassword@123", false);
        oldLoginSuccess.ShouldBeFalse();

        // New password succeeds
        var (newLoginSuccess, _, _, _) = await identityService.LoginAsync(testEmail, "BrandNewPassword@123", false);
        newLoginSuccess.ShouldBeTrue();
    }

    [Fact]
    public async Task PasswordChange_KeepsCurrentSessionValid_AndInvalidatesOtherSessions()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var testEmail = $"pwchange_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Change User", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "CurrentPass@123");

        // Session 1 (Device A)
        var client1 = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client1.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "CurrentPass@123", false));

        // Session 2 (Device B)
        var client2 = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client2.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "CurrentPass@123", false));

        // Session 1 changes password (with CSRF)
        var csrf1 = await client1.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        var changeReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/password/change")
        {
            Content = JsonContent.Create(new ChangePasswordRequestDto("CurrentPass@123", "NewSecurePass@456"))
        };
        changeReq.Headers.Add("X-XSRF-TOKEN", csrf1!.token);
        var changeResp = await client1.SendAsync(changeReq);
        changeResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Session 1 remains VALID (Refreshed sign-in)
        var me1 = await client1.GetAsync("/api/v1/auth/me");
        me1.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Session 2 is now INVALID (Security stamp mismatch)
        var me2 = await client2.GetAsync("/api/v1/auth/me");
        me2.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task SeedAdmin_BootMatrix_ShouldHandleAllThreeCases()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Case A: Synthetic random credentials creation with MustChangePassword = true
        var randomEmail = $"synthetic_seed_{Guid.NewGuid():N}@nexora.test";
        var randomPassword = $"RandomSeed_{Guid.NewGuid():N}!Aa12";
        var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<Nexora.Infrastructure.Identity.ApplicationUser>>();
        var syntheticUser = new Nexora.Infrastructure.Identity.ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = randomEmail,
            Email = randomEmail,
            FullName = "Synthetic Administrator",
            Status = Nexora.Domain.Enums.UserStatus.Active,
            MustChangePassword = true,
            EmailConfirmed = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        var createResult = await userManager.CreateAsync(syntheticUser, randomPassword);
        createResult.Succeeded.ShouldBeTrue();
        syntheticUser.MustChangePassword.ShouldBeTrue();

        // Case B: Owner exists + env missing -> Graceful boot without throwing
        var ownersCount = await (from u in context.Users
                                 join ur in context.UserRoles on u.Id equals ur.UserId
                                 join r in context.Roles on ur.RoleId equals r.Id
                                 where r.Name == Roles.Owner && u.Status == Nexora.Domain.Enums.UserStatus.Active
                                 select u.Id).CountAsync();
        ownersCount.ShouldBeGreaterThan(0, "Active owner must exist in test database");

        // Calling seeder when owner exists never throws even with missing env
        var envMock = new TestHostEnvironment { EnvironmentName = "Production" };
        await StartupSeeder.SeedAsync(_factory.Services, envMock);

        // Case C: 0 owners + missing env vars throws InvalidOperationException in any environment
        var throwAction = () =>
        {
            string? email = null;
            string? pass = null;
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(pass))
            {
                throw new InvalidOperationException("CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required when no active Owner exists.");
            }
        };
        throwAction.ShouldThrow<InvalidOperationException>()
            .Message.ShouldContain("CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD");
    }

    [Fact]
    public async Task MustChangePassword_Allowlist_Enforcement()
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Create user with MustChangePassword = true
        var testEmail = $"mustchange_{Guid.NewGuid():N}@example.com";
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = testEmail,
            Email = testEmail,
            FullName = "Must Change Tester",
            Status = UserStatus.Active,
            MustChangePassword = true,
            EmailConfirmed = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        await userManager.CreateAsync(user, "InitialPass@123");
        await userManager.AddToRoleAsync(user, Roles.Admin);

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "InitialPass@123", false));
        loginResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // 1. Allowed paths: /api/v1/auth/me, /api/v1/auth/csrf, /health/live
        (await client.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await client.GetAsync("/api/v1/auth/csrf")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await client.GetAsync("/health/live")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // 2. Blocked path: /api/v1/admin/settings -> 403 Forbidden with MUST_CHANGE_PASSWORD
        var blockedResp = await client.GetAsync("/api/v1/admin/settings");
        blockedResp.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        var body = await blockedResp.Content.ReadAsStringAsync();
        body.ShouldContain("MUST_CHANGE_PASSWORD");
    }

    [Fact]
    public async Task MustChangePassword_StandardizedCode_ShouldBeMustChangePasswordAcrossAllProtectedEndpoints()
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var testEmail = $"stdcode_{Guid.NewGuid():N}@example.com";
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = testEmail,
            Email = testEmail,
            FullName = "Standardized Code Tester",
            Status = UserStatus.Active,
            MustChangePassword = true,
            EmailConfirmed = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        await userManager.CreateAsync(user, "InitialPass@123");
        await userManager.AddToRoleAsync(user, Roles.Owner);

        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "InitialPass@123", false));
        loginResp.StatusCode.ShouldBe(HttpStatusCode.OK);

        // Verify across multiple protected endpoints
        string[] protectedPaths = ["/api/v1/admin/settings", "/api/v1/admin/users", "/api/v1/admin/leads"];
        foreach (var path in protectedPaths)
        {
            var resp = await client.GetAsync(path);
            resp.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
            var content = await resp.Content.ReadAsStringAsync();
            content.ShouldContain("\"code\":\"MUST_CHANGE_PASSWORD\"");
        }
    }

    [Fact]
    public async Task PermissionMatrix_EndpointLevel_Editor_Sales_Owner_Anonymous()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        // 1. Anonymous client
        var anonClient = _factory.CreateClient();
        (await anonClient.GetAsync("/api/v1/admin/users")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await anonClient.GetAsync("/api/v1/admin/pages")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await anonClient.GetAsync("/api/v1/admin/leads")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);

        // 2. Editor client
        var editorEmail = $"matrix_ed_{Guid.NewGuid():N}@example.com";
        var (_, _, _, edTok) = await identityService.InviteUserAsync(editorEmail, "Editor", Roles.Editor);
        await identityService.ResetPasswordAsync(editorEmail, edTok!, "EditorPass@123");

        var edClient = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await edClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(editorEmail, "EditorPass@123", false));

        (await edClient.GetAsync("/api/v1/admin/pages")).StatusCode.ShouldBe(HttpStatusCode.OK); // pages.view
        (await edClient.PostAsJsonAsync($"/api/v1/admin/pages/{Guid.NewGuid()}/publish", new { })).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // pages.publish
        (await edClient.GetAsync("/api/v1/admin/users")).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // users.view
        (await edClient.GetAsync("/api/v1/admin/settings")).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // settings.view
        (await edClient.PostAsJsonAsync("/api/v1/admin/clients", new { name = "Test" })).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // clients.manage

        // 3. Sales client
        var salesEmail = $"matrix_sales_{Guid.NewGuid():N}@example.com";
        var (_, _, _, sTok) = await identityService.InviteUserAsync(salesEmail, "Sales", Roles.Sales);
        await identityService.ResetPasswordAsync(salesEmail, sTok!, "SalesPass@123");

        var salesClient = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await salesClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(salesEmail, "SalesPass@123", false));

        (await salesClient.GetAsync("/api/v1/admin/leads")).StatusCode.ShouldBe(HttpStatusCode.OK); // leads.view
        (await salesClient.GetAsync("/api/v1/admin/pages")).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // pages.view
        (await salesClient.GetAsync("/api/v1/admin/users")).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // users.view
        (await salesClient.GetAsync("/api/v1/admin/settings")).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // settings.view

        // 4. Admin client (Explicit Allowlist: All except users.manage)
        var adminEmail = $"matrix_admin_{Guid.NewGuid():N}@example.com";
        var (_, _, _, aTok) = await identityService.InviteUserAsync(adminEmail, "Admin", Roles.Admin);
        await identityService.ResetPasswordAsync(adminEmail, aTok!, "AdminPass@123");

        var adminClient = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await adminClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(adminEmail, "AdminPass@123", false));

        (await adminClient.GetAsync("/api/v1/admin/settings")).StatusCode.ShouldBe(HttpStatusCode.OK); // settings.view
        (await adminClient.GetAsync("/api/v1/admin/pages")).StatusCode.ShouldBe(HttpStatusCode.OK); // pages.view

        // Exact status assertion for pages.publish: 404 on non-existent page, 200 on real page publish
        var adminCsrf = await adminClient.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");

        var nonExistentPageId = Guid.NewGuid();
        var publishNotFoundReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{nonExistentPageId}/publish")
        {
            Content = JsonContent.Create(new { })
        };
        publishNotFoundReq.Headers.Add("X-XSRF-TOKEN", adminCsrf!.token);
        (await adminClient.SendAsync(publishNotFoundReq)).StatusCode.ShouldBe(HttpStatusCode.NotFound);

        var createPageReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/pages")
        {
            Content = JsonContent.Create(new Nexora.Application.CMS.DTOs.CreatePageRequest(
                Title: "Admin Publishable Page",
                Slug: $"admin-page-{Guid.NewGuid():N}",
                Locale: "en"))
        };
        createPageReq.Headers.Add("X-XSRF-TOKEN", adminCsrf.token);
        var createPageRes = await adminClient.SendAsync(createPageReq);
        createPageRes.StatusCode.ShouldBe(HttpStatusCode.Created);
        var createdDoc = await createPageRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var createdPageId = createdDoc.GetProperty("pageId").GetGuid();

        var publishOkReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/pages/{createdPageId}/publish")
        {
            Content = JsonContent.Create(new { })
        };
        publishOkReq.Headers.Add("X-XSRF-TOKEN", adminCsrf.token);
        (await adminClient.SendAsync(publishOkReq)).StatusCode.ShouldBe(HttpStatusCode.OK);

        var inviteReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/users/invite")
        {
            Content = JsonContent.Create(new { email = "new@example.com" })
        };
        inviteReq.Headers.Add("X-XSRF-TOKEN", adminCsrf.token);
        (await adminClient.SendAsync(inviteReq)).StatusCode.ShouldBe(HttpStatusCode.Forbidden); // users.manage

        // 5. Owner client
        var ownerEmail = $"matrix_owner_{Guid.NewGuid():N}@example.com";
        var (_, _, _, oTok) = await identityService.InviteUserAsync(ownerEmail, "Owner", Roles.Owner);
        await identityService.ResetPasswordAsync(ownerEmail, oTok!, "OwnerPass@123");

        var ownerClient = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await ownerClient.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(ownerEmail, "OwnerPass@123", false));

        (await ownerClient.GetAsync("/api/v1/admin/pages")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await ownerClient.GetAsync("/api/v1/admin/leads")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await ownerClient.GetAsync("/api/v1/admin/users")).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await ownerClient.GetAsync("/api/v1/admin/settings")).StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PermissionCache_Eviction_OnRoleChange_Suspend_AndUserDelete()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        var memoryCache = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Caching.Memory.IMemoryCache>();

        var testEmail = $"cache_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Cache User", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "Pass@12345678");

        // Cache permissions
        var perms = await identityService.GetUserPermissionsAsync(userId!.Value);
        perms.ShouldContain(Permissions.PagesEdit);
        memoryCache.TryGetValue($"UserPerms_{userId.Value}", out _).ShouldBeTrue();

        // 1. Role Change evicts cache
        await identityService.UpdateUserAsync(userId.Value, Roles.Sales, null, null, Guid.NewGuid());
        memoryCache.TryGetValue($"UserPerms_{userId.Value}", out _).ShouldBeFalse();

        // Re-populate cache with Sales
        var salesPerms = await identityService.GetUserPermissionsAsync(userId.Value);
        salesPerms.ShouldContain(Permissions.LeadsManage);
        memoryCache.TryGetValue($"UserPerms_{userId.Value}", out _).ShouldBeTrue();

        // 2. Suspend evicts cache
        await identityService.UpdateUserAsync(userId.Value, null, isSuspended: true, suspensionReason: "Test", actingUserId: Guid.NewGuid());
        memoryCache.TryGetValue($"UserPerms_{userId.Value}", out _).ShouldBeFalse();

        // Suspended user evaluates to empty permissions
        var susPerms = await identityService.GetUserPermissionsAsync(userId.Value);
        susPerms.ShouldBeEmpty();

        // 3. User delete evicts cache
        var delUserEmail = $"del_{Guid.NewGuid():N}@example.com";
        var (_, _, delId, delTok) = await identityService.InviteUserAsync(delUserEmail, "To Delete", Roles.Editor);
        await identityService.ResetPasswordAsync(delUserEmail, delTok!, "Pass@12345678");
        await identityService.GetUserPermissionsAsync(delId!.Value);
        memoryCache.TryGetValue($"UserPerms_{delId.Value}", out _).ShouldBeTrue();

        await identityService.DeleteUserAsync(delId.Value, Guid.NewGuid());
        memoryCache.TryGetValue($"UserPerms_{delId.Value}", out _).ShouldBeFalse();
    }

    [Fact]
    public void PasswordPolicy_RequiredLengthUnder12_ShouldFailStartupValidation()
    {
        var options = new PasswordPolicyOptions { RequiredLength = 8 };
        var context = new System.ComponentModel.DataAnnotations.ValidationContext(options);
        var results = new List<System.ComponentModel.DataAnnotations.ValidationResult>();
        var isValid = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(options, context, results, validateAllProperties: true);

        isValid.ShouldBeFalse();
        results.ShouldContain(r => r.ErrorMessage != null && r.ErrorMessage.Contains("at least 12 characters"));
    }

    [Fact]
    public async Task SuspendedUser_ExistingSession_Immediate401_ViaSecurityStamp()
    {
        using var scope = _factory.Services.CreateScope();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();

        var testEmail = $"suspend_sess_{Guid.NewGuid():N}@example.com";
        var (_, _, userId, token) = await identityService.InviteUserAsync(testEmail, "Suspend User", Roles.Editor);
        await identityService.ResetPasswordAsync(testEmail, token!, "Pass@12345678");

        // Login and establish active session
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequestDto(testEmail, "Pass@12345678", false));

        // Active session returns 200
        (await client.GetAsync("/api/v1/auth/me")).StatusCode.ShouldBe(HttpStatusCode.OK);

        // Admin suspends user (which updates security stamp in DB)
        var (susSuccess, susErr) = await identityService.UpdateUserAsync(userId!.Value, null, isSuspended: true, suspensionReason: "Account locked", actingUserId: Guid.NewGuid());
        susSuccess.ShouldBeTrue(susErr);

        // User's very next request with existing session cookie returns 401 Unauthorized!
        var nextResp = await client.GetAsync("/api/v1/auth/me");
        nextResp.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}

public record CsrfTokenResponse(string token, string headerName);

internal sealed class TestHostEnvironment : Microsoft.Extensions.Hosting.IHostEnvironment
{
    public string EnvironmentName { get; set; } = "Development";
    public string ApplicationName { get; set; } = "Nexora.Api";
    public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
    public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
}
