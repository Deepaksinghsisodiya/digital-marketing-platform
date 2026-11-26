using Microsoft.EntityFrameworkCore;
using Nexora.Application.Common.Interfaces;
using Nexora.Domain.Entities;
using Nexora.Infrastructure.Persistence;

namespace Nexora.Api.Services;

public class OutboxBackgroundDispatcher : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OutboxBackgroundDispatcher> _logger;

    public OutboxBackgroundDispatcher(
        IServiceProvider serviceProvider,
        ILogger<OutboxBackgroundDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Nexora API In-Process Outbox Dispatcher started.");

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var outboxProcessor = scope.ServiceProvider.GetRequiredService<IOutboxProcessor>();

                int processed = await outboxProcessor.ProcessPendingMessagesAsync(stoppingToken);
                if (processed > 0)
                {
                    _logger.LogInformation("API Dispatcher drained {Count} pending outbox email/notification messages.", processed);
                }

                // Scheduled CMS Page Publishing
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
                var duePages = await db.Pages
                    .Where(p => p.ScheduledPublishAtUtc != null && p.ScheduledPublishAtUtc <= DateTime.UtcNow)
                    .Select(p => p.Id)
                    .ToListAsync(stoppingToken);

                foreach (var pageId in duePages)
                {
                    var (pubOk, pubErr, _) = await cmsService.PublishPageAsync(pageId, Guid.Empty, stoppingToken);
                    var pageEntity = await db.Pages.FirstOrDefaultAsync(p => p.Id == pageId, stoppingToken);
                    if (pageEntity != null)
                    {
                        pageEntity.ScheduledPublishAtUtc = null;
                        await db.SaveChangesAsync(stoppingToken);
                    }
                    if (pubOk)
                    {
                        _logger.LogInformation("Scheduled publish executed for page {PageId}.", pageId);
                    }
                    else
                    {
                        _logger.LogWarning("Scheduled publish failed for page {PageId}: {Error}", pageId, pubErr);
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in API outbox dispatcher loop.");
            }
        }

        _logger.LogInformation("Nexora API In-Process Outbox Dispatcher stopping cleanly.");
    }
}
