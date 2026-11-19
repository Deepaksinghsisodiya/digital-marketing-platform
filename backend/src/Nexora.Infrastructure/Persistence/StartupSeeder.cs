using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Domain.Enums;
using Nexora.Infrastructure.Identity;
using Nexora.Infrastructure.Themes;

namespace Nexora.Infrastructure.Persistence;

public static class StartupSeeder
{
    private static readonly SemaphoreSlim _migrationLock = new(1, 1);

    public static async Task SeedAsync(IServiceProvider serviceProvider, IHostEnvironment environment)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        if (configuration.GetValue<bool>("SkipStartupSeed", false))
        {
            logger.LogInformation("Startup seeder skipped via configuration (SkipStartupSeed=true).");
            return;
        }

        // 0. Database Migration (Development environment or explicitly opted-in via ApplyMigrationsOnStartup)
        if (environment.IsDevelopment() || configuration.GetValue<bool>("ApplyMigrationsOnStartup", false))
        {
            await _migrationLock.WaitAsync();
            try
            {
                await context.Database.MigrateAsync();
            }
            finally
            {
                _migrationLock.Release();
            }
        }

        // 1. Seed Roles & RolePermissions with explicit allowlists (no Permissions.All minus X)
        var roleDefinitions = new Dictionary<string, (string Description, IReadOnlyList<string> Permissions)>
        {
            [Roles.Owner] = ("Full platform owner with unrestricted access across all modules.", Permissions.All),
            [Roles.Admin] = ("Agency administrator managing operations, settings, and campaigns.",
                new[]
                {
                    Permissions.SettingsView,
                    Permissions.SettingsManage,
                    Permissions.AuditView,
                    Permissions.UsersView,
                    Permissions.RolesView,
                    Permissions.PagesView,
                    Permissions.PagesEdit,
                    Permissions.PagesPublish,
                    Permissions.LeadsView,
                    Permissions.LeadsManage,
                    Permissions.LeadsExport,
                    Permissions.ClientsView,
                    Permissions.ClientsManage,
                    Permissions.TasksView,
                    Permissions.TasksManage,
                    Permissions.ThemesView,
                    Permissions.ThemesManage
                }),
            [Roles.Editor] = ("Content editor creating and maintaining marketing and CMS pages.",
                new[] { Permissions.PagesView, Permissions.PagesEdit }),
            [Roles.Sales] = ("Sales representative managing inbound leads, clients, and follow-up tasks.",
                new[]
                {
                    Permissions.LeadsView,
                    Permissions.LeadsManage,
                    Permissions.LeadsExport,
                    Permissions.ClientsView,
                    Permissions.ClientsManage,
                    Permissions.TasksView,
                    Permissions.TasksManage,
                    Permissions.ThemesView,
                    Permissions.ThemesManage
                })
        };

        foreach (var (roleName, (desc, perms)) in roleDefinitions)
        {
            var role = await roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                role = new ApplicationRole
                {
                    Id = Guid.NewGuid(),
                    Name = roleName,
                    NormalizedName = roleName.ToUpperInvariant(),
                    Description = desc,
                    IsSystemRole = true,
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                };
                await roleManager.CreateAsync(role);
            }

            // Sync permissions for role
            var existingPerms = await context.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.PermissionKey)
                .ToListAsync();

            var missing = perms.Except(existingPerms).ToList();
            if (missing.Count > 0)
            {
                var newEntities = missing.Select(p => new RolePermission
                {
                    RoleId = role.Id,
                    PermissionKey = p,
                    GrantedAtUtc = DateTime.UtcNow
                });
                context.RolePermissions.AddRange(newEntities);
                await context.SaveChangesAsync();
            }
        }

        // 2. Seed Singleton SiteSettings (SingletonId = 1)
        var settingsExist = await context.SiteSettings.AnyAsync(s => s.SingletonId == 1);
        if (!settingsExist)
        {
            var defaultRegion = configuration["NEXT_PUBLIC_DEFAULT_REGION"] ?? "IN";
            var defaultSupported = new[] { "IN", "US", "AE", "GB", "SG" };

            var companyName = configuration["Platform:CompanyName"] ?? string.Empty;
            var legalName = configuration["Platform:LegalName"] ?? string.Empty;
            var supportEmail = configuration["Platform:SupportEmail"] ?? string.Empty;
            var supportPhone = configuration["Platform:SupportPhone"] ?? string.Empty;
            var address = configuration["Platform:Address"] ?? string.Empty;
            var timeZoneId = configuration["Platform:TimeZoneId"] ?? "UTC";

            if (environment.IsProduction())
            {
                if (string.IsNullOrWhiteSpace(legalName) || legalName.Contains("Placeholder", StringComparison.OrdinalIgnoreCase) ||
                    string.IsNullOrWhiteSpace(supportEmail) || supportEmail.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("CRITICAL: Production startup requires real Platform configuration (LegalName, SupportEmail, Address) via environment variables or secret manager. Default placeholders are prohibited.");
                }
            }

            var initialSettings = new SiteSettings
            {
                SingletonId = 1,
                CompanyName = companyName,
                LegalName = legalName,
                SupportEmail = supportEmail,
                SupportPhone = supportPhone,
                Address = address,
                DefaultRegion = defaultRegion,
                SupportedRegions = defaultSupported,
                TimeZoneId = timeZoneId,
                ThemeTokensJson = """
                {
                  "primaryColor": "#7657ff",
                  "accentColor": "#3685ff",
                  "navyColor": "#10162f",
                  "fontSans": "Inter",
                  "fontHeading": "Plus Jakarta Sans",
                  "radius": "0.5rem",
                  "buttonStyle": "rounded"
                }
                """
            };

            context.SiteSettings.Add(initialSettings);
            await context.SaveChangesAsync();
            logger.LogInformation("Singleton SiteSettings initialized with configuration defaults.");
        }
        else
        {
            var existingSettings = await context.SiteSettings.FirstOrDefaultAsync(s => s.SingletonId == 1);
            if (existingSettings != null && (string.IsNullOrWhiteSpace(existingSettings.ThemeTokensJson) || existingSettings.ThemeTokensJson == "{}"))
            {
                existingSettings.ThemeTokensJson = """
                {
                  "primaryColor": "#7657ff",
                  "accentColor": "#3685ff",
                  "navyColor": "#10162f",
                  "fontSans": "Inter",
                  "fontHeading": "Plus Jakarta Sans",
                  "radius": "0.5rem",
                  "buttonStyle": "rounded"
                }
                """;
                await context.SaveChangesAsync();
            }
        }

        // 2b. Seed System Theme Presets (idempotent; protected system themes)
        foreach (var preset in ThemePresetSeed.GetPresets())
        {
            if (!await context.Themes.AnyAsync(t => t.Slug == preset.Slug))
            {
                var theme = new Theme
                {
                    Name = preset.Name,
                    Slug = preset.Slug,
                    Description = preset.Description,
                    ConfigJson = preset.ConfigJson,
                    DraftConfigJson = null,
                    IsSystem = true,
                    IsDefault = string.Equals(preset.Slug, "cyber-emerald", StringComparison.OrdinalIgnoreCase),
                    IsDeleted = false,
                    CurrentVersion = 1
                };

                context.Themes.Add(theme);
                context.ThemeVersions.Add(new ThemeVersion
                {
                    ThemeId = theme.Id,
                    VersionNumber = 1,
                    ConfigJson = preset.ConfigJson,
                    ChangeDescription = "Seeded system preset"
                });

                await context.SaveChangesAsync();
            }
        }

        // 2c. Seed Default 'contact' FormDefinition
        var contactFormExists = await context.FormDefinitions.AnyAsync(f => f.FormKey == "contact");
        if (!contactFormExists)
        {
            var contactSchemaJson = """
            [
              { "id": "fullName", "name": "fullName", "label": "Full Name", "type": "text", "required": true, "mapsTo": "FullName", "placeholder": "Jane Doe" },
              { "id": "email", "name": "email", "label": "Business Email", "type": "email", "required": true, "mapsTo": "Email", "placeholder": "jane@company.com" },
              { "id": "phone", "name": "phone", "label": "Phone Number", "type": "tel", "required": false, "mapsTo": "Phone", "placeholder": "+1 (555) 000-0000" },
              { "id": "company", "name": "company", "label": "Company", "type": "text", "required": false, "mapsTo": "Company", "placeholder": "Acme Corp" },
              { "id": "region", "name": "region", "label": "Region", "type": "select", "required": false, "mapsTo": "Region", "defaultValue": "in" },
              { "id": "message", "name": "message", "label": "Message / Project Scope", "type": "textarea", "required": false, "mapsTo": null, "placeholder": "Tell us about your requirements..." }
            ]
            """;

            var contactSettingsJson = """
            {
              "successMessage": "Thank you! Your inquiry has been received and our team will get back to you shortly.",
              "receiverEmails": ["contact-intake@nexora.local"],
              "notifyOnSubmission": true
            }
            """;

            var contactForm = new FormDefinition(
                formKey: "contact",
                name: "Contact Us",
                schemaJson: contactSchemaJson,
                settingsJson: contactSettingsJson,
                title: "Executive Consultation & Discovery",
                description: "Schedule an institutional discovery session with our digital marketing architects.");

            context.FormDefinitions.Add(contactForm);
            await context.SaveChangesAsync();
            logger.LogInformation("Default 'contact' FormDefinition seeded successfully.");
        }

        // 3. Seed Initial Administrator User
        var configEmail = configuration["SEED_ADMIN_EMAIL"];
        var seedEmail = !string.IsNullOrWhiteSpace(configEmail) 
            ? configEmail 
            : Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL");

        var configPassword = configuration["SEED_ADMIN_PASSWORD"];
        var seedPassword = !string.IsNullOrWhiteSpace(configPassword) 
            ? configPassword 
            : Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");

        var ownersCount = await (from u in context.Users
                                 join ur in context.UserRoles on u.Id equals ur.UserId
                                 join r in context.Roles on ur.RoleId equals r.Id
                                 where r.Name == Roles.Owner && u.Status == UserStatus.Active
                                 select u.Id).CountAsync();

        if (ownersCount == 0 && (string.IsNullOrWhiteSpace(seedEmail) || string.IsNullOrWhiteSpace(seedPassword)))
        {
            throw new InvalidOperationException("CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required when no active Owner exists.");
        }
        else if (!string.IsNullOrWhiteSpace(seedEmail) && !string.IsNullOrWhiteSpace(seedPassword))
        {
            var existingUser = await userManager.FindByEmailAsync(seedEmail);
            if (existingUser == null)
            {
                var adminUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = seedEmail,
                    Email = seedEmail,
                    FullName = "Platform Administrator",
                    Status = UserStatus.Active,
                    MustChangePassword = true,
                    EmailConfirmed = true,
                    CreatedAtUtc = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, seedPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, Roles.Owner);
                    logger.LogInformation("Initial administrator user seeded successfully for {Email}.", seedEmail);
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    logger.LogError("Failed to seed administrator user: {Errors}", errors);
                    throw new InvalidOperationException($"CRITICAL: Failed to seed administrator user: {errors}");
                }
            }
            else
            {
                // Ensure existing seed user is Owner and has active status with password synchronized
                if (!await userManager.CheckPasswordAsync(existingUser, seedPassword))
                {
                    var token = await userManager.GeneratePasswordResetTokenAsync(existingUser);
                    await userManager.ResetPasswordAsync(existingUser, token, seedPassword);
                }
                existingUser.Status = UserStatus.Active;
                await userManager.UpdateAsync(existingUser);

                if (!await userManager.IsInRoleAsync(existingUser, Roles.Owner))
                {
                    await userManager.AddToRoleAsync(existingUser, Roles.Owner);
                }
                logger.LogInformation("Verified administrator user {Email} as active Owner.", seedEmail);
            }
        }

        // 4. Seed Default Email Templates (Inbound, Auth, Client Lifecycle, and CRM Tasks)
        var templatesToSeed = new List<EmailTemplate>
        {
            new EmailTemplate(
                key: "lead-auto-reply",
                name: "Lead Inquiry Auto-Reply",
                subjectTemplate: "Thank you for contacting Nexora, {{lead.name}}!",
                bodyHtmlTemplate: "<h2>Inquiry Received</h2><p>Dear {{lead.name}},</p><p>Thank you for contacting Nexora. We have received your business inquiry and our team is evaluating your project details.</p><p>An enterprise growth consultant will be in touch shortly.</p><br/><p>Warm regards,<br/><strong>Nexora Digital Team</strong></p>",
                bodyPlainTextTemplate: "Dear {{lead.name}},\n\nThank you for contacting Nexora. We have received your inquiry and our team will be in touch shortly.\n\nWarm regards,\nNexora Digital Team"),

            new EmailTemplate(
                key: "lead-internal-notification",
                name: "New Lead Internal Alert",
                subjectTemplate: "[New Inbound Lead] {{lead.name}} ({{lead.company}} - {{lead.region}})",
                bodyHtmlTemplate: "<h2>New Inbound Lead Captured</h2><p><strong>Name:</strong> {{lead.name}}</p><p><strong>Email:</strong> {{lead.email}}</p><p><strong>Phone:</strong> {{lead.phone}}</p><p><strong>Company:</strong> {{lead.company}}</p><p><strong>Region:</strong> {{lead.region}}</p>",
                bodyPlainTextTemplate: "New Inbound Lead Captured:\nName: {{lead.name}}\nEmail: {{lead.email}}\nPhone: {{lead.phone}}\nCompany: {{lead.company}}\nRegion: {{lead.region}}"),

            new EmailTemplate(
                key: "user-invitation",
                name: "Staff Invitation & Role Setup",
                subjectTemplate: "Invitation to Nexora Digital Marketing Platform",
                bodyHtmlTemplate: "<h2>Welcome to Nexora</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>You have been invited to join the <strong>{{platform.companyName}}</strong> workspace as a <strong>{{user.role}}</strong>.</p><p><a href=\"{{invite.link}}\" style=\"display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Set Password &amp; Activate Account</a></p><p>Or copy this link to your browser:<br/><a href=\"{{invite.link}}\">{{invite.link}}</a></p><p>This invitation link will expire in {{expires_hours}} hours.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Admin Team</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nYou have been invited to join the {{platform.companyName}} workspace as a {{user.role}}.\n\nSet your password and activate your account using the link below:\n{{invite.link}}\n\nThis invitation link will expire in {{expires_hours}} hours.\n\nWarm regards,\n{{platform.companyName}} Admin Team"),

            new EmailTemplate(
                key: "user-password-reset",
                name: "Staff Password Reset Request",
                subjectTemplate: "Reset Your Nexora Account Password",
                bodyHtmlTemplate: "<h2>Password Reset Request</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>We received a request to reset your password for your <strong>{{platform.companyName}}</strong> account.</p><p><a href=\"{{reset.link}}\" style=\"display:inline-block;padding:12px 24px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Reset Password</a></p><p>Or copy this link to your browser:<br/><a href=\"{{reset.link}}\">{{reset.link}}</a></p><p>If you did not request this reset, you can safely ignore this email.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Security Team</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nWe received a request to reset your password for your {{platform.companyName}} account.\n\nReset your password using the link below:\n{{reset.link}}\n\nIf you did not request this, you can safely ignore this email.\n\nWarm regards,\n{{platform.companyName}} Security Team"),

            new EmailTemplate(
                key: "user-password-changed",
                name: "Security Alert: Password Changed",
                subjectTemplate: "Security Alert: Password Changed for {{user.name}}",
                bodyHtmlTemplate: "<h2>Password Changed Successfully</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>This is a confirmation that the password for your <strong>{{platform.companyName}}</strong> account was changed at {{timestamp}}.</p><p>If you made this change, no further action is required.</p><p><strong>Didn't make this change?</strong> Please contact support immediately at <a href=\"mailto:{{support.email}}\">{{support.email}}</a>.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Security Team</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nThis is a confirmation that the password for your {{platform.companyName}} account was changed at {{timestamp}}.\n\nIf you made this change, no further action is required. If you did not make this change, please contact support immediately at {{support.email}}.\n\nWarm regards,\n{{platform.companyName}} Security Team"),

            new EmailTemplate(
                key: "user-account-locked",
                name: "Security Alert: Account Temporarily Locked",
                subjectTemplate: "Security Notice: Account Temporarily Locked",
                bodyHtmlTemplate: "<h2>Account Temporarily Locked</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>Your <strong>{{platform.companyName}}</strong> account has been temporarily locked due to multiple consecutive failed sign-in attempts.</p><p>Your account will automatically unlock after {{lockout_duration}} minutes. Alternatively, an administrator can unlock your profile.</p><p>If you believe someone is trying to access your account, reach out to <a href=\"mailto:{{support.email}}\">{{support.email}}</a>.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Security Team</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nYour {{platform.companyName}} account has been temporarily locked due to multiple failed sign-in attempts.\n\nYour account will automatically unlock after {{lockout_duration}} minutes.\n\nIf you believe this is unauthorized, contact {{support.email}}.\n\nWarm regards,\n{{platform.companyName}} Security Team"),

            new EmailTemplate(
                key: "user-role-updated",
                name: "Staff Role Privilege Update",
                subjectTemplate: "Role Privileges Updated - {{platform.companyName}}",
                bodyHtmlTemplate: "<h2>Privileges Updated</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>Your account role in <strong>{{platform.companyName}}</strong> has been updated to <strong>{{user.role}}</strong> by an administrator.</p><p>Your updated platform permissions are now active across the admin workspace.</p><p><a href=\"{{action.url}}\" style=\"display:inline-block;padding:12px 24px;background-color:#0284c7;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Open Workspace</a></p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Operations</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nYour account role in {{platform.companyName}} has been updated to {{user.role}}.\n\nYour new permissions are now active: {{action.url}}\n\nWarm regards,\n{{platform.companyName}} Operations"),

            new EmailTemplate(
                key: "client-welcome-onboarding",
                name: "Client Welcome & Onboarding",
                subjectTemplate: "Welcome to {{platform.companyName}} - Let's Accelerate Your Growth, {{client.name}}!",
                bodyHtmlTemplate: "<h2>Welcome to {{platform.companyName}}!</h2><p>Dear <strong>{{client.name}}</strong>,</p><p>We are thrilled to officially welcome <strong>{{client.company}}</strong> to the {{platform.companyName}} family. Our team is dedicated to scaling your digital acquisition and brand impact.</p><p>Your Dedicated Growth Manager is <strong>{{manager.name}}</strong> (<a href=\"mailto:{{manager.email}}\">{{manager.email}}</a>).</p><h3>Next Steps for Your Onboarding:</h3><ul><li>Schedule your Strategy Kickoff session.</li><li>Grant access to your analytics and advertising properties.</li><li>Review initial keyword &amp; performance benchmarks.</li></ul><p>We look forward to achieving exceptional results together.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Client Success Team</strong></p>",
                bodyPlainTextTemplate: "Dear {{client.name}},\n\nWelcome to {{platform.companyName}}! We are thrilled to partner with {{client.company}}.\n\nYour Dedicated Growth Manager: {{manager.name}} ({{manager.email}}).\n\nNext steps: strategy kickoff, asset handover, and benchmark reviews.\n\nWarm regards,\n{{platform.companyName}} Client Success Team"),

            new EmailTemplate(
                key: "client-proposal-sent",
                name: "Client Proposal & Scope Dispatch",
                subjectTemplate: "Commercial Proposal: {{proposal.title}} for {{client.company}}",
                bodyHtmlTemplate: "<h2>Commercial Growth Proposal</h2><p>Dear <strong>{{client.name}}</strong>,</p><p>Our growth strategists have tailored a bespoke digital marketing proposal for <strong>{{client.company}}</strong>: <em>{{proposal.title}}</em>.</p><p><a href=\"{{proposal.url}}\" style=\"display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Review Proposal &amp; Scope</a></p><p>This proposal is valid until <strong>{{expires_at}}</strong>.</p><p>Feel free to reach out directly with any questions or refinements.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Enterprise Partnerships</strong></p>",
                bodyPlainTextTemplate: "Dear {{client.name}},\n\nOur growth strategists have tailored a proposal for {{client.company}}: {{proposal.title}}.\n\nReview proposal: {{proposal.url}}\nValid until: {{expires_at}}\n\nWarm regards,\n{{platform.companyName}} Enterprise Partnerships"),

            new EmailTemplate(
                key: "client-milestone-completed",
                name: "Campaign Milestone Completed",
                subjectTemplate: "Milestone Completed: {{milestone.title}} ({{client.company}})",
                bodyHtmlTemplate: "<h2>Milestone Achieved 🎉</h2><p>Dear <strong>{{client.name}}</strong>,</p><p>We are pleased to report that the milestone <strong>{{milestone.title}}</strong> for project <em>{{project.name}}</em> has been successfully completed!</p><div style=\"background-color:#f8fafc;padding:16px;border-left:4px solid #10b981;margin:16px 0;\"><p><strong>Summary of Deliverables:</strong></p><p>{{summary}}</p></div><p>Our team has commenced execution on the next project phase.</p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Performance Team</strong></p>",
                bodyPlainTextTemplate: "Dear {{client.name}},\n\nMilestone completed: {{milestone.title}} for {{project.name}}.\n\nSummary:\n{{summary}}\n\nWarm regards,\n{{platform.companyName}} Performance Team"),

            new EmailTemplate(
                key: "client-monthly-performance-report",
                name: "Monthly Marketing Performance Report",
                subjectTemplate: "Monthly Performance Report ({{report.month}}) - {{client.company}}",
                bodyHtmlTemplate: "<h2>Monthly Growth Executive Summary</h2><p>Dear <strong>{{client.name}}</strong>,</p><p>Your monthly digital marketing performance report for <strong>{{report.month}}</strong> is ready for review.</p><div style=\"background-color:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;\"><ul><li><strong>Inbound Leads Generated:</strong> {{report.leads_count}}</li><li><strong>Target Conversion Rate:</strong> {{report.conversion_rate}}</li><li><strong>Attributed Pipeline Value:</strong> {{report.pipeline_value}}</li></ul></div><p><a href=\"{{report.download_url}}\" style=\"display:inline-block;padding:12px 24px;background-color:#0284c7;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Download Full Analytics Report (PDF)</a></p><br/><p>Warm regards,<br/><strong>{{platform.companyName}} Analytics Division</strong></p>",
                bodyPlainTextTemplate: "Dear {{client.name}},\n\nYour monthly performance report for {{report.month}} is ready.\n\nLeads: {{report.leads_count}}\nConversion Rate: {{report.conversion_rate}}\nPipeline Value: {{report.pipeline_value}}\n\nDownload: {{report.download_url}}\n\nWarm regards,\n{{platform.companyName}} Analytics Division"),

            new EmailTemplate(
                key: "task-assigned",
                name: "CRM Task Assignment",
                subjectTemplate: "[Task Assigned] {{task.title}} - Due {{task.due_date}}",
                bodyHtmlTemplate: "<h2>New Task Assigned</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>You have been assigned a new task by <strong>{{assigned_by}}</strong> for client <strong>{{client.name}}</strong>.</p><div style=\"background-color:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;\"><p><strong>Task:</strong> {{task.title}}</p><p><strong>Priority:</strong> {{task.priority}}</p><p><strong>Due Date:</strong> {{task.due_date}}</p></div><p><a href=\"{{action.url}}\" style=\"display:inline-block;padding:10px 20px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">View Task in CRM</a></p><br/><p>Warm regards,<br/><strong>Nexora Task Manager</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nYou have been assigned a new task: {{task.title}}\nClient: {{client.name}}\nPriority: {{task.priority}}\nDue Date: {{task.due_date}}\nAssigned By: {{assigned_by}}\n\nView: {{action.url}}"),

            new EmailTemplate(
                key: "task-overdue-alert",
                name: "CRM Task Deadline Overdue",
                subjectTemplate: "⚠️ URGENT: Overdue Task - {{task.title}}",
                bodyHtmlTemplate: "<h2>Overdue Task Alert ⚠️</h2><p>Hello <strong>{{user.name}}</strong>,</p><p>The task <strong>{{task.title}}</strong> for client <strong>{{client.name}}</strong> was due on <strong>{{task.due_date}}</strong> and is currently flagged as overdue.</p><p><a href=\"{{action.url}}\" style=\"display:inline-block;padding:10px 20px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Update Status in CRM</a></p><br/><p>Warm regards,<br/><strong>Nexora Task Automation</strong></p>",
                bodyPlainTextTemplate: "Hello {{user.name}},\n\nTask overdue alert: {{task.title}} for {{client.name}} was due on {{task.due_date}}.\n\nUpdate: {{action.url}}")
        };

        foreach (var tpl in templatesToSeed)
        {
            if (!await context.EmailTemplates.AnyAsync(t => t.Key == tpl.Key))
            {
                context.EmailTemplates.Add(tpl);
            }
        }

        // 5. Seed Initial Blog Posts
        if (!await context.BlogPosts.AnyAsync(p => p.Slug == "scaling-enterprise-b2b-growth-2026"))
        {
            var initialPost = new BlogPost(
                slug: "scaling-enterprise-b2b-growth-2026",
                title: "Scaling Enterprise B2B Growth: Modern Playbooks for Performance Marketing",
                excerpt: "Discover the multi-channel strategies, attribution models, and conversion rate optimizations powering 10x ROI for high-growth tech companies.",
                contentHtml: "<h2>The New Reality of B2B Pipeline Growth</h2><p>In modern performance marketing, vanity metrics like impressions and unfocused clicks no longer justify ad budgets. High-growth enterprises demand full-funnel attribution, strict CAC-to-LTV discipline, and multi-touch tracking across LinkedIn, Google Ads, and account-based retargeting.</p><h3>Key Pillars of Modern Lead Acquisition</h3><ul><li><strong>High-Intent Search Architecture:</strong> Targeting commercial search queries with bespoke landing experiences.</li><li><strong>Hyper-Targeted ABM:</strong> Aligning sales outreach directly with real-time website engagement.</li><li><strong>Rigorous Conversion Rate Optimization:</strong> Reducing friction in contact forms while capturing full consent and compliance signals.</li></ul><p>Partner with Nexora to transform your digital customer acquisition engine.</p>",
                category: "Growth Strategy",
                tags: "B2B,Growth,Performance Marketing,CRO",
                coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
                authorName: "Aarav Sharma, Chief Growth Strategist",
                status: BlogPostStatus.Published,
                metaTitle: "Scaling Enterprise B2B Growth in 2026 | Nexora Growth Insights",
                metaDescription: "Explore proven playbooks for high-ROI B2B digital marketing, lead gen funnels, and enterprise attribution.");

            context.BlogPosts.Add(initialPost);
        }

        // 6. Seed Default Home CMS Page
        if (!await context.Pages.AnyAsync(p => p.Slug == "home"))
        {
            var homePage = new Page
            {
                Slug = "home",
                Title = "Home — Nexora Digital Marketing Platform",
                Locale = "en",
                Status = PageStatus.Published,
                IsEnabled = true,
                MetaTitle = "Nexora — Unified Enterprise Growth Engine",
                MetaDescription = "Powering enterprise pipeline velocity, multi-touch attribution, and multi-region performance marketing.",
                CanonicalUrl = "http://localhost:3000"
            };

            var homeBlocksJson = """
            [
              {
                "id": "blk_hero_1",
                "type": "Hero",
                "schemaVersion": 1,
                "enabled": true,
                "settings": { "theme": "dark", "overlayOpacity": 0.65 },
                "content": {
                  "isSlider": true,
                  "autoplay": true,
                  "interval": 5000,
                  "slides": [
                    {
                      "id": "slide-1",
                      "tag": "Performance Paid Ads & ROI",
                      "headline": "Turn Your Ad Spend Into Predictable Sales & Profit.",
                      "subheadline": "Stop wasting marketing budget on low-quality clicks. We build high-converting ad campaigns across Google, Meta, and LinkedIn that flood your pipeline with qualified, ready-to-buy customers.",
                      "primaryCtaText": "Get Free Ad Spend Audit",
                      "primaryCtaLink": "/contact",
                      "secondaryCtaText": "Explore Paid Ads Strategy",
                      "secondaryCtaLink": "/services",
                      "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85",
                      "imageAlt": "Paid Ads Performance & Sales Dashboard",
                      "imageBadge": "4.5x+ Average Client ROAS",
                      "overlayOpacity": 0.65,
                      "enabled": true
                    },
                    {
                      "id": "slide-2",
                      "tag": "Google Search Dominance (SEO)",
                      "headline": "Rank #1 on Google for Customers Ready to Buy Today.",
                      "subheadline": "Capture high-intent buyers at the exact second they search for your services. We build organic Google rankings and high-converting landing pages that compound sales month after month.",
                      "primaryCtaText": "Get Free SEO Blueprint",
                      "primaryCtaLink": "/contact",
                      "secondaryCtaText": "Explore Search Strategy",
                      "secondaryCtaLink": "/services",
                      "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=85",
                      "imageAlt": "Google Search Rankings and Organic Traffic Growth",
                      "imageBadge": "Page #1 Commercial Rankings",
                      "overlayOpacity": 0.65,
                      "enabled": true
                    },
                    {
                      "id": "slide-3",
                      "tag": "Lead Conversion & Instant Follow-Up",
                      "headline": "Convert 2x More Website Visitors into Paying Clients.",
                      "subheadline": "Double your lead conversion rate without spending more on media. Ultra-fast landing pages, frictionless WhatsApp qualification, and automated email follow-ups within 60 seconds.",
                      "primaryCtaText": "Schedule Strategy Session",
                      "primaryCtaLink": "/book-a-call",
                      "secondaryCtaText": "Explore Conversion Systems",
                      "secondaryCtaLink": "/services",
                      "imageUrl": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=85",
                      "imageAlt": "Lead Conversion and WhatsApp Automation",
                      "imageBadge": "Sub-60s Instant Lead Routing",
                      "overlayOpacity": 0.65,
                      "enabled": true
                    }
                  ]
                }
              },
              {
                "id": "blk_logos_1",
                "type": "LogoStrip",
                "schemaVersion": 1,
                "enabled": false,
                "content": {
                  "title": "Trusted by High-Velocity Growth Teams",
                  "speed": "normal",
                  "brands": []
                }
              },
              {
                "id": "blk_stats_1",
                "type": "Stats",
                "schemaVersion": 1,
                "enabled": false,
                "content": {
                  "metrics": []
                }
              },
              {
                "id": "blk_features_1",
                "type": "FeatureGrid",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "sectionTitle": "Full-Stack Performance Marketing Engines",
                  "sectionSubtitle": "Everything your brand needs to generate qualified customer inquiries, maximize ad spend efficiency, and scale predictable revenue.",
                  "features": [
                    {
                      "title": "High-Intent Commercial SEO",
                      "description": "Rank on page #1 of Google for high-value commercial keywords. Bespoke landing architectures, programmatic schema, and authority content that drives paying customers.",
                      "pillar": "Digital Growth",
                      "link": "/services/seo",
                      "enabled": true
                    },
                    {
                      "title": "Paid Search & Google Ads PMax",
                      "description": "Capture buyers at the exact second they are searching. Continuous negative matching and smart bidding eliminating 30-40% ad waste while maintaining 4.5x+ ROAS.",
                      "pillar": "Digital Growth",
                      "link": "/services/paid-ads",
                      "enabled": true
                    },
                    {
                      "title": "Paid Social (Meta, Instagram & LinkedIn)",
                      "description": "Scroll-stopping video ad creatives, laser-focused audience segmentation, and high-converting retargeting funnels tailored for B2B and DTC buyers.",
                      "pillar": "Digital Growth",
                      "link": "/services/paid-social",
                      "enabled": true
                    },
                    {
                      "title": "Scientific Landing Page CRO",
                      "description": "Double your sales conversion rate without spending more on media. Multivariate split testing, psychological copy hooks, and sub-second mobile page loads.",
                      "pillar": "Digital Growth",
                      "link": "/services/cro",
                      "enabled": true
                    },
                    {
                      "title": "Automated WhatsApp & Email Lead Nurturing",
                      "description": "Instant sub-60-second lead qualification via automated WhatsApp routing and behavioral email drip sequences that book meetings straight into your calendar.",
                      "pillar": "AI & Automation",
                      "link": "/services/marketing-automation",
                      "enabled": true
                    },
                    {
                      "title": "Closed-Loop Revenue Attribution",
                      "description": "Eliminate vanity metrics. Direct server-side tracking that maps ad clicks to actual closed deals in your CRM, giving you true ROI transparency.",
                      "pillar": "AI & Automation",
                      "link": "/services/attribution",
                      "enabled": true
                    }
                  ]
                }
              },
              {
                "id": "blk_process_1",
                "type": "ProcessSteps",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "sectionTitle": "The 4-Phase Growth Framework That Multiplies Your Revenue",
                  "sectionSubtitle": "A systematic, battle-tested execution process designed to turn unpredictable marketing spend into a predictable customer acquisition machine.",
                  "steps": [
                    {
                      "number": "01",
                      "title": "Ad Spend & Funnel Audit",
                      "timeline": "Days 1 — 7",
                      "description": "We analyze your existing ad accounts, competitor campaigns, and website drop-offs to immediately stop wasted marketing spend.",
                      "deliverables": [
                        "Ad budget waste & leakage breakdown",
                        "Competitor ad intelligence report",
                        "High-intent buyer search terms list"
                      ]
                    },
                    {
                      "number": "02",
                      "title": "High-Converting Creatives & Landing Pages",
                      "timeline": "Days 8 — 14",
                      "description": "Our creative team designs scroll-stopping ad creatives and writes persuasive copy that hooks buyers and compels them to take action.",
                      "deliverables": [
                        "High-converting ad video & image variants",
                        "Mobile-optimized landing page deployment",
                        "Instant WhatsApp lead capture funnels"
                      ]
                    },
                    {
                      "number": "03",
                      "title": "Multi-Channel Campaign Launch",
                      "timeline": "Days 15 — 30",
                      "description": "We launch targeted campaigns across Google, Meta, and LinkedIn with continuous budget optimization towards your highest-profit ads.",
                      "deliverables": [
                        "Targeted Google & Meta campaign rollout",
                        "Real-time sales lead & revenue tracking",
                        "Weekly performance sprint reports"
                      ]
                    },
                    {
                      "number": "04",
                      "title": "Scale, Optimize & Compound Profits",
                      "timeline": "Day 31 Onward",
                      "description": "We double down on winning audiences, test fresh creative hooks, and optimize conversion rates so customer acquisition gets cheaper over time.",
                      "deliverables": [
                        "Weekly creative refreshes & split testing",
                        "Automated lead nurturing & review drips",
                        "Monthly strategic ROI review calls"
                      ]
                    }
                  ]
                }
              },
              {
                "id": "blk_casestudies_1",
                "type": "CaseStudies",
                "schemaVersion": 1,
                "enabled": false,
                "content": {
                  "sectionTitle": "Commercial Outcomes & Case Studies",
                  "sectionSubtitle": "Real client results delivered through our marketing and engineering capabilities.",
                  "caseStudies": []
                }
              },
              {
                "id": "blk_testimonials_1",
                "type": "Testimonials",
                "schemaVersion": 1,
                "enabled": false,
                "settings": { "theme": "light" },
                "content": {
                  "sectionTitle": "Client Feedback",
                  "sectionSubtitle": "What our clients say about our work.",
                  "testimonials": []
                }
              },
              {
                "id": "blk_faq_1",
                "type": "FAQ",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "title": "Frequently Asked Questions",
                  "items": [
                    {
                      "question": "How quickly can Nexora deploy our custom marketing infrastructure?",
                      "answer": "Initial campaigns and tracking architecture typically go live within 7 to 14 business days, with real-time attribution and CRM synchronization enabled from day one."
                    },
                    {
                      "question": "Does Nexora support multi-country campaigns for India and global markets?",
                      "answer": "Yes. Nexora natively handles multi-region routing, localized currencies (INR / USD / EUR / GBP), phone validation, tax/GST fields, and regional compliance (DPDP, GDPR, CCPA)."
                    },
                    {
                      "question": "Can our marketing team edit website pages without developer support?",
                      "answer": "Yes, our modern Admin portal provides a visual block builder to update headlines, banners, features, and blog content with live preview and version rollback."
                    },
                    {
                      "question": "How does deterministic server-side attribution work?",
                      "answer": "Unlike fragile browser cookies blocked by Safari and ad-blockers, our server-side engine logs conversion events directly from server to Meta CAPI, Google Ads, and your internal CRM with cryptographic SHA-256 validation."
                    }
                  ]
                }
              },
              {
                "id": "blk_cta_1",
                "type": "CTA",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "headline": "Ready to Accelerate Your Enterprise Pipeline?",
                  "subheadline": "Connect with our growth architects for a comprehensive ad spend audit and pipeline forecast.",
                  "buttonText": "Schedule Free Growth Diagnostic",
                  "buttonLink": "/contact"
                }
              }
            ]
            """;

            var homeVersion = new PageVersion
            {
                PageId = homePage.Id,
                VersionNumber = 1,
                SchemaVersion = 1,
                ContentJson = homeBlocksJson,
                Note = "Initial published home page version",
                PublishedAtUtc = DateTime.UtcNow
            };

            // Step 6a: Add Page and PageVersion without PublishedVersionId first to avoid circular FK dependency
            context.Pages.Add(homePage);
            context.PageVersions.Add(homeVersion);

            try
            {
                await context.SaveChangesAsync();
                // Step 6b: Link PublishedVersionId once both rows exist
                homePage.PublishedVersionId = homeVersion.Id;
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "Concurrent seed attempt detected; changes already committed by another instance.");
            }
        }
        else
        {
            // Upgrade existing home page if blocks are missing
            var existingHome = await context.Pages
                .Include(p => p.PublishedVersion)
                .FirstOrDefaultAsync(p => p.Slug == "home");

            if (existingHome != null && existingHome.PublishedVersion != null)
            {
                var content = existingHome.PublishedVersion.ContentJson ?? string.Empty;
                if (!content.Contains("CaseStudies") || content.Contains("RoiCalculator") || content.Contains("ComparisonTable") || content.Contains("Pricing") || !content.Contains("LogoStrip") || content.Contains("\"slides\": []") || !content.Contains("Turn Your Ad Spend Into Predictable Sales"))
                {
                    var updatedBlocksJson = """
                    [
                      {
                        "id": "blk_hero_1",
                        "type": "Hero",
                        "schemaVersion": 1,
                        "enabled": true,
                        "settings": { "theme": "dark", "overlayOpacity": 0.65 },
                        "content": {
                          "isSlider": true,
                          "autoplay": true,
                          "interval": 5000,
                          "slides": [
                            {
                              "id": "slide-1",
                              "tag": "Performance Paid Ads & ROI",
                              "headline": "Turn Your Ad Spend Into Predictable Sales & Profit.",
                              "subheadline": "Stop wasting marketing budget on low-quality clicks. We build high-converting ad campaigns across Google, Meta, and LinkedIn that flood your pipeline with qualified, ready-to-buy customers.",
                              "primaryCtaText": "Get Free Ad Spend Audit",
                              "primaryCtaLink": "/contact",
                              "secondaryCtaText": "Explore Paid Ads Strategy",
                              "secondaryCtaLink": "/services",
                              "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85",
                              "imageAlt": "Paid Ads Performance & Sales Dashboard",
                              "imageBadge": "4.5x+ Average Client ROAS",
                              "overlayOpacity": 0.65,
                              "enabled": true
                            },
                            {
                              "id": "slide-2",
                              "tag": "Google Search Dominance (SEO)",
                              "headline": "Rank #1 on Google for Customers Ready to Buy Today.",
                              "subheadline": "Capture high-intent buyers at the exact second they search for your services. We build organic Google rankings and high-converting landing pages that compound sales month after month.",
                              "primaryCtaText": "Get Free SEO Blueprint",
                              "primaryCtaLink": "/contact",
                              "secondaryCtaText": "Explore Search Strategy",
                              "secondaryCtaLink": "/services",
                              "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=85",
                              "imageAlt": "Google Search Rankings and Organic Traffic Growth",
                              "imageBadge": "Page #1 Commercial Rankings",
                              "overlayOpacity": 0.65,
                              "enabled": true
                            },
                            {
                              "id": "slide-3",
                              "tag": "Lead Conversion & Instant Follow-Up",
                              "headline": "Convert 2x More Website Visitors into Paying Clients.",
                              "subheadline": "Double your lead conversion rate without spending more on media. Ultra-fast landing pages, frictionless WhatsApp qualification, and automated email follow-ups within 60 seconds.",
                              "primaryCtaText": "Schedule Strategy Session",
                              "primaryCtaLink": "/book-a-call",
                              "secondaryCtaText": "Explore Conversion Systems",
                              "secondaryCtaLink": "/services",
                              "imageUrl": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=85",
                              "imageAlt": "Lead Conversion and WhatsApp Automation",
                              "imageBadge": "Sub-60s Instant Lead Routing",
                              "overlayOpacity": 0.65,
                              "enabled": true
                            }
                          ]
                        }
                      },
                      {
                        "id": "blk_logos_1",
                        "type": "LogoStrip",
                        "schemaVersion": 1,
                        "enabled": false,
                        "content": {
                          "title": "Trusted by High-Velocity Growth Teams",
                          "speed": "normal",
                          "brands": []
                        }
                      },
                      {
                        "id": "blk_stats_1",
                        "type": "Stats",
                        "schemaVersion": 1,
                        "enabled": false,
                        "content": {
                          "metrics": []
                        }
                      },
                      {
                        "id": "blk_features_1",
                        "type": "FeatureGrid",
                        "schemaVersion": 1,
                        "enabled": true,
                        "content": {
                          "sectionTitle": "Full-Stack Performance Marketing Engines",
                          "sectionSubtitle": "Everything your brand needs to generate qualified customer inquiries, maximize ad spend efficiency, and scale predictable revenue.",
                          "features": [
                            {
                              "title": "High-Intent Commercial SEO",
                              "description": "Rank on page #1 of Google for high-value commercial keywords. Bespoke landing architectures, programmatic schema, and authority content that drives paying customers.",
                              "pillar": "Digital Growth",
                              "link": "/services/seo",
                              "enabled": true
                            },
                            {
                              "title": "Paid Search & Google Ads PMax",
                              "description": "Capture buyers at the exact second they are searching. Continuous negative matching and smart bidding eliminating 30-40% ad waste while maintaining 4.5x+ ROAS.",
                              "pillar": "Digital Growth",
                              "link": "/services/paid-ads",
                              "enabled": true
                            },
                            {
                              "title": "Paid Social (Meta, Instagram & LinkedIn)",
                              "description": "Scroll-stopping video ad creatives, laser-focused audience segmentation, and high-converting retargeting funnels tailored for B2B and DTC buyers.",
                              "pillar": "Digital Growth",
                              "link": "/services/paid-social",
                              "enabled": true
                            },
                            {
                              "title": "Scientific Landing Page CRO",
                              "description": "Double your sales conversion rate without spending more on media. Multivariate split testing, psychological copy hooks, and sub-second mobile page loads.",
                              "pillar": "Digital Growth",
                              "link": "/services/cro",
                              "enabled": true
                            },
                            {
                              "title": "Automated WhatsApp & Email Lead Nurturing",
                              "description": "Instant sub-60-second lead qualification via automated WhatsApp routing and behavioral email drip sequences that book meetings straight into your calendar.",
                              "pillar": "AI & Automation",
                              "link": "/services/marketing-automation",
                              "enabled": true
                            },
                            {
                              "title": "Closed-Loop Revenue Attribution",
                              "description": "Eliminate vanity metrics. Direct server-side tracking that maps ad clicks to actual closed deals in your CRM, giving you true ROI transparency.",
                              "pillar": "AI & Automation",
                              "link": "/services/attribution",
                              "enabled": true
                            }
                          ]
                        }
                      },
                      {
                        "id": "blk_process_1",
                        "type": "ProcessSteps",
                        "schemaVersion": 1,
                        "enabled": true,
                        "content": {
                          "sectionTitle": "The 4-Phase Growth Framework That Multiplies Your Revenue",
                          "sectionSubtitle": "A systematic, battle-tested execution process designed to turn unpredictable marketing spend into a predictable customer acquisition machine.",
                          "steps": [
                            {
                              "number": "01",
                              "title": "Ad Spend & Funnel Audit",
                              "timeline": "Days 1 — 7",
                              "description": "We analyze your existing ad accounts, competitor campaigns, and website drop-offs to immediately stop wasted marketing spend.",
                              "deliverables": [
                                "Ad budget waste & leakage breakdown",
                                "Competitor ad intelligence report",
                                "High-intent buyer search terms list"
                              ]
                            },
                            {
                              "number": "02",
                              "title": "High-Converting Creatives & Landing Pages",
                              "timeline": "Days 8 — 14",
                              "description": "Our creative team designs scroll-stopping ad creatives and writes persuasive copy that hooks buyers and compels them to take action.",
                              "deliverables": [
                                "High-converting ad video & image variants",
                                "Mobile-optimized landing page deployment",
                                "Instant WhatsApp lead capture funnels"
                              ]
                            },
                            {
                              "number": "03",
                              "title": "Multi-Channel Campaign Launch",
                              "timeline": "Days 15 — 30",
                              "description": "We launch targeted campaigns across Google, Meta, and LinkedIn with continuous budget optimization towards your highest-profit ads.",
                              "deliverables": [
                                "Targeted Google & Meta campaign rollout",
                                "Real-time sales lead & revenue tracking",
                                "Weekly performance sprint reports"
                              ]
                            },
                            {
                              "number": "04",
                              "title": "Scale, Optimize & Compound Profits",
                              "timeline": "Day 31 Onward",
                              "description": "We double down on winning audiences, test fresh creative hooks, and optimize conversion rates so customer acquisition gets cheaper over time.",
                              "deliverables": [
                                "Weekly creative refreshes & split testing",
                                "Automated lead nurturing & review drips",
                                "Monthly strategic ROI review calls"
                              ]
                            }
                          ]
                        }
                      },
                      {
                        "id": "blk_casestudies_1",
                        "type": "CaseStudies",
                        "schemaVersion": 1,
                        "enabled": false,
                        "content": {
                          "sectionTitle": "Commercial Outcomes & Case Studies",
                          "sectionSubtitle": "Real client results delivered through our marketing and engineering capabilities.",
                          "caseStudies": []
                        }
                      },
                      {
                        "id": "blk_testimonials_1",
                        "type": "Testimonials",
                        "schemaVersion": 1,
                        "enabled": false,
                        "settings": { "theme": "light" },
                        "content": {
                          "sectionTitle": "Client Feedback",
                          "sectionSubtitle": "What our clients say about our work.",
                          "testimonials": []
                        }
                      },
                      {
                        "id": "blk_faq_1",
                        "type": "FAQ",
                        "schemaVersion": 1,
                        "enabled": true,
                        "content": {
                          "title": "Frequently Asked Questions",
                          "items": [
                            {
                              "question": "How quickly can Nexora deploy our custom marketing infrastructure?",
                              "answer": "Initial campaigns and tracking architecture typically go live within 7 to 14 business days, with real-time attribution and CRM synchronization enabled from day one."
                            },
                            {
                              "question": "Does Nexora support multi-country campaigns for India and global markets?",
                              "answer": "Yes. Nexora natively handles multi-region routing, localized currencies (INR / USD / EUR / GBP), phone validation, tax/GST fields, and regional compliance (DPDP, GDPR, CCPA)."
                            },
                            {
                              "question": "Can our marketing team edit website pages without developer support?",
                              "answer": "Yes, our modern Admin portal provides a visual block builder to update headlines, banners, features, and blog content with live preview and version rollback."
                            },
                            {
                              "question": "How does deterministic server-side attribution work?",
                              "answer": "Unlike fragile browser cookies blocked by Safari and ad-blockers, our server-side engine logs conversion events directly from server to Meta CAPI, Google Ads, and your internal CRM with cryptographic SHA-256 validation."
                            }
                          ]
                        }
                      },
                      {
                        "id": "blk_cta_1",
                        "type": "CTA",
                        "schemaVersion": 1,
                        "enabled": true,
                        "content": {
                          "headline": "Ready to Accelerate Your Enterprise Pipeline?",
                          "subheadline": "Connect with our growth architects for a comprehensive ad spend audit and pipeline forecast.",
                          "buttonText": "Schedule Free Growth Diagnostic",
                          "buttonLink": "/contact"
                        }
                      }
                    ]
                    """;

                    existingHome.PublishedVersion.ContentJson = updatedBlocksJson;
                    existingHome.MarkUpdated();
                    try
                    {
                        await context.SaveChangesAsync();
                        logger.LogInformation("Existing home page upgraded with world-class digital marketing blocks.");
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Could not upgrade existing home page version.");
                    }
                }
            }
        }

        // 6b. Seed Full Digital Marketing Suite CMS Pages to guarantee zero 404s
        var samplePages = new[]
        {
            // Core Pages
            ("about", "About Us — Nexora", "Sample content — customize in Admin CMS. Nexora delivers enterprise digital marketing and growth infrastructure.", "About Nexora"),
            ("solutions", "Solutions & Capabilities — Nexora", "Sample content — customize in Admin CMS. Full-funnel performance marketing, search architecture, and pipeline acceleration.", "Growth Solutions"),
            ("pricing", "Transparent Enterprise Pricing — Nexora", "Sample content — customize in Admin CMS. Scalable enterprise growth tiers designed for high-performing marketing teams.", "Pricing Tiers"),
            ("case-studies", "Client Case Studies — Nexora", "Sample content — customize in Admin CMS. Verifiable enterprise revenue growth and multi-touch attribution outcomes.", "Case Studies"),
            ("services", "Full-Spectrum Digital Marketing Services — Nexora", "Sample content — customize in Admin CMS. 12 institutional marketing capabilities designed to capture and convert enterprise demand.", "Enterprise Services"),
            ("industries", "Vertical Industry Solutions — Nexora", "Sample content — customize in Admin CMS. Specialized growth architectures tailored for vertical market dynamics.", "Industry Verticals"),
            ("resources", "Marketing Knowledge Hub & Playbooks — Nexora", "Sample content — customize in Admin CMS. Tactical frameworks, conversion guides, and research briefs.", "Resources & Guides"),
            ("book-a-call", "Schedule Strategic Growth Consultation — Nexora", "Sample content — customize in Admin CMS. Connect directly with our enterprise marketing architects.", "Book a Strategic Discovery Session"),

            // 12 Specialized Digital Marketing Services
            ("services/seo", "Search Engine Optimization (SEO) — Nexora", "Sample content — customize in Admin CMS. Technical audits, programmatic search architecture, and high-intent commercial keyword domination.", "High-Intent Enterprise SEO"),
            ("services/content-marketing", "Content Marketing & Editorial Strategy — Nexora", "Sample content — customize in Admin CMS. Authoritative thought leadership and search-driven content engines.", "B2B Content Engines"),
            ("services/social-media-marketing", "Social Media Marketing (SMM) — Nexora", "Sample content — customize in Admin CMS. Multi-channel organic and executive brand amplification across LinkedIn and Meta.", "Executive Social Amplification"),
            ("services/paid-ads", "Paid Media (Google & Meta PPC) — Nexora", "Sample content — customize in Admin CMS. Algorithmic bid management, account-based retargeting, and negative matching.", "Performance Paid Media"),
            ("services/email-marketing", "Lifecycle Email Marketing — Nexora", "Sample content — customize in Admin CMS. Automated lead nurturing sequences and behavioral drip trigger flows.", "Automated Lead Nurturing"),
            ("services/whatsapp-marketing", "WhatsApp Business Marketing — Nexora", "Sample content — customize in Admin CMS. High-engagement conversational campaigns, transactional routing, and click-to-chat funnels.", "Conversational WhatsApp Funnels"),
            ("services/web-design-development", "Web Design & Conversion Engineering — Nexora", "Sample content — customize in Admin CMS. Blazing fast Next.js architectures optimized for sub-second Core Web Vitals.", "High-Conversion Web Architecture"),
            ("services/cro", "Conversion Rate Optimization (CRO) — Nexora", "Sample content — customize in Admin CMS. Multivariate A/B testing, heatmaps, and funnel drop-off remediation.", "Scientific Conversion Optimization"),
            ("services/analytics-reporting", "Analytics & Attribution Reporting — Nexora", "Sample content — customize in Admin CMS. Deterministic server-side multi-touch attribution dashboards.", "Deterministic Multi-Touch Attribution"),
            ("services/branding-creative", "Branding & Creative Design — Nexora", "Sample content — customize in Admin CMS. Visual identity systems, typography guidelines, and conversion creative.", "Enterprise Brand & Creative"),
            ("services/influencer-marketing", "B2B & Enterprise Influencer Marketing — Nexora", "Sample content — customize in Admin CMS. Vetted industry voices, co-marketed webinars, and affiliate syndication.", "Creator & Influencer Partnerships"),
            ("services/marketing-automation-crm", "Marketing Automation & CRM Architecture — Nexora", "Sample content — customize in Admin CMS. Seamless lead scoring, stage progression, and SLA assignment.", "Marketing Automation & CRM"),

            // 8 Industry Verticals
            ("industries/saas", "SaaS & Cloud Software Growth — Nexora", "Sample content — customize in Admin CMS. CAC-to-LTV expansion and product-led pipeline velocity.", "SaaS Performance Marketing"),
            ("industries/ecommerce", "E-Commerce & DTC Performance — Nexora", "Sample content — customize in Admin CMS. ROAS maximization, feed optimization, and cart recovery.", "E-Commerce Scale Engine"),
            ("industries/real-estate", "Real Estate & Property Development — Nexora", "Sample content — customize in Admin CMS. High-ticket investor acquisition and localized search targeting.", "Real Estate Lead Generation"),
            ("industries/education", "Higher Education & EdTech — Nexora", "Sample content — customize in Admin CMS. Student recruitment cycles, programmatic landing funnels, and intake scaling.", "Education & EdTech Marketing"),
            ("industries/healthcare", "Healthcare & Medical Services — Nexora", "Sample content — customize in Admin CMS. HIPAA/DPDP-compliant patient acquisition and doctor referrals.", "Compliant Healthcare Growth"),
            ("industries/local-business", "Local Business & Multi-Location Services — Nexora", "Sample content — customize in Admin CMS. Hyper-local Google Maps ranking and localized review velocity.", "Multi-Location Local SEO"),
            ("industries/professional-services", "Professional Services & Consulting — Nexora", "Sample content — customize in Admin CMS. RFP lead generation and partner credibility establishment.", "Professional Services Inbound"),
            ("industries/hospitality", "Hospitality & Travel Marketing — Nexora", "Sample content — customize in Admin CMS. Direct booking maximization and seasonality surge management.", "Hospitality Direct Booking"),

            // Legal & Compliance Pages
            ("privacy", "Privacy Policy — Nexora", "Sample policy — legal review required. Our commitments to data protection, transparency, and regional compliance (DPDP, GDPR, CCPA).", "Privacy Policy"),
            ("terms", "Terms of Service — Nexora", "Sample terms — legal review required. Contractual terms of service governing engagement and platform usage.", "Terms of Service"),
            ("cookies", "Cookie Policy & Tracking Preferences — Nexora", "Sample policy — legal review required. Clear disclosure of essential, analytical, and marketing cookies.", "Cookie Policy & Transparency"),
            ("accessibility", "Accessibility Statement (WCAG AA) — Nexora", "Sample statement. Our commitment to digital inclusion and Section 508 / WCAG AA compliance.", "Accessibility Statement"),
            ("trust", "Trust, Security & Compliance — Nexora", "Sample content. Enterprise grade SOC 2 Type II controls, AES-256 data encryption, and audit logging.", "Enterprise Trust & Security")
        };

        foreach (var (slug, title, desc, headline) in samplePages)
        {
            if (!await context.Pages.AnyAsync(p => p.Slug == slug))
            {
                var page = new Page
                {
                    Slug = slug,
                    Title = title,
                    Locale = "en",
                    Status = PageStatus.Published,
                    IsEnabled = true,
                    MetaTitle = title,
                    MetaDescription = desc,
                    CanonicalUrl = $"http://localhost:3000/{slug}"
                };

                var pageBlocksJson = $$"""
                [
                  {
                    "id": "blk_hero_{{slug}}",
                    "type": "Hero",
                    "schemaVersion": 1,
                    "enabled": true,
                    "settings": { "theme": "dark" },
                    "content": {
                      "headline": "{{headline}}",
                      "subheadline": "Sample content — customize in Admin CMS. {{desc}}",
                      "primaryCtaText": "Get In Touch",
                      "primaryCtaLink": "/contact",
                      "secondaryCtaText": "Return Home",
                      "secondaryCtaLink": "/"
                    }
                  }
                ]
                """;

                var pageVersion = new PageVersion
                {
                    PageId = page.Id,
                    VersionNumber = 1,
                    SchemaVersion = 1,
                    ContentJson = pageBlocksJson,
                    Note = "Initial sample content version",
                    PublishedAtUtc = DateTime.UtcNow
                };

                context.Pages.Add(page);
                context.PageVersions.Add(pageVersion);

                try
                {
                    await context.SaveChangesAsync();
                    page.PublishedVersionId = pageVersion.Id;
                    await context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    logger.LogDebug(ex, "Concurrent seed attempt for page {Slug} detected.", slug);
                }
            }
        }

        // 7. Seed Dynamic Pipeline Stages (Lead, Client, Task)
        if (!await context.PipelineStages.AnyAsync())
        {
            var defaultStages = new List<PipelineStage>
            {
                // Lead Stages
                new() { Category = "Lead", StageKey = "new", Value = 0, DisplayName = "New Inquiry", ColorHex = "#3b82f6", BadgeClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", OrderIndex = 0, IsSystem = true },
                new() { Category = "Lead", StageKey = "in_progress", Value = 1, DisplayName = "Under Evaluation", ColorHex = "#f59e0b", BadgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", OrderIndex = 1, IsSystem = true },
                new() { Category = "Lead", StageKey = "contacted", Value = 2, DisplayName = "Contacted", ColorHex = "#8b5cf6", BadgeClass = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20", OrderIndex = 2, IsSystem = true },
                new() { Category = "Lead", StageKey = "qualified", Value = 3, DisplayName = "Qualified (SQL)", ColorHex = "#10b981", BadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", OrderIndex = 3, IsSystem = true },
                new() { Category = "Lead", StageKey = "closed", Value = 4, DisplayName = "Converted / Closed", ColorHex = "#64748b", BadgeClass = "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20", OrderIndex = 4, IsSystem = true },
                new() { Category = "Lead", StageKey = "spam", Value = 5, DisplayName = "Spam Filtered", ColorHex = "#f43f5e", BadgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20", OrderIndex = 5, IsSystem = true },

                // Client Stages
                new() { Category = "Client", StageKey = "active", Value = 1, DisplayName = "Active Account", ColorHex = "#10b981", BadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", OrderIndex = 0, IsSystem = true },
                new() { Category = "Client", StageKey = "prospect", Value = 2, DisplayName = "Prospect Opportunity", ColorHex = "#3b82f6", BadgeClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", OrderIndex = 1, IsSystem = true },
                new() { Category = "Client", StageKey = "inactive", Value = 3, DisplayName = "Inactive", ColorHex = "#64748b", BadgeClass = "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20", OrderIndex = 2, IsSystem = true },
                new() { Category = "Client", StageKey = "churned", Value = 4, DisplayName = "Churned", ColorHex = "#f43f5e", BadgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20", OrderIndex = 3, IsSystem = true },

                // Task Statuses
                new() { Category = "Task", StageKey = "pending", Value = 1, DisplayName = "Pending", ColorHex = "#f59e0b", BadgeClass = "bg-amber-500/10 text-amber-700 border-amber-500/20", OrderIndex = 0, IsSystem = true },
                new() { Category = "Task", StageKey = "in_progress", Value = 2, DisplayName = "In Progress", ColorHex = "#3b82f6", BadgeClass = "bg-blue-500/10 text-blue-700 border-blue-500/20", OrderIndex = 1, IsSystem = true },
                new() { Category = "Task", StageKey = "completed", Value = 3, DisplayName = "Completed", ColorHex = "#10b981", BadgeClass = "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", OrderIndex = 2, IsSystem = true },
                new() { Category = "Task", StageKey = "cancelled", Value = 4, DisplayName = "Cancelled", ColorHex = "#64748b", BadgeClass = "bg-slate-500/10 text-slate-700 border-slate-500/20", OrderIndex = 3, IsSystem = true }
            };

            context.PipelineStages.AddRange(defaultStages);
            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default dynamic pipeline stages.");
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "PipelineStages already seeded by another instance.");
            }
        }

        // 8. Seed Dynamic Country Regions & Currencies
        if (!await context.CountryRegions.AnyAsync())
        {
            var defaultRegions = new List<CountryRegion>
            {
                new() { Code = "IN", Name = "India", CurrencyCode = "INR", CurrencySymbol = "₹", FlagEmoji = "🇮🇳", PhonePrefix = "+91", TaxLabel = "GST", IsDefault = true, IsEnabled = true, OrderIndex = 0 },
                new() { Code = "US", Name = "United States", CurrencyCode = "USD", CurrencySymbol = "$", FlagEmoji = "🇺🇸", PhonePrefix = "+1", TaxLabel = "Sales Tax", IsDefault = false, IsEnabled = true, OrderIndex = 1 },
                new() { Code = "AE", Name = "United Arab Emirates", CurrencyCode = "AED", CurrencySymbol = "AED", FlagEmoji = "🇦🇪", PhonePrefix = "+971", TaxLabel = "VAT", IsDefault = false, IsEnabled = true, OrderIndex = 2 },
                new() { Code = "GB", Name = "United Kingdom", CurrencyCode = "GBP", CurrencySymbol = "£", FlagEmoji = "🇬🇧", PhonePrefix = "+44", TaxLabel = "VAT", IsDefault = false, IsEnabled = true, OrderIndex = 3 },
                new() { Code = "SG", Name = "Singapore", CurrencyCode = "SGD", CurrencySymbol = "S$", FlagEmoji = "🇸🇬", PhonePrefix = "+65", TaxLabel = "GST", IsDefault = false, IsEnabled = true, OrderIndex = 4 }
            };

            context.CountryRegions.AddRange(defaultRegions);
            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default country regions and currencies.");
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "CountryRegions already seeded by another instance.");
            }
        }

        // 9. Seed Default Navigation Menus (Header & Footer)
        var existingHeader = await context.NavigationMenus
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.Key == "header");

        if (existingHeader == null)
        {
            var headerMenu = new NavigationMenu
            {
                Key = "header",
                Title = "Main Navigation",
                RegionCode = null,
                Items = new List<NavigationMenuItem>
                {
                    new() { Label = "Services", Url = "/services", DisplayOrder = 0 },
                    new() { Label = "Industries", Url = "/industries", DisplayOrder = 1 },
                    new() { Label = "Solutions", Url = "/solutions", DisplayOrder = 2 },
                    new() { Label = "Our Work", Url = "/case-studies", DisplayOrder = 3 },
                    new() { Label = "Insights", Url = "/blog", DisplayOrder = 4 },
                    new() { Label = "About", Url = "/about", DisplayOrder = 5 },
                    new() { Label = "Contact", Url = "/contact", DisplayOrder = 6 }
                }
            };
            context.NavigationMenus.Add(headerMenu);
            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default header navigation menu.");
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "Header menu already seeded.");
            }
        }
        else if (!existingHeader.Items.Any(i => i.Label == "Services"))
        {
            existingHeader.Items.Clear();
            var newHeaderItems = new[]
            {
                new NavigationMenuItem { Label = "Services", Url = "/services", DisplayOrder = 0 },
                new NavigationMenuItem { Label = "Industries", Url = "/industries", DisplayOrder = 1 },
                new NavigationMenuItem { Label = "Solutions", Url = "/solutions", DisplayOrder = 2 },
                new NavigationMenuItem { Label = "Our Work", Url = "/case-studies", DisplayOrder = 3 },
                new NavigationMenuItem { Label = "Insights", Url = "/blog", DisplayOrder = 4 },
                new NavigationMenuItem { Label = "About", Url = "/about", DisplayOrder = 5 },
                new NavigationMenuItem { Label = "Contact", Url = "/contact", DisplayOrder = 6 }
            };
            foreach (var item in newHeaderItems)
            {
                existingHeader.Items.Add(item);
            }
            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Updated default header navigation menu with full services and industries routes.");
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Failed to update header menu.");
            }
        }

        var existingFooter = await context.NavigationMenus
            .FirstOrDefaultAsync(m => m.Key == "footer");

        if (existingFooter == null)
        {
            var footerMenu = new NavigationMenu
            {
                Key = "footer",
                Title = "Footer Navigation",
                RegionCode = null,
                Items = new List<NavigationMenuItem>
                {
                    new() { Label = "Privacy Policy", Url = "/privacy", DisplayOrder = 0 },
                    new() { Label = "Terms of Service", Url = "/terms", DisplayOrder = 1 },
                    new() { Label = "Cookie Preferences", Url = "/cookies", DisplayOrder = 2 },
                    new() { Label = "Accessibility (WCAG AA)", Url = "/accessibility", DisplayOrder = 3 },
                    new() { Label = "Security & Trust", Url = "/trust", DisplayOrder = 4 },
                    new() { Label = "Contact Support", Url = "/contact", DisplayOrder = 5 }
                }
            };
            context.NavigationMenus.Add(footerMenu);
            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default footer navigation menu.");
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "Footer menu already seeded.");
            }
        }

        // 10. Seed System Theme Presets (Idempotent)
        if (!await context.Themes.AnyAsync())
        {
            var systemPresets = new List<(string Name, string Slug, string Desc, string Primary, string Accent, string Navy)>
            {
                ("Cyber Emerald & Deep Onyx", "cyber-emerald", "High-frequency engineering, Supabase & Cursor tech style", "#10b981", "#06b6d4", "#080c14"),
                ("Silicon Valley Electric", "silicon-valley", "Modern high-performance, Linear & Stripe corporate style", "#4f46e5", "#2563eb", "#060b18"),
                ("Midnight Violet & Sunset Coral", "midnight-violet", "Creative AI powerhouse, OpenAI & Raycast modern aurora", "#8b5cf6", "#f97316", "#0b0816"),
                ("Monochrome Stealth & Laser Cobalt", "monochrome-stealth", "Sub-second minimal speed, Apple Pro & Vercel precision", "#0055ff", "#38bdf8", "#000000"),
                ("Sapphire Ocean & Cyber Cyan", "sapphire-ocean", "Global cloud infrastructure, Cloudflare & Docker enterprise", "#1d4ed8", "#00d8ff", "#040d21"),
                ("Champagne Gold & Executive Obsidian", "champagne-gold", "High-ticket bespoke advisory, Palantir & Luxury Private Equity", "#f59e0b", "#d97706", "#0b0c10")
            };

            foreach (var preset in systemPresets)
            {
                var isDefault = preset.Slug == "cyber-emerald";
                var themeJson = $$"""
                {
                  "schemaVersion": 1,
                  "id": "{{preset.Slug}}",
                  "slug": "{{preset.Slug}}",
                  "name": "{{preset.Name}}",
                  "tagline": "{{preset.Desc}}",
                  "isSystem": true,
                  "colors": {
                    "light": {
                      "primary": "{{preset.Primary}}",
                      "primaryForeground": "#ffffff",
                      "primaryHover": "{{preset.Primary}}",
                      "primaryActive": "{{preset.Primary}}",
                      "secondary": "#0f172a",
                      "secondaryForeground": "#ffffff",
                      "accent": "{{preset.Accent}}",
                      "accentForeground": "#ffffff",
                      "background": "#ffffff",
                      "foreground": "#0f172a",
                      "surface": "#f8fafc",
                      "surfaceElevated": "#ffffff",
                      "card": "#ffffff",
                      "cardForeground": "#0f172a",
                      "navbar": "rgba(255, 255, 255, 0.85)",
                      "footer": "{{preset.Navy}}",
                      "sidebar": "#ffffff",
                      "modal": "#ffffff",
                      "overlay": "rgba(15, 23, 42, 0.5)",
                      "textPrimary": "#0f172a",
                      "textSecondary": "#475569",
                      "textMuted": "#64748b",
                      "textInverted": "#ffffff",
                      "link": "{{preset.Primary}}",
                      "linkHover": "{{preset.Primary}}",
                      "border": "#e2e8f0",
                      "borderStrong": "#cbd5e1",
                      "divider": "#f1f5f9",
                      "input": "#ffffff",
                      "ring": "{{preset.Primary}}",
                      "selection": "{{preset.Primary}}",
                      "disabled": "#94a3b8",
                      "placeholder": "#94a3b8",
                      "success": "#10b981",
                      "warning": "#f59e0b",
                      "danger": "#ef4444",
                      "info": "{{preset.Accent}}",
                      "navy": "{{preset.Navy}}",
                      "ink": "#0d1422"
                    },
                    "dark": {
                      "primary": "{{preset.Primary}}",
                      "primaryForeground": "#ffffff",
                      "primaryHover": "{{preset.Primary}}",
                      "primaryActive": "{{preset.Primary}}",
                      "secondary": "#1e293b",
                      "secondaryForeground": "#ffffff",
                      "accent": "{{preset.Accent}}",
                      "accentForeground": "#ffffff",
                      "background": "{{preset.Navy}}",
                      "foreground": "#f8fafc",
                      "surface": "#0d1422",
                      "surfaceElevated": "#131b2e",
                      "card": "#0d1422",
                      "cardForeground": "#f8fafc",
                      "navbar": "rgba(8, 12, 20, 0.85)",
                      "footer": "#04060a",
                      "sidebar": "#0d1422",
                      "modal": "#0d1422",
                      "overlay": "rgba(0, 0, 0, 0.75)",
                      "textPrimary": "#f8fafc",
                      "textSecondary": "#94a3b8",
                      "textMuted": "#64748b",
                      "textInverted": "#0f172a",
                      "link": "{{preset.Primary}}",
                      "linkHover": "{{preset.Primary}}",
                      "border": "rgba(255, 255, 255, 0.08)",
                      "borderStrong": "rgba(255, 255, 255, 0.16)",
                      "divider": "rgba(255, 255, 255, 0.05)",
                      "input": "#131b2e",
                      "ring": "{{preset.Primary}}",
                      "selection": "{{preset.Primary}}",
                      "disabled": "#475569",
                      "placeholder": "#64748b",
                      "success": "#10b981",
                      "warning": "#f59e0b",
                      "danger": "#ef4444",
                      "info": "{{preset.Accent}}",
                      "navy": "{{preset.Navy}}",
                      "ink": "#0d1422"
                    }
                  },
                  "typography": {
                    "fontSans": "Inter, ui-sans-serif, system-ui, sans-serif",
                    "fontHeading": "Plus Jakarta Sans, Inter, sans-serif",
                    "fontButton": "Inter, sans-serif",
                    "fontNav": "Inter, sans-serif",
                    "fontMono": "ui-monospace, monospace",
                    "baseFontSize": "16px",
                    "headingWeight": "700",
                    "letterSpacingHeading": "-0.025em"
                  },
                  "shape": {
                    "radiusSm": "0.375rem",
                    "radiusMd": "0.5rem",
                    "radiusLg": "0.75rem",
                    "radiusXl": "1rem",
                    "radiusFull": "9999px",
                    "buttonRadius": "0.5rem",
                    "cardRadius": "0.75rem",
                    "inputRadius": "0.5rem"
                  },
                  "shadows": {
                    "shadowSm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    "shadowMd": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    "shadowLg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "glow": "rgba(16, 185, 129, 0.28)",
                    "glassBlur": "16px"
                  },
                  "gradients": {
                    "gradientBrand": "linear-gradient(135deg, {{preset.Primary}} 0%, {{preset.Accent}} 100%)",
                    "gradientHero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16, 185, 129, 0.18), transparent 70%)",
                    "gradientAccent": "linear-gradient(135deg, {{preset.Accent}} 0%, {{preset.Primary}} 100%)"
                  },
                  "layout": {
                    "containerWidth": "1280px",
                    "sectionSpacing": "5rem",
                    "navbarHeight": "4.5rem",
                    "sidebarWidth": "16rem"
                  },
                  "motion": {
                    "enabled": true,
                    "speed": "normal",
                    "durationFast": "0.15s",
                    "durationNormal": "0.3s",
                    "durationSlow": "0.6s"
                  },
                  "components": {
                    "buttonStyle": "rounded",
                    "cardStyle": "glass",
                    "tableDensity": "normal"
                  },
                  "admin": {
                    "sidebarBg": "#0d1422",
                    "sidebarBorder": "rgba(255, 255, 255, 0.08)",
                    "sidebarActiveItem": "rgba(16, 185, 129, 0.15)",
                    "navbarBg": "rgba(13, 20, 34, 0.8)",
                    "navbarBorder": "rgba(255, 255, 255, 0.08)",
                    "widgetCardBg": "#0d1422"
                  }
                }
                """;

                var newTheme = new Theme
                {
                    Name = preset.Name,
                    Slug = preset.Slug,
                    Description = preset.Desc,
                    ConfigJson = themeJson,
                    DraftConfigJson = null,
                    IsSystem = true,
                    IsDefault = isDefault,
                    IsDeleted = false,
                    CurrentVersion = 1
                };

                newTheme.Versions.Add(new ThemeVersion
                {
                    VersionNumber = 1,
                    ConfigJson = themeJson,
                    ChangeDescription = "Initial system preset release"
                });

                context.Themes.Add(newTheme);
            }

            try
            {
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded 6 system theme presets successfully.");
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "Themes already seeded by another instance.");
            }
        }
        else
        {
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger.LogDebug(ex, "Concurrent seed attempt detected; changes already committed by another instance.");
            }
        }
    }
}
