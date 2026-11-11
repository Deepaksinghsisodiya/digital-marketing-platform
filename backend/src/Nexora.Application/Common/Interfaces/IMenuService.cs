using Nexora.Application.CMS.DTOs;

namespace Nexora.Application.Common.Interfaces;

public interface IMenuService
{
    Task<IReadOnlyList<NavigationMenuDto>> GetMenusAsync(CancellationToken ct = default);
    Task<NavigationMenuDto?> GetMenuByIdAsync(Guid id, CancellationToken ct = default);
    Task<NavigationMenuDto?> GetMenuByKeyAsync(string key, string? regionCode = null, CancellationToken ct = default);
    Task<(bool Success, string? Error, NavigationMenuDto? Result)> SaveMenuAsync(SaveMenuRequest request, Guid? id = null, CancellationToken ct = default);
    Task<bool> DeleteMenuAsync(Guid id, CancellationToken ct = default);
}

