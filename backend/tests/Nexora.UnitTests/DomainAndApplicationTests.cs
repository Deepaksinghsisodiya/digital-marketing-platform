using Nexora.Application.Common.Localization;
using Nexora.Application.Common.Models;
using Nexora.Domain.Common;
using Shouldly;
using Xunit;

namespace Nexora.UnitTests;

public class DomainAndApplicationTests
{
    private sealed class TestEntity : BaseEntity
    {
    }

    [Fact]
    public void BaseEntity_Should_AssignGuidAndUtcTimestampOnCreation()
    {
        var entity = new TestEntity();

        entity.Id.ShouldNotBe(Guid.Empty);
        entity.CreatedAtUtc.ShouldBeLessThanOrEqualTo(DateTime.UtcNow);
        entity.UpdatedAtUtc.ShouldBeNull();
    }

    [Fact]
    public void BaseEntity_MarkUpdated_ShouldSetUpdatedAtUtc()
    {
        var entity = new TestEntity();
        entity.MarkUpdated();

        entity.UpdatedAtUtc.ShouldNotBeNull();
        entity.UpdatedAtUtc.Value.ShouldBeLessThanOrEqualTo(DateTime.UtcNow);
    }

    [Fact]
    public void RegionContext_FromOptions_ShouldReflectConfiguredValues()
    {
        var customOptions = new RegionOptions
        {
            DefaultRegionCode = "US",
            DefaultCulture = "en-US",
            DefaultTimeZoneId = "America/New_York"
        };

        var context = RegionContext.FromOptions(customOptions);

        context.RegionCode.ShouldBe("US");
        context.CultureName.ShouldBe("en-US");
        context.TimeZoneId.ShouldBe("America/New_York");
    }

    [Fact]
    public void RegionContext_DefaultOptions_ShouldReflectStandardDefaults()
    {
        var defaultOptions = new RegionOptions();
        var context = RegionContext.FromOptions(defaultOptions);

        context.RegionCode.ShouldBe("IN");
        context.CultureName.ShouldBe("en-IN");
        context.TimeZoneId.ShouldBe("Asia/Kolkata");
    }

    [Fact]
    public void EmailMessage_Should_HoldRecipientsAndSubject()
    {
        var recipient = new EmailRecipient("admin@nexora.local", "Admin");
        var message = new EmailMessage([recipient], "Welcome", "<p>Hello</p>");

        message.To.Count.ShouldBe(1);
        message.Subject.ShouldBe("Welcome");
        message.BodyHtml.ShouldBe("<p>Hello</p>");
    }
}
