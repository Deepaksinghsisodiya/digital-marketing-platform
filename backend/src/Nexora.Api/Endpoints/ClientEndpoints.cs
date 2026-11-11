using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Clients.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;

namespace Nexora.Api.Endpoints;

public static class ClientEndpoints
{
    public static void MapClientEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin")
            .WithTags("Clients & CRM")
            .RequireAuthorization();

        // 1. Clients List
        group.MapGet("/clients", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] ClientStatus? status,
            [FromQuery] string? region,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var result = await clientService.GetClientsAsync(
                page ?? 1,
                pageSize ?? 20,
                search,
                status,
                region,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.ClientsView)
        .WithName("GetClients")
        .WithSummary("List clients with pagination, status, and region filters.");

        // 2. Client Detail
        group.MapGet("/clients/{id:guid}", async (
            Guid id,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var client = await clientService.GetClientByIdAsync(id, ct);
            if (client == null) return Results.NotFound(new { error = "Client not found." });
            return Results.Ok(client);
        })
        .RequireAuthorization(Permissions.ClientsView)
        .WithName("GetClientById")
        .WithSummary("Get full client details including contacts, tasks, and activities.");

        // 3. Create Client
        group.MapPost("/clients", async (
            [FromBody] CreateClientRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, clientId, error) = await clientService.CreateClientAsync(request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Created($"/api/v1/admin/clients/{clientId}", new { clientId });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("CreateClient")
        .WithSummary("Create a new client profile.");

        // 4. Update Client
        group.MapPut("/clients/{id:guid}", async (
            Guid id,
            [FromBody] UpdateClientRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await clientService.UpdateClientAsync(id, request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Client updated successfully." });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("UpdateClient")
        .WithSummary("Update client profile information.");

        // 5. Update Client Status
        group.MapPatch("/clients/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateClientStatusRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await clientService.UpdateClientStatusAsync(id, request.Status, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Client status updated." });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("UpdateClientStatus")
        .WithSummary("Update client status (Active, Prospect, Inactive, Churned).");

        // 6. Convert Lead to Client
        group.MapPost("/leads/{id:guid}/convert", async (
            Guid id,
            [FromBody] ConvertLeadToClientRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, clientId, error) = await clientService.ConvertLeadToClientAsync(id, request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { clientId, message = "Lead successfully converted to Client." });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("ConvertLeadToClient")
        .WithSummary("Convert an inbound lead into an active Client account.");

        // 7. Add Contact to Client
        group.MapPost("/clients/{id:guid}/contacts", async (
            Guid id,
            [FromBody] CreateContactRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, contactId, error) = await clientService.AddContactAsync(id, request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Created($"/api/v1/admin/clients/{id}", new { contactId });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("AddContact")
        .WithSummary("Add an additional contact person to a client.");

        // 8. Add Client Activity Note
        group.MapPost("/clients/{id:guid}/activities", async (
            Guid id,
            [FromBody] AddActivityRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await clientService.AddClientActivityAsync(id, request.ActivityType ?? "Note", request.Description, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Activity recorded." });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("AddClientActivity")
        .WithSummary("Log an interaction or note on a client timeline.");

        // 9. Tasks List
        group.MapGet("/tasks", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] TaskItemStatus? status,
            [FromQuery] TaskPriority? priority,
            [FromQuery] Guid? clientId,
            [FromQuery] Guid? leadId,
            [FromQuery] Guid? assignedToUserId,
            [FromQuery] bool? overdueOnly,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var result = await clientService.GetTasksAsync(
                page ?? 1,
                pageSize ?? 30,
                status,
                priority,
                clientId,
                leadId,
                assignedToUserId,
                overdueOnly,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.TasksView)
        .WithName("GetTasks")
        .WithSummary("List follow-up tasks with filter by client, status, priority, and overdue flag.");

        // 10. Create Task
        group.MapPost("/tasks", async (
            [FromBody] CreateTaskRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, taskId, error) = await clientService.CreateTaskAsync(request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Created($"/api/v1/admin/tasks/{taskId}", new { taskId });
        })
        .RequireAuthorization(Permissions.TasksManage)
        .WithName("CreateTask")
        .WithSummary("Create a new task or follow-up reminder.");

        // 11. Update Task
        group.MapPut("/tasks/{id:guid}", async (
            Guid id,
            [FromBody] UpdateTaskRequest request,
            ClaimsPrincipal user,
            IClientService clientService,
            CancellationToken ct) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            _ = Guid.TryParse(userIdStr, out var userId);

            var (success, error) = await clientService.UpdateTaskAsync(id, request, userId, ct);
            if (!success) return Results.BadRequest(new { error });

            return Results.Ok(new { message = "Task updated successfully." });
        })
        .RequireAuthorization(Permissions.TasksManage)
        .WithName("UpdateTask")
        .WithSummary("Update task status, due date, or priority.");
    }
}

public record UpdateClientStatusRequest(ClientStatus Status);
public record AddActivityRequest(string? ActivityType, string Description);

