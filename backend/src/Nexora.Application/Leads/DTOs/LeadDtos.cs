using Nexora.Domain.Entities;

namespace Nexora.Application.Leads.DTOs;

public record PublicFormDto(
    string FormKey,
    string Name,
    string? Title,
    string? Description,
    string SchemaJson,
    string SuccessMessage,
    string TimeTrapToken);

public record SubmitFormRequest(
    string FullName,
    string Email,
    string? Phone = null,
    string? Company = null,
    string? Region = "in",
    string? State = null,
    string? PostalCode = null,
    Dictionary<string, object?>? CustomFields = null,
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null,
    string? UtmTerm = null,
    string? UtmContent = null,
    string? ReferrerUrl = null,
    bool ConsentGiven = false,
    string? ConsentWordingVersion = null,
    string? Honeypot = null,
    string? TimeTrapToken = null,
    string? TurnstileToken = null,
    string? IdempotencyKey = null);

public record SubmitFormResponse(
    bool Success,
    Guid? SubmissionId,
    string Message,
    string? Error = null,
    string? ReferenceNumber = null);

public record LeadSummaryDto(
    Guid Id,
    string FormKey,
    string FullName,
    string Email,
    string? Phone,
    string? Company,
    string Region,
    string? State,
    LeadStatus Status,
    Guid? AssignedToUserId,
    DateTime CreatedAtUtc);

public record LeadActivityDto(
    Guid Id,
    string ActivityType,
    string Description,
    string? MetadataJson,
    Guid? ActorUserId,
    DateTime CreatedAtUtc);

public record LeadDetailDto(
    Guid Id,
    string FormKey,
    string FullName,
    string Email,
    string? Phone,
    string? Company,
    string Region,
    string? State,
    string? PostalCode,
    string CustomFieldsJson,
    string? UtmSource,
    string? UtmMedium,
    string? UtmCampaign,
    string? UtmTerm,
    string? UtmContent,
    string? ReferrerUrl,
    bool ConsentGiven,
    string? ConsentWordingVersion,
    DateTime? ConsentTimestampUtc,
    LeadStatus Status,
    Guid? AssignedToUserId,
    string InternalNotesJson,
    string? IpAddress,
    string? UserAgent,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<LeadActivityDto> Activities);

public record UpdateLeadStatusRequest(
    LeadStatus Status);

public record AddLeadNoteRequest(
    string Note);

public record LeadStatsDto(
    int TotalLeads,
    int NewLeads,
    int InProgressLeads,
    int ContactedLeads,
    int QualifiedLeads,
    int ClosedLeads,
    int SpamLeads);

public record AdminFormDefinitionDto(
    Guid Id,
    string FormKey,
    string Name,
    string? Title,
    string? Description,
    string SchemaJson,
    string SettingsJson,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record SaveFormDefinitionRequest(
    string FormKey,
    string Name,
    string SchemaJson,
    string SettingsJson,
    string? Title = null,
    string? Description = null,
    bool IsActive = true);


