using Microsoft.AspNetCore.Mvc;
using Nexora.Application.CMS.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;

namespace Nexora.Api.Endpoints;

public static class MenuEndpoints
{
    public static void MapMenuEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Public Menu Intake
        var publicGroup = app.MapGroup("/api/v1/public/menus")
            .WithTags("Public Navigation Menus");

        publicGroup.MapGet("/{key}", async (
            string key,
            [FromQuery] string? region,
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var menu = await menuService.GetMenuByKeyAsync(key, region, ct);
            if (menu == null)
            {
                return Results.NotFound(new { error = $"Menu with key '{key}' was not found." });
            }
            return Results.Ok(menu);
        })
        .WithName("GetPublicMenuByKey")
        .WithSummary("Retrieve hierarchical navigation menu by key (e.g. header, footer) and region.");

        // 2. Admin Menu CRUD
        var adminGroup = app.MapGroup("/api/v1/admin/menus")
            .WithTags("Navigation Menus (Admin)")
            .RequireAuthorization();

        adminGroup.MapGet("/", async (
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var menus = await menuService.GetMenusAsync(ct);
            return Results.Ok(menus);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetAdminMenus")
        .WithSummary("List all navigation menus.");

        adminGroup.MapGet("/{id:guid}", async (
            Guid id,
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var menu = await menuService.GetMenuByIdAsync(id, ct);
            if (menu == null) return Results.NotFound(new { error = "Menu not found." });
            return Results.Ok(menu);
        })
        .RequireAuthorization(Permissions.PagesView)
        .WithName("GetAdminMenuById")
        .WithSummary("Get navigation menu tree by ID.");

        adminGroup.MapPost("/", async (
            [FromBody] SaveMenuRequest request,
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var (success, error, result) = await menuService.SaveMenuAsync(request, null, ct);
            if (!success) return Results.BadRequest(new { error });
            return Results.Created($"/api/v1/admin/menus/{result!.Id}", result);
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("CreateMenu")
        .WithSummary("Create a new hierarchical navigation menu.");

        adminGroup.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] SaveMenuRequest request,
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var (success, error, result) = await menuService.SaveMenuAsync(request, id, ct);
            if (!success)
            {
                if (error != null && error.Contains("not found", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.NotFound(new { error });
                }
                return Results.BadRequest(new { error });
            }
            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("UpdateMenu")
        .WithSummary("Update navigation menu and items tree.");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            IMenuService menuService,
            CancellationToken ct) =>
        {
            var deleted = await menuService.DeleteMenuAsync(id, ct);
            if (!deleted) return Results.NotFound(new { error = "Menu not found." });
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.PagesEdit)
        .WithName("DeleteMenu")
        .WithSummary("Delete navigation menu and associated items.");
    }
}

