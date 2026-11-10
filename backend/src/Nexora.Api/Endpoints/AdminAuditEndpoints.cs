using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Models;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Api.Endpoints;

public static class AdminAuditEndpoints
{
    public static IEndpointRouteBuilder MapAdminAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/audit-logs")
            .RequireAuthorization(Permissions.AuditView)
            .WithTags("Audit");

        group.MapGet("/", async (
            [FromQuery] int page,
            [FromQuery] int pageSize,
            [FromQuery] string? action,
            [FromQuery] string? resourceType,
            [FromQuery] string? search,
            [FromQuery] DateTime? fromUtc,
            [FromQuery] DateTime? toUtc,
            AppDbContext context,
            CancellationToken ct) =>
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

            var query = context.AuditLogs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(action))
            {
                query = query.Where(a => a.Action == action);
            }

            if (!string.IsNullOrWhiteSpace(resourceType))
            {
                query = query.Where(a => a.ResourceType == resourceType);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(a => (a.ActorEmail != null && a.ActorEmail.ToLower().Contains(s)) ||
                                         (a.ResourceId != null && a.ResourceId.ToLower().Contains(s)) ||
                                         a.Action.ToLower().Contains(s));
            }

            if (fromUtc.HasValue)
            {
                query = query.Where(a => a.TimestampUtc >= fromUtc.Value);
            }

            if (toUtc.HasValue)
            {
                query = query.Where(a => a.TimestampUtc <= toUtc.Value);
            }

            var total = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(a => a.TimestampUtc)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return Results.Ok(new PaginatedResult<AuditLog>(items, total, page, pageSize));
        })
        .WithName("GetAuditLogs")
        .WithSummary("Retrieve append-only audit trail logs with filtering.");

        return app;
    }
}

