using Microsoft.AspNetCore.Identity;
using Nexora.Domain.Enums;

namespace Nexora.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public UserStatus Status { get; set; } = UserStatus.Active;

    public DateTime? SuspendedAtUtc { get; set; }
    public string? SuspensionReason { get; set; }

    public bool MustChangePassword { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAtUtc { get; set; }
}

