using Microsoft.EntityFrameworkCore;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Api.Endpoints;

public record PipelineStageDto(
    Guid Id,
    string Category,
    string StageKey,
    int Value,
    string DisplayName,
    string ColorHex,
    string? BadgeClass,
    int OrderIndex,
    bool IsSystem,
    bool IsActive);

public record CreatePipelineStageDto(
    string Category,
    string StageKey,
    string DisplayName,
    string ColorHex,
    string? BadgeClass,
    int OrderIndex);

public record UpdatePipelineStageDto(
    string DisplayName,
    string ColorHex,
    string? BadgeClass,
    int OrderIndex,
    bool IsActive);

public record CountryRegionDto(
    Guid Id,
    string Code,
    string Name,
    string CurrencyCode,
    string CurrencySymbol,
    string FlagEmoji,
    string PhonePrefix,
    string TaxLabel,
    bool IsDefault,
    bool IsEnabled,
    int OrderIndex);

public record CreateCountryRegionDto(
    string Code,
    string Name,
    string CurrencyCode,
    string CurrencySymbol,
    string FlagEmoji,
    string PhonePrefix,
    string TaxLabel,
    bool IsDefault,
    int OrderIndex);

public record TimezoneDto(
    string Id,
    string DisplayName,
    string BaseUtcOffset,
    double OffsetHours);

public record CurrencyDto(
    string Code,
    string Name,
    string Symbol,
    string CountryName);

public record UpdateCountryRegionDto(
    string Name,
    string CurrencyCode,
    string CurrencySymbol,
    string FlagEmoji,
    string PhonePrefix,
    string TaxLabel,
    bool IsDefault,
    bool IsEnabled,
    int OrderIndex);

public static class LookupEndpoints
{
    public static IEndpointRouteBuilder MapLookupEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Public / Authenticated Lookups
        var lookupGroup = app.MapGroup("/api/v1/lookups")
            .WithTags("Lookups");

        // GET pipeline stages (optionally filtered by category: Lead, Client, Task)
        lookupGroup.MapGet("/pipeline-stages", async (
            string? category,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var query = db.PipelineStages.AsNoTracking().Where(s => s.IsActive);
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(s => s.Category == category);
            }

            var items = await query
                .OrderBy(s => s.Category)
                .ThenBy(s => s.OrderIndex)
                .Select(s => new PipelineStageDto(
                    s.Id,
                    s.Category,
                    s.StageKey,
                    s.Value,
                    s.DisplayName,
                    s.ColorHex,
                    s.BadgeClass,
                    s.OrderIndex,
                    s.IsSystem,
                    s.IsActive))
                .ToListAsync(ct);

            return Results.Ok(items);
        })
        .WithName("GetPipelineStages")
        .WithSummary("Retrieve active pipeline stages for Lead, Client, or Task.");

        // GET supported country regions
        lookupGroup.MapGet("/regions", async (
            AppDbContext db,
            CancellationToken ct) =>
        {
            var items = await db.CountryRegions
                .AsNoTracking()
                .Where(r => r.IsEnabled)
                .OrderBy(r => r.OrderIndex)
                .Select(r => new CountryRegionDto(
                    r.Id,
                    r.Code,
                    r.Name,
                    r.CurrencyCode,
                    r.CurrencySymbol,
                    r.FlagEmoji,
                    r.PhonePrefix,
                    r.TaxLabel,
                    r.IsDefault,
                    r.IsEnabled,
                    r.OrderIndex))
                .ToListAsync(ct);

            return Results.Ok(items);
        })
        .WithName("GetCountryRegions")
        .WithSummary("Retrieve enabled global country regions, currencies, and formats.");

        // GET dynamic global timezones from system
        lookupGroup.MapGet("/timezones", () =>
        {
            var timezones = TimeZoneInfo.GetSystemTimeZones()
                .OrderBy(tz => tz.BaseUtcOffset)
                .Select(tz => new TimezoneDto(
                    tz.Id,
                    tz.DisplayName,
                    (tz.BaseUtcOffset >= TimeSpan.Zero ? "+" : "-") + tz.BaseUtcOffset.ToString(@"hh\:mm"),
                    tz.BaseUtcOffset.TotalHours
                ))
                .ToList();

            return Results.Ok(timezones);
        })
        .WithName("GetSystemTimezones")
        .WithSummary("Retrieve all global standard timezones from system.");

        // GET dynamic global currencies from standard RegionInfo / CultureInfo
        lookupGroup.MapGet("/currencies", () =>
        {
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var currencies = new List<CurrencyDto>();

            foreach (var culture in System.Globalization.CultureInfo.GetCultures(System.Globalization.CultureTypes.SpecificCultures))
            {
                try
                {
                    var region = new System.Globalization.RegionInfo(culture.Name);
                    if (seen.Add(region.ISOCurrencySymbol))
                    {
                        currencies.Add(new CurrencyDto(
                            region.ISOCurrencySymbol,
                            region.CurrencyEnglishName,
                            region.CurrencySymbol,
                            region.EnglishName
                        ));
                    }
                }
                catch
                {
                    // Skip cultures without standard regions
                }
            }

            var ordered = currencies.OrderBy(c => c.Code).ToList();
            return Results.Ok(ordered);
        })
        .WithName("GetCurrencies")
        .WithSummary("Retrieve dynamic global currencies from standard international cultures.");

        // 2. Admin Management Endpoints
        var adminGroup = app.MapGroup("/api/v1/admin/lookups")
            .RequireAuthorization(Permissions.SettingsView)
            .WithTags("Lookups Admin");

        // GET all stages including inactive
        adminGroup.MapGet("/pipeline-stages", async (
            string? category,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var query = db.PipelineStages.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(s => s.Category == category);
            }

            var items = await query
                .OrderBy(s => s.Category)
                .ThenBy(s => s.OrderIndex)
                .Select(s => new PipelineStageDto(
                    s.Id,
                    s.Category,
                    s.StageKey,
                    s.Value,
                    s.DisplayName,
                    s.ColorHex,
                    s.BadgeClass,
                    s.OrderIndex,
                    s.IsSystem,
                    s.IsActive))
                .ToListAsync(ct);

            return Results.Ok(items);
        })
        .WithName("AdminGetPipelineStages");

        // POST create stage
        adminGroup.MapPost("/pipeline-stages", async (
            CreatePipelineStageDto dto,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(dto.DisplayName) || string.IsNullOrWhiteSpace(dto.StageKey))
            {
                return Results.BadRequest(new { error = "DisplayName and StageKey are required." });
            }

            var existingMax = await db.PipelineStages
                .Where(s => s.Category == dto.Category)
                .Select(s => (int?)s.Value)
                .MaxAsync(ct) ?? 0;

            var stage = new PipelineStage
            {
                Category = dto.Category,
                StageKey = dto.StageKey.Trim().ToLowerInvariant(),
                Value = existingMax + 1,
                DisplayName = dto.DisplayName.Trim(),
                ColorHex = string.IsNullOrWhiteSpace(dto.ColorHex) ? "#3b82f6" : dto.ColorHex.Trim(),
                BadgeClass = dto.BadgeClass,
                OrderIndex = dto.OrderIndex,
                IsSystem = false,
                IsActive = true
            };

            db.PipelineStages.Add(stage);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/v1/lookups/pipeline-stages/{stage.Id}", new PipelineStageDto(
                stage.Id,
                stage.Category,
                stage.StageKey,
                stage.Value,
                stage.DisplayName,
                stage.ColorHex,
                stage.BadgeClass,
                stage.OrderIndex,
                stage.IsSystem,
                stage.IsActive));
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("AdminCreatePipelineStage");

        // PATCH update stage
        adminGroup.MapPatch("/pipeline-stages/{id:guid}", async (
            Guid id,
            UpdatePipelineStageDto dto,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var stage = await db.PipelineStages.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (stage == null) return Results.NotFound();

            stage.DisplayName = dto.DisplayName.Trim();
            stage.ColorHex = dto.ColorHex.Trim();
            stage.BadgeClass = dto.BadgeClass;
            stage.OrderIndex = dto.OrderIndex;
            stage.IsActive = dto.IsActive;
            stage.UpdatedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            return Results.Ok(new PipelineStageDto(
                stage.Id,
                stage.Category,
                stage.StageKey,
                stage.Value,
                stage.DisplayName,
                stage.ColorHex,
                stage.BadgeClass,
                stage.OrderIndex,
                stage.IsSystem,
                stage.IsActive));
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("AdminUpdatePipelineStage");

        // GET all regions (including disabled)
        adminGroup.MapGet("/regions", async (
            AppDbContext db,
            CancellationToken ct) =>
        {
            var items = await db.CountryRegions
                .AsNoTracking()
                .OrderBy(r => r.OrderIndex)
                .Select(r => new CountryRegionDto(
                    r.Id,
                    r.Code,
                    r.Name,
                    r.CurrencyCode,
                    r.CurrencySymbol,
                    r.FlagEmoji,
                    r.PhonePrefix,
                    r.TaxLabel,
                    r.IsDefault,
                    r.IsEnabled,
                    r.OrderIndex))
                .ToListAsync(ct);

            return Results.Ok(items);
        })
        .WithName("AdminGetCountryRegions");

        // POST create country region
        adminGroup.MapPost("/regions", async (
            CreateCountryRegionDto dto,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var upperCode = dto.Code.Trim().ToUpperInvariant();
            if (await db.CountryRegions.AnyAsync(r => r.Code == upperCode, ct))
            {
                return Results.BadRequest(new { error = $"Region code '{upperCode}' already exists." });
            }

            var region = new CountryRegion
            {
                Code = upperCode,
                Name = dto.Name.Trim(),
                CurrencyCode = dto.CurrencyCode.Trim().ToUpperInvariant(),
                CurrencySymbol = dto.CurrencySymbol.Trim(),
                FlagEmoji = dto.FlagEmoji.Trim(),
                PhonePrefix = dto.PhonePrefix.Trim(),
                TaxLabel = dto.TaxLabel.Trim(),
                IsDefault = dto.IsDefault,
                IsEnabled = true,
                OrderIndex = dto.OrderIndex
            };

            db.CountryRegions.Add(region);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/v1/admin/lookups/regions/{region.Id}", new CountryRegionDto(
                region.Id,
                region.Code,
                region.Name,
                region.CurrencyCode,
                region.CurrencySymbol,
                region.FlagEmoji,
                region.PhonePrefix,
                region.TaxLabel,
                region.IsDefault,
                region.IsEnabled,
                region.OrderIndex));
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("AdminCreateCountryRegion");

        // PATCH update region
        adminGroup.MapPatch("/regions/{id:guid}", async (
            Guid id,
            UpdateCountryRegionDto dto,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var region = await db.CountryRegions.FirstOrDefaultAsync(r => r.Id == id, ct);
            if (region == null) return Results.NotFound();

            region.Name = dto.Name.Trim();
            region.CurrencyCode = dto.CurrencyCode.Trim().ToUpperInvariant();
            region.CurrencySymbol = dto.CurrencySymbol.Trim();
            region.FlagEmoji = dto.FlagEmoji.Trim();
            region.PhonePrefix = dto.PhonePrefix.Trim();
            region.TaxLabel = dto.TaxLabel.Trim();
            region.IsDefault = dto.IsDefault;
            region.IsEnabled = dto.IsEnabled;
            region.OrderIndex = dto.OrderIndex;
            region.UpdatedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            return Results.Ok(new CountryRegionDto(
                region.Id,
                region.Code,
                region.Name,
                region.CurrencyCode,
                region.CurrencySymbol,
                region.FlagEmoji,
                region.PhonePrefix,
                region.TaxLabel,
                region.IsDefault,
                region.IsEnabled,
                region.OrderIndex));
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("AdminUpdateCountryRegion");

        return app;
    }
}

