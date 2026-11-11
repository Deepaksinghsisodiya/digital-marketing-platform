namespace Nexora.Domain.Entities;

public enum ClientStatus
{
    Active = 1,
    Prospect = 2,
    Inactive = 3,
    Churned = 4
}

public class Client
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Website { get; private set; }
    public string? Industry { get; private set; }
    public string Region { get; private set; } = "in";
    public ClientStatus Status { get; private set; } = ClientStatus.Active;
    public string PrimaryContactEmail { get; private set; } = string.Empty;
    public string? PrimaryContactPhone { get; private set; }
    public Guid? ConvertedFromLeadId { get; private set; }
    public string? BillingAddress { get; private set; }
    public string? TaxId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; private set; }
    public byte[] Version { get; private set; } = [];

    public ICollection<Contact> Contacts { get; private set; } = new List<Contact>();
    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();
    public ICollection<ClientActivity> Activities { get; private set; } = new List<ClientActivity>();

    private Client() { }

    public Client(
        string name,
        string primaryContactEmail,
        string? primaryContactPhone = null,
        string? website = null,
        string? industry = null,
        string region = "in",
        ClientStatus status = ClientStatus.Active,
        Guid? convertedFromLeadId = null,
        string? billingAddress = null,
        string? taxId = null,
        string? notes = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        PrimaryContactEmail = primaryContactEmail;
        PrimaryContactPhone = primaryContactPhone;
        Website = website;
        Industry = industry;
        Region = region.ToLowerInvariant();
        Status = status;
        ConvertedFromLeadId = convertedFromLeadId;
        BillingAddress = billingAddress;
        TaxId = taxId;
        Notes = notes;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateProfile(
        string name,
        string? website,
        string? industry,
        string region,
        string? billingAddress,
        string? taxId,
        string? notes)
    {
        Name = name;
        Website = website;
        Industry = industry;
        Region = region.ToLowerInvariant();
        BillingAddress = billingAddress;
        TaxId = taxId;
        Notes = notes;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStatus(ClientStatus newStatus)
    {
        Status = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetPrimaryContact(string email, string? phone)
    {
        PrimaryContactEmail = email;
        PrimaryContactPhone = phone;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

