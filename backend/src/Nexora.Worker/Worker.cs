using Nexora.Application.Common.Interfaces;

namespace Nexora.Worker;

public class Worker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<Worker> _logger;

    public Worker(IServiceProvider serviceProvider, ILogger<Worker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Nexora Autonomous Email & Outbox Worker started at: {Time}", DateTimeOffset.UtcNow);

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
                    _logger.LogInformation("Successfully dispatched {Count} automated email/notification messages from Outbox.", processed);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while draining Outbox queue in background worker.");
            }
        }

        _logger.LogInformation("Nexora Autonomous Email & Outbox Worker stopping cleanly at: {Time}", DateTimeOffset.UtcNow);
    }
}
