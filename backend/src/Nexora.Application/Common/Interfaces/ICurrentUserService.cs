namespace Nexora.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    string CorrelationId { get; }
}

