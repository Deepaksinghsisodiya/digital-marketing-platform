namespace Nexora.Domain.Constants;

public static class Permissions
{
    // Settings
    public const string SettingsView = "settings.view";
    public const string SettingsManage = "settings.manage";

    // Audit
    public const string AuditView = "audit.view";

    // Team & Roles
    public const string UsersView = "users.view";
    public const string UsersManage = "users.manage";
    public const string RolesView = "roles.view";

    // CMS Pages
    public const string PagesView = "pages.view";
    public const string PagesEdit = "pages.edit";
    public const string PagesPublish = "pages.publish";

    // Leads & CRM
    public const string LeadsView = "leads.view";
    public const string LeadsManage = "leads.manage";
    public const string LeadsExport = "leads.export";

    // Clients & Lite CRM
    public const string ClientsView = "clients.view";
    public const string ClientsManage = "clients.manage";
    public const string TasksView = "tasks.view";
    public const string TasksManage = "tasks.manage";

    public static readonly IReadOnlyList<string> All =
    [
        SettingsView,
        SettingsManage,
        AuditView,
        UsersView,
        UsersManage,
        RolesView,
        PagesView,
        PagesEdit,
        PagesPublish,
        LeadsView,
        LeadsManage,
        LeadsExport,
        ClientsView,
        ClientsManage,
        TasksView,
        TasksManage
    ];
}

public static class Roles
{
    public const string Owner = "Owner";
    public const string Admin = "Admin";
    public const string Editor = "Editor";
    public const string Sales = "Sales";

    public static readonly IReadOnlyList<string> All =
    [
        Owner,
        Admin,
        Editor,
        Sales
    ];
}

