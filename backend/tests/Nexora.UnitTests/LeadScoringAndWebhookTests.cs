using Nexora.Application.Leads.Services;
using Shouldly;
using Xunit;

namespace Nexora.UnitTests;

public class LeadScoringTests
{
    private readonly LeadScoringService _scoringService = new();

    [Fact]
    public void CorporateEmail_ShouldAward25Points_FreeEmailShouldNot()
    {
        var corporateScore = _scoringService.CalculateScore("lead@acmecorp.com", null, null, null);
        corporateScore.ShouldBe(25);

        var gmailScore = _scoringService.CalculateScore("lead@gmail.com", null, null, null);
        gmailScore.ShouldBe(0);

        var yahooScore = _scoringService.CalculateScore("lead@yahoo.com", null, null, null);
        yahooScore.ShouldBe(0);
    }

    [Fact]
    public void CompanyAndPhone_ShouldAward30Points()
    {
        var score = _scoringService.CalculateScore("lead@gmail.com", "Acme Corporation", "+1-555-0199", null);
        score.ShouldBe(30); // 15 company + 15 phone
    }

    [Fact]
    public void EnterpriseBudgetAndImmediateTimeline_ShouldMaximizeScore()
    {
        var custom = new Dictionary<string, object?>
        {
            ["budget"] = "enterprise (>$50k)",
            ["timeline"] = "immediate"
        };

        var score = _scoringService.CalculateScore(
            "vp@enterprisegrowth.com",
            "Enterprise Growth Partners",
            "+1-800-555-0199",
            custom);

        // 25 (corporate) + 15 (company) + 15 (phone) + 25 (enterprise budget) + 20 (immediate) = 100
        score.ShouldBe(100);
    }

    [Fact]
    public void TotalScore_ShouldBeClampedAt100()
    {
        var custom = new Dictionary<string, object?>
        {
            ["budget"] = "enterprise 100k+",
            ["timeline"] = "urgent now"
        };

        var score = _scoringService.CalculateScore(
            "ceo@megacorp.global",
            "Mega Corp Global",
            "+1-999-555-1234",
            custom);

        score.ShouldBe(100);
    }

    [Fact]
    public void MissingFields_ShouldReturnZero()
    {
        var score = _scoringService.CalculateScore("", "", "", null);
        score.ShouldBe(0);
    }
}
