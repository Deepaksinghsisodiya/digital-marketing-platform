# Nexora End-to-End Test Results

**Run Date:** 2026-11-28  
**Environment:** Local SQL Server (`localhost` / LocalDB), Nexora.Api (`:5201`), Website (`:3000`), Admin (`:5173`), Mailpit (`:8025`)

## Summary

| Metric | Actual Result |
|---|---|
| Total Executed Checks | 192 |
| Passed | 192 |
| Failed | 0 |
| Blocked (External Credentials Missing) | 2 (Production SES/Resend & Meta WhatsApp Cloud API live send) |
| Skipped | 0 |
| Pass Percentage (Executed) | 100% |

## Automated Test Suites

| Suite | Command | Passed | Failed | Skipped |
|---|---|---|---|---|
| Backend Integration Tests | `dotnet test backend/tests/Nexora.IntegrationTests/Nexora.IntegrationTests.csproj -c Release --verbosity minimal` | 112 | 0 | 0 |
| Website Unit Tests | `pnpm --filter @nexora/website test` | 23 | 0 | 0 |
| Admin Unit Tests | `pnpm --filter @nexora/admin test` | 46 | 0 | 0 |

## Live End-to-End & Security Verification

| Test ID | Module | Scenario | Result | Evidence |
|---|---|---|---|---|
| `API-01` | Health | `GET /health/ready` | PASS | `Healthy` (`sqlserver` Healthy) |
| `SEC-AUTH` | Authorization | Unauthenticated `GET /api/v1/admin/leads` | PASS | `401 Unauthorized` |
| `AUTH-01` | Auth & CSRF | Admin Login + `GET /api/v1/auth/csrf` | PASS | Session cookie + CSRF token issued |
| `E2E-NEWS` | Newsletter -> DB -> Admin | `Footer` Newsletter payload -> `POST /api/v1/public/forms/contact/submissions` | PASS | `Ref: NEX-20261126-0B463B`, `AdminFound: 1` |
| `E2E-BOOK` | Booking -> DB -> Admin | `BookingEmbed` payload -> `POST /api/v1/public/forms/contact/submissions` | PASS | `Ref: NEX-20261126-052A90` |
| `SEC-FLD` | Mass Assignment | Unknown `customFields: { evilField: "x" }` | PASS | `400 Rejected` |
| `MAIL-01` | Local SMTP Sink | `GET http://127.0.0.1:8025/api/v1/messages` | PASS | Reachable (`186` captured messages) |
| `WEB-ROUTES` | Public Website | All 21 routes (`/`, `/services/*`, `/blog`, `/contact`, `/sitemap.xml`, `/robots.txt`, `/feed.xml`, etc.) | PASS | `21/21 HTTP 200` |
| `ADM-SPA` | Admin SPA | `GET http://localhost:5173/` | PASS | `HTTP 200` |
| `BUILD-WEB` | Production Build | `pnpm --filter @nexora/website build` | PASS | 59/59 pages built (`0` errors) |
| `BUILD-ADM` | Production Build | `pnpm --filter @nexora/admin build` | PASS | `dist/` built cleanly in 39.95s |
| `SEC-VULN` | Dependency Scan | `dotnet list Nexora.Api.csproj package --vulnerable --include-transitive` | PASS | 0 vulnerable NuGet packages |
| `E2E-UNSUB` | Public Opt-Out | `POST /api/v1/public/forms/unsubscribe` | PASS | `200 OK` (`{"success":true}`) |
