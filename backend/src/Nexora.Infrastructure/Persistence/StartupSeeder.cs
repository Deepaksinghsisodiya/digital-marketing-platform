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

        // 0. Database Migration (Strictly gated by Development environment with race guard)
        if (environment.IsDevelopment())
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
                    Permissions.TasksManage
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
                    Permissions.TasksManage
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
                TimeZoneId = timeZoneId
            };

            context.SiteSettings.Add(initialSettings);
            await context.SaveChangesAsync();
            logger.LogInformation("Singleton SiteSettings initialized with configuration defaults.");
        }

        // 2b. Seed Default 'contact' FormDefinition
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
              "receiverEmails": ["contact-intake@example.com"],
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
                existingUser.MustChangePassword = false;
                await userManager.UpdateAsync(existingUser);

                if (!await userManager.IsInRoleAsync(existingUser, Roles.Owner))
                {
                    await userManager.AddToRoleAsync(existingUser, Roles.Owner);
                }
                logger.LogInformation("Verified administrator user {Email} as active Owner.", seedEmail);
            }
        }

        // 4. Seed Default Email Templates
        if (!await context.EmailTemplates.AnyAsync(t => t.Key == "lead-auto-reply"))
        {
            var autoReply = new EmailTemplate(
                key: "lead-auto-reply",
                name: "Lead Inquiry Auto-Reply",
                subjectTemplate: "Thank you for contacting Nexora, {{lead.name}}!",
                bodyHtmlTemplate: "<h2>Inquiry Received</h2><p>Dear {{lead.name}},</p><p>Thank you for contacting Nexora. We have received your business inquiry and our team is evaluating your project details.</p><p>An enterprise growth consultant will be in touch shortly.</p><br/><p>Warm regards,<br/><strong>Nexora Digital Team</strong></p>",
                bodyPlainTextTemplate: "Dear {{lead.name}},\n\nThank you for contacting Nexora. We have received your inquiry and our team will be in touch shortly.\n\nWarm regards,\nNexora Digital Team");

            context.EmailTemplates.Add(autoReply);
        }

        if (!await context.EmailTemplates.AnyAsync(t => t.Key == "lead-internal-notification"))
        {
            var internalNotif = new EmailTemplate(
                key: "lead-internal-notification",
                name: "New Lead Internal Alert",
                subjectTemplate: "[New Inbound Lead] {{lead.name}} ({{lead.company}} - {{lead.region}})",
                bodyHtmlTemplate: "<h2>New Inbound Lead Captured</h2><p><strong>Name:</strong> {{lead.name}}</p><p><strong>Email:</strong> {{lead.email}}</p><p><strong>Phone:</strong> {{lead.phone}}</p><p><strong>Company:</strong> {{lead.company}}</p><p><strong>Region:</strong> {{lead.region}}</p>",
                bodyPlainTextTemplate: "New Inbound Lead Captured:\nName: {{lead.name}}\nEmail: {{lead.email}}\nPhone: {{lead.phone}}\nCompany: {{lead.company}}\nRegion: {{lead.region}}");

            context.EmailTemplates.Add(internalNotif);
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
                "settings": { "theme": "dark" },
                "content": {
                  "headline": "Data-Driven Marketing at Enterprise Scale",
                  "subheadline": "Connect your enterprise to target audiences with AI campaign automation, precision audience modeling, and verifiable attribution.",
                  "primaryCtaText": "Get Free Growth Diagnostic",
                  "primaryCtaLink": "/contact",
                  "secondaryCtaText": "Explore Insights & Strategy",
                  "secondaryCtaLink": "/blog"
                }
              },
              {
                "id": "blk_stats_1",
                "type": "Stats",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "metrics": [
                    { "value": "340%", "label": "Avg Pipeline Velocity" },
                    { "value": "$120M+", "label": "Enterprise Revenue Influenced" },
                    { "value": "99.8%", "label": "Attribution Accuracy" }
                  ]
                }
              },
              {
                "id": "blk_features_1",
                "type": "FeatureGrid",
                "schemaVersion": 1,
                "enabled": true,
                "content": {
                  "sectionTitle": "Engineered for Enterprise Performance",
                  "sectionSubtitle": "Comprehensive digital marketing infrastructure designed for high-velocity teams across India and global markets.",
                  "features": [
                    { "title": "High-Intent Performance SEO", "description": "Dominate high-converting commercial search queries with bespoke architecture, schema markup, and programmatic content." },
                    { "title": "Account-Based Marketing (ABM)", "description": "Engage enterprise buying committees with real-time intent triggers, personalized landing experiences, and CRM sync." },
                    { "title": "Multi-Touch Revenue Attribution", "description": "Track pipeline contributions across LinkedIn Ads, Google Search, organic traffic, and direct sales touches." },
                    { "title": "Conversion Rate Optimization (CRO)", "description": "Turn high-cost traffic into qualified sales opportunities with continuous split testing and frictionless forms." },
                    { "title": "Automated Lead Routing & Outbox", "description": "Instantly route captured inquiries, enforce SLA follow-ups, and trigger personalized auto-replies via transactional email." },
                    { "title": "Enterprise Compliance & Consent", "description": "Full audit-proof consent tracking, multi-region data policies (DPDP Act, GDPR, CCPA), and immutable logs." }
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
                  "buttonText": "Schedule Strategy Session",
                  "buttonLink": "/contact"
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
                    { "question": "How quickly can Nexora deploy our custom marketing infrastructure?", "answer": "Initial campaigns and tracking architecture typically go live within 7 to 14 business days, with real-time attribution and CRM synchronization enabled from day one." },
                    { "question": "Does Nexora support multi-country campaigns for India and the US?", "answer": "Yes. Nexora natively handles multi-region routing, localized currency (INR / USD), phone validation, tax/GST fields, and regional compliance." },
                    { "question": "Can our marketing team edit website pages without developer support?", "answer": "Yes, our modern Admin portal provides a visual block builder to update headlines, banners, features, and blog content with live preview and version rollback." }
                  ]
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

        // 6b. Seed Neutral Sample CMS Pages (about, solutions, pricing, case-studies) to ensure zero 404s
        var samplePages = new[]
        {
            ("about", "About Us — Nexora", "Sample content — customize in Admin CMS. Nexora delivers enterprise digital marketing and growth infrastructure.", "About Nexora"),
            ("solutions", "Solutions & Capabilities — Nexora", "Sample content — customize in Admin CMS. Full-funnel performance marketing, search architecture, and pipeline acceleration.", "Growth Solutions"),
            ("pricing", "Transparent Enterprise Pricing — Nexora", "Sample content — customize in Admin CMS. Scalable enterprise growth tiers designed for high-performing marketing teams.", "Pricing Tiers"),
            ("case-studies", "Client Case Studies — Nexora", "Sample content — customize in Admin CMS. Verifiable enterprise revenue growth and multi-touch attribution outcomes.", "Case Studies")
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
        else
        {
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // In concurrent test executions or multi-process restarts, an idempotent seed collision is safely handled
                logger.LogDebug(ex, "Concurrent seed attempt detected; changes already committed by another instance.");
            }
        }
    }
}
