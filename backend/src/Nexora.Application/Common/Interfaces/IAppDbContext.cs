using Nexora.Domain.Entities;

namespace Nexora.Application.Common.Interfaces;

public interface IAppDbContext
{
    IQueryable<AuditLog> AuditLogs { get; }
    IQueryable<SiteSettings> SiteSettings { get; }
    IQueryable<FormDefinition> FormDefinitions { get; }
    IQueryable<Lead> Leads { get; }
    IQueryable<LeadActivity> LeadActivities { get; }
    IQueryable<OutboxMessage> OutboxMessages { get; }
    IQueryable<EmailTemplate> EmailTemplates { get; }
    IQueryable<EmailLog> EmailLogs { get; }
    IQueryable<Client> Clients { get; }
    IQueryable<Contact> Contacts { get; }
    IQueryable<TaskItem> TaskItems { get; }
    IQueryable<ClientActivity> ClientActivities { get; }
    IQueryable<BlogPost> BlogPosts { get; }
    IQueryable<PipelineStage> PipelineStages { get; }
    IQueryable<CountryRegion> CountryRegions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
