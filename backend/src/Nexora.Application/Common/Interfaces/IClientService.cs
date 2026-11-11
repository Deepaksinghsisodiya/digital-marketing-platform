using Nexora.Application.Clients.DTOs;
using Nexora.Application.Common.Models;
using Nexora.Domain.Entities;

namespace Nexora.Application.Common.Interfaces;

public interface IClientService
{
    // Clients
    Task<PaginatedResult<ClientSummaryDto>> GetClientsAsync(
        int page,
        int pageSize,
        string? search,
        ClientStatus? status,
        string? region,
        CancellationToken ct = default);

    Task<ClientDetailDto?> GetClientByIdAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, Guid? ClientId, string? Error)> CreateClientAsync(
        CreateClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdateClientAsync(
        Guid id,
        UpdateClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdateClientStatusAsync(
        Guid id,
        ClientStatus status,
        Guid? actorUserId,
        CancellationToken ct = default);

    // Lead -> Client Conversion
    Task<(bool Success, Guid? ClientId, string? Error)> ConvertLeadToClientAsync(
        Guid leadId,
        ConvertLeadToClientRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    // Contacts
    Task<(bool Success, Guid? ContactId, string? Error)> AddContactAsync(
        Guid clientId,
        CreateContactRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    // Tasks
    Task<PaginatedResult<TaskItemDto>> GetTasksAsync(
        int page,
        int pageSize,
        TaskItemStatus? status,
        TaskPriority? priority,
        Guid? clientId,
        Guid? leadId,
        Guid? assignedToUserId,
        bool? overdueOnly,
        CancellationToken ct = default);

    Task<(bool Success, Guid? TaskId, string? Error)> CreateTaskAsync(
        CreateTaskRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdateTaskAsync(
        Guid id,
        UpdateTaskRequest request,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> AddClientActivityAsync(
        Guid clientId,
        string activityType,
        string description,
        Guid? actorUserId,
        CancellationToken ct = default);
}
