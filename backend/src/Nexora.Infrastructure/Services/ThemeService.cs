using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Themes;
using Nexora.Application.Themes.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class ThemeService : IThemeService
{
    private const string FallbackConfigJson = """
    {
      "schemaVersion": 1,
      "id": "cyber-emerald",
      "slug": "cyber-emerald",
      "name": "Cyber Emerald & Deep Onyx",
      "tagline": "High-frequency engineering, Supabase & Cursor tech style",
      "badge": "Supabase / Cursor"
    }
    """;

    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    public ThemeService(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<List<ThemeSummaryDto>> GetThemesAsync(bool includeDeleted = false, CancellationToken ct = default)
    {
        var query = _context.Themes.AsNoTracking();
        if (!includeDeleted)
        {
            query = query.Where(t => !t.IsDeleted);
        }

        var themes = await query
            .OrderByDescending(t => t.IsSystem)
            .ThenBy(t => t.Name)
            .ToListAsync(ct);

        return themes.Select(t => new ThemeSummaryDto(
            t.Id, t.Name, t.Slug, t.Description, t.IsSystem, t.IsDefault, t.IsDeleted,
            t.DraftConfigJson != null, t.CurrentVersion, t.CreatedAtUtc, t.UpdatedAtUtc)).ToList();
    }

    public async Task<ThemeDetailDto?> GetThemeAsync(Guid id, CancellationToken ct = default)
    {
        var theme = await _context.Themes.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct);
        return theme == null ? null : MapDetail(theme);
    }

    public async Task<(bool Success, string? Error, ThemeDetailDto? Theme)> CreateThemeAsync(
        CreateThemeDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return (false, "Theme name is required.", null);
        }

        var slug = NormalizeSlug(string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name : dto.Slug);
        if (await _context.Themes.AnyAsync(t => t.Slug == slug, ct))
        {
            return (false, $"A theme with slug '{slug}' already exists.", null);
        }

        string configJson;
        if (!string.IsNullOrWhiteSpace(dto.ConfigJson))
        {
            var (valid, errors) = ThemeConfigValidator.Validate(dto.ConfigJson);
            if (!valid)
            {
                return (false, string.Join(" ", errors), null);
            }
            configJson = dto.ConfigJson;
        }
        else
        {
            var source = await FindDefaultThemeAsync(ct);
            configJson = source?.ConfigJson ?? FallbackConfigJson;
        }

        var theme = new Theme
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description?.Trim() ?? string.Empty,
            ConfigJson = configJson,
            DraftConfigJson = null,
            IsSystem = false,
            IsDefault = false,
            IsDeleted = false,
            CurrentVersion = 1,
            CreatedBy = actingUserId,
            UpdatedBy = actingUserId
        };

        theme.ConfigJson = StampConfigIdentity(theme.ConfigJson, theme.Id, theme.Slug, theme.Name);

        _context.Themes.Add(theme);
        _context.ThemeVersions.Add(new ThemeVersion
        {
            ThemeId = theme.Id,
            VersionNumber = 1,
            ConfigJson = theme.ConfigJson,
            ChangedBy = actingUserId,
            ChangeDescription = "Initial theme creation"
        });

        await _context.SaveChangesAsync(ct);
        return (true, null, MapDetail(theme));
    }

    public async Task<(bool Success, string? Error, bool Conflict, ThemeDetailDto? Theme)> SaveDraftAsync(
        Guid id, SaveThemeDraftDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        var theme = await _context.Themes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (theme == null || theme.IsDeleted)
        {
            return (false, "Theme not found.", false, null);
        }

        if (theme.IsSystem)
        {
            return (false, "System themes are read-only. Duplicate the theme to customize it.", false, null);
        }

        var (valid, errors) = ThemeConfigValidator.Validate(dto.ConfigJson);
        if (!valid)
        {
            return (false, string.Join(" ", errors), false, null);
        }

        if (!string.IsNullOrWhiteSpace(dto.BaseVersionToken))
        {
            try
            {
                _context.Entry(theme).Property(t => t.Version).OriginalValue = Convert.FromBase64String(dto.BaseVersionToken);
            }
            catch (FormatException)
            {
                return (false, "Invalid version token format.", false, null);
            }
        }

        theme.DraftConfigJson = StampConfigIdentity(
            dto.ConfigJson,
            theme.Id,
            theme.Slug,
            TryReadConfigName(dto.ConfigJson) ?? theme.Name);
        theme.UpdatedBy = actingUserId;
        theme.MarkUpdated();

        try
        {
            await _context.SaveChangesAsync(ct);
            return (true, null, false, MapDetail(theme));
        }
        catch (DbUpdateConcurrencyException)
        {
            return (false, "This theme was modified by another administrator. Refresh and retry.", true, null);
        }
    }

    public async Task<(bool Success, string? Error)> DeleteThemeAsync(Guid id, CancellationToken ct = default)
    {
        var theme = await _context.Themes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (theme == null || theme.IsDeleted)
        {
            return (false, "Theme not found.");
        }

        if (theme.IsSystem)
        {
            return (false, "System themes cannot be deleted.");
        }

        if (theme.IsDefault)
        {
            return (false, "The default theme cannot be deleted.");
        }

        var settings = await _context.SiteSettings.FirstOrDefaultAsync(s => s.SingletonId == 1, ct);
        if (settings != null && IsAssigned(theme, settings))
        {
            return (false, "This theme is currently active on the website or admin. Assign another theme before deleting.");
        }

        theme.IsDeleted = true;
        theme.MarkUpdated();
        await _context.SaveChangesAsync(ct);
        return (true, null);
    }

    public async Task<(bool Success, string? Error, ThemeDetailDto? Theme)> DuplicateThemeAsync(
        Guid id, string? newName, Guid actingUserId, CancellationToken ct = default)
    {
        var source = await _context.Themes.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct);
        if (source == null)
        {
            return (false, "Theme not found.", null);
        }

        var name = string.IsNullOrWhiteSpace(newName) ? $"{source.Name} (Copy)" : newName.Trim();
        var slug = NormalizeSlug(name);
        var suffix = 1;
        var baseSlug = slug;
        while (await _context.Themes.AnyAsync(t => t.Slug == slug, ct))
        {
            slug = $"{baseSlug}-{++suffix}";
        }

        var theme = new Theme
        {
            Name = name,
            Slug = slug,
            Description = source.Description,
            ConfigJson = source.ConfigJson,
            DraftConfigJson = null,
            IsSystem = false,
            IsDefault = false,
            IsDeleted = false,
            CurrentVersion = 1,
            CreatedBy = actingUserId,
            UpdatedBy = actingUserId
        };

        theme.ConfigJson = StampConfigIdentity(theme.ConfigJson, theme.Id, theme.Slug, theme.Name);

        _context.Themes.Add(theme);
        _context.ThemeVersions.Add(new ThemeVersion
        {
            ThemeId = theme.Id,
            VersionNumber = 1,
            ConfigJson = theme.ConfigJson,
            ChangedBy = actingUserId,
            ChangeDescription = $"Duplicated from '{source.Name}'"
        });

        await _context.SaveChangesAsync(ct);
        return (true, null, MapDetail(theme));
    }

    public async Task<(bool Success, string? Error, ThemeVersionDto? Version)> PublishThemeAsync(
        Guid id, PublishThemeDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        var theme = await _context.Themes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (theme == null || theme.IsDeleted)
        {
            return (false, "Theme not found.", null);
        }

        if (theme.IsSystem)
        {
            return (false, "System themes are protected and cannot be re-published. Duplicate to customize.", null);
        }

        if (string.IsNullOrWhiteSpace(theme.DraftConfigJson))
        {
            return (false, "There is no draft to publish for this theme.", null);
        }

        var (valid, errors) = ThemeConfigValidator.Validate(theme.DraftConfigJson);
        if (!valid)
        {
            return (false, string.Join(" ", errors), null);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var publishedName = TryReadConfigName(theme.DraftConfigJson) ?? theme.Name;
        theme.ConfigJson = StampConfigIdentity(theme.DraftConfigJson, theme.Id, theme.Slug, publishedName);
        theme.Name = publishedName;
        theme.DraftConfigJson = null;
        theme.CurrentVersion += 1;
        theme.UpdatedBy = actingUserId;
        theme.MarkUpdated();

        var version = new ThemeVersion
        {
            ThemeId = theme.Id,
            VersionNumber = theme.CurrentVersion,
            ConfigJson = theme.ConfigJson,
            ChangedBy = actingUserId,
            ChangeDescription = string.IsNullOrWhiteSpace(dto.ChangeDescription)
                ? $"Published version {theme.CurrentVersion}"
                : dto.ChangeDescription.Trim()
        };
        _context.ThemeVersions.Add(version);

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        InvalidateThemeCaches();

        return (true, null, MapVersion(version));
    }

    public async Task<(bool Success, string? Error, ThemeSettingsDto? Settings)> ActivateThemeAsync(
        Guid id, ActivateThemeDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        var theme = await _context.Themes.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct);
        if (theme == null)
        {
            return (false, "Theme not found.", null);
        }

        if (string.IsNullOrWhiteSpace(theme.ConfigJson) || theme.ConfigJson == "{}")
        {
            return (false, "This theme has no published configuration to activate.", null);
        }

        var target = (dto.Target ?? "both").Trim().ToLowerInvariant();
        if (target is not ("website" or "admin" or "both"))
        {
            return (false, "Target must be one of: website, admin, both.", null);
        }

        var settings = await _context.SiteSettings.FirstOrDefaultAsync(s => s.SingletonId == 1, ct);
        if (settings == null)
        {
            return (false, "Site settings singleton not found.", null);
        }

        if (target is "website" or "both")
        {
            settings.WebsiteThemeId = theme.Slug;
        }
        if (target is "admin" or "both")
        {
            settings.AdminThemeId = theme.Slug;
        }

        settings.UpdatedByUserId = actingUserId;
        settings.MarkUpdated();

        await _context.SaveChangesAsync(ct);
        InvalidateThemeCaches();

        return (true, null, MapSettings(settings));
    }

    public async Task<List<ThemeVersionDto>> GetVersionsAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.ThemeVersions
            .AsNoTracking()
            .Where(v => v.ThemeId == id)
            .OrderByDescending(v => v.VersionNumber)
            .Select(v => new ThemeVersionDto(v.Id, v.VersionNumber, v.ConfigJson, v.ChangedBy, v.CreatedAtUtc, v.ChangeDescription))
            .ToListAsync(ct);
    }

    public async Task<(bool Success, string? Error, ThemeDetailDto? Theme)> RollbackThemeAsync(
        Guid id, RollbackThemeDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        var theme = await _context.Themes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (theme == null || theme.IsDeleted)
        {
            return (false, "Theme not found.", null);
        }

        if (theme.IsSystem)
        {
            return (false, "System themes are protected and cannot be rolled back. Duplicate to customize.", null);
        }

        var version = await _context.ThemeVersions
            .FirstOrDefaultAsync(v => v.ThemeId == id && v.VersionNumber == dto.VersionNumber, ct);
        if (version == null)
        {
            return (false, $"Version {dto.VersionNumber} was not found for this theme.", null);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        theme.ConfigJson = StampConfigIdentity(version.ConfigJson, theme.Id, theme.Slug, theme.Name);
        theme.DraftConfigJson = null;
        theme.CurrentVersion += 1;
        theme.UpdatedBy = actingUserId;
        theme.MarkUpdated();

        _context.ThemeVersions.Add(new ThemeVersion
        {
            ThemeId = theme.Id,
            VersionNumber = theme.CurrentVersion,
            ConfigJson = theme.ConfigJson,
            ChangedBy = actingUserId,
            ChangeDescription = $"Rolled back to version {dto.VersionNumber}"
        });

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        InvalidateThemeCaches();
        return (true, null, MapDetail(theme));
    }

    public async Task<(bool Success, string? Error, ThemeDetailDto? Theme)> ImportThemeAsync(
        ImportThemeDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        return await CreateThemeAsync(
            new CreateThemeDto(dto.Name, dto.Slug, dto.Description, dto.ConfigJson),
            actingUserId,
            ct);
    }

    public async Task<string?> ExportThemeAsync(Guid id, CancellationToken ct = default)
    {
        var theme = await _context.Themes.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct);
        return theme?.ConfigJson;
    }

    public async Task<ThemeSettingsDto> GetSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SingletonId == 1, ct)
            ?? throw new InvalidOperationException("SiteSettings singleton row not found in database.");
        return MapSettings(settings);
    }

    public async Task<(bool Success, string? Error, bool Conflict, ThemeSettingsDto? Settings)> UpdateSettingsAsync(
        UpdateThemeSettingsDto dto, Guid actingUserId, CancellationToken ct = default)
    {
        var settings = await _context.SiteSettings.FirstOrDefaultAsync(s => s.SingletonId == 1, ct);
        if (settings == null)
        {
            return (false, "Site settings singleton not found.", false, null);
        }

        if (!string.IsNullOrWhiteSpace(dto.VersionToken))
        {
            try
            {
                _context.Entry(settings).Property(s => s.Version).OriginalValue = Convert.FromBase64String(dto.VersionToken);
            }
            catch (FormatException)
            {
                return (false, "Invalid version token format.", false, null);
            }
        }

        if (dto.WebsiteThemeId != null && dto.WebsiteThemeId.Length > 0 &&
            !await ThemeReferenceExistsAsync(dto.WebsiteThemeId, ct))
        {
            return (false, $"Website theme '{dto.WebsiteThemeId}' does not exist.", false, null);
        }
        if (dto.AdminThemeId != null && dto.AdminThemeId.Length > 0 &&
            !await ThemeReferenceExistsAsync(dto.AdminThemeId, ct))
        {
            return (false, $"Admin theme '{dto.AdminThemeId}' does not exist.", false, null);
        }
        if (dto.FallbackThemeId != null && dto.FallbackThemeId.Length > 0 &&
            !await ThemeReferenceExistsAsync(dto.FallbackThemeId, ct))
        {
            return (false, $"Fallback theme '{dto.FallbackThemeId}' does not exist.", false, null);
        }

        if (dto.GlobalEngineEnabled.HasValue) settings.GlobalThemeEngineEnabled = dto.GlobalEngineEnabled.Value;
        if (dto.WebsiteThemeEnabled.HasValue) settings.WebsiteThemeEnabled = dto.WebsiteThemeEnabled.Value;
        if (dto.AdminThemeEnabled.HasValue) settings.AdminThemeEnabled = dto.AdminThemeEnabled.Value;
        if (dto.WebsiteThemeId != null) settings.WebsiteThemeId = dto.WebsiteThemeId;
        if (dto.AdminThemeId != null) settings.AdminThemeId = dto.AdminThemeId;
        if (dto.FallbackThemeId != null) settings.FallbackThemeId = dto.FallbackThemeId;

        settings.UpdatedByUserId = actingUserId;
        settings.MarkUpdated();

        try
        {
            await _context.SaveChangesAsync(ct);
            InvalidateThemeCaches();
            return (true, null, false, MapSettings(settings));
        }
        catch (DbUpdateConcurrencyException)
        {
            return (false, "Theme settings were modified by another administrator. Refresh and retry.", true, null);
        }
    }

    public async Task<PublicThemeDto> GetPublicThemeAsync(string app, CancellationToken ct = default)
    {
        var normalizedApp = (app ?? "website").Trim().ToLowerInvariant();
        if (normalizedApp is not ("website" or "admin"))
        {
            normalizedApp = "website";
        }

        var settings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SingletonId == 1, ct);

        var engineOn = settings?.GlobalThemeEngineEnabled ?? true;
        var appOn = normalizedApp == "admin"
            ? settings?.AdminThemeEnabled ?? true
            : settings?.WebsiteThemeEnabled ?? true;
        var assignedId = normalizedApp == "admin"
            ? settings?.AdminThemeId
            : settings?.WebsiteThemeId;
        var fallbackId = settings?.FallbackThemeId ?? "cyber-emerald";

        Theme? theme = null;
        var source = "database";

        if (engineOn && appOn && !string.IsNullOrWhiteSpace(assignedId))
        {
            theme = await ResolveThemeReferenceAsync(assignedId!, ct);
        }

        if (theme == null)
        {
            theme = await ResolveThemeReferenceAsync(fallbackId, ct);
            source = "fallback";
        }

        if (theme == null)
        {
            theme = await FindDefaultThemeAsync(ct);
            source = "default";
        }

        if (theme == null)
        {
            using var fallbackDoc = JsonDocument.Parse(FallbackConfigJson);
            return new PublicThemeDto(
                normalizedApp, "cyber-emerald", "Cyber Emerald & Deep Onyx", "cyber-emerald",
                1, fallbackDoc.RootElement.Clone(), "builtin", true);
        }

        var configJson = string.IsNullOrWhiteSpace(theme.ConfigJson) ? FallbackConfigJson : theme.ConfigJson;
        using var doc = JsonDocument.Parse(configJson);
        var root = doc.RootElement.Clone();
        var schemaVersion = root.TryGetProperty("schemaVersion", out var sv) && sv.TryGetInt32(out var v) ? v : 1;

        return new PublicThemeDto(
            normalizedApp,
            theme.Slug,
            theme.Name,
            theme.Slug,
            schemaVersion,
            root,
            source,
            theme.IsDefault);
    }

    private async Task<Theme?> ResolveThemeReferenceAsync(string reference, CancellationToken ct)
    {
        if (Guid.TryParse(reference, out var guid))
        {
            var byId = await _context.Themes.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == guid && !t.IsDeleted, ct);
            if (byId != null) return byId;
        }

        return await _context.Themes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == reference && !t.IsDeleted, ct);
    }

    private async Task<Theme?> FindDefaultThemeAsync(CancellationToken ct)
    {
        var theme = await _context.Themes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.IsDefault && !t.IsDeleted, ct);
        theme ??= await _context.Themes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == "cyber-emerald" && !t.IsDeleted, ct);
        theme ??= await _context.Themes.AsNoTracking()
            .Where(t => t.IsSystem && !t.IsDeleted)
            .OrderBy(t => t.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);
        return theme;
    }

    private async Task<bool> ThemeReferenceExistsAsync(string reference, CancellationToken ct)
    {
        return await ResolveThemeReferenceAsync(reference, ct) != null;
    }

    private static bool IsAssigned(Theme theme, SiteSettings settings)
    {
        var id = theme.Id.ToString();
        return settings.WebsiteThemeId is var w && (w == theme.Slug || w == id)
            || settings.AdminThemeId is var a && (a == theme.Slug || a == id)
            || settings.FallbackThemeId is var f && (f == theme.Slug || f == id);
    }

    private static string? TryReadConfigName(string configJson)
    {
        try
        {
            if (JsonNode.Parse(configJson) is JsonObject node &&
                node["name"] is JsonValue value &&
                value.TryGetValue<string>(out var name) &&
                !string.IsNullOrWhiteSpace(name))
            {
                return name.Trim();
            }
        }
        catch (JsonException)
        {
            // Ignore malformed JSON; validation reports it separately.
        }

        return null;
    }

    private static string StampConfigIdentity(string configJson, Guid id, string slug, string name)
    {
        try
        {
            if (JsonNode.Parse(configJson) is not JsonObject node)
            {
                return configJson;
            }

            node["id"] = id.ToString();
            node["slug"] = slug;
            node["name"] = name;
            node["schemaVersion"] ??= 1;
            return node.ToJsonString();
        }
        catch (JsonException)
        {
            return configJson;
        }
    }

    private static string NormalizeSlug(string value)
    {
        var slug = value.Trim().ToLowerInvariant();
        var builder = new StringBuilder(slug.Length);
        var lastDash = false;
        foreach (var ch in slug)
        {
            if (char.IsLetterOrDigit(ch))
            {
                builder.Append(ch);
                lastDash = false;
            }
            else if (!lastDash && builder.Length > 0)
            {
                builder.Append('-');
                lastDash = true;
            }
        }

        var result = builder.ToString().Trim('-');
        return string.IsNullOrWhiteSpace(result) ? $"theme-{Guid.NewGuid():N}"[..20] : result;
    }

    private static ThemeDetailDto MapDetail(Theme theme) => new(
        theme.Id,
        theme.Name,
        theme.Slug,
        theme.Description,
        theme.ConfigJson,
        theme.DraftConfigJson,
        theme.IsSystem,
        theme.IsDefault,
        theme.IsDeleted,
        theme.CurrentVersion,
        Convert.ToBase64String(theme.Version),
        theme.CreatedAtUtc,
        theme.UpdatedAtUtc);

    private static ThemeVersionDto MapVersion(ThemeVersion version) => new(
        version.Id,
        version.VersionNumber,
        version.ConfigJson,
        version.ChangedBy,
        version.CreatedAtUtc,
        version.ChangeDescription);

    private static ThemeSettingsDto MapSettings(SiteSettings settings) => new(
        settings.GlobalThemeEngineEnabled,
        settings.WebsiteThemeEnabled,
        settings.WebsiteThemeId,
        settings.AdminThemeEnabled,
        settings.AdminThemeId,
        settings.FallbackThemeId,
        Convert.ToBase64String(settings.Version),
        settings.UpdatedAtUtc);

    private void InvalidateThemeCaches()
    {
        _cache.Remove("nexora:theme:website");
        _cache.Remove("nexora:theme:admin");
    }
}
