using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Identity;

namespace Nexora.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid,
    IdentityUserClaim<Guid>, IdentityUserRole<Guid>, IdentityUserLogin<Guid>,
    IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    IQueryable<AuditLog> IAppDbContext.AuditLogs => AuditLogs;
    IQueryable<SiteSettings> IAppDbContext.SiteSettings => SiteSettings;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        // SQL Server high-precision UTC timestamp standard
        configurationBuilder.Properties<DateTime>().HaveColumnType("datetime2");
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Rename Identity tables and configure column length limits (900-byte index key limit)
        builder.Entity<ApplicationUser>(b =>
        {
            b.ToTable("Users");
            b.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            b.Property(u => u.Status).HasConversion<int>().IsRequired();
            b.Property(u => u.SuspensionReason).HasMaxLength(500);

            b.Property(u => u.UserName).HasMaxLength(256);
            b.Property(u => u.NormalizedUserName).HasMaxLength(256);
            b.Property(u => u.Email).HasMaxLength(256);
            b.Property(u => u.NormalizedEmail).HasMaxLength(256);
            b.Property(u => u.PhoneNumber).HasMaxLength(50);
            b.Property(u => u.ConcurrencyStamp).HasMaxLength(36);
            b.Property(u => u.SecurityStamp).HasMaxLength(36);

            // Filtered unique indexes for SQL Server NULL-safety
            b.HasIndex(u => u.NormalizedEmail)
                .IsUnique()
                .HasFilter("[NormalizedEmail] IS NOT NULL");

            b.HasIndex(u => u.NormalizedUserName)
                .IsUnique()
                .HasFilter("[NormalizedUserName] IS NOT NULL");
        });

        builder.Entity<ApplicationRole>(b =>
        {
            b.ToTable("Roles");
            b.Property(r => r.Name).HasMaxLength(256);
            b.Property(r => r.NormalizedName).HasMaxLength(256);
            b.Property(r => r.ConcurrencyStamp).HasMaxLength(36);
            b.Property(r => r.Description).HasMaxLength(256);

            b.HasIndex(r => r.NormalizedName)
                .IsUnique()
                .HasFilter("[NormalizedName] IS NOT NULL");
        });

        builder.Entity<IdentityUserRole<Guid>>(b =>
        {
            b.ToTable("UserRoles");
            b.HasKey(r => new { r.UserId, r.RoleId });
        });

        builder.Entity<IdentityUserClaim<Guid>>(b =>
        {
            b.ToTable("UserClaims");
            b.Property(uc => uc.ClaimType).HasMaxLength(256);
            b.Property(uc => uc.ClaimValue).HasMaxLength(1024);
        });

        builder.Entity<IdentityUserLogin<Guid>>(b =>
        {
            b.ToTable("UserLogins");
            b.HasKey(l => new { l.LoginProvider, l.ProviderKey });
            b.Property(l => l.LoginProvider).HasMaxLength(128);
            b.Property(l => l.ProviderKey).HasMaxLength(128);
        });

        builder.Entity<IdentityRoleClaim<Guid>>(b =>
        {
            b.ToTable("RoleClaims");
            b.Property(rc => rc.ClaimType).HasMaxLength(256);
            b.Property(rc => rc.ClaimValue).HasMaxLength(1024);
        });

        builder.Entity<IdentityUserToken<Guid>>(b =>
        {
            b.ToTable("UserTokens");
            b.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
            b.Property(t => t.LoginProvider).HasMaxLength(128);
            b.Property(t => t.Name).HasMaxLength(128);
        });

        // RolePermission Composite Key
        builder.Entity<RolePermission>(b =>
        {
            b.ToTable("RolePermissions");
            b.HasKey(rp => new { rp.RoleId, rp.PermissionKey });
            b.Property(rp => rp.PermissionKey).HasMaxLength(100).IsRequired();
            b.HasOne(rp => rp.Role)
                .WithMany()
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AuditLog Configuration (Append-only with SQL Server trigger)
        builder.Entity<AuditLog>(b =>
        {
            b.ToTable("AuditLogs", tb =>
            {
                tb.HasTrigger("trg_AuditLogs_AppendOnly");
                tb.HasCheckConstraint("CK_AuditLogs_MetadataJson", "ISJSON([MetadataJson]) = 1 OR [MetadataJson] IS NULL");
            });

            b.HasKey(a => a.Id);
            b.Property(a => a.Action).HasMaxLength(100).IsRequired();
            b.Property(a => a.ResourceType).HasMaxLength(100).IsRequired();
            b.Property(a => a.ResourceId).HasMaxLength(100);
            b.Property(a => a.Outcome).HasMaxLength(50).IsRequired();
            b.Property(a => a.ActorEmail).HasMaxLength(256);
            b.Property(a => a.IpAddress).HasMaxLength(45); // IPv6 max
            b.Property(a => a.UserAgent).HasMaxLength(512);
            b.Property(a => a.CorrelationId).HasMaxLength(64).IsRequired();
            b.Property(a => a.MetadataJson).HasColumnType("nvarchar(max)");

            b.HasIndex(a => a.TimestampUtc);
            b.HasIndex(a => new { a.ResourceType, a.ResourceId });
            b.HasIndex(a => a.ActorUserId);
            // Composite index for audit querying (Action ASC, TimestampUtc DESC)
            b.HasIndex(a => new { a.Action, a.TimestampUtc })
                .IsDescending(false, true);
        });

        // SiteSettings Configuration (Singleton with RowVersion Concurrency)
        builder.Entity<SiteSettings>(b =>
        {
            b.ToTable("SiteSettings", tb =>
            {
                tb.HasCheckConstraint("CK_SiteSettings_Singleton", "[SingletonId] = 1");
                tb.HasCheckConstraint("CK_SiteSettings_SupportedRegions_Json", "ISJSON([SupportedRegions]) = 1");
            });

            b.HasKey(s => s.Id);
            b.Property(s => s.SingletonId).HasDefaultValue(1);
            b.HasIndex(s => s.SingletonId).IsUnique();

            b.Property(s => s.CompanyName).HasMaxLength(200).IsRequired();
            b.Property(s => s.LegalName).HasMaxLength(200);
            b.Property(s => s.SupportEmail).HasMaxLength(256);
            b.Property(s => s.SupportPhone).HasMaxLength(50);
            b.Property(s => s.DefaultRegion).HasMaxLength(10).IsRequired();

            // SupportedRegions JSON value converter with sequence-equality ValueComparer
            var regionsConverter = new ValueConverter<string[], string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>());

            var regionsComparer = new ValueComparer<string[]>(
                (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToArray());

            b.Property(s => s.SupportedRegions)
                .HasConversion(regionsConverter)
                .HasColumnType("nvarchar(max)")
                .IsRequired()
                .Metadata.SetValueComparer(regionsComparer);

            b.Property(s => s.TimeZoneId).HasMaxLength(100).IsRequired();

            // Optimistic concurrency using SQL Server rowversion
            b.Property(s => s.Version).IsRowVersion();
        });
    }
}
