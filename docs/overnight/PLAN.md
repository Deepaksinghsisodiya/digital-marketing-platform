# Autonomous Overnight Master Execution Plan

This master plan details the autonomous execution roadmap across Phases 0 through 8, establishing test counts, safety gates, evidence logs, and architectural hardening for the Nexora platform.

---

## High-Level Execution Schedule

```
Phase 0: Baseline & Pending Closures
  ├── Capture baseline test log (116 tests)
  ├── Permission parity table (`ENDPOINT_PERMISSIONS.md`)
  ├── Turnstile fail-closed & SPAM_TOKEN_SECRET validation tests
  └── Dev reseed state verification

Phase 1: Deep Project Gap Audit & Register
  ├── Line-by-line audit across Security, Data/SQL, CMS, Website, Admin UX, Marketing, Ops
  └── Populate `GAP_REGISTER.md` with Critical/High/Med/Low severities

Phase 2: Database Schema & Backend Hardening
  ├── Corrective migration with reviewed SQL in `migrations-review/`
  ├── Outbox table hardening (DeliveryOutcomeUnknown, DeadLetter, NextAttempt, retry limit)
  ├── Rowversion optimistic concurrency on editable entities
  ├── Unique constraints (PipelineStages, Menus without region overlap)
  └── SMTP encrypted credential storage via ASP.NET Core Data Protection

Phase 3: Design System & Token Foundation
  ├── CSS variables theme token bridge (colors, radius, spacing, typography)
  ├── OFL self-hosted font loading via `next/font` (Inter, Plus Jakarta Sans)
  └── Admin dynamic theme editor injection

Phase 4: Public Website (Industry-Standard Experience)
  ├── All core pages & sections driven by dynamic CMS blocks & collections
  ├── Sample data marking on seed content
  ├── Dynamic region switcher & localized contact / pricing
  └── Lighthouse & WCAG AA contrast compliance

Phase 5: Admin Panel (Modern Cockpit)
  ├── Theme editor, Menu manager, Media library, Visual Page Editor
  ├── Search bar & notification center integration
  └── Robust error/empty/loading state handling across all screens

Phase 6: Marketing Engine & Integrations
  ├── Lead scoring engine, tags, simple segmentation
  ├── UTM attribution capture & dashboard widget
  ├── SSRF-safe outbound webhook delivery
  └── Booking embed (Cal.com / Calendly) & ROI calculator block

Phase 7: End-to-End Verification & Disaster Recovery
  ├── Playwright E2E flows (auth, CMS publish, lead capture to email)
  ├── Backup & restore PowerShell scripts (`backup-db.ps1`, `restore-db.ps1`)
  └── Automated restore verification test against `nexora_restore_test`

Phase 8: Final Polish & Morning Handoff
  ├── Pixel-level UI polish, micro-animations, empty states
  ├── Demo walkthrough guide (`DEMO_SCRIPT.md`)
  └── Comprehensive Morning Report (`MORNING_REPORT.md`)
```

---

## Phase Gate Checklist (Every Commit Must Satisfy)

1. `dotnet build` 0 errors; `dotnet test` 0 failed, 0 skipped, test count >= baseline.
2. `pnpm -r lint`, `pnpm run format:check`, `pnpm -r test`, `pnpm --filter @nexora/website build`, `pnpm --filter @nexora/admin build` all exit 0.
3. No `.env` files tracked (`git ls-files | findstr /i "\.env"` returns empty).
4. Raw log generated in `docs/overnight/logs/`.
5. Local commit formatted as `phase-N: <description> (tests: X pass, 0 fail, 0 skip)`.
