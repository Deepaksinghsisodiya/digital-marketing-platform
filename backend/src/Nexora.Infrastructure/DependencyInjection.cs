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
        services.AddHttpClient();

        // Password policy options with ValidateOnStart
        services.AddOptions<PasswordPolicyOptions>()
            .BindConfiguration(PasswordPolicyOptions.SectionName)
            .ValidateDataAnnotations()
            .Validate(p => p.RequiredLength >= 12, "PasswordPolicy:RequiredLength must be at least 12.")
            .ValidateOnStart();

        var passwordPolicy = configuration.GetSection(PasswordPolicyOptions.SectionName).Get<PasswordPolicyOptions>()
            ?? new PasswordPolicyOptions();

        if (passwordPolicy.RequiredLength < 12)
        {
            throw new InvalidOperationException("PasswordPolicy:RequiredLength must be at least 12.");
        }

        // ASP.NET Core Identity Core registration with SQL Server EF Core stores
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequiredLength = passwordPolicy.RequiredLength;
            options.Password.RequireDigit = passwordPolicy.RequireDigit;
            options.Password.RequireLowercase = passwordPolicy.RequireLowercase;
            options.Password.RequireUppercase = passwordPolicy.RequireUppercase;
            options.Password.RequireNonAlphanumeric = passwordPolicy.RequireNonAlphanumeric;

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
        services.AddSingleton<IStorageService, Storage.LocalStorageService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ISiteSettingsService, SiteSettingsService>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ICmsService, CmsService>();
        services.AddScoped<ILeadService, LeadService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<IOutboxProcessor, OutboxProcessor>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IBlogService, BlogService>();

        // Health check registration
        services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>(
                name: "sqlserver",
                tags: ["ready"]);

        return services;
    }
}
