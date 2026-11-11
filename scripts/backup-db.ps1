<#
.SYNOPSIS
    Performs a native SQL Server database backup for the Nexora platform.

.PARAMETER DatabaseName
    Name of the source database to back up (default: nexora_dev).

.PARAMETER ServerInstance
    Target SQL Server instance (default: (localdb)\MSSQLLocalDB).

.PARAMETER BackupDirectory
    Destination directory for the .bak backup archive (default: backend/backups).

.PARAMETER BackupFileName
    Optional custom filename for the backup archive.
#>
[CmdletBinding()]
param(
    [string]$DatabaseName = "nexora_dev",
    [string]$ServerInstance = "(localdb)\MSSQLLocalDB",
    [string]$BackupDirectory = "",
    [string]$BackupFileName = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
if ([string]::IsNullOrWhiteSpace($BackupDirectory)) {
    $BackupDirectory = Join-Path $repoRoot "backend\backups"
}

if (-not (Test-Path $BackupDirectory)) {
    New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
}

if ([string]::IsNullOrWhiteSpace($BackupFileName)) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFileName = "${DatabaseName}_${timestamp}.bak"
}

$destinationPath = [System.IO.Path]::GetFullPath((Join-Path $BackupDirectory $BackupFileName))

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Nexora Database Backup Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Source Database : $DatabaseName"
Write-Host "SQL Instance    : $ServerInstance"
Write-Host "Destination File: $destinationPath"
Write-Host ""

$connStr = "Server=$ServerInstance;Database=master;Integrated Security=True;Encrypt=False;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)

try {
    $conn.Open()

    # Verify source database exists
    $checkCmd = $conn.CreateCommand()
    $checkCmd.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = @dbName"
    $checkCmd.Parameters.AddWithValue("@dbName", $DatabaseName) | Out-Null
    $exists = [int]$checkCmd.ExecuteScalar()

    if ($exists -eq 0) {
        throw "Source database '$DatabaseName' does not exist on instance '$ServerInstance'."
    }

    # Execute native SQL Server BACKUP command
    Write-Host "Executing SQL Server native backup..." -ForegroundColor Yellow
    $backupCmd = $conn.CreateCommand()
    $backupCmd.CommandTimeout = 300
    $escapedPath = $destinationPath.Replace("'", "''")
    $backupCmd.CommandText = "BACKUP DATABASE [$DatabaseName] TO DISK = N'$escapedPath' WITH FORMAT, INIT, STATS = 10, NAME = N'Nexora Full Database Backup';"
    $backupCmd.ExecuteNonQuery() | Out-Null

    if (-not (Test-Path $destinationPath)) {
        throw "Backup file was not created at '$destinationPath'."
    }

    $fileInfo = Get-Item $destinationPath
    $fileSizeMB = [Math]::Round($fileInfo.Length / 1MB, 2)

    Write-Host ""
    Write-Host "SUCCESS: Database backup completed successfully!" -ForegroundColor Green
    Write-Host "Archive Path : $destinationPath" -ForegroundColor Green
    Write-Host "Archive Size : $fileSizeMB MB ($($fileInfo.Length) bytes)" -ForegroundColor Green

    return $destinationPath
}
catch {
    Write-Host "ERROR: Database backup failed: $_" -ForegroundColor Red
    throw
}
finally {
    if ($conn -and $conn.State -eq [System.Data.ConnectionState]::Open) {
        $conn.Close()
        $conn.Dispose()
    }
}

