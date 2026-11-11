namespace Nexora.Application.Common.Interfaces;

public interface ILeadScoringService
{
    int CalculateScore(
        string email,
        string? company,
        string? phone,
        IReadOnlyDictionary<string, object?>? customFields);
}
