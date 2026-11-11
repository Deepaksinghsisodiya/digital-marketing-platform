# Nexora Digital Marketing Platform — One-Click Local Launcher
# Starts Mailpit, .NET 10 API, Next.js Website, and Vite Admin Panel

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Nexora Digital Marketing Platform (Local Dev)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start SQL Server LocalDB
Write-Host "[1/4] Ensuring SQL Server LocalDB is running..." -ForegroundColor Yellow
sqllocaldb start MSSQLLocalDB

# 2. Start Mailpit (SMTP 1025, Web 8025)
Write-Host "[2/4] Starting Mailpit Email Capture on :8025 (SMTP :1025)..." -ForegroundColor Yellow
Start-Process -FilePath "infra\tools\mailpit.exe" -ArgumentList "-s [::]:1025 -l [::]:8025" -WindowStyle Minimized

# 3. Start Backend API (:5201)
Write-Host "[3/4] Launching ASP.NET Core API on http://localhost:5201..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run --project backend\src\Nexora.Api --urls 'http://localhost:5201'"

# 4. Start Admin Panel (:5173) & Website (:3000)
Write-Host "[4/4] Launching Website (:3000) & Admin SPA (:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm run website:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm run admin:dev"

Write-Host ""
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host "  - Public Website: http://localhost:3000" -ForegroundColor White
Write-Host "  - Agency Admin:   http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:    http://localhost:5201/scalar/v1" -ForegroundColor White
Write-Host "  - Mailpit UI:     http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "Admin Access:" -ForegroundColor Cyan
Write-Host "  Credentials configured via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

