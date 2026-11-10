namespace Nexora.Api.Options;

/// <summary>
/// Configuration for Identity auth cookie.
/// Local dev: distinct localhost ports, SameSite Lax, Secure optional.
/// Production: admin.<domain> and api.<domain> share parent domain cookie, SameSite Lax/Strict, Secure true.
/// </summary>
public class AuthCookieOptions
{
    public const string SectionName = "AuthCookie";

    public string CookieName { get; set; } = ".Nexora.Admin.Session";
    public string? Domain { get; set; }
    public string SameSite { get; set; } = "Lax"; // Lax or Strict
    public bool Secure { get; set; } = false; // Enabled in production
    public int ExpireMinutes { get; set; } = 480;
}

