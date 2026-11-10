using Nexora.Domain.Entities;

namespace Nexora.Application.Common.Interfaces;

public interface IAppDbContext
{
    IQueryable<AuditLog> AuditLogs { get; }
    IQueryable<SiteSettings> SiteSettings { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
