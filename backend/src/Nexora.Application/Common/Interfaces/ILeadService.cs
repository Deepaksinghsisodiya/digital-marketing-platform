using Nexora.Application.Common.Models;
using Nexora.Application.Leads.DTOs;
using Nexora.Domain.Entities;

namespace Nexora.Application.Common.Interfaces;

public interface ILeadService
{
    Task<PublicFormDto?> GetPublicFormAsync(string formKey, CancellationToken ct = default);

    Task<SubmitFormResponse> SubmitFormAsync(
        string formKey,
        SubmitFormRequest request,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default);

    Task<PaginatedResult<LeadSummaryDto>> GetLeadsAsync(
        int page,
        int pageSize,
        string? search,
        LeadStatus? status,
        string? region,
        string? formKey,
        CancellationToken ct = default);

    Task<LeadDetailDto?> GetLeadByIdAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, string? Error)> UpdateLeadStatusAsync(
        Guid id,
        LeadStatus newStatus,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<(bool Success, string? Error)> AddLeadNoteAsync(
        Guid id,
        string note,
        Guid? actorUserId,
        CancellationToken ct = default);

    Task<LeadStatsDto> GetLeadStatsAsync(CancellationToken ct = default);

    Task<byte[]> ExportLeadsCsvAsync(
        string? search,
        LeadStatus? status,
        string? region,
        string? formKey = null,
        CancellationToken ct = default);

    Task<IReadOnlyList<AdminFormDefinitionDto>> GetAdminFormsAsync(CancellationToken ct = default);

    Task<AdminFormDefinitionDto?> GetAdminFormByIdAsync(Guid id, CancellationToken ct = default);

    Task<(bool Success, string? Error, AdminFormDefinitionDto? Result)> SaveFormDefinitionAsync(
        SaveFormDefinitionRequest request,
        Guid? existingId = null,
        CancellationToken ct = default);
}

