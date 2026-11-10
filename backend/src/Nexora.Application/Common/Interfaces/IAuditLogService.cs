namespace Nexora.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        string action,
        string resourceType,
        string? resourceId,
        string outcome,
        Guid? actorUserId,
        string? actorEmail,
        string? ipAddress,
        string? userAgent,
        string correlationId,
        Dictionary<string, object?>? metadata = null,
        CancellationToken cancellationToken = default);
}

