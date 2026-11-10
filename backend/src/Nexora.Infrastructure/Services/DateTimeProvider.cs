using Nexora.Application.Common.Interfaces;

namespace Nexora.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

