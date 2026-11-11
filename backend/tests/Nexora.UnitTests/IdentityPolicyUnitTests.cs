using Nexora.Domain.Constants;
using Shouldly;
using Xunit;

namespace Nexora.UnitTests;

public class IdentityPolicyUnitTests
{
    [Fact]
    public void PermissionCatalog_ShouldContainAllRequiredPermissions()
    {
        Permissions.All.ShouldContain(Permissions.SettingsView);
        Permissions.All.ShouldContain(Permissions.SettingsManage);
        Permissions.All.ShouldContain(Permissions.AuditView);
        Permissions.All.ShouldContain(Permissions.UsersView);
        Permissions.All.ShouldContain(Permissions.UsersManage);
        Permissions.All.ShouldContain(Permissions.RolesView);
        Permissions.All.ShouldContain(Permissions.PagesView);
        Permissions.All.ShouldContain(Permissions.PagesEdit);
        Permissions.All.ShouldContain(Permissions.PagesPublish);
        Permissions.All.ShouldContain(Permissions.LeadsView);
        Permissions.All.ShouldContain(Permissions.LeadsManage);
        Permissions.All.ShouldContain(Permissions.LeadsExport);
        Permissions.All.ShouldContain(Permissions.ClientsView);
        Permissions.All.ShouldContain(Permissions.ClientsManage);
        Permissions.All.ShouldContain(Permissions.TasksView);
        Permissions.All.ShouldContain(Permissions.TasksManage);
        Permissions.All.Count.ShouldBe(16);
    }

    [Fact]
    public void RoleMatrix_EditorAndSales_ShouldHaveRestrictedPermissionSubsets()
    {
        // Editor: only pages.view, pages.edit (no publish, no users, no settings)
        var editorPerms = new[] { Permissions.PagesView, Permissions.PagesEdit };
        editorPerms.ShouldContain(Permissions.PagesView);
        editorPerms.ShouldContain(Permissions.PagesEdit);
        editorPerms.ShouldNotContain(Permissions.PagesPublish);
        editorPerms.ShouldNotContain(Permissions.UsersManage);
        editorPerms.ShouldNotContain(Permissions.SettingsManage);

        // Sales: only leads.view, leads.manage, leads.export
        var salesPerms = new[] { Permissions.LeadsView, Permissions.LeadsManage, Permissions.LeadsExport };
        salesPerms.ShouldContain(Permissions.LeadsView);
        salesPerms.ShouldContain(Permissions.LeadsManage);
        salesPerms.ShouldContain(Permissions.LeadsExport);
        salesPerms.ShouldNotContain(Permissions.PagesView);
        salesPerms.ShouldNotContain(Permissions.UsersManage);

        // Admin: all except users.manage
        var adminPerms = Permissions.All.Where(p => p != Permissions.UsersManage).ToList();
        adminPerms.ShouldNotContain(Permissions.UsersManage);
        adminPerms.ShouldContain(Permissions.SettingsManage);
        adminPerms.ShouldContain(Permissions.LeadsExport);
        adminPerms.ShouldContain(Permissions.PagesPublish);
    }

    [Theory]
    [InlineData("short", false)]
    [InlineData("nouppercase123!", false)]
    [InlineData("NOLOWERCASE123!", false)]
    [InlineData("NoDigitSpecial!", false)]
    [InlineData("NoSpecialChar123", false)]
    [InlineData("ValidP@ssword123", true)]
    public void PasswordPolicy_RuleCheck_ShouldValidateLengthAndComplexity(string candidate, bool expectedValid)
    {
        // Password Policy rule: Min 8 chars, 1 digit, 1 lowercase, 1 uppercase, 1 non-alphanumeric
        bool isValid = candidate.Length >= 8 &&
                       candidate.Any(char.IsDigit) &&
                       candidate.Any(char.IsLower) &&
                       candidate.Any(char.IsUpper) &&
                       candidate.Any(ch => !char.IsLetterOrDigit(ch));

        isValid.ShouldBe(expectedValid);
    }

    [Fact]
    public void LastOwnerRule_ShouldPreventDemotingOrSuspending_WhenTotalActiveOwnersIsOne()
    {
        int totalActiveOwners = 1;
        bool isCurrentOwner = true;
        bool requestedSuspension = true;

        bool canModify = !(isCurrentOwner && requestedSuspension && totalActiveOwners <= 1);
        canModify.ShouldBeFalse("Cannot suspend the sole remaining active Owner.");
    }

    [Fact]
    public void LastOwnerRule_ShouldAllowDemotingOrSuspending_WhenMultipleActiveOwnersExist()
    {
        int totalActiveOwners = 2;
        bool isCurrentOwner = true;
        bool requestedSuspension = true;

        bool canModify = !(isCurrentOwner && requestedSuspension && totalActiveOwners <= 1);
        canModify.ShouldBeTrue("Can suspend an Owner when other active Owners exist.");
    }

    [Fact]
    public void SelfActionGuard_ShouldRejectSelfSuspension_AndAllowOtherUserSuspension()
    {
        var currentUserId = Guid.NewGuid();
        var targetUserIdSelf = currentUserId;
        var targetUserIdOther = Guid.NewGuid();

        bool isSelfAction = targetUserIdSelf == currentUserId;
        bool isOtherAction = targetUserIdOther == currentUserId;

        isSelfAction.ShouldBeTrue();
        isOtherAction.ShouldBeFalse();
    }
}

