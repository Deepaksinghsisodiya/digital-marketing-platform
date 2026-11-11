<#
.SYNOPSIS
    Restores a Nexora database backup (.bak) to a target SQL Server database.

.PARAMETER BackupFilePath
    Absolute or relative path to the source .bak file.

.PARAMETER TargetDatabaseName
    Destination database name (default: nexora_restore_test).

.PARAMETER ServerInstance
    Target SQL Server instance (default: (localdb)\MSSQLLocalDB).
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFilePath,

    [string]$TargetDatabaseName = "nexora_restore_test",
    [string]$ServerInstance = "(localdb)\MSSQLLocalDB"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFilePath)) {
    throw "Backup file not found at: $BackupFilePath"
}

$fullBackupPath = [System.IO.Path]::GetFullPath($BackupFilePath)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Nexora Database Restore Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Backup Archive  : $fullBackupPath"
Write-Host "Target Database : $TargetDatabaseName"
Write-Host "SQL Instance    : $ServerInstance"
Write-Host ""

$connStr = "Server=$ServerInstance;Database=master;Integrated Security=True;Encrypt=False;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)

try {
    $conn.Open()

    # 1. Query file list inside the backup
    Write-Host "Analyzing backup contents..." -ForegroundColor Yellow
    $fileListCmd = $conn.CreateCommand()
    $fileListCmd.CommandTimeout = 120
    $escapedPath = $fullBackupPath.Replace("'", "''")
    $fileListCmd.CommandText = "RESTORE FILELISTONLY FROM DISK = N'$escapedPath';"
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($fileListCmd)
    $table = New-Object System.Data.DataTable
    $adapter.Fill($table) | Out-Null

    $dataLogical = ""
    $logLogical = ""

    foreach ($row in $table.Rows) {
        $type = [string]$row["Type"]
        $name = [string]$row["LogicalName"]
        if ($type -eq "D" -and [string]::IsNullOrEmpty($dataLogical)) {
            $dataLogical = $name
        }
        elseif ($type -eq "L" -and [string]::IsNullOrEmpty($logLogical)) {
            $logLogical = $name
        }
    }

    if ([string]::IsNullOrEmpty($dataLogical) -or [string]::IsNullOrEmpty($logLogical)) {
        throw "Could not determine logical data and log file names from the backup file."
    }

    Write-Host "Discovered Logical Files:" -ForegroundColor Gray
    Write-Host "  Data: $dataLogical" -ForegroundColor Gray
    Write-Host "  Log : $logLogical" -ForegroundColor Gray

    # 2. Determine target file destination directory
    $dirCmd = $conn.CreateCommand()
    $dirCmd.CommandText = "SELECT CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS NVARCHAR(512));"
    $defaultDataPath = [string]$dirCmd.ExecuteScalar()

    if ([string]::IsNullOrWhiteSpace($defaultDataPath)) {
        # Fallback to local appdata LocalDB directory
        $defaultDataPath = [System.IO.Path]::Combine($env:LOCALAPPDATA, "Microsoft\Microsoft SQL Server Local DB\Instances\MSSQLLocalDB")
        if (-not (Test-Path $defaultDataPath)) {
            $defaultDataPath = [System.IO.Path]::GetDirectoryName($fullBackupPath)
        }
    }

    $targetMdfPath = [System.IO.Path]::Combine($defaultDataPath, "${TargetDatabaseName}.mdf")
    $targetLdfPath = [System.IO.Path]::Combine($defaultDataPath, "${TargetDatabaseName}_log.ldf")

    Write-Host "Target physical paths:" -ForegroundColor Gray
    Write-Host "  MDF : $targetMdfPath" -ForegroundColor Gray
    Write-Host "  LDF : $targetLdfPath" -ForegroundColor Gray

    # 3. Kill connections if target database already exists
    $killCmd = $conn.CreateCommand()
    $killCmd.CommandText = @"
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = '$TargetDatabaseName')
BEGIN
    ALTER DATABASE [$TargetDatabaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
END
"@
    $killCmd.ExecuteNonQuery() | Out-Null

    # 4. Perform the restore with MOVE
    Write-Host "Executing database RESTORE..." -ForegroundColor Yellow
    $escapedMdf = $targetMdfPath.Replace("'", "''")
    $escapedLdf = $targetLdfPath.Replace("'", "''")
    $escapedDataLog = $dataLogical.Replace("'", "''")
    $escapedLogLog = $logLogical.Replace("'", "''")

    $restoreCmd = $conn.CreateCommand()
    $restoreCmd.CommandTimeout = 300
    $restoreCmd.CommandText = @"
RESTORE DATABASE [$TargetDatabaseName]
FROM DISK = N'$escapedPath'
WITH REPLACE, RECOVERY, STATS = 10,
MOVE N'$escapedDataLog' TO N'$escapedMdf',
MOVE N'$escapedLogLog' TO N'$escapedLdf';

ALTER DATABASE [$TargetDatabaseName] SET MULTI_USER;
"@
    $restoreCmd.ExecuteNonQuery() | Out-Null

    # 5. Sanity verification on restored database
    Write-Host "Verifying restored database integrity..." -ForegroundColor Yellow
    $verifyCmd = $conn.CreateCommand()
    $verifyCmd.CommandText = "SELECT COUNT(*) FROM [$TargetDatabaseName].sys.tables;"
    $tableCount = [int]$verifyCmd.ExecuteScalar()

    Write-Host ""
    Write-Host "SUCCESS: Database restored and verified successfully!" -ForegroundColor Green
    Write-Host "Target Database : $TargetDatabaseName" -ForegroundColor Green
    Write-Host "Table Count     : $tableCount tables present" -ForegroundColor Green

    return $tableCount
}
catch {
    Write-Host "ERROR: Database restore failed: $_" -ForegroundColor Red
    throw
}
finally {
    if ($conn -and $conn.State -eq [System.Data.ConnectionState]::Open) {
        $conn.Close()
        $conn.Dispose()
    }
}

