using Nexora.Application.Common.Interfaces;

namespace Nexora.Application.Leads.Services;

public class LeadScoringService : ILeadScoringService
{
    private static readonly HashSet<string> FreeEmailDomains = new(StringComparer.OrdinalIgnoreCase)
    {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
        "mail.ru", "aol.com", "protonmail.com", "zoho.com", "live.com"
    };

    public int CalculateScore(
        string email,
        string? company,
        string? phone,
        IReadOnlyDictionary<string, object?>? customFields)
    {
        var score = 0;

        // 1. Corporate / Non-free email domain: +25
        if (!string.IsNullOrWhiteSpace(email))
        {
            var parts = email.Split('@');
            if (parts.Length == 2 && !FreeEmailDomains.Contains(parts[1].Trim()))
            {
                score += 25;
            }
        }

        // 2. Company provided: +15
        if (!string.IsNullOrWhiteSpace(company))
        {
            score += 15;
        }

        // 3. Phone provided: +15
        if (!string.IsNullOrWhiteSpace(phone) && phone.Trim().Length >= 7)
        {
            score += 15;
        }

        // 4. Budget Tier Evaluation: up to +25
        if (customFields != null)
        {
            if (customFields.TryGetValue("budget", out var rawBudget) && rawBudget != null)
            {
                var b = rawBudget.ToString()?.ToLowerInvariant() ?? string.Empty;
                if (b.Contains("50k") || b.Contains("enterprise") || b.Contains("10k+") || b.Contains(">10k") || b.Contains(">$10k") || b.Contains("25k"))
                {
                    score += 25;
                }
                else if (b.Contains("5k") || b.Contains("medium") || b.Contains("10k"))
                {
                    score += 15;
                }
                else if (!string.IsNullOrWhiteSpace(b))
                {
                    score += 5;
                }
            }

            // 5. Timeline / Urgency Evaluation: up to +20
            if (customFields.TryGetValue("timeline", out var rawTimeline) && rawTimeline != null)
            {
                var t = rawTimeline.ToString()?.ToLowerInvariant() ?? string.Empty;
                if (t.Contains("immediate") || t.Contains("urgent") || t.Contains("< 1 month") || t.Contains("1-2 weeks") || t.Contains("now"))
                {
                    score += 20;
                }
                else if (t.Contains("1-3 months") || t.Contains("quarter"))
                {
                    score += 10;
                }
                else if (!string.IsNullOrWhiteSpace(t))
                {
                    score += 5;
                }
            }
        }

        return Math.Clamp(score, 0, 100);
    }
}

