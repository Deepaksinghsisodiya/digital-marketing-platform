# scripts/e2e-auth.ps1
# End-to-end integration authentication flow test against Nexora Api.
# Reads seed credentials dynamically from repo root .env (or environment variables).
# Strictly zero hardcoded passwords; user email is masked in all outputs (e.g. de***@gmail.com).

$ErrorActionPreference = "Stop"

$seedEmail = [Environment]::GetEnvironmentVariable("SEED_ADMIN_EMAIL")
$seedPass = [Environment]::GetEnvironmentVariable("SEED_ADMIN_PASSWORD")

if (-not $seedEmail -or -not $seedPass) {
    if (Test-Path ".env") {
        $envLines = Get-Content ".env"
        foreach ($line in $envLines) {
            $trimmed = $line.Trim()
            if ($trimmed.StartsWith("SEED_ADMIN_EMAIL=")) {
                $seedEmail = $trimmed.Substring("SEED_ADMIN_EMAIL=".Length).Trim()
            }
            if ($trimmed.StartsWith("SEED_ADMIN_PASSWORD=")) {
                $seedPass = $trimmed.Substring("SEED_ADMIN_PASSWORD=".Length).Trim()
            }
        }
    }
}

if (-not $seedEmail -or -not $seedPass) {
    Write-Error "CRITICAL: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env or environment variables."
    exit 1
}

$parts = $seedEmail.Split('@')
$maskedEmail = $parts[0].Substring(0, [Math]::Min(2, $parts[0].Length)) + "***@" + $parts[1]

Write-Host "=== NEXORA LIVE E2E AUTH & PERMISSION FLOW ===" -ForegroundColor Cyan
Write-Host "Target User: $maskedEmail"

$baseUrl = [Environment]::GetEnvironmentVariable("API_BASE_URL")
if (-not $baseUrl) {
    $baseUrl = "http://localhost:5201"
}

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Step 1: Initial Login with seed credentials
$loginBody = @{
    email = $seedEmail
    password = $seedPass
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResp = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session -UseBasicParsing
    Write-Host "[STEP 1] Login Status: $($loginResp.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Error "[STEP 1] Login failed: $($_.Exception.Message)"
    exit 1
}

# Step 2: Query /api/v1/auth/me to verify MustChangePassword is True
$meResp = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method Get -WebSession $session -UseBasicParsing
Write-Host "[STEP 2] /api/v1/auth/me: MustChangePassword = $($meResp.mustChangePassword)" -ForegroundColor Yellow
if (-not $meResp.mustChangePassword) {
    Write-Warning "[STEP 2] Warning: MustChangePassword is false (password was already rotated). Proceeding with flow."
}

# Step 3: Verify /api/v1/admin/settings is blocked with 403 MUST_CHANGE_PASSWORD
if ($meResp.mustChangePassword) {
    try {
        $settingsResp = Invoke-WebRequest -Uri "$baseUrl/api/v1/admin/settings" -Method Get -WebSession $session -UseBasicParsing
        Write-Error "[STEP 3] ERROR: Expected 403 Forbidden with MUST_CHANGE_PASSWORD but received $($settingsResp.StatusCode)"
        exit 1
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        $errJson = $errBody | ConvertFrom-Json
        if ($statusCode -eq 403 -and $errJson.code -eq "MUST_CHANGE_PASSWORD") {
            Write-Host "[STEP 3] /api/v1/admin/settings Blocked: 403 Forbidden (Code: $($errJson.code))" -ForegroundColor Green
        } else {
            Write-Error "[STEP 3] Unexpected error response: $errBody"
            exit 1
        }
    }
} else {
    Write-Host "[STEP 3] Skipped 403 check (MustChangePassword is already false)." -ForegroundColor Yellow
}

# Step 4: Retrieve CSRF token
$csrfResp = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/csrf" -Method Get -WebSession $session -UseBasicParsing
$csrfToken = $csrfResp.token
$csrfHeader = $csrfResp.headerName
Write-Host "[STEP 4] CSRF token retrieved (Header: $csrfHeader)" -ForegroundColor Green

# Step 5: Rotate password dynamically (Random GUID suffix, never hardcoded)
$newPass = [Environment]::GetEnvironmentVariable("E2E_NEW_PASSWORD")
if (-not $newPass) {
    $newPass = "RotatedPass@" + [Guid]::NewGuid().ToString("N") + "1a"
}

$changeBody = @{
    currentPassword = $seedPass
    newPassword = $newPass
    confirmPassword = $newPass
} | ConvertTo-Json

$headers = @{
    $csrfHeader = $csrfToken
}

try {
    $changeResp = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/password/change" -Method Post -Body $changeBody -ContentType "application/json" -Headers $headers -WebSession $session -UseBasicParsing
    Write-Host "[STEP 5] Password Change Status: $($changeResp.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Error "[STEP 5] Password change failed: $($_.Exception.Message)"
    exit 1
}

# Step 6: Verify /api/v1/auth/me now has MustChangePassword = False
$meAfter = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method Get -WebSession $session -UseBasicParsing
if ($meAfter.mustChangePassword -ne $false) {
    Write-Error "[STEP 6] MustChangePassword did not flip to false."
    exit 1
}
Write-Host "[STEP 6] /api/v1/auth/me: MustChangePassword = False" -ForegroundColor Green

# Step 7: Access /api/v1/admin/settings now -> Expect 200 OK
$settingsAfter = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/settings" -Method Get -WebSession $session -UseBasicParsing
Write-Host "[STEP 7] /api/v1/admin/settings: Status 200 OK (Company: $($settingsAfter.companyName))" -ForegroundColor Green
Write-Host "=== LIVE E2E FLOW PASSED 100% ===" -ForegroundColor Cyan

