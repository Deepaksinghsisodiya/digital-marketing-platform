namespace Nexora.Domain.Entities;

public class Contact
{
    public Guid Id { get; private set; }
    public Guid ClientId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Title { get; private set; }
    public bool IsPrimary { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Client? Client { get; private set; }

    private Contact() { }

    public Contact(
        Guid clientId,
        string fullName,
        string email,
        string? phone = null,
        string? title = null,
        bool isPrimary = false)
    {
        Id = Guid.NewGuid();
        ClientId = clientId;
        FullName = fullName;
        Email = email;
        Phone = phone;
        Title = title;
        IsPrimary = isPrimary;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void Update(string fullName, string email, string? phone, string? title, bool isPrimary)
    {
        FullName = fullName;
        Email = email;
        Phone = phone;
        Title = title;
        IsPrimary = isPrimary;
    }
}

