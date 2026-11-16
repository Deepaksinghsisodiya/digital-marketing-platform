# Theme Engine Test Report

Date: 2026-11-16
Environment: Windows, .NET 10, Node 20+, pnpm workspace, SQL Server (local).

## Executed Commands and Results

| Area | Command | Result |
|---|---|---|
| Backend build | `dotnet build backend/src/Nexora.Api/Nexora.Api.csproj` | PASS — 0 errors, 89 pre-existing warnings |
| Backend unit tests | `dotnet test backend/tests/Nexora.UnitTests/Nexora.UnitTests.csproj` | PASS — 37 passed / 0 failed (including ThemeEngineTests) |
| Backend architecture tests | `dotnet test backend/tests/Nexora.ArchitectureTests` | PASS — 3 passed / 0 failed |
| Backend integration tests | `dotnet test backend/tests/Nexora.IntegrationTests` | PARTIAL — 99 passed / 3 failed (email delivery environment) |
| Admin tests | `pnpm --filter @nexora/admin test` | PASS — 46 passed / 0 failed (16 files) |
| Admin build | `pnpm --filter @nexora/admin build` | PASS — typecheck + Vite build (0 errors) |
| Admin lint | `pnpm --filter @nexora/admin lint` | PASS — 0 errors, 1 warning (`ThemeStudioPage` hook dependency) |
| Website tests | `pnpm --filter @nexora/website test` | PASS — 19 passed / 0 failed (5 files) |
| Website build | `pnpm --filter @nexora/website build` | PASS — all routes compiled |
| Website lint | `pnpm --filter @nexora/website lint` | PASS — no warnings or errors |
| Color guardrail | `pnpm run check:colors` | PASS — 0 violations |
| Migration | `20261115204151_Add_Themes_And_ThemeSettings` | Present and verified |

## Integration Failures (environmental)

All three failures are in `EmailAndOutboxIntegrationTests` and depend on real outbound SMTP delivery:

- `ProcessOutboxMessages_ShouldSendEmailsAndRecordLogs`
- `TestSendEmail_ShouldDeliverTestEmail`
- `TestSendEmail_ClientAndRoleTemplates_ShouldDeliverAndLogSuccessfully`

They assert `EmailDeliveryStatus.Sent`, which requires a configured SMTP server. They are unrelated to the theme engine. Marked **FAIL (environment)** rather than PASS.

## Theme-Specific Coverage Executed

Admin (`vitest`):

- `ThemeStudioPage.test.tsx` — full page integration (tab switching, viewport/mode toggles, publish modal flow).
- `themeStudioUtils.test.ts` — JSON parsing, deep clone, path get/set, slugify.
- `themeStudioWorkflow.test.ts` — edit → draft → publish → CSS token generation; live style isolation.
- `panels/OverviewPanel.test.tsx` — theme identity, master toggles, website/admin/both assignments.
- `panels/ColorsPanel.test.tsx` — light/dark color field updates and contrast badge.
- `panels/TypographyPanel.test.tsx` — base font size, font family stacks, weights.
- `panels/ComponentsPanel.test.tsx` — button/card styles, table density, shape radii, admin surfaces.
- `panels/LayoutPanel.test.tsx` — container widths, section spacing, navbar/sidebar dimensions.
- `panels/EffectsPanel.test.tsx` — shadows, glows, motion toggle, and duration speeds.
- `panels/HistoryPanel.test.tsx` — version listing, snapshot viewer, rollback protection.
- `panels/AdvancedPanel.test.tsx` — raw JSON validation, error handling, reset editor.
- `panels/PresetsPanel.test.tsx` — preset cloning, opening, and selection.
- `panels/MyThemesPanel.test.tsx` — list rendering, selection, create/duplicate/delete/import/export actions.
- `ThemePreview.test.tsx` — sandboxed iframe `srcDoc` composition and mode/viewport switching.

Backend:

- Permission catalog updated and asserted: `themes.view`, `themes.manage` (18 total permissions).
- Architecture tests confirm layering and dependency rules.
- Integration suite exercises authentication, CMS, RBAC, backup/restore, and outbox behavior alongside the new tables.

## NOT RUN

- Manual visual QA in a real browser across Chrome/Firefox/Safari/Edge.
- Real SMTP delivery validation.
- Production/staging database migration execution (migration generated and inspected only).
- Lighthouse / performance budgets.
- Load testing of the public theme endpoint.
- Screenshot-based visual regression.

## Notes

- Admin bundle is 918.81 kB (231.14 kB gzip); Vite warns about chunks over 500 kB. This is a pre-existing size trend, not a regression.
- Website build reports dynamic server-rendering routes, expected for the CMS-driven app.
