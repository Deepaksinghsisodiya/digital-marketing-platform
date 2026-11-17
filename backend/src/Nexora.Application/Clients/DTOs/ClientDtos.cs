using Nexora.Domain.Entities;

namespace Nexora.Application.Clients.DTOs;

public record ClientSummaryDto(
    Guid Id,
    string Name,
    string PrimaryContactEmail,
    string? PrimaryContactPhone,
    string? Industry,
    string Region,
    ClientStatus Status,
    int ActiveTasksCount,
    DateTime CreatedAtUtc,
    string? PrimaryContactName = null,
    string? PrimaryContactTitle = null,
    string? Website = null);

public record ContactDto(
    Guid Id,
    Guid ClientId,
    string FullName,
    string Email,
    string? Phone,
    string? Title,
    bool IsPrimary,
    DateTime CreatedAtUtc);

public record ClientActivityDto(
    Guid Id,
    Guid ClientId,
    string ActivityType,
    string Description,
    Guid? ActorUserId,
    DateTime CreatedAtUtc);

public record TaskItemDto(
    Guid Id,
    string Title,
    string? Description,
    DateTime? DueDateUtc,
    TaskPriority Priority,
    TaskItemStatus Status,
    Guid? ClientId,
    string? ClientName,
    Guid? LeadId,
    Guid? AssignedToUserId,
    DateTime? CompletedAtUtc,
    DateTime CreatedAtUtc);

public record ClientDetailDto(
    Guid Id,
    string Name,
    string? Website,
    string? Industry,
    string Region,
    ClientStatus Status,
    string PrimaryContactEmail,
    string? PrimaryContactPhone,
    Guid? ConvertedFromLeadId,
    string? BillingAddress,
    string? TaxId,
    string? Notes,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<ContactDto> Contacts,
    IReadOnlyList<TaskItemDto> Tasks,
    IReadOnlyList<ClientActivityDto> Activities);

public record CreateClientRequest(
    string Name,
    string PrimaryContactEmail,
    string? PrimaryContactPhone = null,
    string? PrimaryContactName = null,
    string? PrimaryContactTitle = null,
    string? Website = null,
    string? Industry = null,
    string Region = "in",
    string? BillingAddress = null,
    string? TaxId = null,
    string? Notes = null,
    ClientStatus? Status = null);

public record UpdateClientRequest(
    string Name,
    string? Website,
    string? Industry,
    string Region,
    string? BillingAddress,
    string? TaxId,
    string? Notes);

public record CreateContactRequest(
    string FullName,
    string Email,
    string? Phone = null,
    string? Title = null,
    bool IsPrimary = false);

public record ConvertLeadToClientRequest(
    string? ClientName = null,
    string? Industry = null,
    string? TaxId = null,
    string? InitialTaskTitle = null,
    DateTime? InitialTaskDueDateUtc = null);

public record CreateTaskRequest(
    string Title,
    string? Description = null,
    DateTime? DueDateUtc = null,
    TaskPriority Priority = TaskPriority.Medium,
    Guid? ClientId = null,
    Guid? LeadId = null,
    Guid? AssignedToUserId = null);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    DateTime? DueDateUtc,
    TaskPriority Priority,
    TaskItemStatus Status,
    Guid? AssignedToUserId);

