using Nexora.Domain.Common;

namespace Nexora.Domain.Entities;

public enum LeadStatus
{
    New = 0,
    InProgress = 1,
    Contacted = 2,
    Qualified = 3,
    Closed = 4,
    Spam = 5
}

public class Lead : BaseEntity<Guid>
{
    public string FormKey { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Company { get; private set; }
    public string Region { get; private set; } = "in";
    public string? State { get; private set; }
    public string? PostalCode { get; private set; }
    public string CustomFieldsJson { get; private set; } = "{}";

    // Marketing Attribution
    public string? UtmSource { get; private set; }
    public string? UtmMedium { get; private set; }
    public string? UtmCampaign { get; private set; }
    public string? UtmTerm { get; private set; }
    public string? UtmContent { get; private set; }
    public string? ReferrerUrl { get; private set; }

    // Anti-Spam, Idempotency & Public Reference
    public string? ReferenceNumber { get; private set; }
    public string? IdempotencyKey { get; private set; }
    public string? TimeTrapNonce { get; private set; }

    // Consent Tracking
    public bool ConsentGiven { get; private set; }
    public string? ConsentWordingVersion { get; private set; }
    public DateTime? ConsentTimestampUtc { get; private set; }

    // Workflow
    public LeadStatus Status { get; private set; } = LeadStatus.New;
    public int Score { get; private set; } = 0;
    public Guid? AssignedToUserId { get; private set; }
    public string InternalNotesJson { get; private set; } = "[]";
    public DateTime? NextFollowUpAtUtc { get; private set; }
    public string? FollowUpNote { get; private set; }

    // Technical Context
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }

    // Concurrency Token
    public byte[] Version { get; private set; } = [];

    // Navigation collection
    public ICollection<LeadActivity> Activities { get; private set; } = new List<LeadActivity>();

    private Lead() { }

    public Lead(
        string formKey,
        string fullName,
        string email,
        string? phone,
        string? company,
        string region,
        string? state,
        string? postalCode,
        string customFieldsJson,
        bool consentGiven,
        string? consentWordingVersion,
        string? utmSource = null,
        string? utmMedium = null,
        string? utmCampaign = null,
        string? utmTerm = null,
        string? utmContent = null,
        string? referrerUrl = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? referenceNumber = null,
        string? idempotencyKey = null,
        string? timeTrapNonce = null)
    {
        Id = Guid.NewGuid();
        FormKey = formKey.Trim().ToLowerInvariant();
        FullName = fullName.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone?.Trim();
        Company = company?.Trim();
        Region = (region ?? "in").Trim().ToLowerInvariant();
        State = state?.Trim();
        PostalCode = postalCode?.Trim();
        CustomFieldsJson = string.IsNullOrWhiteSpace(customFieldsJson) ? "{}" : customFieldsJson;
        ConsentGiven = consentGiven;
        ConsentWordingVersion = consentWordingVersion?.Trim();
        ConsentTimestampUtc = consentGiven ? DateTime.UtcNow : null;
        UtmSource = utmSource?.Trim();
        UtmMedium = utmMedium?.Trim();
        UtmCampaign = utmCampaign?.Trim();
        UtmTerm = utmTerm?.Trim();
        UtmContent = utmContent?.Trim();
        ReferrerUrl = referrerUrl?.Trim();
        IpAddress = ipAddress?.Trim();
        UserAgent = userAgent?.Trim();
        ReferenceNumber = referenceNumber?.Trim();
        IdempotencyKey = idempotencyKey?.Trim();
        TimeTrapNonce = timeTrapNonce?.Trim();
        Status = LeadStatus.New;
    }

    public void SetReferenceNumber(string referenceNumber)
    {
        ReferenceNumber = referenceNumber?.Trim();
        MarkUpdated();
    }

    public void SetIdempotencyKey(string? idempotencyKey)
    {
        IdempotencyKey = idempotencyKey?.Trim();
    }

    public void SetTimeTrapNonce(string? nonce)
    {
        TimeTrapNonce = nonce?.Trim();
    }

    public void ChangeStatus(LeadStatus newStatus)
    {
        Status = newStatus;
        MarkUpdated();
    }

    public void AssignTo(Guid? userId)
    {
        AssignedToUserId = userId;
        MarkUpdated();
    }

    public void UpdateNotes(string notesJson)
    {
        InternalNotesJson = notesJson;
        MarkUpdated();
    }

    public void SetScore(int score)
    {
        Score = Math.Clamp(score, 0, 100);
        MarkUpdated();
    }

    public void Anonymize()
    {
        FullName = "Anonymized Lead";
        Email = $"anonymized-{Id:N}@redacted.local";
        Phone = null;
        Company = "Redacted (DPDP)";
        State = null;
        PostalCode = null;
        IpAddress = "0.0.0.0";
        UserAgent = null;
        CustomFieldsJson = "{}";
        InternalNotesJson = "[]";
        ConsentGiven = false;
        Status = LeadStatus.Closed;
        MarkUpdated();
    }

    public void WithdrawConsent()
    {
        ConsentGiven = false;
        MarkUpdated();
    }

    public void ScheduleFollowUp(DateTime? nextFollowUpAtUtc, string? note)
    {
        NextFollowUpAtUtc = nextFollowUpAtUtc;
        FollowUpNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        MarkUpdated();
    }
}

