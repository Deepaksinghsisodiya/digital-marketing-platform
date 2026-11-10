using System.Text.Json;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;

    public AuditLogService(AppDbContext context, IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task LogAsync(
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
        CancellationToken cancellationToken = default)
    {
        var sanitizedEmail = actorEmail;
        if (action.Contains("login.failed", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(actorEmail))
        {
            sanitizedEmail = MaskEmail(actorEmail);
        }

        string? metadataJson = null;
        if (metadata != null && metadata.Count > 0)
        {
            var allowlisted = new Dictionary<string, object?>();
            foreach (var kvp in metadata)
            {
                // Never log passwords, tokens, or sensitive values
                var keyLower = kvp.Key.ToLowerInvariant();
                if (keyLower.Contains("password") || keyLower.Contains("token") || keyLower.Contains("secret") || keyLower.Contains("key"))
                {
                    continue;
                }
                allowlisted[kvp.Key] = kvp.Value;
            }

            if (allowlisted.Count > 0)
            {
                metadataJson = JsonSerializer.Serialize(allowlisted);
            }
        }

        var entry = new AuditLog
        {
            Id = Guid.NewGuid(),
            TimestampUtc = _dateTimeProvider.UtcNow,
            ActorUserId = actorUserId,
            ActorEmail = sanitizedEmail,
            Action = action,
            ResourceType = resourceType,
            ResourceId = resourceId,
            Outcome = outcome,
            IpAddress = ipAddress,
            UserAgent = userAgent != null && userAgent.Length > 512 ? userAgent[..512] : userAgent,
            CorrelationId = correlationId,
            MetadataJson = metadataJson
        };

        _context.AuditLogs.Add(entry);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static string MaskEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 2)
        {
            return "***" + (atIndex >= 0 ? email[atIndex..] : string.Empty);
        }

        return email[..2] + "***" + email[atIndex..];
    }
}

