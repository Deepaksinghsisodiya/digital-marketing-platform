using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexora.Application.Common.Interfaces;
using Nexora.Application.Common.Models;
using Nexora.Application.Leads.DTOs;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class LeadService : ILeadService
{
    private readonly AppDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<LeadService> _logger;

    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static readonly HashSet<string> AllowedMapsTo = new(StringComparer.OrdinalIgnoreCase)
    {
        "FullName", "Email", "Phone", "Company", "State", "PostalCode", "Region"
    };

    public LeadService(
        AppDbContext context,
        IAuditLogService auditLogService,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IHostEnvironment environment,
        ILogger<LeadService> logger)
    {
        _context = context;
        _auditLogService = auditLogService;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _environment = environment;
        _logger = logger;
    }

    private string GetTokenSecret()
    {
        var secret = _configuration["SPAM_TOKEN_SECRET"] ?? Environment.GetEnvironmentVariable("SPAM_TOKEN_SECRET");
        if (string.IsNullOrWhiteSpace(secret))
        {
            if (_environment.IsProduction())
            {
                throw new InvalidOperationException("CRITICAL: SPAM_TOKEN_SECRET is required in Production environment.");
            }
            secret = "Nexora_Dev_Spam_Token_Secret_2026_Secure_Key";
        }
        return secret;
    }

    private static string ComputeHmac(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public string GenerateTimeTrapToken(string formKey)
    {
        var secret = GetTokenSecret();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var nonce = Guid.NewGuid().ToString("N");
        var raw = $"{formKey.Trim().ToLowerInvariant()}:{timestamp}:{nonce}";
        var sig = ComputeHmac(raw, secret);
        return $"{raw}:{sig}";
    }

    public async Task<PublicFormDto?> GetPublicFormAsync(string formKey, CancellationToken ct = default)
    {
        var normalizedKey = formKey.Trim().ToLowerInvariant();
        var form = await _context.FormDefinitions.AsNoTracking()
            .FirstOrDefaultAsync(f => f.FormKey == normalizedKey && f.IsActive, ct);

        if (form == null) return null;

        var successMessage = "Thank you! Your submission has been received.";
        try
        {
            if (!string.IsNullOrWhiteSpace(form.SettingsJson))
            {
                using var doc = JsonDocument.Parse(form.SettingsJson);
                if (doc.RootElement.TryGetProperty("successMessage", out var msgProp))
                {
                    var customMsg = msgProp.GetString();
                    if (!string.IsNullOrWhiteSpace(customMsg)) successMessage = customMsg;
                }
            }
        }
        catch (JsonException) { }

        var token = GenerateTimeTrapToken(form.FormKey);

        return new PublicFormDto(
            FormKey: form.FormKey,
            Name: form.Name,
            Title: form.Title,
            Description: form.Description,
            SchemaJson: form.SchemaJson,
            SuccessMessage: successMessage,
            TimeTrapToken: token);
    }

    private async Task<(bool Valid, string? Error, string? Nonce)> VerifyTimeTrapTokenAsync(
        string formKey,
        string? token,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            if (_configuration.GetValue<bool>("SkipTimeTrapVerification", false))
            {
                return (true, null, null);
            }
            return (false, "Time-trap token is missing. Please refresh the form.", null);
        }

        var parts = token.Split(':');
        if (parts.Length != 4)
        {
            return (false, "Invalid time-trap token format.", null);
        }

        var tokenFormKey = parts[0];
        if (!string.Equals(tokenFormKey, formKey, StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Token form mismatch.", null);
        }

        if (!long.TryParse(parts[1], out var tokenTs))
        {
            return (false, "Invalid token timestamp.", null);
        }

        var tokenNonce = parts[2];
        var tokenSig = parts[3];

        var secret = GetTokenSecret();
        var expectedSig = ComputeHmac($"{tokenFormKey}:{tokenTs}:{tokenNonce}", secret);

        var sigBytes = Encoding.UTF8.GetBytes(tokenSig);
        var expectedBytes = Encoding.UTF8.GetBytes(expectedSig);

        if (sigBytes.Length != expectedBytes.Length || !CryptographicOperations.FixedTimeEquals(sigBytes, expectedBytes))
        {
            return (false, "Token signature verification failed.", null);
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var ageSeconds = now - tokenTs;

        var minSeconds = _configuration.GetValue("SpamProtection:MinSubmissionSeconds", 3);
        var maxSeconds = _configuration.GetValue("SpamProtection:MaxSubmissionSeconds", 86400);

        var skipMinAge = _configuration.GetValue<bool>("SkipTimeTrapMinAge", false);

        if (ageSeconds < 0 || ageSeconds > maxSeconds)
        {
            return (false, "Token has expired. Please refresh the form and try again.", null);
        }

        if (!skipMinAge && ageSeconds < minSeconds)
        {
            return (false, "Submission completed too fast. Please take your time.", null);
        }

        // Verify nonce replay against database
        var nonceAlreadyUsed = await _context.Leads.AnyAsync(l => l.TimeTrapNonce == tokenNonce, ct);
        if (nonceAlreadyUsed)
        {
            return (false, "Replay attack detected: token nonce has already been consumed.", null);
        }

        return (true, null, tokenNonce);
    }

    private async Task<(bool Valid, string? Error)> VerifyTurnstileAsync(
        string? turnstileToken,
        string? ipAddress,
        CancellationToken ct)
    {
        var secret = _configuration["TURNSTILE_SECRET_KEY"] ?? Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY");

        // Allow development/testing bypass
        if (_environment.IsDevelopment() || _configuration.GetValue<bool>("SkipTurnstileVerification", false))
        {
            if (string.IsNullOrWhiteSpace(turnstileToken) ||
                turnstileToken == "XXXX.DUMMY.TOKEN.XXXX" ||
                turnstileToken.StartsWith("test_", StringComparison.OrdinalIgnoreCase))
            {
                return (true, null);
            }
        }

        if (string.IsNullOrWhiteSpace(turnstileToken))
        {
            return (false, "Turnstile verification challenge required.");
        }

        if (string.IsNullOrWhiteSpace(secret))
        {
            if (_environment.IsProduction())
            {
                _logger.LogError("TURNSTILE_SECRET_KEY is missing in Production environment.");
                return (false, "Verification service unavailable.");
            }
            return (true, null);
        }

        try
        {
            var verifyUrl = _configuration["SpamProtection:TurnstileVerifyUrl"] ?? "https://challenges.cloudflare.com/turnstile/v0/siteverify";
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);

            var postData = new Dictionary<string, string>
            {
                ["secret"] = secret,
                ["response"] = turnstileToken
            };
            if (!string.IsNullOrWhiteSpace(ipAddress))
            {
                postData["remoteip"] = ipAddress;
            }

            using var content = new FormUrlEncodedContent(postData);
            var response = await client.PostAsync(verifyUrl, content, ct);

            if (!response.IsSuccessStatusCode)
            {
                if (_environment.IsProduction())
                {
                    return (false, "Verification service returned an error.");
                }
                return (true, null);
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var success = root.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
            if (!success)
            {
                return (false, "Turnstile verification failed.");
            }

            var allowedHostnames = _configuration.GetSection("SpamProtection:AllowedHostnames").Get<string[]>()
                ?? ["localhost", "127.0.0.1", "nexora.local"];

            if (root.TryGetProperty("hostname", out var hostProp))
            {
                var host = hostProp.GetString();
                if (!string.IsNullOrWhiteSpace(host) && !allowedHostnames.Contains(host, StringComparer.OrdinalIgnoreCase))
                {
                    return (false, $"Submission hostname '{host}' is not in the allowed domain list.");
                }
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during Turnstile siteverify verification.");
            if (_environment.IsProduction())
            {
                return (false, "Verification service temporarily unavailable.");
            }
            return (true, null);
        }
    }

    public async Task<SubmitFormResponse> SubmitFormAsync(
        string formKey,
        SubmitFormRequest request,
        string? ipAddress,
        string? userAgent,
        CancellationToken ct = default)
    {
        var normalizedKey = formKey.Trim().ToLowerInvariant();

        // 0. Verify Form Definition exists and is active (returns 404 behavior if not active)
        var formDef = await _context.FormDefinitions.AsNoTracking()
            .FirstOrDefaultAsync(f => f.FormKey == normalizedKey && f.IsActive, ct);

        if (formDef == null)
        {
            return new SubmitFormResponse(false, null, string.Empty, $"Form '{formKey}' was not found or is inactive.");
        }

        // 1. Idempotency Check (Executed FIRST before token verification/nonce consumption)
        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existing = await _context.Leads.AsNoTracking()
                .FirstOrDefaultAsync(l => l.FormKey == normalizedKey && l.IdempotencyKey == request.IdempotencyKey.Trim(), ct);

            if (existing != null)
            {
                return new SubmitFormResponse(
                    Success: true,
                    SubmissionId: existing.Id,
                    Message: "Thank you for your submission.",
                    ReferenceNumber: existing.ReferenceNumber);
            }
        }

        // 2. Silent Honeypot rejection (Nonce is NOT consumed)
        if (!string.IsNullOrWhiteSpace(request.Honeypot))
        {
            return new SubmitFormResponse(
                Success: true,
                SubmissionId: Guid.NewGuid(),
                Message: "Thank you for your submission.",
                ReferenceNumber: $"NEX-{DateTime.UtcNow:yyyyMMdd}-HP0000");
        }

        // 3. Validation (Nonce is NOT consumed on failure)
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return new SubmitFormResponse(false, null, string.Empty, "Full name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !EmailRegex.IsMatch(request.Email.Trim()))
        {
            return new SubmitFormResponse(false, null, string.Empty, "A valid email address is required.");
        }

        if (!request.ConsentGiven)
        {
            return new SubmitFormResponse(false, null, string.Empty, "Explicit consent is required to process your request.");
        }

        // 4. Turnstile Challenge Verification
        var (turnstileValid, turnstileError) = await VerifyTurnstileAsync(request.TurnstileToken, ipAddress, ct);
        if (!turnstileValid)
        {
            return new SubmitFormResponse(false, null, string.Empty, turnstileError);
        }

        // 5. Time-Trap Token Verification
        var (timeTrapValid, timeTrapError, nonce) = await VerifyTimeTrapTokenAsync(normalizedKey, request.TimeTrapToken, ct);
        if (!timeTrapValid)
        {
            return new SubmitFormResponse(false, null, string.Empty, timeTrapError);
        }

        // 6. Unknown Field Rejection & MapsTo Allowlist
        if (request.CustomFields != null && request.CustomFields.Count > 0)
        {
            var allowedCustomFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "serviceOfInterest", "budget", "message", "timeline", "source"
            };

            foreach (var key in request.CustomFields.Keys)
            {
                if (!allowedCustomFields.Contains(key))
                {
                    return new SubmitFormResponse(false, null, string.Empty, $"Unknown or unauthorized field '{key}' in submission payload.");
                }
            }
        }

        var customFieldsJson = request.CustomFields != null && request.CustomFields.Count > 0
            ? JsonSerializer.Serialize(request.CustomFields)
            : "{}";

        // 7. Generate Reference Number
        var referenceNumber = $"NEX-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

        // 8. Construct Lead entity
        var lead = new Lead(
            formKey: normalizedKey,
            fullName: request.FullName,
            email: request.Email,
            phone: request.Phone,
            company: request.Company,
            region: request.Region ?? "in",
            state: request.State,
            postalCode: request.PostalCode,
            customFieldsJson: customFieldsJson,
            consentGiven: request.ConsentGiven,
            consentWordingVersion: request.ConsentWordingVersion ?? "v1.0",
            utmSource: request.UtmSource,
            utmMedium: request.UtmMedium,
            utmCampaign: request.UtmCampaign,
            utmTerm: request.UtmTerm,
            utmContent: request.UtmContent,
            referrerUrl: request.ReferrerUrl,
            ipAddress: ipAddress,
            userAgent: userAgent,
            referenceNumber: referenceNumber,
            idempotencyKey: request.IdempotencyKey?.Trim(),
            timeTrapNonce: nonce);

        _context.Leads.Add(lead);

        // 9. Activity Timeline Record
        var activity = new LeadActivity(
            lead.Id,
            "Created",
            $"Lead inquiry submitted via form '{normalizedKey}' (Ref: {referenceNumber}).",
            JsonSerializer.Serialize(new { formKey = normalizedKey, region = lead.Region, referenceNumber }));
        _context.LeadActivities.Add(activity);

        // 10. Outbox Message for Email / Worker Dispatch
        var outboxPayload = JsonSerializer.Serialize(new
        {
            leadId = lead.Id,
            referenceNumber = referenceNumber,
            fullName = lead.FullName,
            email = lead.Email,
            phone = lead.Phone,
            company = lead.Company,
            formKey = lead.FormKey,
            region = lead.Region,
            submittedAtUtc = lead.CreatedAtUtc
        });

        var outbox = new OutboxMessage("LeadReceived", outboxPayload);
        _context.OutboxMessages.Add(outbox);

        // 11. Transactional Commit (Time-Trap Nonce is strictly consumed upon successful save)
        await _context.SaveChangesAsync(ct);

        // 12. Audit Log
        await _auditLogService.LogAsync(
            action: "Lead.Submitted",
            resourceType: "Lead",
            resourceId: lead.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?>
            {
                ["formKey"] = normalizedKey,
                ["email"] = lead.Email,
                ["region"] = lead.Region,
                ["referenceNumber"] = referenceNumber
            },
            actorUserId: null,
            actorEmail: null,
            ipAddress: ipAddress,
            userAgent: userAgent,
            correlationId: Guid.NewGuid().ToString("N"));

        var successMessage = "Thank you for your submission.";
        try
        {
            if (!string.IsNullOrWhiteSpace(formDef.SettingsJson))
            {
                using var doc = JsonDocument.Parse(formDef.SettingsJson);
                if (doc.RootElement.TryGetProperty("successMessage", out var msgProp))
                {
                    var customMsg = msgProp.GetString();
                    if (!string.IsNullOrWhiteSpace(customMsg)) successMessage = customMsg;
                }
            }
        }
        catch (JsonException) { }

        return new SubmitFormResponse(
            Success: true,
            SubmissionId: lead.Id,
            Message: successMessage,
            ReferenceNumber: referenceNumber);
    }

    public async Task<PaginatedResult<LeadSummaryDto>> GetLeadsAsync(
        int page,
        int pageSize,
        string? search,
        LeadStatus? status,
        string? region,
        string? formKey,
        CancellationToken ct = default)
    {
        var query = _context.Leads.AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(region))
        {
            var r = region.Trim().ToLowerInvariant();
            query = query.Where(l => l.Region == r);
        }

        if (!string.IsNullOrWhiteSpace(formKey))
        {
            var fk = formKey.Trim().ToLowerInvariant();
            query = query.Where(l => l.FormKey == fk);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(l =>
                l.FullName.Contains(s) ||
                l.Email.Contains(s) ||
                (l.Company != null && l.Company.Contains(s)) ||
                (l.Phone != null && l.Phone.Contains(s)));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(l => l.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LeadSummaryDto(
                l.Id,
                l.FormKey,
                l.FullName,
                l.Email,
                l.Phone,
                l.Company,
                l.Region,
                l.State,
                l.Status,
                l.AssignedToUserId,
                l.CreatedAtUtc))
            .ToListAsync(ct);

        return new PaginatedResult<LeadSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<LeadDetailDto?> GetLeadByIdAsync(Guid id, CancellationToken ct = default)
    {
        var lead = await _context.Leads
            .Include(l => l.Activities)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id, ct);

        if (lead == null) return null;

        var activities = lead.Activities
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new LeadActivityDto(
                a.Id,
                a.ActivityType,
                a.Description,
                a.MetadataJson,
                a.ActorUserId,
                a.CreatedAtUtc))
            .ToList();

        return new LeadDetailDto(
            lead.Id,
            lead.FormKey,
            lead.FullName,
            lead.Email,
            lead.Phone,
            lead.Company,
            lead.Region,
            lead.State,
            lead.PostalCode,
            lead.CustomFieldsJson,
            lead.UtmSource,
            lead.UtmMedium,
            lead.UtmCampaign,
            lead.UtmTerm,
            lead.UtmContent,
            lead.ReferrerUrl,
            lead.ConsentGiven,
            lead.ConsentWordingVersion,
            lead.ConsentTimestampUtc,
            lead.Status,
            lead.AssignedToUserId,
            lead.InternalNotesJson,
            lead.IpAddress,
            lead.UserAgent,
            lead.CreatedAtUtc,
            lead.UpdatedAtUtc,
            activities);
    }

    public async Task<(bool Success, string? Error)> UpdateLeadStatusAsync(
        Guid id,
        LeadStatus newStatus,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id, ct);
        if (lead == null) return (false, "Lead not found.");

        var oldStatus = lead.Status;
        if (oldStatus == newStatus) return (true, null);

        lead.ChangeStatus(newStatus);

        var activity = new LeadActivity(
            lead.Id,
            "StatusChanged",
            $"Status changed from {oldStatus} to {newStatus}.",
            JsonSerializer.Serialize(new { from = oldStatus.ToString(), to = newStatus.ToString() }),
            actorUserId);
        _context.LeadActivities.Add(activity);

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Lead.StatusChanged",
            resourceType: "Lead",
            resourceId: lead.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?>
            {
                ["oldStatus"] = oldStatus.ToString(),
                ["newStatus"] = newStatus.ToString()
            },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> AddLeadNoteAsync(
        Guid id,
        string note,
        Guid? actorUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(note)) return (false, "Note text cannot be empty.");

        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id, ct);
        if (lead == null) return (false, "Lead not found.");

        List<Dictionary<string, object?>> notes;
        try
        {
            notes = JsonSerializer.Deserialize<List<Dictionary<string, object?>>>(lead.InternalNotesJson)
                    ?? new List<Dictionary<string, object?>>();
        }
        catch
        {
            notes = new List<Dictionary<string, object?>>();
        }

        notes.Add(new Dictionary<string, object?>
        {
            ["text"] = note.Trim(),
            ["authorUserId"] = actorUserId?.ToString(),
            ["timestampUtc"] = DateTime.UtcNow.ToString("O")
        });

        lead.UpdateNotes(JsonSerializer.Serialize(notes));

        var activity = new LeadActivity(
            lead.Id,
            "NoteAdded",
            note.Trim().Length > 80 ? note.Trim()[..77] + "..." : note.Trim(),
            actorUserId: actorUserId);
        _context.LeadActivities.Add(activity);

        await _context.SaveChangesAsync(ct);

        await _auditLogService.LogAsync(
            action: "Lead.NoteAdded",
            resourceType: "Lead",
            resourceId: lead.Id.ToString(),
            outcome: "Success",
            metadata: new Dictionary<string, object?>
            {
                ["noteLength"] = note.Length
            },
            actorUserId: actorUserId,
            actorEmail: null,
            ipAddress: null,
            userAgent: null,
            correlationId: Guid.NewGuid().ToString("N"));

        return (true, null);
    }

    public async Task<LeadStatsDto> GetLeadStatsAsync(CancellationToken ct = default)
    {
        var counts = await _context.Leads
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        int total = 0, newCount = 0, inProg = 0, contacted = 0, qualified = 0, closed = 0, spam = 0;

        foreach (var c in counts)
        {
            total += c.Count;
            switch (c.Status)
            {
                case LeadStatus.New: newCount = c.Count; break;
                case LeadStatus.InProgress: inProg = c.Count; break;
                case LeadStatus.Contacted: contacted = c.Count; break;
                case LeadStatus.Qualified: qualified = c.Count; break;
                case LeadStatus.Closed: closed = c.Count; break;
                case LeadStatus.Spam: spam = c.Count; break;
            }
        }

        return new LeadStatsDto(total, newCount, inProg, contacted, qualified, closed, spam);
    }

    public async Task<byte[]> ExportLeadsCsvAsync(
        string? search,
        LeadStatus? status,
        string? region,
        CancellationToken ct = default)
    {
        var query = _context.Leads.AsNoTracking();

        if (status.HasValue) query = query.Where(l => l.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(region))
        {
            var r = region.Trim().ToLowerInvariant();
            query = query.Where(l => l.Region == r);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(l => l.FullName.Contains(s) || l.Email.Contains(s) || (l.Company != null && l.Company.Contains(s)));
        }

        var leads = await query
            .OrderByDescending(l => l.CreatedAtUtc)
            .Take(5000)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("ID,Date (UTC),Full Name,Email,Phone,Company,Region,State,Status,UTM Source,UTM Campaign");

        foreach (var l in leads)
        {
            sb.AppendLine(string.Join(",",
                EscapeCsv(l.Id.ToString()),
                EscapeCsv(l.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)),
                EscapeCsv(l.FullName),
                EscapeCsv(l.Email),
                EscapeCsv(l.Phone ?? string.Empty),
                EscapeCsv(l.Company ?? string.Empty),
                EscapeCsv(l.Region),
                EscapeCsv(l.State ?? string.Empty),
                EscapeCsv(l.Status.ToString()),
                EscapeCsv(l.UtmSource ?? string.Empty),
                EscapeCsv(l.UtmCampaign ?? string.Empty)));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return "\"\"";
        // Prevent CSV formula injection (=, +, -, @)
        if (value.StartsWith('=') || value.StartsWith('+') || value.StartsWith('-') || value.StartsWith('@'))
        {
            value = "'" + value;
        }
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }
}
