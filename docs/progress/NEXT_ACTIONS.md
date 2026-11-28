# Next Actions

1. Confirm `task-2211` (`Nexora.IntegrationTests` in Release) passes 110/110.
2. Start `Nexora.Api` (`-c Release --no-build`) on `:5201` and re-run live E2E verification (`E2E-LEAD` -> DB -> Admin Leads -> Mailpit + Theme live sync + Admin CRUD roundtrip).
3. Run `pnpm --filter @nexora/website build` (`next build`) and security/vulnerability scans (`dotnet list package --vulnerable`, `pnpm audit --prod`).
4. Complete required audit docs (`docs/PROJECT_ARCHITECTURE.md`, `docs/PROJECT_AUDIT.md`, `docs/DEPENDENCY_AUDIT.md`, `docs/STATIC_DATA_AUDIT.md`, `docs/OPEN_SOURCE_REFERENCE_AUDIT.md`, `docs/SECURITY_AUDIT.md`).
5. Write `docs/testing/*`, `docs/FINAL_PROJECT_COMPLETION_REPORT.md`, and `docs/progress/MORNING_HANDOFF.md`.
