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

## DEC-004: Outbox Message Status & Queue Draining Loop

- **Context:** Outbox messages previously relied solely on `ProcessedAtUtc == null` with a fixed `Take(100)` query. A backlog of messages from prior test runs or bursts caused newly inserted outbox messages to wait indefinitely if the worker only processed one fixed batch per invocation.
- **Decision:**
  1. Introduce explicit `OutboxMessageStatus` enum (`Pending`, `Processing`, `Processed`, `DeadLetter`, `DeliveryOutcomeUnknown`).
  2. Implement bounded exponential backoff (`NextAttemptAtUtc`) and dead letter marking after 5 failed attempts.
  3. Update `OutboxProcessor.ProcessPendingMessagesAsync` with a loop draining up to 100 messages per iteration until the queue has fewer than 100 pending messages, preventing queue starvation.

## DEC-005: Data Protection Encryption for Stored SMTP Credentials

- **Context:** `SiteSettings.SmtpPassword` was previously persisted in plaintext in SQL Server.
- **Decision:** Use ASP.NET Core `IDataProtectionProvider` with purpose `"Nexora.SmtpCredentials"`. Stored passwords are prefixed with `"enc:"` when encrypted. `MailKitEmailSender` seamlessly detects `"enc:"` and decrypts using the DPAPI data protector, preserving backwards compatibility with legacy plaintext entries if unencrypted.
