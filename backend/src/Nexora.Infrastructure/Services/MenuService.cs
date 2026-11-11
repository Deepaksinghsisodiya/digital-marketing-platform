using Microsoft.EntityFrameworkCore;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class MenuService : IMenuService
{
    private readonly AppDbContext _context;

    public MenuService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NavigationMenuDto>> GetMenusAsync(CancellationToken ct = default)
    {
        var menus = await _context.NavigationMenus
            .Include(m => m.Items)
            .AsNoTracking()
            .OrderBy(m => m.Key)
            .ToListAsync(ct);

        return menus.Select(MapToDto).ToList();
    }

    public async Task<NavigationMenuDto?> GetMenuByIdAsync(Guid id, CancellationToken ct = default)
    {
        var m = await _context.NavigationMenus
            .Include(m => m.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return m != null ? MapToDto(m) : null;
    }

    public async Task<NavigationMenuDto?> GetMenuByKeyAsync(string key, string? regionCode = null, CancellationToken ct = default)
    {
        var normKey = key.Trim().ToLowerInvariant();

        // 1. Try region-specific menu first if regionCode provided
        if (!string.IsNullOrWhiteSpace(regionCode))
        {
            var regionMenu = await _context.NavigationMenus
                .Include(m => m.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Key == normKey && m.RegionCode == regionCode.Trim().ToUpperInvariant(), ct);

            if (regionMenu != null) return MapToDto(regionMenu);
        }

        // 2. Fall back to global (null RegionCode) menu
        var globalMenu = await _context.NavigationMenus
            .Include(m => m.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Key == normKey && (m.RegionCode == null || m.RegionCode == ""), ct);

        return globalMenu != null ? MapToDto(globalMenu) : null;
    }

    public async Task<(bool Success, string? Error, NavigationMenuDto? Result)> SaveMenuAsync(
        SaveMenuRequest request,
        Guid? id = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Key))
        {
            return (false, "Menu Key is required.", null);
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return (false, "Menu Title is required.", null);
        }

        var normKey = request.Key.Trim().ToLowerInvariant();
        var region = string.IsNullOrWhiteSpace(request.RegionCode) ? null : request.RegionCode.Trim().ToUpperInvariant();

        NavigationMenu? menu;
        if (id.HasValue && id.Value != Guid.Empty)
        {
            menu = await _context.NavigationMenus
                .Include(m => m.Items)
                .FirstOrDefaultAsync(m => m.Id == id.Value, ct);

            if (menu == null)
            {
                return (false, "Navigation menu not found.", null);
            }

            menu.Key = normKey;
            menu.Title = request.Title.Trim();
            menu.RegionCode = region;
            menu.MarkUpdated();

            // Clear old items
            _context.NavigationMenuItems.RemoveRange(menu.Items);
            menu.Items.Clear();
        }
        else
        {
            var exists = await _context.NavigationMenus.AnyAsync(m => m.Key == normKey && m.RegionCode == region, ct);
            if (exists)
            {
                return (false, $"A menu with key '{normKey}' already exists for region '{region ?? "global"}'.", null);
            }

            menu = new NavigationMenu
            {
                Key = normKey,
                Title = request.Title.Trim(),
                RegionCode = region
            };
            _context.NavigationMenus.Add(menu);
        }

        // Add items if supplied
        if (request.Items != null && request.Items.Count > 0)
        {
            var itemMap = new Dictionary<SaveMenuItemRequest, NavigationMenuItem>();

            foreach (var itemReq in request.Items)
            {
                var item = new NavigationMenuItem
                {
                    MenuId = menu.Id,
                    Label = itemReq.Label.Trim(),
                    Url = itemReq.Url.Trim(),
                    DisplayOrder = itemReq.DisplayOrder,
                    ParentItemId = itemReq.ParentItemId
                };
                menu.Items.Add(item);
            }
        }

        await _context.SaveChangesAsync(ct);
        return (true, null, MapToDto(menu));
    }

    public async Task<bool> DeleteMenuAsync(Guid id, CancellationToken ct = default)
    {
        var menu = await _context.NavigationMenus
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

        if (menu == null) return false;

        _context.NavigationMenus.Remove(menu);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    private static NavigationMenuDto MapToDto(NavigationMenu menu)
    {
        var lookup = menu.Items
            .OrderBy(i => i.DisplayOrder)
            .ToLookup(i => i.ParentItemId);

        List<NavigationMenuItemDto> BuildTree(Guid? parentId)
        {
            return lookup[parentId].Select(i => new NavigationMenuItemDto(
                i.Id,
                i.Label,
                i.Url,
                i.DisplayOrder,
                i.ParentItemId,
                BuildTree(i.Id)
            )).ToList();
        }

        var rootItems = BuildTree(null);

        return new NavigationMenuDto(
            menu.Id,
            menu.Key,
            menu.Title,
            menu.RegionCode,
            rootItems);
    }
}

