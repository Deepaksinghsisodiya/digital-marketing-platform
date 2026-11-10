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

namespace Nexora.Infrastructure.Persistence;

public static class StartupSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, IHostEnvironment environment)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        // 1. Seed Roles & RolePermissions
        var roleDefinitions = new Dictionary<string, (string Description, IReadOnlyList<string> Permissions)>
        {
            [Roles.Owner] = ("Full platform owner with unrestricted access across all modules.", Permissions.All),
            [Roles.Admin] = ("Agency administrator managing operations, settings, and campaigns.",
                Permissions.All.Where(p => p != Permissions.UsersManage).ToList()),
            [Roles.Editor] = ("Content editor creating and maintaining marketing and CMS pages.",
                [Permissions.PagesView, Permissions.PagesEdit]),
            [Roles.Sales] = ("Sales representative managing inbound leads and lead pipelines.",
                [Permissions.LeadsView, Permissions.LeadsManage, Permissions.LeadsExport])
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

            var initialSettings = new SiteSettings
            {
                SingletonId = 1,
                CompanyName = configuration["Platform:CompanyName"] ?? "Nexora Digital",
                LegalName = configuration["Platform:LegalName"] ?? "Nexora Growth Technologies Ltd.",
                SupportEmail = configuration["Platform:SupportEmail"] ?? "support@nexora.local",
                SupportPhone = configuration["Platform:SupportPhone"] ?? "+91 98765 43210",
                Address = configuration["Platform:Address"] ?? "Cyber City, Gurugram, India",
                DefaultRegion = defaultRegion,
                SupportedRegions = defaultSupported,
                TimeZoneId = configuration["Platform:TimeZoneId"] ?? "Asia/Kolkata"
            };

            context.SiteSettings.Add(initialSettings);
            await context.SaveChangesAsync();
            logger.LogInformation("Singleton SiteSettings initialized with configuration defaults.");
        }

        // 3. Seed Initial Administrator User
        var ownersCount = await (from u in context.Users
                                 join ur in context.UserRoles on u.Id equals ur.UserId
                                 join r in context.Roles on ur.RoleId equals r.Id
                                 where r.Name == Roles.Owner && u.Status == UserStatus.Active
                                 select u.Id).CountAsync();

        if (ownersCount == 0)
        {
            var seedEmail = configuration["SEED_ADMIN_EMAIL"] ?? Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL");
            var seedPassword = configuration["SEED_ADMIN_PASSWORD"] ?? Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");

            if (string.IsNullOrWhiteSpace(seedEmail) || string.IsNullOrWhiteSpace(seedPassword))
            {
                if (environment.IsProduction())
                {
                    throw new InvalidOperationException("CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be provided in production when no Owner exists.");
                }
                logger.LogWarning("SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set. Admin seeding skipped for development.");
            }
            else
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
                        logger.LogInformation("Initial administrator user seeded successfully for {Email} (MustChangePassword=true).", seedEmail);
                    }
                    else
                    {
                        logger.LogError("Failed to seed administrator user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    // Ensure existing seed user is Owner
                    if (!await userManager.IsInRoleAsync(existingUser, Roles.Owner))
                    {
                        await userManager.AddToRoleAsync(existingUser, Roles.Owner);
                    }
                }
            }
        }
    }
}
