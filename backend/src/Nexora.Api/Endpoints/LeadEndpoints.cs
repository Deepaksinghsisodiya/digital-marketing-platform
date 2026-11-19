using Microsoft.AspNetCore.Mvc;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Leads.DTOs;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;

namespace Nexora.Api.Endpoints;

public static class LeadEndpoints
{
    public static void MapLeadEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Public Form Submissions
        var publicGroup = app.MapGroup("/api/v1/public/forms")
            .WithTags("Public Forms");

        publicGroup.MapGet("/{formKey}", async (
            string formKey,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var form = await leadService.GetPublicFormAsync(formKey, ct);
            if (form == null)
            {
                return Results.NotFound(new { error = $"Form '{formKey}' was not found or is inactive." });
            }

            return Results.Ok(form);
        })
        .WithName("GetPublicForm")
        .WithSummary("Retrieve public form definition and server-issued time-trap token.")
        .Produces<PublicFormDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        publicGroup.MapPost("/{formKey}/submissions", async (
            string formKey,
            [FromBody] SubmitFormRequest request,
            HttpContext httpContext,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = httpContext.Request.Headers.UserAgent.ToString();

            // Extract Idempotency Key from header if not in payload body
            var idempotencyKey = !string.IsNullOrWhiteSpace(request.IdempotencyKey)
                ? request.IdempotencyKey
                : httpContext.Request.Headers["X-Idempotency-Key"].FirstOrDefault();

            var effectiveRequest = request with { IdempotencyKey = idempotencyKey };

            var response = await leadService.SubmitFormAsync(formKey, effectiveRequest, ipAddress, userAgent, ct);

            if (!response.Success)
            {
                if (response.Error != null && response.Error.Contains("not found or is inactive", StringComparison.OrdinalIgnoreCase))
                {
                    return Results.NotFound(new { error = response.Error });
                }
                if (response.Error != null && (response.Error.Contains("temporarily unavailable", StringComparison.OrdinalIgnoreCase) || response.Error.Contains("Verification service unavailable", StringComparison.OrdinalIgnoreCase)))
                {
                    return Results.Json(new { error = response.Error }, statusCode: StatusCodes.Status503ServiceUnavailable);
                }
                return Results.BadRequest(new { error = response.Error });
            }

            return Results.Ok(response);
        })
        .WithName("SubmitPublicForm")
        .WithSummary("Inbound form intake endpoint for lead capture.")
        .RequireRateLimiting("PublicFormRateLimit");

        // 2. Admin Leads Inbox & Management
        var adminGroup = app.MapGroup("/api/v1/admin/leads")
            .WithTags("Leads Inbox (Admin)")
            .RequireAuthorization();

        adminGroup.MapGet("/", async (
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            [FromQuery] int? status,
            [FromQuery] string? region,
            [FromQuery] string? formKey,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            LeadStatus? leadStatus = status.HasValue ? (LeadStatus)status.Value : null;
            var result = await leadService.GetLeadsAsync(
                page ?? 1,
                pageSize ?? 20,
                search,
                leadStatus,
                region,
                formKey,
                ct);

            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.LeadsView)
        .WithName("GetAdminLeads")
        .WithSummary("Paginated list of captured inbound leads.");

        adminGroup.MapGet("/stats", async (
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var stats = await leadService.GetLeadStatsAsync(ct);
            return Results.Ok(stats);
        })
        .RequireAuthorization(Permissions.LeadsView)
        .WithName("GetLeadStats")
        .WithSummary("Aggregated lead metrics for dashboard.");

        adminGroup.MapGet("/export", async (
            [FromQuery] string? search,
            [FromQuery] int? status,
            [FromQuery] string? region,
            [FromQuery] string? formKey,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            LeadStatus? leadStatus = status.HasValue ? (LeadStatus)status.Value : null;
            var csvBytes = await leadService.ExportLeadsCsvAsync(search, leadStatus, region, formKey, ct);

            var fileName = $"leads_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return Results.File(csvBytes, "text/csv", fileName);
        })
        .RequireAuthorization(Permissions.LeadsExport)
        .WithName("ExportLeads")
        .WithSummary("Export leads to CSV file.");

        adminGroup.MapGet("/{id:guid}", async (
            Guid id,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var lead = await leadService.GetLeadByIdAsync(id, ct);
            if (lead == null) return Results.NotFound(new { error = "Lead not found." });
            return Results.Ok(lead);
        })
        .RequireAuthorization(Permissions.LeadsView)
        .WithName("GetLeadById")
        .WithSummary("Retrieve detailed lead profile and activity history.");

        adminGroup.MapPatch("/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateLeadStatusRequest request,
            ILeadService leadService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await leadService.UpdateLeadStatusAsync(
                id,
                request.Status,
                currentUser.UserId,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("UpdateLeadStatus")
        .WithSummary("Update lead workflow status (New, Contacted, Qualified, etc.).");

        adminGroup.MapPost("/{id:guid}/notes", async (
            Guid id,
            [FromBody] AddLeadNoteRequest request,
            ILeadService leadService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await leadService.AddLeadNoteAsync(
                id,
                request.Note,
                currentUser.UserId,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("AddLeadNote")
        .WithSummary("Append internal follow-up note to lead timeline.");

        // 3. Admin Form Definitions
        var adminFormsGroup = app.MapGroup("/api/v1/admin/forms")
            .WithTags("Form Definitions (Admin)")
            .RequireAuthorization();

        adminFormsGroup.MapGet("/", async (
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var forms = await leadService.GetAdminFormsAsync(ct);
            return Results.Ok(forms);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetAdminForms")
        .WithSummary("List all custom form definitions.");

        adminFormsGroup.MapGet("/{id:guid}", async (
            Guid id,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var form = await leadService.GetAdminFormByIdAsync(id, ct);
            if (form == null) return Results.NotFound(new { error = "Form definition not found." });
            return Results.Ok(form);
        })
        .RequireAuthorization(Permissions.SettingsView)
        .WithName("GetAdminFormById")
        .WithSummary("Get form definition by ID.");

        adminFormsGroup.MapPost("/", async (
            [FromBody] SaveFormDefinitionRequest request,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var (success, error, result) = await leadService.SaveFormDefinitionAsync(request, null, ct);
            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("CreateFormDefinition")
        .WithSummary("Create new dynamic form schema.");

        adminFormsGroup.MapPut("/{id:guid}", async (
            Guid id,
            [FromBody] SaveFormDefinitionRequest request,
            ILeadService leadService,
            CancellationToken ct) =>
        {
            var (success, error, result) = await leadService.SaveFormDefinitionAsync(request, id, ct);
            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(result);
        })
        .RequireAuthorization(Permissions.SettingsManage)
        .WithName("UpdateFormDefinition")
        .WithSummary("Update existing dynamic form schema.");
    }
}
