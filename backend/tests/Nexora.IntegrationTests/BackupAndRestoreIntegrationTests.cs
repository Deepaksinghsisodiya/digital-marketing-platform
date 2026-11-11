using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nexora.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Nexora.IntegrationTests;

[Collection("IntegrationTests")]
public class BackupAndRestoreIntegrationTests
{
    private readonly NexoraTestWebApplicationFactory _factory;

    public BackupAndRestoreIntegrationTests(NexoraTestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void DatabaseBackupAndRestore_ShouldSucceed_AndVerifySchemaIntegrity()
    {
        using var scope = _factory.Services.CreateScope();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var testConnString = config.GetConnectionString("TestConnection")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=nexora_test;Integrated Security=True;TrustServerCertificate=True";

        var builder = new SqlConnectionStringBuilder(testConnString);
        var sourceDb = builder.InitialCatalog;
        var masterConnString = new SqlConnectionStringBuilder(testConnString)
        {
            InitialCatalog = "master"
        }.ConnectionString;

        var tempBackupPath = Path.Combine(Path.GetTempPath(), $"nexora_test_backup_{Guid.NewGuid():N}.bak");

        using var conn = new SqlConnection(masterConnString);
        conn.Open();

        try
        {
            // 1. Take backup of test database
            using (var backupCmd = conn.CreateCommand())
            {
                backupCmd.CommandTimeout = 120;
                backupCmd.CommandText = $"BACKUP DATABASE [{sourceDb}] TO DISK = N'{tempBackupPath}' WITH FORMAT, INIT;";
                backupCmd.ExecuteNonQuery();
            }

            File.Exists(tempBackupPath).ShouldBeTrue();
            new FileInfo(tempBackupPath).Length.ShouldBeGreaterThan(0);

            // 2. Discover logical file names
            string? dataLogical = null;
            string? logLogical = null;

            using (var fileListCmd = conn.CreateCommand())
            {
                fileListCmd.CommandText = $"RESTORE FILELISTONLY FROM DISK = N'{tempBackupPath}';";
                using var reader = fileListCmd.ExecuteReader();
                while (reader.Read())
                {
                    var type = reader["Type"]?.ToString();
                    var name = reader["LogicalName"]?.ToString();
                    if (type == "D" && dataLogical == null) dataLogical = name;
                    else if (type == "L" && logLogical == null) logLogical = name;
                }
            }

            dataLogical.ShouldNotBeNullOrEmpty();
            logLogical.ShouldNotBeNullOrEmpty();

            // 3. Restore to an isolated test db name
            var restoredDb = $"nexora_verify_{Guid.NewGuid():N}";
            var tempMdf = Path.Combine(Path.GetTempPath(), $"{restoredDb}.mdf");
            var tempLdf = Path.Combine(Path.GetTempPath(), $"{restoredDb}_log.ldf");

            try
            {
                using (var restoreCmd = conn.CreateCommand())
                {
                    restoreCmd.CommandTimeout = 120;
                    restoreCmd.CommandText = $@"
                        RESTORE DATABASE [{restoredDb}]
                        FROM DISK = N'{tempBackupPath}'
                        WITH REPLACE, RECOVERY,
                        MOVE N'{dataLogical}' TO N'{tempMdf}',
                        MOVE N'{logLogical}' TO N'{tempLdf}';
                        ALTER DATABASE [{restoredDb}] SET MULTI_USER;";
                    restoreCmd.ExecuteNonQuery();
                }

                // 4. Verify table count in restored DB
                using (var verifyCmd = conn.CreateCommand())
                {
                    verifyCmd.CommandText = $"SELECT COUNT(*) FROM [{restoredDb}].sys.tables;";
                    var tableCount = Convert.ToInt32(verifyCmd.ExecuteScalar());
                    tableCount.ShouldBeGreaterThanOrEqualTo(20);
                }
            }
            finally
            {
                // Clean up restored DB and files
                using var dropCmd = conn.CreateCommand();
                dropCmd.CommandText = $@"
                    IF EXISTS (SELECT 1 FROM sys.databases WHERE name = '{restoredDb}')
                    BEGIN
                        ALTER DATABASE [{restoredDb}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                        DROP DATABASE [{restoredDb}];
                    END";
                dropCmd.ExecuteNonQuery();

                if (File.Exists(tempMdf)) File.Delete(tempMdf);
                if (File.Exists(tempLdf)) File.Delete(tempLdf);
            }
        }
        finally
        {
            if (File.Exists(tempBackupPath))
            {
                File.Delete(tempBackupPath);
            }
        }
    }
}

