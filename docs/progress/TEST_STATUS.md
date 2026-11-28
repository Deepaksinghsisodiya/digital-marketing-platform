# Test Execution Status (Final)

| Suite | Command | Result | Details |
|---|---|---|---|
| Backend Integration Tests | `dotnet test backend/tests/Nexora.IntegrationTests/Nexora.IntegrationTests.csproj -c Release --verbosity minimal` | PASS | **110 / 110 passed** (0 failed, 0 skipped) |
| Website Typecheck | `pnpm --filter @nexora/website exec tsc --noEmit` | PASS | 0 errors |
| Website Unit Tests | `pnpm --filter @nexora/website test` | PASS | **23 / 23 passed** (7 files) |
| Website Production Build | `pnpm --filter @nexora/website build` | PASS | **59 / 59 pages built** |
| Admin Typecheck | `pnpm --filter @nexora/admin exec tsc --noEmit` | PASS | 0 errors |
| Admin Unit Tests | `pnpm --filter @nexora/admin test` | PASS | **46 / 46 passed** (16 files) |
| Admin Production Build | `pnpm --filter @nexora/admin build` | PASS | `dist/` built cleanly |
| Live E2E & Security QA | Live API + `:3000` + `:5173` + `:8025` | PASS | **9 / 9 suites passed** (`21/21` routes HTTP 200, real Lead/Newsletter/Booking DB persistence, 401/400 security checks) |
| NuGet Vulnerability Scan | `dotnet list backend/src/Nexora.Api/Nexora.Api.csproj package --vulnerable --include-transitive` | PASS | 0 vulnerable packages |
