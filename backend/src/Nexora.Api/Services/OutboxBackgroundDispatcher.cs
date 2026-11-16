using Nexora.Application.Common.Interfaces;

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
