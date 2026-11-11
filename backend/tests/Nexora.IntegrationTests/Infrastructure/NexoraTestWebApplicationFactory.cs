using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Nexora.Infrastructure.Persistence;

namespace Nexora.IntegrationTests.Infrastructure;

public class NexoraTestWebApplicationFactory : WebApplicationFactory<Program>
{
    private static readonly object _migrateLock = new();
    private static bool _migrated = false;

    public string TargetDatabaseName { get; private set; } = string.Empty;

    public static string ResolveAndValidateTestConnectionString()
    {
        var testConn = Environment.GetEnvironmentVariable("ConnectionStrings__TestConnection");
        if (string.IsNullOrWhiteSpace(testConn))
        {
            // Walk directory tree to find root .env
            var searchDir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (searchDir != null)
            {
                var envPath = Path.Combine(searchDir.FullName, ".env");
                if (File.Exists(envPath))
                {
                    foreach (var line in File.ReadAllLines(envPath))
                    {
                        var trimmed = line.Trim();
                        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#')) continue;
                        var idx = trimmed.IndexOf('=');
                        if (idx > 0)
                        {
                            var k = trimmed.Substring(0, idx).Trim();
                            var v = trimmed.Substring(idx + 1).Trim();
                            if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(k)))
                            {
                                Environment.SetEnvironmentVariable(k, v);
                            }
                        }
                    }
                    break;
                }
                searchDir = searchDir.Parent;
            }

            testConn = Environment.GetEnvironmentVariable("ConnectionStrings__TestConnection");
        }

        if (string.IsNullOrWhiteSpace(testConn))
        {
            throw new InvalidOperationException("CRITICAL: ConnectionStrings__TestConnection environment variable is required to run integration tests. No default fallback allowed.");
        }

        ValidateConnectionString(testConn);
        return testConn;
    }

    public static string ValidateConnectionString(string connectionString)
    {
        var csb = new SqlConnectionStringBuilder(connectionString);
        var dbName = csb.InitialCatalog;

        if (string.IsNullOrWhiteSpace(dbName) || !dbName.EndsWith("_test", StringComparison.OrdinalIgnoreCase))
        {
            // CRITICAL: Exception MUST contain ONLY the database name, never the full connection string!
            throw new InvalidOperationException($"Invalid test database '{dbName}'. Test database name MUST end with '_test'.");
        }

        return dbName;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var testConn = ResolveAndValidateTestConnectionString();
        TargetDatabaseName = new SqlConnectionStringBuilder(testConn).InitialCatalog;

        // Force both DefaultConnection and TestConnection to point strictly to the test DB
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", testConn);
        Environment.SetEnvironmentVariable("ConnectionStrings__TestConnection", testConn);

        var envSeedEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL");
        var seedEmail = !string.IsNullOrWhiteSpace(envSeedEmail)
            ? envSeedEmail
            : "admin@nexora.local";

        var envSeedPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
        var seedPassword = (!string.IsNullOrWhiteSpace(envSeedPassword) && envSeedPassword.Length >= 12)
            ? envSeedPassword
            : $"TestOwner!{Guid.NewGuid():N}123";

        Environment.SetEnvironmentVariable("SEED_ADMIN_EMAIL", seedEmail);
        Environment.SetEnvironmentVariable("SEED_ADMIN_PASSWORD", seedPassword);

        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((ctx, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = testConn,
                ["ConnectionStrings:TestConnection"] = testConn,
                ["SEED_ADMIN_EMAIL"] = seedEmail,
                ["SEED_ADMIN_PASSWORD"] = seedPassword,
                ["SkipTimeTrapMinAge"] = "true",
                ["SkipTurnstileVerification"] = "true",
                ["SkipTimeTrapVerification"] = "false"
            });
        });
    }

    public void EnsureDatabaseMigrated()
    {
        if (_migrated) return;

        lock (_migrateLock)
        {
            if (_migrated) return;

            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var connection = db.Database.GetDbConnection();
            var efDbName = connection.Database;

            if (string.IsNullOrWhiteSpace(efDbName) || !efDbName.EndsWith("_test", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"CRITICAL: EF Core connection database is '{efDbName}', which does not end with '_test'. Refusing to migrate or run tests.");
            }

            db.Database.Migrate();

            var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
            StartupSeeder.SeedAsync(scope.ServiceProvider, env).GetAwaiter().GetResult();

            _migrated = true;
        }
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
    }
}
