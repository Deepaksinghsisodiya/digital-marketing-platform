namespace Nexora.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Nexora Background Worker started successfully at: {Time}", DateTimeOffset.UtcNow);

        while (!stoppingToken.IsCancellationRequested)
        {
            // Empty loop / tick for Step 1 foundation (Outbox processing will be wired in future phase)
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }

        _logger.LogInformation("Nexora Background Worker stopping cleanly at: {Time}", DateTimeOffset.UtcNow);
    }
}
