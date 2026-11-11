using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nexora.Infrastructure.Persistence;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class DatabaseIsolationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public DatabaseIsolationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
    }

    [Fact]
    public void EfCoreConnection_TargetDatabaseName_MustEndWith_test()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dbConnection = db.Database.GetDbConnection();

        var dbName = dbConnection.Database;

        dbName.ShouldNotBeNullOrWhiteSpace();
        dbName.EndsWith("_test", StringComparison.OrdinalIgnoreCase).ShouldBeTrue(
            $"EF Core connected to '{dbName}' which does not end with '_test'. Tests must strictly run on test database.");
    }

    [Theory]
    [InlineData("Server=(localdb)\\MSSQLLocalDB;Database=nexora_dev;Trusted_Connection=True", "nexora_dev")]
    [InlineData("Server=prod-sql.nexora.com;Database=nexora_production;User Id=sa;Password=SecretProdPassword123!", "nexora_production")]
    [InlineData("Server=localhost;Database=master;Trusted_Connection=True", "master")]
    public void TestDatabaseGuard_WhenDatabaseDoesNotEndWithTest_ThrowsExceptionWithoutExposingConnectionString(
        string nonTestConnectionString, string expectedDbName)
    {
        var ex = Should.Throw<InvalidOperationException>(() =>
        {
            NexoraTestWebApplicationFactory.ValidateConnectionString(nonTestConnectionString);
        });

        // Must contain the target database name
        ex.Message.ShouldContain(expectedDbName);
        ex.Message.ShouldContain("MUST end with '_test'");

        // MUST NEVER leak sensitive connection string tokens or passwords
        ex.Message.ShouldNotContain("Server=");
        ex.Message.ShouldNotContain("User Id=");
        ex.Message.ShouldNotContain("Password=");
        ex.Message.ShouldNotContain("SecretProdPassword123!");
        ex.Message.ShouldNotContain("Trusted_Connection=");
    }

    [Fact]
    public void TestDatabaseGuard_WhenDatabaseEndsWithTest_PassesSuccessfully()
    {
        var validTestConn = "Server=(localdb)\\MSSQLLocalDB;Database=my_app_test;Trusted_Connection=True";
        var dbName = NexoraTestWebApplicationFactory.ValidateConnectionString(validTestConn);
        dbName.ShouldBe("my_app_test");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Server=(localdb)\\MSSQLLocalDB;Trusted_Connection=True")]
    public void TestDatabaseGuard_WhenConnectionStringMissingOrCatalogEmpty_ThrowsInvalidOperationException(string invalidConn)
    {
        var ex = Should.Throw<InvalidOperationException>(() =>
        {
            NexoraTestWebApplicationFactory.ValidateConnectionString(invalidConn);
        });
        ex.Message.ShouldContain("MUST end with '_test'");
    }
}
