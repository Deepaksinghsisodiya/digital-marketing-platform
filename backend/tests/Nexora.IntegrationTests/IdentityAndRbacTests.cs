using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Identity.Models;
using Nexora.Application.Settings.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Domain.Enums;
using Nexora.Infrastructure.Persistence;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

public class IdentityAndRbacTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public IdentityAndRbacTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
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

        // Find the active Owner seeded at startup
        var ownerUser = await (from u in context.Users
                               join ur in context.UserRoles on u.Id equals ur.UserId
                               join r in context.Roles on ur.RoleId equals r.Id
                               where r.Name == Roles.Owner && u.Status == UserStatus.Active
                               select u).FirstOrDefaultAsync();

        if (ownerUser != null)
        {
            // Another dummy acting admin tries to suspend the only owner
            var dummyAdminId = Guid.NewGuid();
            var (success, error) = await identityService.UpdateUserAsync(
                ownerUser.Id,
                newRole: null,
                isSuspended: true,
                suspensionReason: "Malicious suspension test",
                actingUserId: dummyAdminId);

            success.ShouldBeFalse();
            error.ShouldContain("Cannot demote or suspend the last active Owner");
        }
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
}
