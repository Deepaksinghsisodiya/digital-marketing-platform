using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Leads.DTOs;
using Nexora.Domain.Constants;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

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

        adminGroup.MapPatch("/{id:guid}/assign", async (
            Guid id,
            [FromBody] AssignLeadRequest request,
            ILeadService leadService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await leadService.AssignLeadAsync(
                id,
                request.AssignedToUserId,
                currentUser.UserId,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("AssignLead")
        .WithSummary("Assign lead to an agency team member.");

        adminGroup.MapPost("/{id:guid}/send-email", async (
            Guid id,
            [FromBody] SendLeadEmailRequest request,
            ILeadService leadService,
            IEmailTemplateService templateService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var lead = await leadService.GetLeadByIdAsync(id, ct);
            if (lead == null) return Results.NotFound(new { error = "Lead not found." });

            var vars = request.Variables ?? new Dictionary<string, string>();
            vars["lead.name"] = lead.FullName;
            vars["lead.email"] = lead.Email;
            vars["lead.company"] = lead.Company ?? "";
            vars["lead.phone"] = lead.Phone ?? "";

            var (success, error) = await templateService.SendTestEmailAsync(
                lead.Email,
                request.TemplateKey,
                vars,
                ct);

            if (!success) return Results.BadRequest(new { error });

            await leadService.AddLeadNoteAsync(
                id,
                $"Outbound email sent using template '{request.TemplateKey}' to {lead.Email}.",
                currentUser.UserId,
                ct);

            return Results.Ok(new { message = $"Email successfully sent to {lead.Email}." });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("SendLeadEmail")
        .WithSummary("Send a templated email directly to a lead.");

        adminGroup.MapPost("/{id:guid}/anonymize", async (
            Guid id,
            ILeadService leadService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await leadService.AnonymizeLeadAsync(
                id,
                currentUser.UserId,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true, message = "Lead personal data successfully anonymized." });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("AnonymizeLead")
        .WithSummary("Anonymize lead PII under DPDP/GDPR compliance.");

        adminGroup.MapDelete("/{id:guid}", async (
            Guid id,
            ILeadService leadService,
            ICurrentUserService currentUser,
            CancellationToken ct) =>
        {
            var (success, error) = await leadService.DeleteLeadAsync(
                id,
                currentUser.UserId,
                ct);

            if (!success) return Results.BadRequest(new { error });
            return Results.Ok(new { success = true, message = "Lead permanently deleted." });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("DeleteLead")
        .WithSummary("Permanently delete lead under DPDP/GDPR statutory compliance.");

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

        // 4. Bulk Lead Actions & Follow-Up Scheduler
        var adminLeadsGroup = app.MapGroup("/api/v1/admin/leads")
            .WithTags("Leads (Admin)")
            .RequireAuthorization();

        adminLeadsGroup.MapPost("/bulk", async (
            [FromBody] BulkLeadActionDto request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (request.LeadIds == null || request.LeadIds.Length == 0)
            {
                return Results.BadRequest(new { error = "At least one lead ID is required." });
            }

            var leads = await db.Leads
                .Where(l => request.LeadIds.Contains(l.Id))
                .ToListAsync(ct);

            if (leads.Count == 0)
            {
                return Results.NotFound(new { error = "No matching leads found." });
            }

            var action = (request.Action ?? string.Empty).Trim().ToLowerInvariant();
            if (action == "delete")
            {
                db.Leads.RemoveRange(leads);
            }
            else if (action == "status" && request.Status.HasValue)
            {
                foreach (var lead in leads)
                {
                    lead.ChangeStatus(request.Status.Value);
                }
            }
            else if (action == "assign")
            {
                foreach (var lead in leads)
                {
                    lead.AssignTo(request.AssignedToUserId);
                }
            }
            else
            {
                return Results.BadRequest(new { error = "Unsupported bulk action. Use 'status', 'assign', or 'delete'." });
            }

            await db.SaveChangesAsync(ct);
            return Results.Ok(new { affected = leads.Count, action });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("BulkLeadAction");

        adminLeadsGroup.MapPatch("/{id:guid}/follow-up", async (
            Guid id,
            [FromBody] ScheduleLeadFollowUpDto request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == id, ct);
            if (lead == null) return Results.NotFound(new { error = "Lead not found." });

            lead.ScheduleFollowUp(request.NextFollowUpAtUtc, request.FollowUpNote);
            await db.SaveChangesAsync(ct);
            return Results.Ok(new
            {
                lead.Id,
                lead.NextFollowUpAtUtc,
                lead.FollowUpNote
            });
        })
        .RequireAuthorization(Permissions.LeadsManage)
        .WithName("ScheduleLeadFollowUp");

        // 5. Dashboard Revenue & Date-Range Analytics
        app.MapGet("/api/v1/admin/dashboard/analytics", async (
            DateTime? startDate,
            DateTime? endDate,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var leadsInRange = await db.Leads
                .AsNoTracking()
                .Where(l => l.CreatedAtUtc >= start && l.CreatedAtUtc <= end)
                .ToListAsync(ct);

            var invoices = await db.ClientInvoices
                .AsNoTracking()
                .Where(i => i.CreatedAtUtc >= start && i.CreatedAtUtc <= end)
                .ToListAsync(ct);

            var totalBilled = invoices.Where(i => i.Status != InvoiceStatus.Cancelled).Sum(i => i.Amount);
            var totalPaid = invoices.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.Amount);
            var totalPending = invoices.Where(i => i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Draft).Sum(i => i.Amount);
            var totalOverdue = invoices.Where(i => i.Status == InvoiceStatus.Overdue).Sum(i => i.Amount);

            var monthlyRevenue = invoices
                .Where(i => i.Status != InvoiceStatus.Cancelled)
                .GroupBy(i => new { i.CreatedAtUtc.Year, i.CreatedAtUtc.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Billed = g.Sum(x => x.Amount),
                    Paid = g.Where(x => x.Status == InvoiceStatus.Paid).Sum(x => x.Amount)
                })
                .ToList();

            var funnel = new
            {
                Total = leadsInRange.Count,
                New = leadsInRange.Count(l => l.Status == LeadStatus.New),
                InProgress = leadsInRange.Count(l => l.Status == LeadStatus.InProgress),
                Contacted = leadsInRange.Count(l => l.Status == LeadStatus.Contacted),
                Qualified = leadsInRange.Count(l => l.Status == LeadStatus.Qualified),
                Closed = leadsInRange.Count(l => l.Status == LeadStatus.Closed)
            };

            return Results.Ok(new
            {
                StartDateUtc = start,
                EndDateUtc = end,
                Funnel = funnel,
                Revenue = new
                {
                    TotalBilled = totalBilled,
                    TotalPaid = totalPaid,
                    TotalPending = totalPending,
                    TotalOverdue = totalOverdue,
                    InvoiceCount = invoices.Count,
                    MonthlySeries = monthlyRevenue
                }
            });
        })
        .RequireAuthorization(Permissions.LeadsView)
        .WithTags("Dashboard")
        .WithName("GetDashboardAnalytics");
    }
}

public record BulkLeadActionDto(Guid[] LeadIds, string Action, LeadStatus? Status, Guid? AssignedToUserId);
public record ScheduleLeadFollowUpDto(DateTime? NextFollowUpAtUtc, string? FollowUpNote);
