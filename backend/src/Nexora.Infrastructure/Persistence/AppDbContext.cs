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
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<PageVersion> PageVersions => Set<PageVersion>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<MediaFolder> MediaFolders => Set<MediaFolder>();
    public DbSet<NavigationMenu> NavigationMenus => Set<NavigationMenu>();
    public DbSet<NavigationMenuItem> NavigationMenuItems => Set<NavigationMenuItem>();
    public DbSet<PreviewToken> PreviewTokens => Set<PreviewToken>();
    public DbSet<FormDefinition> FormDefinitions => Set<FormDefinition>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<ClientActivity> ClientActivities => Set<ClientActivity>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<PipelineStage> PipelineStages => Set<PipelineStage>();
    public DbSet<CountryRegion> CountryRegions => Set<CountryRegion>();

    IQueryable<AuditLog> IAppDbContext.AuditLogs => AuditLogs;
    IQueryable<SiteSettings> IAppDbContext.SiteSettings => SiteSettings;
    IQueryable<FormDefinition> IAppDbContext.FormDefinitions => FormDefinitions;
    IQueryable<Lead> IAppDbContext.Leads => Leads;
    IQueryable<LeadActivity> IAppDbContext.LeadActivities => LeadActivities;
    IQueryable<OutboxMessage> IAppDbContext.OutboxMessages => OutboxMessages;
    IQueryable<EmailTemplate> IAppDbContext.EmailTemplates => EmailTemplates;
    IQueryable<EmailLog> IAppDbContext.EmailLogs => EmailLogs;
    IQueryable<Client> IAppDbContext.Clients => Clients;
    IQueryable<Contact> IAppDbContext.Contacts => Contacts;
    IQueryable<TaskItem> IAppDbContext.TaskItems => TaskItems;
    IQueryable<ClientActivity> IAppDbContext.ClientActivities => ClientActivities;
    IQueryable<BlogPost> IAppDbContext.BlogPosts => BlogPosts;
    IQueryable<PipelineStage> IAppDbContext.PipelineStages => PipelineStages;
    IQueryable<CountryRegion> IAppDbContext.CountryRegions => CountryRegions;

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
                tb.HasCheckConstraint("CK_SiteSettings_SectionVisibility_Json", "ISJSON([SectionVisibilityJson]) = 1");
                tb.HasCheckConstraint("CK_SiteSettings_ThemeTokens_Json", "ISJSON([ThemeTokensJson]) = 1");
                tb.HasCheckConstraint("CK_SiteSettings_SocialLinks_Json", "ISJSON([SocialLinksJson]) = 1");
                tb.HasCheckConstraint("CK_SiteSettings_TrackingCodes_Json", "ISJSON([TrackingCodesJson]) = 1");
                tb.HasCheckConstraint("CK_SiteSettings_AnnouncementBar_Json", "ISJSON([AnnouncementBarJson]) = 1");
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

            b.Property(s => s.SmtpHost).HasMaxLength(200);
            b.Property(s => s.SmtpUserName).HasMaxLength(200);
            b.Property(s => s.SmtpPassword).HasMaxLength(500);
            b.Property(s => s.SmtpFromEmail).HasMaxLength(256);
            b.Property(s => s.SmtpFromName).HasMaxLength(200);
            b.Property(s => s.SectionVisibilityJson).HasColumnType("nvarchar(max)").HasDefaultValue("{}");
            b.Property(s => s.FaviconMediaId);
            b.Property(s => s.ThemeTokensJson).HasColumnType("nvarchar(max)").HasDefaultValue("{}");
            b.Property(s => s.SocialLinksJson).HasColumnType("nvarchar(max)").HasDefaultValue("{}");
            b.Property(s => s.TrackingCodesJson).HasColumnType("nvarchar(max)").HasDefaultValue("{}");
            b.Property(s => s.BookingUrl).HasMaxLength(500);
            b.Property(s => s.AnnouncementBarJson).HasColumnType("nvarchar(max)").HasDefaultValue("{}");
            b.Property(s => s.WebhookUrl).HasMaxLength(512);
            b.Property(s => s.WebhookSecret).HasMaxLength(128);

            // Optimistic concurrency using SQL Server rowversion
            b.Property(s => s.Version).IsRowVersion();
        });

        // 4. CMS: Pages Configuration
        builder.Entity<Page>(b =>
        {
            b.ToTable("Pages");
            b.HasKey(p => p.Id);

            b.Property(p => p.Slug).HasMaxLength(200).IsRequired();
            b.Property(p => p.Locale).HasMaxLength(10).IsRequired();
            b.Property(p => p.Title).HasMaxLength(300).IsRequired();
            b.Property(p => p.Status).HasConversion<int>().IsRequired();
            b.Property(p => p.IsEnabled).IsRequired();

            b.Property(p => p.MetaTitle).HasMaxLength(300);
            b.Property(p => p.MetaDescription).HasMaxLength(500);
            b.Property(p => p.CanonicalUrl).HasMaxLength(500);

            // Concurrency token for optimistic locking on page edits
            b.Property(p => p.Version).IsRowVersion();

            // Unique index per Slug + Locale
            b.HasIndex(p => new { p.Slug, p.Locale }).IsUnique();

            // Self-referencing published version relation
            b.HasOne(p => p.PublishedVersion)
                .WithMany()
                .HasForeignKey(p => p.PublishedVersionId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasMany(p => p.Versions)
                .WithOne(v => v.Page)
                .HasForeignKey(v => v.PageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 5. CMS: PageVersions Configuration
        builder.Entity<PageVersion>(b =>
        {
            b.ToTable("PageVersions", tb =>
            {
                tb.HasCheckConstraint("CK_PageVersions_ContentJson_Json", "ISJSON([ContentJson]) = 1");
            });

            b.HasKey(v => v.Id);
            b.Property(v => v.VersionNumber).IsRequired();
            b.Property(v => v.SchemaVersion).IsRequired();
            b.Property(v => v.ContentJson).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(v => v.Note).HasMaxLength(500);

            b.HasIndex(v => new { v.PageId, v.VersionNumber }).IsUnique();
        });

        // 6. CMS: Media Assets & Folders
        builder.Entity<MediaFolder>(b =>
        {
            b.ToTable("MediaFolders");
            b.HasKey(f => f.Id);
            b.Property(f => f.Name).HasMaxLength(150).IsRequired();

            b.HasOne(f => f.ParentFolder)
                .WithMany(pf => pf.SubFolders)
                .HasForeignKey(f => f.ParentFolderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MediaAsset>(b =>
        {
            b.ToTable("MediaAssets");
            b.HasKey(m => m.Id);
            b.Property(m => m.StorageKey).HasMaxLength(256).IsRequired();
            b.HasIndex(m => m.StorageKey).IsUnique();

            b.Property(m => m.FileName).HasMaxLength(256).IsRequired();
            b.Property(m => m.MimeType).HasMaxLength(100).IsRequired();
            b.Property(m => m.AltText).HasMaxLength(300);

            b.HasOne(m => m.Folder)
                .WithMany(f => f.Assets)
                .HasForeignKey(m => m.FolderId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 7. CMS: Navigation Menus & Items
        builder.Entity<NavigationMenu>(b =>
        {
            b.ToTable("NavigationMenus");
            b.HasKey(m => m.Id);
            b.Property(m => m.Key).HasMaxLength(100).IsRequired();
            b.Property(m => m.Title).HasMaxLength(150).IsRequired();
            b.Property(m => m.RegionCode).HasMaxLength(10);

            b.HasIndex(m => m.Key).IsUnique().HasFilter("[RegionCode] IS NULL");
            b.HasIndex(m => new { m.Key, m.RegionCode }).IsUnique().HasFilter("[RegionCode] IS NOT NULL");

            b.HasMany(m => m.Items)
                .WithOne(i => i.Menu)
                .HasForeignKey(i => i.MenuId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<NavigationMenuItem>(b =>
        {
            b.ToTable("NavigationMenuItems");
            b.HasKey(i => i.Id);
            b.Property(i => i.Label).HasMaxLength(150).IsRequired();
            b.Property(i => i.Url).HasMaxLength(500).IsRequired();
            b.Property(i => i.DisplayOrder).IsRequired();

            b.HasOne(i => i.ParentItem)
                .WithMany(p => p.Children)
                .HasForeignKey(i => i.ParentItemId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // 8. CMS: Preview Tokens
        builder.Entity<PreviewToken>(b =>
        {
            b.ToTable("PreviewTokens");
            b.HasKey(t => t.Id);
            b.Property(t => t.Token).HasMaxLength(100).IsRequired();
            b.Property(t => t.TokenHash).HasMaxLength(64).IsRequired();
            b.HasIndex(t => t.Token).IsUnique();
            b.HasIndex(t => t.TokenHash);

            b.HasOne(t => t.PageVersion)
                .WithMany()
                .HasForeignKey(t => t.PageVersionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 9. Forms & Form Definitions
        builder.Entity<FormDefinition>(b =>
        {
            b.ToTable("FormDefinitions", tb =>
            {
                tb.HasCheckConstraint("CK_FormDefinitions_SchemaJson", "ISJSON([SchemaJson]) = 1");
                tb.HasCheckConstraint("CK_FormDefinitions_SettingsJson", "ISJSON([SettingsJson]) = 1");
            });

            b.HasKey(f => f.Id);
            b.Property(f => f.FormKey).HasMaxLength(100).IsRequired();
            b.HasIndex(f => f.FormKey).IsUnique();

            b.Property(f => f.Name).HasMaxLength(150).IsRequired();
            b.Property(f => f.Title).HasMaxLength(200);
            b.Property(f => f.Description).HasMaxLength(500);
            b.Property(f => f.SchemaJson).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(f => f.SettingsJson).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(f => f.IsActive).IsRequired();
            b.Property(f => f.Version).IsRowVersion();
        });

        // 10. Leads & Inquiries
        builder.Entity<Lead>(b =>
        {
            b.ToTable("Leads", tb =>
            {
                tb.HasCheckConstraint("CK_Leads_CustomFieldsJson", "ISJSON([CustomFieldsJson]) = 1");
                tb.HasCheckConstraint("CK_Leads_InternalNotesJson", "ISJSON([InternalNotesJson]) = 1");
            });

            b.HasKey(l => l.Id);
            b.Property(l => l.FormKey).HasMaxLength(100).IsRequired();
            b.Property(l => l.FullName).HasMaxLength(200).IsRequired();
            b.Property(l => l.Email).HasMaxLength(256).IsRequired();
            b.Property(l => l.Phone).HasMaxLength(50);
            b.Property(l => l.Company).HasMaxLength(200);
            b.Property(l => l.Region).HasMaxLength(10).IsRequired();
            b.Property(l => l.State).HasMaxLength(100);
            b.Property(l => l.PostalCode).HasMaxLength(20);
            b.Property(l => l.CustomFieldsJson).HasColumnType("nvarchar(max)").IsRequired();

            b.Property(l => l.UtmSource).HasMaxLength(150);
            b.Property(l => l.UtmMedium).HasMaxLength(150);
            b.Property(l => l.UtmCampaign).HasMaxLength(150);
            b.Property(l => l.UtmTerm).HasMaxLength(150);
            b.Property(l => l.UtmContent).HasMaxLength(150);
            b.Property(l => l.ReferrerUrl).HasMaxLength(500);

            b.Property(l => l.ConsentGiven).IsRequired();
            b.Property(l => l.ConsentWordingVersion).HasMaxLength(50);
            b.Property(l => l.ConsentTimestampUtc);

            b.Property(l => l.Status).IsRequired();
            b.Property(l => l.Score).HasDefaultValue(0);
            b.Property(l => l.AssignedToUserId);
            b.Property(l => l.InternalNotesJson).HasColumnType("nvarchar(max)").IsRequired();

            b.Property(l => l.IpAddress).HasMaxLength(45);
            b.Property(l => l.UserAgent).HasMaxLength(512);

            b.Property(l => l.ReferenceNumber).HasMaxLength(50);
            b.Property(l => l.IdempotencyKey).HasMaxLength(128);
            b.Property(l => l.TimeTrapNonce).HasMaxLength(64);
            b.Property(l => l.Version).IsRowVersion();

            b.HasIndex(l => l.Email);
            b.HasIndex(l => l.Phone);
            b.HasIndex(l => l.Region);
            b.HasIndex(l => l.FormKey);
            b.HasIndex(l => new { l.Status, l.CreatedAtUtc })
                .IsDescending(false, true);

            b.HasIndex(l => l.ReferenceNumber)
                .IsUnique()
                .HasFilter("[ReferenceNumber] IS NOT NULL");

            b.HasIndex(l => new { l.FormKey, l.IdempotencyKey })
                .IsUnique()
                .HasFilter("[IdempotencyKey] IS NOT NULL");

            b.HasIndex(l => l.TimeTrapNonce)
                .IsUnique()
                .HasFilter("[TimeTrapNonce] IS NOT NULL");

            b.HasMany(l => l.Activities)
                .WithOne(a => a.Lead)
                .HasForeignKey(a => a.LeadId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 11. Lead Activities / Audit
        builder.Entity<LeadActivity>(b =>
        {
            b.ToTable("LeadActivities", tb =>
            {
                tb.HasCheckConstraint("CK_LeadActivities_MetadataJson", "ISJSON([MetadataJson]) = 1 OR [MetadataJson] IS NULL");
            });

            b.HasKey(a => a.Id);
            b.Property(a => a.ActivityType).HasMaxLength(100).IsRequired();
            b.Property(a => a.Description).HasMaxLength(1000).IsRequired();
            b.Property(a => a.MetadataJson).HasColumnType("nvarchar(max)");
            b.Property(a => a.ActorUserId);

            b.HasIndex(a => new { a.LeadId, a.CreatedAtUtc })
                .IsDescending(false, true);
        });

        // 12. Outbox Messages (Reliable Async Dispatch)
        builder.Entity<OutboxMessage>(b =>
        {
            b.ToTable("OutboxMessages");
            b.HasKey(o => o.Id);
            b.Property(o => o.EventType).HasMaxLength(100).IsRequired();
            b.Property(o => o.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(o => o.Status).HasConversion<int>().IsRequired().HasDefaultValue(OutboxMessageStatus.Pending);
            b.Property(o => o.ErrorMessage).HasMaxLength(2000);
            b.Property(o => o.DeadLetterReason).HasMaxLength(500);
            b.Property(o => o.NextAttemptAtUtc);
            b.Property(o => o.RetryCount).IsRequired();

            b.HasIndex(o => new { o.Status, o.NextAttemptAtUtc });
            b.HasIndex(o => new { o.ProcessedAtUtc, o.CreatedAtUtc })
                .HasFilter("[ProcessedAtUtc] IS NULL");
        });

        // 13. Email Templates
        builder.Entity<EmailTemplate>(b =>
        {
            b.ToTable("EmailTemplates");
            b.HasKey(t => t.Id);
            b.Property(t => t.Key).HasMaxLength(100).IsRequired();
            b.HasIndex(t => t.Key).IsUnique();

            b.Property(t => t.Name).HasMaxLength(150).IsRequired();
            b.Property(t => t.SubjectTemplate).HasMaxLength(300).IsRequired();
            b.Property(t => t.BodyHtmlTemplate).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(t => t.BodyPlainTextTemplate).HasColumnType("nvarchar(max)");
            b.Property(t => t.IsActive).IsRequired();
            b.Property(t => t.Version).IsRowVersion();
        });

        // 14. Email Delivery Logs
        builder.Entity<EmailLog>(b =>
        {
            b.ToTable("EmailLogs");
            b.HasKey(l => l.Id);
            b.Property(l => l.RecipientEmail).HasMaxLength(256).IsRequired();
            b.Property(l => l.Subject).HasMaxLength(300).IsRequired();
            b.Property(l => l.TemplateKey).HasMaxLength(100);
            b.Property(l => l.Status).IsRequired();
            b.Property(l => l.ErrorMessage).HasMaxLength(2000);
            b.Property(l => l.SentAtUtc);

            b.HasIndex(l => l.RecipientEmail);
            b.HasIndex(l => new { l.Status, l.CreatedAtUtc })
                .IsDescending(false, true);
        });

        // 15. Clients
        builder.Entity<Client>(b =>
        {
            b.ToTable("Clients");
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(200).IsRequired();
            b.Property(c => c.PrimaryContactEmail).HasMaxLength(256).IsRequired();
            b.Property(c => c.PrimaryContactPhone).HasMaxLength(50);
            b.Property(c => c.Website).HasMaxLength(255);
            b.Property(c => c.Industry).HasMaxLength(100);
            b.Property(c => c.Region).HasMaxLength(10).IsRequired();
            b.Property(c => c.Status).IsRequired();
            b.Property(c => c.BillingAddress).HasMaxLength(500);
            b.Property(c => c.TaxId).HasMaxLength(50);
            b.Property(c => c.Notes).HasMaxLength(2000);
            b.Property(c => c.Version).IsRowVersion();

            b.HasIndex(c => new { c.Region, c.Status });
            b.HasIndex(c => c.PrimaryContactEmail);

            b.HasMany(c => c.Contacts)
                .WithOne(con => con.Client)
                .HasForeignKey(con => con.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(c => c.Tasks)
                .WithOne(t => t.Client)
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(c => c.Activities)
                .WithOne(a => a.Client)
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 16. Contacts
        builder.Entity<Contact>(b =>
        {
            b.ToTable("Contacts");
            b.HasKey(con => con.Id);
            b.Property(con => con.FullName).HasMaxLength(150).IsRequired();
            b.Property(con => con.Email).HasMaxLength(256).IsRequired();
            b.Property(con => con.Phone).HasMaxLength(50);
            b.Property(con => con.Title).HasMaxLength(100);
            b.Property(con => con.IsPrimary).IsRequired();

            b.HasIndex(con => new { con.ClientId, con.Email });
        });

        // 17. Tasks
        builder.Entity<TaskItem>(b =>
        {
            b.ToTable("TaskItems");
            b.HasKey(t => t.Id);
            b.Property(t => t.Title).HasMaxLength(250).IsRequired();
            b.Property(t => t.Description).HasMaxLength(1000);
            b.Property(t => t.Priority).IsRequired();
            b.Property(t => t.Status).IsRequired();
            b.Property(t => t.DueDateUtc);
            b.Property(t => t.CompletedAtUtc);
            b.Property(t => t.Version).IsRowVersion();

            b.HasIndex(t => new { t.Status, t.DueDateUtc });
            b.HasIndex(t => t.AssignedToUserId);
        });

        // 18. Client Activities
        builder.Entity<ClientActivity>(b =>
        {
            b.ToTable("ClientActivities");
            b.HasKey(a => a.Id);
            b.Property(a => a.ActivityType).HasMaxLength(50).IsRequired();
            b.Property(a => a.Description).HasMaxLength(1000).IsRequired();
            b.Property(a => a.CreatedAtUtc).IsRequired();

            b.HasIndex(a => new { a.ClientId, a.CreatedAtUtc })
                .IsDescending(false, true);
        });

        // 19. Blog Posts
        builder.Entity<BlogPost>(b =>
        {
            b.ToTable("BlogPosts");
            b.HasKey(p => p.Id);
            b.Property(p => p.Slug).HasMaxLength(200).IsRequired();
            b.HasIndex(p => p.Slug).IsUnique();

            b.Property(p => p.Title).HasMaxLength(250).IsRequired();
            b.Property(p => p.Excerpt).HasMaxLength(500).IsRequired();
            b.Property(p => p.ContentHtml).HasColumnType("nvarchar(max)").IsRequired();
            b.Property(p => p.Category).HasMaxLength(100).IsRequired();
            b.Property(p => p.Tags).HasMaxLength(250);
            b.Property(p => p.CoverImageUrl).HasMaxLength(500);
            b.Property(p => p.AuthorName).HasMaxLength(100).IsRequired();
            b.Property(p => p.Status).IsRequired();
            b.Property(p => p.MetaTitle).HasMaxLength(200);
            b.Property(p => p.MetaDescription).HasMaxLength(300);
            b.Property(p => p.Version).IsRowVersion();

            b.HasIndex(p => new { p.Status, p.PublishedAtUtc })
                .IsDescending(false, true);
            b.HasIndex(p => p.Category);
        });

        // 20. Dynamic Pipeline Stages
        builder.Entity<PipelineStage>(b =>
        {
            b.ToTable("PipelineStages");
            b.HasKey(s => s.Id);
            b.Property(s => s.Category).HasMaxLength(50).IsRequired();
            b.Property(s => s.StageKey).HasMaxLength(100).IsRequired();
            b.Property(s => s.DisplayName).HasMaxLength(150).IsRequired();
            b.Property(s => s.ColorHex).HasMaxLength(30).IsRequired();
            b.Property(s => s.BadgeClass).HasMaxLength(150);
            b.HasIndex(s => new { s.Category, s.StageKey }).IsUnique();
            b.HasIndex(s => new { s.Category, s.Value }).IsUnique();
            b.HasIndex(s => new { s.Category, s.OrderIndex });
        });

        // 21. Dynamic Country Regions & Currencies
        builder.Entity<CountryRegion>(b =>
        {
            b.ToTable("CountryRegions");
            b.HasKey(r => r.Id);
            b.Property(r => r.Code).HasMaxLength(10).IsRequired();
            b.HasIndex(r => r.Code).IsUnique();
            b.Property(r => r.Name).HasMaxLength(100).IsRequired();
            b.Property(r => r.CurrencyCode).HasMaxLength(10).IsRequired();
            b.Property(r => r.CurrencySymbol).HasMaxLength(10).IsRequired();
            b.Property(r => r.FlagEmoji).HasMaxLength(20).IsRequired();
            b.Property(r => r.PhonePrefix).HasMaxLength(20).IsRequired();
            b.Property(r => r.TaxLabel).HasMaxLength(50).IsRequired();
            b.HasIndex(r => r.OrderIndex);
        });
    }
}
