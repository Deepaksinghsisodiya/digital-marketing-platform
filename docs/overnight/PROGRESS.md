# Autonomous Overnight Progress Tracker

## Global Status Dashboard

- **Current Phase:** Phase 2 (Schema & Backend Hardening) -> Completed ✅
- **Active Task:** Phase 2 Gate Passed, committing schema hardening & concurrency tokens
- **Test Baseline:** 124 backend tests passing (Unit: 24, Arch: 3, Integration: 97), 0 failed, 0 skipped. Frontend Vitest: 13 passed (Admin: 6, Website: 7). Total: 137 passing tests.
- **Gap Register:** 18 total gaps (7 Closed in Phase 2, 11 Remaining)
- **Known Blockers:** 0

---

## Phase Execution History

### Phase 0: Baseline & Pending Closure (COMPLETED)

- [x] Initialized overnight folder structure (`PLAN.md`, `DECISIONS.md`, `BLOCKERS.md`, `LICENSES.md`, `PROGRESS.md`, `GAP_REGISTER.md`)
- [x] Baseline test run output captured to `docs/overnight/logs/test-output-baseline.txt`
- [x] Documented all endpoint permissions in `docs/overnight/ENDPOINT_PERMISSIONS.md`
- [x] Phase 0 local commit (`b7f20dc`)

### Phase 1: Full Gap Audit (COMPLETED)

- [x] Comprehensive line-by-line codebase audit across Security, Data/SQL, CMS, Website, Admin UX, Marketing, Ops
- [x] Generated `docs/overnight/GAP_REGISTER.md` cataloging 18 prioritized gaps
- [x] Verified zero `.env` tracking
- [x] Phase 1 local commit (`8a4cb67`)

### Phase 2: Schema & Backend Hardening (COMPLETED)

- [x] `OutboxMessage` status model (`Pending`, `Processing`, `Processed`, `DeadLetter`, `DeliveryOutcomeUnknown`), exponential backoff, dead letter reason.
- [x] Concurrency rowversion added to editable entities: `Lead`, `Client`, `TaskItem`, `BlogPost`, `FormDefinition`, `EmailTemplate`.
- [x] Unique composite constraints on `PipelineStage` (Category, StageKey) & (Category, Value) and `NavigationMenu` filtered index for NULL / NOT NULL RegionCode.
- [x] SQL Server check constraint `CK_SiteSettings_SectionVisibility_Json` enforcing `ISJSON([SectionVisibilityJson]) = 1` and default `"{}"`.
- [x] PreviewToken SHA-256 token hashing on generate and lookup (`TokenHash` index).
- [x] SMTP password encryption with ASP.NET Data Protection (`enc:` protected format) in `SiteSettingsService` and decrypted in `MailKitEmailSender`.
- [x] Generated idempotent review script `docs/overnight/migrations-review/20261112_Harden_Schema_Outbox_Concurrency_Indexes.sql`.
- [x] Applied migration `20261111183804_Harden_Schema_Outbox_Concurrency_Indexes` to local SQL Server database.
- [x] Added unit tests `HardenSchemaAndOutboxTests.cs` covering Outbox states, concurrency versions, and SHA-256 token hashing.
- [x] All 124 backend tests passed (0 failed, 0 skipped). Output logged in `docs/overnight/logs/test-output-phase-2.txt`.
- [x] All 13 frontend tests passed. Linter clean. Formatter verified.
