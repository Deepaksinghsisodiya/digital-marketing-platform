namespace Nexora.Api.Options;

/// <summary>
/// Options for initial admin seed account.
/// Read strictly from environment variables: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.
/// Never hardcoded in source code or repository.
/// </summary>
public class SeedAdminOptions
{
    public string? Email { get; set; }
    public string? Password { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
}

