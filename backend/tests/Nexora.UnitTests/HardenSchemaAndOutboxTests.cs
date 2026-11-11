using System.Security.Cryptography;
using System.Text;
using Nexora.Domain.Entities;
using Shouldly;
using Xunit;

namespace Nexora.UnitTests;

public class HardenSchemaAndOutboxTests
{
    [Fact]
    public void OutboxMessage_InitialState_ShouldBePending()
    {
        var message = new OutboxMessage("LeadReceived", "{\"email\":\"test@nexora.digital\"}");

        message.Status.ShouldBe(OutboxMessageStatus.Pending);
        message.RetryCount.ShouldBe(0);
        message.ProcessedAtUtc.ShouldBeNull();
        message.LockClaimedAtUtc.ShouldBeNull();
        message.NextAttemptAtUtc.ShouldBeNull();
        message.DeadLetterReason.ShouldBeNull();
    }

    [Fact]
    public void OutboxMessage_MarkClaimed_ShouldSetStatusToProcessing()
    {
        var message = new OutboxMessage("LeadReceived", "{}");
        message.MarkClaimed();

        message.Status.ShouldBe(OutboxMessageStatus.Processing);
        message.LockClaimedAtUtc.ShouldNotBeNull();
    }

    [Fact]
    public void OutboxMessage_MarkProcessed_ShouldSetStatusToProcessed()
    {
        var message = new OutboxMessage("LeadReceived", "{}");
        message.MarkClaimed();
        message.MarkProcessed();

        message.Status.ShouldBe(OutboxMessageStatus.Processed);
        message.ProcessedAtUtc.ShouldNotBeNull();
        message.LockClaimedAtUtc.ShouldBeNull();
        message.ErrorMessage.ShouldBeNull();
    }

    [Fact]
    public void OutboxMessage_RecordFailure_ShouldApplyExponentialBackoff()
    {
        var message = new OutboxMessage("LeadReceived", "{}");
        message.MarkClaimed();
        message.RecordFailure("SMTP timeout");

        message.Status.ShouldBe(OutboxMessageStatus.Pending);
        message.RetryCount.ShouldBe(1);
        message.LockClaimedAtUtc.ShouldBeNull();
        message.NextAttemptAtUtc.ShouldNotBeNull();
        message.NextAttemptAtUtc.Value.ShouldBeGreaterThan(DateTime.UtcNow);
    }

    [Fact]
    public void OutboxMessage_RecordFailure_ExceedingLimit_ShouldMoveToDeadLetter()
    {
        var message = new OutboxMessage("LeadReceived", "{}");

        for (int i = 0; i < 5; i++)
        {
            message.MarkClaimed();
            message.RecordFailure($"Attempt {i + 1} failed");
        }

        message.Status.ShouldBe(OutboxMessageStatus.DeadLetter);
        message.RetryCount.ShouldBe(5);
        message.DeadLetterReason.ShouldContain("Exceeded maximum retry limit");
    }

    [Fact]
    public void OutboxMessage_RecordFailure_WithOutcomeUnknown_ShouldMoveToDeliveryOutcomeUnknown()
    {
        var message = new OutboxMessage("LeadReceived", "{}");
        message.MarkClaimed();
        message.RecordFailure("Connection reset by peer during DATA transmission", isOutcomeUnknown: true);

        message.Status.ShouldBe(OutboxMessageStatus.DeliveryOutcomeUnknown);
        message.DeadLetterReason.ShouldContain("Delivery outcome unknown");
    }

    [Fact]
    public void Entities_ShouldHaveInitializedVersionProperty()
    {
        var lead = new Lead("contact", "Test User", "lead@nexora.digital", null, null, "IN", null, null, "{}", true, null);
        var client = new Client("Acme Corp", "contact@acme.com");
        var task = new TaskItem("Follow up with Acme");
        var blog = new BlogPost("launch", "Launch", "Exciting news", "<p>Hi</p>", "General", "Admin");
        var form = new FormDefinition("contact-us", "Contact Us", "[]", "{}");
        var email = new EmailTemplate("welcome", "Welcome", "Welcome!", "<p>Hi</p>");

        lead.Version.ShouldNotBeNull();
        client.Version.ShouldNotBeNull();
        task.Version.ShouldNotBeNull();
        blog.Version.ShouldNotBeNull();
        form.Version.ShouldNotBeNull();
        email.Version.ShouldNotBeNull();
    }

    [Fact]
    public void PreviewToken_TokenHash_ShouldMatchSha256()
    {
        var token = "460d3d3790ec4dae975a2874da58e37e";
        var computedHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

        var preview = new PreviewToken
        {
            PageVersionId = Guid.NewGuid(),
            Token = token,
            TokenHash = computedHash,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(2)
        };

        preview.TokenHash.Length.ShouldBe(64);
        preview.TokenHash.ShouldBe(computedHash);
    }
}

