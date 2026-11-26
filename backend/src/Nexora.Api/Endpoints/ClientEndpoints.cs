using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Clients.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

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

        // 12. Task Quick Status & Delete (Kanban Support)
        group.MapPatch("/tasks/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateTaskStatusRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var task = await db.TaskItems.FirstOrDefaultAsync(t => t.Id == id, ct);
            if (task == null) return Results.NotFound(new { error = "Task not found." });
            task.UpdateStatus(request.Status);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { task.Id, task.Status });
        })
        .RequireAuthorization(Permissions.TasksManage)
        .WithName("PatchTaskStatus");

        group.MapDelete("/tasks/{id:guid}", async (
            Guid id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var task = await db.TaskItems.FirstOrDefaultAsync(t => t.Id == id, ct);
            if (task == null) return Results.NotFound(new { error = "Task not found." });
            db.TaskItems.Remove(task);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.TasksManage)
        .WithName("DeleteTask");

        // 13. Client Invoices (Billing)
        group.MapGet("/clients/{id:guid}/invoices", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var items = await db.ClientInvoices
                .AsNoTracking()
                .Where(i => i.ClientId == id)
                .OrderByDescending(i => i.CreatedAtUtc)
                .ToListAsync(ct);
            return Results.Ok(items);
        })
        .RequireAuthorization(Permissions.ClientsView)
        .WithName("GetClientInvoices");

        group.MapPost("/clients/{id:guid}/invoices", async (
            Guid id,
            [FromBody] CreateClientInvoiceRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var clientExists = await db.Clients.AnyAsync(c => c.Id == id, ct);
            if (!clientExists) return Results.NotFound(new { error = "Client not found." });

            var invoice = new ClientInvoice
            {
                ClientId = id,
                InvoiceNumber = string.IsNullOrWhiteSpace(request.InvoiceNumber)
                    ? $"INV-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}"
                    : request.InvoiceNumber.Trim(),
                Amount = request.Amount,
                Currency = string.IsNullOrWhiteSpace(request.Currency) ? "INR" : request.Currency.Trim().ToUpperInvariant(),
                Status = request.Status ?? InvoiceStatus.Draft,
                DueDateUtc = request.DueDateUtc ?? DateTime.UtcNow.AddDays(14),
                PaidAtUtc = request.Status == InvoiceStatus.Paid ? DateTime.UtcNow : null,
                Description = request.Description?.Trim()
            };

            db.ClientInvoices.Add(invoice);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/v1/admin/clients/{id}/invoices/{invoice.Id}", invoice);
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("CreateClientInvoice");

        group.MapPatch("/clients/invoices/{invoiceId:guid}", async (
            Guid invoiceId,
            [FromBody] UpdateClientInvoiceStatusRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var invoice = await db.ClientInvoices.FirstOrDefaultAsync(i => i.Id == invoiceId, ct);
            if (invoice == null) return Results.NotFound(new { error = "Invoice not found." });

            invoice.Status = request.Status;
            invoice.PaidAtUtc = request.Status == InvoiceStatus.Paid ? (invoice.PaidAtUtc ?? DateTime.UtcNow) : null;
            invoice.MarkUpdated();
            await db.SaveChangesAsync(ct);
            return Results.Ok(invoice);
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("UpdateClientInvoiceStatus");

        group.MapDelete("/clients/invoices/{invoiceId:guid}", async (
            Guid invoiceId,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var invoice = await db.ClientInvoices.FirstOrDefaultAsync(i => i.Id == invoiceId, ct);
            if (invoice == null) return Results.NotFound(new { error = "Invoice not found." });
            db.ClientInvoices.Remove(invoice);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("DeleteClientInvoice");

        // 14. Client Milestones
        group.MapGet("/clients/{id:guid}/milestones", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var items = await db.ClientMilestones
                .AsNoTracking()
                .Where(m => m.ClientId == id)
                .OrderBy(m => m.DueDateUtc ?? m.CreatedAtUtc)
                .ToListAsync(ct);
            return Results.Ok(items);
        })
        .RequireAuthorization(Permissions.ClientsView)
        .WithName("GetClientMilestones");

        group.MapPost("/clients/{id:guid}/milestones", async (
            Guid id,
            [FromBody] CreateClientMilestoneRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Milestone title is required." });

            var milestone = new ClientMilestone
            {
                ClientId = id,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
                Status = request.Status ?? MilestoneStatus.Pending,
                DueDateUtc = request.DueDateUtc
            };
            db.ClientMilestones.Add(milestone);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/v1/admin/clients/{id}/milestones/{milestone.Id}", milestone);
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("CreateClientMilestone");

        group.MapPatch("/clients/milestones/{milestoneId:guid}", async (
            Guid milestoneId,
            [FromBody] UpdateClientMilestoneStatusRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var milestone = await db.ClientMilestones.FirstOrDefaultAsync(m => m.Id == milestoneId, ct);
            if (milestone == null) return Results.NotFound(new { error = "Milestone not found." });

            milestone.Status = request.Status;
            milestone.CompletedAtUtc = request.Status == MilestoneStatus.Completed ? DateTime.UtcNow : null;
            milestone.MarkUpdated();
            await db.SaveChangesAsync(ct);
            return Results.Ok(milestone);
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("UpdateClientMilestoneStatus");

        group.MapDelete("/clients/milestones/{milestoneId:guid}", async (
            Guid milestoneId,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var milestone = await db.ClientMilestones.FirstOrDefaultAsync(m => m.Id == milestoneId, ct);
            if (milestone == null) return Results.NotFound(new { error = "Milestone not found." });
            db.ClientMilestones.Remove(milestone);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("DeleteClientMilestone");

        // 15. Client Documents
        group.MapGet("/clients/{id:guid}/documents", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var items = await db.ClientDocuments
                .AsNoTracking()
                .Where(d => d.ClientId == id)
                .OrderByDescending(d => d.CreatedAtUtc)
                .ToListAsync(ct);
            return Results.Ok(items);
        })
        .RequireAuthorization(Permissions.ClientsView)
        .WithName("GetClientDocuments");

        group.MapPost("/clients/{id:guid}/documents", async (
            Guid id,
            [FromBody] CreateClientDocumentRequest request,
            ClaimsPrincipal user,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.FileUrl))
                return Results.BadRequest(new { error = "Document title and FileUrl are required." });

            _ = Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var doc = new ClientDocument
            {
                ClientId = id,
                Title = request.Title.Trim(),
                FileUrl = request.FileUrl.Trim(),
                Category = request.Category?.Trim(),
                FileSizeBytes = request.FileSizeBytes ?? 0,
                UploadedByUserId = userId == Guid.Empty ? null : userId
            };
            db.ClientDocuments.Add(doc);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/v1/admin/clients/{id}/documents/{doc.Id}", doc);
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("CreateClientDocument");

        group.MapDelete("/clients/documents/{docId:guid}", async (
            Guid docId,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var doc = await db.ClientDocuments.FirstOrDefaultAsync(d => d.Id == docId, ct);
            if (doc == null) return Results.NotFound(new { error = "Document not found." });
            db.ClientDocuments.Remove(doc);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("DeleteClientDocument");

        // 16. Client Portal Link Generation & Public Portal View
        group.MapPost("/clients/{id:guid}/portal-link", async (
            Guid id,
            [FromBody] ToggleClientPortalRequest? request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var client = await db.Clients.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (client == null) return Results.NotFound(new { error = "Client not found." });

            var enable = request?.Enabled ?? true;
            var token = enable
                ? (string.IsNullOrWhiteSpace(client.PortalToken) || request?.Regenerate == true
                    ? Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant()
                    : client.PortalToken)
                : client.PortalToken;

            client.SetPortalAccess(token, enable);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new
            {
                client.Id,
                client.PortalEnabled,
                client.PortalToken,
                PortalPath = client.PortalEnabled && !string.IsNullOrWhiteSpace(client.PortalToken)
                    ? $"/client-portal/{client.PortalToken}"
                    : null
            });
        })
        .RequireAuthorization(Permissions.ClientsManage)
        .WithName("GenerateClientPortalLink");

        app.MapGet("/api/v1/public/client-portal/{token}", async (
            string token,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(token)) return Results.NotFound();

            var client = await db.Clients
                .AsNoTracking()
                .Include(c => c.Milestones)
                .Include(c => c.Invoices)
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.PortalEnabled && c.PortalToken == token, ct);

            if (client == null) return Results.NotFound(new { error = "Client portal link is invalid or disabled." });

            return Results.Ok(new
            {
                client.Name,
                client.Industry,
                client.Status,
                Milestones = client.Milestones.OrderBy(m => m.DueDateUtc).Select(m => new
                {
                    m.Id, m.Title, m.Description, m.Status, m.DueDateUtc, m.CompletedAtUtc
                }),
                Invoices = client.Invoices.OrderByDescending(i => i.CreatedAtUtc).Select(i => new
                {
                    i.Id, i.InvoiceNumber, i.Amount, i.Currency, i.Status, i.DueDateUtc, i.PaidAtUtc, i.Description
                }),
                Documents = client.Documents.OrderByDescending(d => d.CreatedAtUtc).Select(d => new
                {
                    d.Id, d.Title, d.FileUrl, d.Category, d.CreatedAtUtc
                })
            });
        })
        .AllowAnonymous()
        .WithTags("Client Portal (Public)")
        .WithName("GetPublicClientPortal");
    }
}

public record UpdateClientStatusRequest(ClientStatus Status);
public record AddActivityRequest(string? ActivityType, string Description);
public record UpdateTaskStatusRequest(TaskItemStatus Status);
public record CreateClientInvoiceRequest(string? InvoiceNumber, decimal Amount, string? Currency, InvoiceStatus? Status, DateTime? DueDateUtc, string? Description);
public record UpdateClientInvoiceStatusRequest(InvoiceStatus Status);
public record CreateClientMilestoneRequest(string Title, string? Description, MilestoneStatus? Status, DateTime? DueDateUtc);
public record UpdateClientMilestoneStatusRequest(MilestoneStatus Status);
public record CreateClientDocumentRequest(string Title, string FileUrl, string? Category, long? FileSizeBytes);
public record ToggleClientPortalRequest(bool? Enabled, bool? Regenerate);

