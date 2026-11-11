namespace Nexora.Application.Common.Interfaces;

public interface IOutboxProcessor
{
    Task<int> ProcessPendingMessagesAsync(CancellationToken ct = default);
}

