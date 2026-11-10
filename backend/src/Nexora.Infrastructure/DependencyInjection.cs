using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Nexora.Application.Common.Interfaces;
using Nexora.Infrastructure.Email;
using Nexora.Infrastructure.Identity;
using Nexora.Infrastructure.Persistence;
using Nexora.Infrastructure.Services;

namespace Nexora.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AppDbContext>(options =>
        {
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseSqlServer(connectionString);
            }
        });

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddMemoryCache();
        services.AddHttpContextAccessor();

        // ASP.NET Core Identity Core registration with SQL Server EF Core stores
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            // Password policy (strict defaults, configurable via config)
            options.Password.RequiredLength = configuration.GetValue("PasswordPolicy:RequiredLength", 8);
            options.Password.RequireDigit = configuration.GetValue("PasswordPolicy:RequireDigit", true);
            options.Password.RequireLowercase = configuration.GetValue("PasswordPolicy:RequireLowercase", true);
            options.Password.RequireUppercase = configuration.GetValue("PasswordPolicy:RequireUppercase", true);
            options.Password.RequireNonAlphanumeric = configuration.GetValue("PasswordPolicy:RequireNonAlphanumeric", true);

            // Lockout policy
            var lockoutMinutes = configuration.GetValue("LockoutPolicy:DefaultLockoutMinutes", 15);
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(lockoutMinutes);
            options.Lockout.MaxFailedAccessAttempts = configuration.GetValue("LockoutPolicy:MaxFailedAttempts", 5);
            options.Lockout.AllowedForNewUsers = true;

            // User policy
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<ApplicationRole>()
        .AddEntityFrameworkStores<AppDbContext>()
        .AddSignInManager<SignInManager<ApplicationUser>>()
        .AddDefaultTokenProviders();

        // Immediate session invalidation on password change or suspension
        services.Configure<SecurityStampValidatorOptions>(options =>
        {
            options.ValidationInterval = TimeSpan.Zero;
        });

        // Email adapter configuration
        var smtpSection = configuration.GetSection(SmtpOptions.SectionName);
        var smtpOptions = new SmtpOptions
        {
            Host = smtpSection["Host"] ?? string.Empty,
            Port = int.TryParse(smtpSection["Port"], out var port) ? port : 1025,
            UseSsl = bool.TryParse(smtpSection["UseSsl"], out var ssl) && ssl,
            UserName = smtpSection["UserName"],
            Password = smtpSection["Password"],
            FromEmail = smtpSection["FromEmail"] ?? "noreply@nexora.local",
            FromName = smtpSection["FromName"] ?? "Nexora Platform"
        };
        services.AddSingleton(Options.Create(smtpOptions));

        services.AddTransient<IEmailSender, MailKitEmailSender>();

        // Domain & Application service implementations
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ISiteSettingsService, SiteSettingsService>();
        services.AddScoped<IIdentityService, IdentityService>();

        // Health check registration
        services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>(
                name: "sqlserver",
                tags: ["ready"]);

        return services;
    }
}
