using Microsoft.EntityFrameworkCore;
using Nexora.Application.Clients.DTOs;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public ClientService(AppDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<PaginatedResult<ClientSummaryDto>> GetClientsAsync(
        int page,
        int pageSize,
        string? search,
        ClientStatus? status,
        string? region,
        CancellationToken ct = default)
    {
        var query = _context.Clients.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(c =>
                c.Name.Contains(s) ||
                c.PrimaryContactEmail.Contains(s) ||
                (c.Industry != null && c.Industry.Contains(s)));
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(region))
        {
            var r = region.Trim().ToLowerInvariant();
            query = query.Where(c => c.Region == r);
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClientSummaryDto(
                c.Id,
                c.Name,
                c.PrimaryContactEmail,
                c.PrimaryContactPhone,
                c.Industry,
                c.Region,
                c.Status,
                c.Tasks.Count(t => t.Status != TaskItemStatus.Completed && t.Status != TaskItemStatus.Cancelled),
                c.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<ClientSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<ClientDetailDto?> GetClientByIdAsync(Guid id, CancellationToken ct = default)
    {
        var client = await _context.Clients
            .AsNoTracking()
            .Include(c => c.Contacts)
            .Include(c => c.Tasks)
            .Include(c => c.Activities)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (client == null) return null;

        var contacts = client.Contacts
            .OrderByDescending(con => con.IsPrimary)
            .ThenBy(con => con.FullName)
            .Select(con => new ContactDto(
                con.Id,
                con.ClientId,
                con.FullName,
                con.Email,
                con.Phone,
                con.Title,
                con.IsPrimary,
                con.CreatedAtUtc))
            .ToList();

        var tasks = client.Tasks
            .OrderBy(t => t.Status == TaskItemStatus.Completed)
            .ThenBy(t => t.DueDateUtc)
            .Select(t => new TaskItemDto(
                t.Id,
                t.Title,
                t.Description,
                t.DueDateUtc,
                t.Priority,
                t.Status,
                t.ClientId,
                client.Name,
                t.LeadId,
                t.AssignedToUserId,
                t.CompletedAtUtc,
                t.CreatedAtUtc))
            .ToList();

        var activities = client.Activities
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new ClientActivityDto(
                a.Id,
                a.ClientId,
                a.ActivityType,
                a.Description,
                a.ActorUserId,
                a.CreatedAtUtc))
            .ToList();

        return new ClientDetailDto(
            client.Id,
            client.Name,
            client.Website,
            client.Industry,
            client.Region,
            client.Status,
            client.PrimaryContactEmail,
            client.PrimaryContactPhone,
            client.ConvertedFromLeadId,
            client.BillingAddress,
            client.TaxId,
            client.Notes,
            client.CreatedAtUtc,
            client.UpdatedAtUtc,
            contacts,
            tasks,
            activities);
    }

    public async Task<(bool Success, Guid? ClientId, string? Error)> CreateClientAsync(
        CreateClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return (false, null, "Client name is required.");

        if (string.IsNullOrWhiteSpace(request.PrimaryContactEmail))
            return (false, null, "Primary contact email is required.");

        var client = new Client(
            name: request.Name.Trim(),
            primaryContactEmail: request.PrimaryContactEmail.Trim().ToLowerInvariant(),
            primaryContactPhone: request.PrimaryContactPhone?.Trim(),
            website: request.Website?.Trim(),
            industry: request.Industry?.Trim(),
            region: request.Region ?? "in",
            billingAddress: request.BillingAddress?.Trim(),
            taxId: request.TaxId?.Trim(),
            notes: request.Notes?.Trim());

        var primaryContact = new Contact(
            clientId: client.Id,
            fullName: request.Name.Trim(),
            email: request.PrimaryContactEmail.Trim().ToLowerInvariant(),
            phone: request.PrimaryContactPhone?.Trim(),
            title: "Primary Contact",
            isPrimary: true);

        var activity = new ClientActivity(
            clientId: client.Id,
            activityType: "Created",
            description: "Client account created manually.",
            actorUserId: actorUserId);

        _context.Clients.Add(client);
        _context.Contacts.Add(primaryContact);
        _context.ClientActivities.Add(activity);

        // Enqueue automated welcome onboarding email to Outbox
        var outboxPayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            clientId = client.Id,
            clientName = client.Name,
            contactEmail = client.PrimaryContactEmail,
            industry = client.Industry,
            region = client.Region
        });
        _context.OutboxMessages.Add(new OutboxMessage("ClientCreated", outboxPayload));

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Client.Created",
            resourceType: "Client",
            resourceId: client.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["name"] = client.Name, ["region"] = client.Region },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, client.Id, null);
    }

    public async Task<(bool Success, string? Error)> UpdateClientAsync(
        Guid id,
        UpdateClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (client == null) return (false, "Client not found.");

        client.UpdateProfile(
            request.Name.Trim(),
            request.Website?.Trim(),
            request.Industry?.Trim(),
            request.Region,
            request.BillingAddress?.Trim(),
            request.TaxId?.Trim(),
            request.Notes?.Trim());

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Client.Updated",
            resourceType: "Client",
            resourceId: client.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["name"] = client.Name },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> UpdateClientStatusAsync(
        Guid id,
        ClientStatus status,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (client == null) return (false, "Client not found.");

        var oldStatus = client.Status;
        client.UpdateStatus(status);

        _context.ClientActivities.Add(new ClientActivity(
            clientId: client.Id,
            activityType: "StatusChange",
            description: $"Client status changed from {oldStatus} to {status}.",
            actorUserId: actorUserId));

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Client.StatusChanged",
            resourceType: "Client",
            resourceId: client.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["oldStatus"] = oldStatus.ToString(), ["newStatus"] = status.ToString() },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<(bool Success, Guid? ClientId, string? Error)> ConvertLeadToClientAsync(
        Guid leadId,
        ConvertLeadToClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == leadId, ct);
        if (lead == null) return (false, null, "Lead not found.");

        var alreadyConverted = await _context.Clients.AnyAsync(c => c.ConvertedFromLeadId == leadId, ct);
        if (alreadyConverted)
            return (false, null, "This lead has already been converted to a client.");

        var clientName = !string.IsNullOrWhiteSpace(request.ClientName)
            ? request.ClientName.Trim()
            : (!string.IsNullOrWhiteSpace(lead.Company) ? lead.Company.Trim() : lead.FullName.Trim());

        var client = new Client(
            name: clientName,
            primaryContactEmail: lead.Email,
            primaryContactPhone: lead.Phone,
            industry: request.Industry?.Trim(),
            region: lead.Region,
            status: ClientStatus.Active,
            convertedFromLeadId: lead.Id,
            taxId: request.TaxId?.Trim());

        var contact = new Contact(
            clientId: client.Id,
            fullName: lead.FullName,
            email: lead.Email,
            phone: lead.Phone,
            title: "Decision Maker",
            isPrimary: true);

        var clientActivity = new ClientActivity(
            clientId: client.Id,
            activityType: "ConvertedFromLead",
            description: $"Client converted from inbound lead (Submission #{lead.Id.ToString()[..8]}).",
            actorUserId: actorUserId);

        _context.Clients.Add(client);
        _context.Contacts.Add(contact);
        _context.ClientActivities.Add(clientActivity);

        // Update lead status to Closed / Qualified
        lead.ChangeStatus(LeadStatus.Closed);
        _context.LeadActivities.Add(new LeadActivity(
            leadId: lead.Id,
            activityType: "ConvertedToClient",
            description: $"Lead converted to client: {client.Name} (Client ID: {client.Id}).",
            actorUserId: actorUserId));

        // Enqueue automated welcome onboarding email to Outbox
        var outboxPayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            clientId = client.Id,
            clientName = client.Name,
            contactEmail = client.PrimaryContactEmail,
            industry = client.Industry,
            region = client.Region
        });
        _context.OutboxMessages.Add(new OutboxMessage("ClientCreated", outboxPayload));

        // Create initial onboarding task if requested
        if (!string.IsNullOrWhiteSpace(request.InitialTaskTitle))
        {
            var initialTask = new TaskItem(
                title: request.InitialTaskTitle.Trim(),
                description: "Initial follow-up and contract signing following lead conversion.",
                dueDateUtc: request.InitialTaskDueDateUtc ?? DateTime.UtcNow.AddDays(2),
                priority: TaskPriority.High,
                clientId: client.Id,
                leadId: lead.Id,
                assignedToUserId: actorUserId);

            _context.TaskItems.Add(initialTask);

            if (actorUserId.HasValue)
            {
                var actorUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == actorUserId.Value, ct);
                if (actorUser != null && !string.IsNullOrWhiteSpace(actorUser.Email))
                {
                    var taskPayload = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        taskId = initialTask.Id,
                        taskTitle = initialTask.Title,
                        priority = initialTask.Priority.ToString(),
                        dueDate = initialTask.DueDateUtc?.ToString("yyyy-MM-dd") ?? "None",
                        clientName = client.Name,
                        assigneeName = actorUser.FullName ?? actorUser.Email,
                        assigneeEmail = actorUser.Email,
                        assignedBy = "System (Lead Conversion)",
                        actionUrl = "http://localhost:5173/admin/tasks"
                    });
                    _context.OutboxMessages.Add(new OutboxMessage("TaskAssigned", taskPayload));
                }
            }
        }

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Lead.ConvertedToClient",
            resourceType: "Lead",
            resourceId: lead.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?> { ["clientId"] = client.Id.ToString(), ["clientName"] = client.Name },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, client.Id, null);
    }

    public async Task<(bool Success, Guid? ContactId, string? Error)> AddContactAsync(
        Guid clientId,
        CreateContactRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId, ct);
        if (client == null) return (false, null, "Client not found.");

        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
            return (false, null, "Contact name and email are required.");

        var contact = new Contact(
            clientId: clientId,
            fullName: request.FullName.Trim(),
            email: request.Email.Trim().ToLowerInvariant(),
            phone: request.Phone?.Trim(),
            title: request.Title?.Trim(),
            isPrimary: request.IsPrimary);

        if (request.IsPrimary)
        {
            client.SetPrimaryContact(contact.Email, contact.Phone);
        }

        _context.Contacts.Add(contact);
        _context.ClientActivities.Add(new ClientActivity(
            clientId: clientId,
            activityType: "ContactAdded",
            description: $"Contact '{contact.FullName}' ({contact.Email}) added to client.",
            actorUserId: actorUserId));

        await _context.SaveChangesAsync(ct);

        return (true, contact.Id, null);
    }

    public async Task<PaginatedResult<TaskItemDto>> GetTasksAsync(
        int page,
        int pageSize,
        TaskItemStatus? status,
        TaskPriority? priority,
        Guid? clientId,
        Guid? leadId,
        Guid? assignedToUserId,
        bool? overdueOnly,
        CancellationToken ct = default)
    {
        var query = _context.TaskItems
            .AsNoTracking()
            .Include(t => t.Client)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (clientId.HasValue)
        {
            query = query.Where(t => t.ClientId == clientId.Value);
        }

        if (leadId.HasValue)
        {
            query = query.Where(t => t.LeadId == leadId.Value);
        }

        if (assignedToUserId.HasValue)
        {
            query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);
        }

        if (overdueOnly == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(t =>
                t.Status != TaskItemStatus.Completed &&
                t.Status != TaskItemStatus.Cancelled &&
                t.DueDateUtc != null &&
                t.DueDateUtc < now);
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(t => t.Status == TaskItemStatus.Completed)
            .ThenBy(t => t.DueDateUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskItemDto(
                t.Id,
                t.Title,
                t.Description,
                t.DueDateUtc,
                t.Priority,
                t.Status,
                t.ClientId,
                t.Client != null ? t.Client.Name : null,
                t.LeadId,
                t.AssignedToUserId,
                t.CompletedAtUtc,
                t.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<TaskItemDto>(items, totalCount, page, pageSize);
    }

    public async Task<(bool Success, Guid? TaskId, string? Error)> CreateTaskAsync(
        CreateTaskRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return (false, null, "Task title is required.");

        var task = new TaskItem(
            title: request.Title.Trim(),
            description: request.Description?.Trim(),
            dueDateUtc: request.DueDateUtc,
            priority: request.Priority,
            clientId: request.ClientId,
            leadId: request.LeadId,
            assignedToUserId: request.AssignedToUserId ?? actorUserId);

        _context.TaskItems.Add(task);

        if (request.ClientId.HasValue)
        {
            _context.ClientActivities.Add(new ClientActivity(
                clientId: request.ClientId.Value,
                activityType: "TaskCreated",
                description: $"Task created: {task.Title}",
                actorUserId: actorUserId));
        }

        // Enqueue automated TaskAssigned notification to Outbox
        var targetUserId = task.AssignedToUserId;
        if (targetUserId.HasValue)
        {
            var assignedUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == targetUserId.Value, ct);
            if (assignedUser != null && !string.IsNullOrWhiteSpace(assignedUser.Email))
            {
                string clientName = "General Task";
                if (task.ClientId.HasValue)
                {
                    var client = await _context.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == task.ClientId.Value, ct);
                    if (client != null) clientName = client.Name;
                }

                string assignerName = "Administrator";
                if (actorUserId.HasValue)
                {
                    var actor = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == actorUserId.Value, ct);
                    if (actor != null) assignerName = actor.FullName ?? actor.Email ?? "Administrator";
                }

                var taskPayload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    taskId = task.Id,
                    taskTitle = task.Title,
                    priority = task.Priority.ToString(),
                    dueDate = task.DueDateUtc?.ToString("yyyy-MM-dd") ?? "None",
                    clientName = clientName,
                    assigneeName = assignedUser.FullName ?? assignedUser.Email,
                    assigneeEmail = assignedUser.Email,
                    assignedBy = assignerName,
                    actionUrl = "http://localhost:5173/admin/tasks"
                });
                _context.OutboxMessages.Add(new OutboxMessage("TaskAssigned", taskPayload));
            }
        }

        await _context.SaveChangesAsync(ct);

        return (true, task.Id, null);
    }

    public async Task<(bool Success, string? Error)> UpdateTaskAsync(
        Guid id,
        UpdateTaskRequest request,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task == null) return (false, "Task not found.");

        var previousAssigneeId = task.AssignedToUserId;

        task.UpdateDetails(
            request.Title.Trim(),
            request.Description?.Trim(),
            request.DueDateUtc,
            request.Priority);

        task.UpdateStatus(request.Status);
        task.AssignTo(request.AssignedToUserId);

        // If newly assigned or reassigned to a different user, enqueue TaskAssigned outbox event
        if (request.AssignedToUserId.HasValue && request.AssignedToUserId != previousAssigneeId)
        {
            var assignedUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.AssignedToUserId.Value, ct);
            if (assignedUser != null && !string.IsNullOrWhiteSpace(assignedUser.Email))
            {
                string clientName = "General Task";
                if (task.ClientId.HasValue)
                {
                    var client = await _context.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == task.ClientId.Value, ct);
                    if (client != null) clientName = client.Name;
                }

                string assignerName = "Administrator";
                if (actorUserId.HasValue)
                {
                    var actor = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == actorUserId.Value, ct);
                    if (actor != null) assignerName = actor.FullName ?? actor.Email ?? "Administrator";
                }

                var taskPayload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    taskId = task.Id,
                    taskTitle = task.Title,
                    priority = task.Priority.ToString(),
                    dueDate = task.DueDateUtc?.ToString("yyyy-MM-dd") ?? "None",
                    clientName = clientName,
                    assigneeName = assignedUser.FullName ?? assignedUser.Email,
                    assigneeEmail = assignedUser.Email,
                    assignedBy = assignerName,
                    actionUrl = "http://localhost:5173/admin/tasks"
                });
                _context.OutboxMessages.Add(new OutboxMessage("TaskAssigned", taskPayload));
            }
        }

        await _context.SaveChangesAsync(ct);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> AddClientActivityAsync(
        Guid clientId,
        string activityType,
        string description,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId, ct);
        if (!clientExists) return (false, "Client not found.");

        _context.ClientActivities.Add(new ClientActivity(
            clientId: clientId,
            activityType: activityType,
            description: description,
            actorUserId: actorUserId));

        await _context.SaveChangesAsync(ct);
        return (true, null);
    }
}
