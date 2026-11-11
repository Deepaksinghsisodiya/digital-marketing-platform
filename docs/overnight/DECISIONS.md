# Autonomous Architectural Decisions Log

This log records every significant design, schema, security, and UI decision made during the autonomous execution run.

## DEC-001: Autonomous Execution Mode Initiated

- **Context:** User requested overnight autonomous execution across 8 phases until tomorrow afternoon.
- **Decision:** Suspend human-in-the-loop approvals for non-destructive actions, enable local git commits per phase gate, enforce strict no-push policy, retain single-tenant Clean Architecture and SQL Server persistence.
- **Date/Time:** 2026-11-11 23:48 IST

## DEC-002: Public Media Streaming Header Sanitization

- **Context:** Browser image preview was failing with broken thumbnail on `http://localhost:5174/media`.
- **Root Cause:** `Results.File` in ASP.NET Core was sending `Content-Disposition: attachment; filename="..."` which Chrome refuses to render inline in `<img>` tags.
- **Decision:** Strip `fileDownloadName` from public streaming endpoints (`/{*path}` and `/{id}`), preserving `Content-Disposition: attachment` strictly for explicit `/{id}/download` requests.
- **Impact:** Images render natively in browser `<img>` elements without cross-origin or download intercept issues.

## DEC-003: Regional Price Localization via Cookie & Fallback

- **Context:** Pricing block on public website was hardcoded to USD.
- **Decision:** Support both `IN` (INR `₹1,49,000` / `₹2,99,000`) and `US` (USD `$1,990` / `$3,990`) dynamically resolved through `nexora_region` cookie with fallback to default region (`IN`).
