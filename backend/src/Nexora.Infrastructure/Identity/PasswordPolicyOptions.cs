using System.ComponentModel.DataAnnotations;

namespace Nexora.Infrastructure.Identity;

public class PasswordPolicyOptions
{
    public const string SectionName = "PasswordPolicy";

    [Range(12, 128, ErrorMessage = "PasswordPolicy:RequiredLength must be at least 12 characters.")]
    public int RequiredLength { get; set; } = 12;

    public bool RequireDigit { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireNonAlphanumeric { get; set; } = true;
}

