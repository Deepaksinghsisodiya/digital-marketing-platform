# NEXORA — DYNAMIC THEME ENGINE (ALL ROUNDS, ONE RUN)

## ROLE

Act as Principal Software Architect + Senior Full-Stack Engineer + Design System Engineer.

You are working inside the EXISTING Nexora monorepo:
- apps/admin = React + Vite + TypeScript
- apps/website = Next.js 15 (App Router)
- packages/design-tokens = shared tokens
- Backend + database = whatever already exists (DETECT IT, do not assume)

## FINAL GOAL

From the Admin Panel, the admin can create unlimited themes and activate one, and the ENTIRE public website AND the Admin UI change instantly (colors, fonts, radius, shadows, gradients, buttons, cards, forms, tables, sidebar, navbar, effects) with ZERO code changes and ZERO redeployment.

Default theme = Cyber Emerald. On first run everything must look exactly as it does today.

## EXECUTION MODE (VERY IMPORTANT)

- Execute ALL rounds below, in order, in this single run. Do NOT stop between rounds to ask for permission. Do NOT wait for confirmation.
- After each round, run the VERIFICATION GATE. If it fails, fix it before moving on. Only continue when the gate passes.
- Only stop and ask me if you are truly blocked (missing credentials, an irreversible/destructive decision, or an ambiguity that would waste major work). Otherwise make the safest reasonable decision, write it in `docs/theme-engine/THEME_IMPLEMENTATION_LOG.md`, and continue.
- Use a task list / checklist and keep `THEME_IMPLEMENTATION_LOG.md` updated after every round (status, files changed, commands run, issues).
- Never write PASS unless you actually ran the command and saw it succeed. If something cannot be verified (no test runner, no browser), say so honestly.

## HARD RULES

1. Do NOT create a new project. Do NOT replace the architecture. Do NOT remove existing features. Do NOT break existing routes, auth or permissions.
2. Do NOT create a second backend, second theme engine, or a second state-management system. Reuse what exists (existing backend, existing DB, existing admin state management, existing API response conventions, existing auth).
3. TypeScript strict. Follow existing naming conventions.
4. No new dependencies unless unavoidable (justify in the log).
5. Use proper DB migrations (never edit the DB by hand).
6. No hardcoded theme colors in shared components, no per-theme CSS files, no per-theme CSS selectors.
7. The authoritative published theme lives in the DATABASE, never only in localStorage.
8. Theme JSON is UNTRUSTED input: validate strictly, no raw CSS or JS injection.
9. Never publish a draft accidentally. Never expose drafts via public endpoints.
10. If something in this spec conflicts with the real architecture, document the conflict in the log and choose the safest implementation.

---

# ROUND 1 — AUDIT + SEMANTIC TOKEN FOUNDATION

Goal: make every component theme-able. This is a REFACTOR; the UI must look identical afterwards (Cyber Emerald default).

## 1.1 Audit (read-only first)

Detect and record: backend language/framework, DB type, admin state management, Tailwind versions/configs, existing ThemeContext, packages/design-tokens, globals.css, index.css. Do not trust the docs; verify against the code.

Search apps/admin, apps/website, and shared packages for:
- hex / rgb / rgba / hsl colors
- Tailwind palette classes (bg-emerald-500, text-slate-700, border-gray-200, from-purple-600, text-white, bg-black, etc.)
- hardcoded font-family
- hardcoded gradients, box-shadows, glows
- color-specific effect classes (.glow-emerald, .lovable-card, .text-gradient-emerald …)

Write `docs/theme-engine/THEME_ARCHITECTURE_AUDIT.md`: detected stack, current theme implementation (what exists vs only documented), hardcoded color counts per folder + top 20 worst files, migration order, risks. Then continue immediately.

## 1.2 Semantic token set

In packages/design-tokens (adapt existing files, do not duplicate) define semantic CSS variables + TypeScript token names. Colors in RGB-channel format (`16 185 129`) so Tailwind opacity (`bg-primary/50`) works. Every color token exists for light AND dark.

Minimum tokens:
- Brand: primary, primary-foreground, primary-hover, primary-active, secondary, secondary-foreground, accent, accent-foreground
- Surfaces: background, foreground, surface, surface-elevated, card, card-foreground, navbar, footer, sidebar, modal, overlay
- Text: text-primary, text-secondary, text-muted, text-inverted, link, link-hover
- UI: border, border-strong, divider, input, ring, selection, disabled, placeholder
- Status: success, warning, danger, info
- Dark canvas: navy, ink (existing)
- Gradients: gradient-brand, gradient-hero (start, end, direction, type)
- Effects: glow, shadow-sm/md/lg, glass-blur
- Shape: radius-sm/md/lg/xl/full, button-radius, card-radius, input-radius
- Typography: font-heading, font-body, font-button, font-nav, font-mono
- Layout: container-width, section-spacing, navbar-height, sidebar-width
- Motion: motion-enabled, motion-speed

Default values = current Cyber Emerald look. Keep old token names working via aliases.

## 1.3 Tailwind binding

One shared Tailwind preset used by BOTH apps (no duplicated color definitions). Provide semantic classes: bg-background, text-foreground, bg-primary, text-primary-foreground, bg-card, border-border, ring-ring, bg-surface, text-text-muted, bg-success, etc., plus radius, fontFamily, boxShadow bound to variables.

## 1.4 Migrate hardcoded colors

Order: (1) shared primitives (Button, Badge, Card, Input, Textarea, Tabs, Accordion, Modal, Drawer, Table, Toast/Alert) → (2) website Navbar/Footer/Hero/sections → (3) admin Sidebar/Navbar/dashboard widgets/tables/forms/charts → (4) effect classes made generic (.glow-emerald → .glow-primary etc., driven by --glow/--primary; keep old names as aliases).

- Work folder by folder, build after each batch.
- True one-off colors (logos, illustrations) stay and are listed as "intentional exceptions".
- No layout/spacing/copy/behavior changes.

## 1.5 Guardrail

Add a check script (`check:colors` or ESLint/stylelint rule) that fails on new hardcoded hex colors / Tailwind palette color classes in components. Allow-list documented exceptions.

## ROUND 1 GATE
- Typecheck, lint, build for both apps pass.
- Existing tests run (report honestly if none / pre-existing failures).
- check:colors passes.
- Temporarily apply a crazy test palette (e.g. hot pink on white, different fonts) ONLY via CSS variables. Confirm ALL visible UI in website and admin changes. Anything unchanged = leftover hardcode → fix. Remove the test palette afterwards.
- Default (Cyber Emerald) looks identical to before.

---

# ROUND 2 — THEME DATA MODEL + BACKEND API + RUNTIME INJECTION

Goal: themes stored in DB; website and admin load the active theme at runtime.

## 2.1 Token engine (packages/design-tokens)

- `schema.ts`: Zod (or the existing validation lib) schema for the full theme JSON: `{ schemaVersion, colors: { light, dark }, gradients, typography, shape, shadows, components (buttons, cards, forms, tables, modals), layout, motion, effects, admin: { sidebar, navbar, dashboard, tables } }`.
- `defaults.ts` / `presets.ts`: complete JSON for the 6 required presets — Cyber Emerald (default), Silicon Valley, Midnight Violet, Monochrome Stealth, Sapphire Ocean, Champagne Gold. Each must have complete light + dark palettes, typography, button/card/form styles, shadows, gradients, layout, motion (NOT only primary color changes). Optional extra presets: Arctic Minimal, Sunset Gradient, Nordic Minimal, Obsidian Pro.
- `themeToCss(theme, { mode })`: pure function JSON → CSS variable string (`:root{…} .dark{…}`), with ONLY whitelisted properties and sanitized values.
- `validateTheme()`: strict validation — HEX/RGB/HSL colors only, whitelisted fonts, safe gradients, URL checks for font sources, max payload size, bounded numeric ranges. Reject anything unknown. No raw CSS accepted.
- `contrast.ts`: WCAG contrast helper returning warnings for failing combinations (text/background, primary/primary-foreground, etc.).
- `resolveTheme()`: merges partial theme over defaults so missing keys never break the UI.

## 2.2 Database + migrations (use the existing ORM/migration system)

Tables/entities (adapt names to existing conventions; JSONB if PostgreSQL, existing JSON type otherwise):

- `Theme`: id, name, slug (unique), description, config JSON (published), draftConfig JSON (nullable), isSystem, isDefault, isDeleted, createdAt, updatedAt, createdBy, updatedBy, currentVersion
- `ThemeVersion`: id, themeId (FK), versionNumber, config JSON, changedBy, changedAt, changeDescription — unique(themeId, versionNumber)
- `ThemeSettings` (single row, or extend the existing site settings table instead of adding a new one): globalEngineEnabled, websiteThemeEnabled, websiteThemeId, adminThemeEnabled, adminThemeId, fallbackThemeId, updatedAt

Indexes on slug, isDeleted, isSystem. Use transactions for publish/activate/rollback. Optimistic concurrency (version/updatedAt check) for updates.

Seed the system presets via migration/seed (idempotent). System themes cannot be deleted or have their published config edited (only duplicated).

## 2.3 API (follow existing route/response conventions + auth)

Admin (require existing admin auth + a theme-manage permission/role):
- GET /themes, GET /themes/:id
- POST /themes (create), PUT /themes/:id (save DRAFT only)
- DELETE /themes/:id (custom only; block if active/default)
- POST /themes/:id/duplicate
- POST /themes/:id/publish (draft → published, creates a ThemeVersion, busts caches)
- POST /themes/:id/activate (assign to website / admin / both via body `{ target }`)
- GET /themes/:id/versions, POST /themes/:id/rollback
- POST /themes/import, GET /themes/:id/export
- GET/PUT /theme-settings (toggles: global, website, admin)
- Validate every write with the shared schema. Write an audit log entry for create/update/publish/activate/rollback/delete.

Public (no auth, no drafts, no private data):
- GET /public/theme?app=website|admin — returns only the resolved PUBLISHED config for the assigned theme (respecting toggles: if global OFF or app toggle OFF → returns fallback/default theme). Add cache headers + ETag.

## 2.4 Website (Next.js) runtime injection

In RootLayout (server component):
- Fetch public theme server-side with cache tag (`theme`), validate, run `themeToCss`, inject `<style id="nexora-theme">` in `<head>` and `data-theme` attribute BEFORE first render (no FOUC, no hydration mismatch).
- Load fonts for the theme's fonts only (next/font or a validated `<link>`), with `display: swap`.
- If the API fails: use last valid cached theme or built-in default, never crash.
- Add a secure revalidation endpoint (shared secret) called by the backend after publish/activate/rollback → `revalidateTag('theme')`.
- Support preview: `?previewTheme=<id>&token=<signed>` renders the DRAFT only for authorized admins; never cached publicly.

## 2.5 Admin (Vite + React) runtime injection

- Central `ThemeProvider` (reuse/extend the existing ThemeContext; do NOT add a competing state system). Fetch `/public/theme?app=admin` at bootstrap, inject CSS variables before first meaningful render (inline cached copy in localStorage ONLY as a fast-start cache, with the server as the authority).
- Keep personal appearance preference separate: System / Light / Dark (localStorage), applied via `.dark` class. Platform theme ≠ personal light/dark.
- Admin theme toggle OFF → default admin appearance. Website toggle OFF → website default. Independent.
- Support draft preview mode (see Round 3) via an in-memory override that never touches published state.

## ROUND 2 GATE
- Migrations run on a clean DB and on existing data.
- Backend tests: create, update, delete protection (system/active/default), duplicate, publish, activate, rollback, invalid JSON, invalid color, unauthorized publish, concurrent update, persistence. Actually run them.
- Manually (or via script) change the active theme through the API → website SSR output contains the new CSS variables and admin reflects the change without rebuild.
- Toggle tests: website OFF doesn't affect admin; admin OFF doesn't affect website; global OFF → fallback.
- Typecheck/lint/build pass for everything.

---

# ROUND 3 — THEME STUDIO (ADMIN UI)

Route: `/settings/theme-studio` (add to existing settings navigation; keep the old Theme tab working or redirect to the new one without losing features such as announcement banner and section visibility).

## 3.1 Layout (premium SaaS look, responsive, uses theme tokens itself)

- Top bar: theme name, status badge (Draft / Published / Unsaved changes), buttons: Save Draft, Discard, Preview, Publish.
- Left panel (sections): Overview, Presets, My Themes, Colors, Typography, Components, Website Appearance, Admin Appearance, Layout, Effects, Advanced, History.
- Center: live preview (Desktop / Tablet / Mobile switch) rendered in an isolated container or iframe using the DRAFT variables. Preview must never alter the production theme.
- Right panel: active theme info, assignment toggles, last saved/published info, publish controls.

## 3.2 Features

- **Overview / toggles:** Global Theme Engine ON/OFF, Website Theme ON/OFF, Admin Theme ON/OFF, assign theme to website and/or admin (separately), "Set as default".
- **Presets:** visual preview cards for all presets (system, protected). Actions: Preview, Activate, Duplicate.
- **My Themes:** create (blank from default or duplicate), rename, edit, delete (blocked for system/active/default), import JSON, export JSON.
- **Colors:** light/dark tabs; every color token with swatch + color picker + manual HEX/RGB/HSL input + reset-to-default; gradient builder (start, end, direction, type, intensity); live contrast warnings (WCAG AA) next to risky pairs. Optional "auto-generate palette from primary + accent + background".
- **Typography:** heading/body/button/navigation fonts from the approved list (Inter, Geist, Plus Jakarta Sans, DM Sans, Sora, Manrope, Outfit, Roboto, System UI), size, weight, line-height, letter-spacing, text-transform, heading scale. Custom fonts only via validated approved URL (no arbitrary uploads in this version; document it as future work).
- **Components:** buttons (solid/gradient/outline/secondary/ghost/link; rounded/sharp/pill; height, padding, shadow), cards (flat/elevated/glass/outlined/borderless/gradient; radius, shadow, hover), forms (bg, border, focus ring, radius, height), tables (header, row, alternate, hover, density), modals/drawers, badges/alerts.
- **Website Appearance / Layout:** navbar height/background/sticky, footer, container width, section spacing, hero height, grid spacing. Layout settings stay separate from color tokens and cannot break content.
- **Admin Appearance:** sidebar (width, bg, active/hover, text/icon color, border, shadow), navbar, dashboard widgets/metric cards, chart colors, tables, modals, notifications.
- **Effects:** glass, aurora, grid, glow, motion enable + speed (respect prefers-reduced-motion).
- **History:** list versions, compare/view, restore previous version (rollback).
- Keep existing features: announcement banner editor, section visibility matrix, and any other existing settings that lived on the old Theme tab.

## 3.3 State model

Three separate states: Published config (from DB), Draft config (editable, persisted via save-draft), Preview config (live, in memory). Show an unsaved-changes indicator, warn before navigating away, "Discard" resets to saved draft, "Restore published" resets draft to published. Publishing requires an explicit confirmation dialog.

Use the existing admin state management and API client. Keep components reusable and small; no giant single file.

## ROUND 3 GATE
- Create a brand-new custom theme purely from the UI, edit colors/fonts/radius/component styles, see live preview change, save draft, publish, activate on website → website changes without any code change or rebuild. Admin UI changes too when assigned.
- Rollback to a previous version works. Import/export round trip works.
- Invalid values (bad color, unsafe URL) are rejected with clear UI errors.
- Admin UI tests (component/integration) for: preset select, create theme, color + typography edit, live preview, save draft, publish, toggles, rollback, import/export. Run them.
- Typecheck/lint/build pass; check:colors passes.

---

# ROUND 4 — HARDENING, ACCESSIBILITY, PERFORMANCE, DOCS, FINAL AUDIT

- **Cross-app verification:** (1) publish in Admin → website updates; (2) → admin UI updates; (3) independent assignments; (4) website OFF doesn't disable admin and vice versa; (5) new custom theme works with no redeploy; (6) all shared components follow tokens (re-run the crazy-palette test against the DB-driven path).
- **Security review:** schema whitelist, no raw CSS/JS, URL/font validation, payload size limit, permission checks on every admin endpoint, no draft leakage via public API, audit logging present, preview token signed and short-lived.
- **Accessibility:** visible focus rings from tokens, keyboard navigation in Studio, reduced-motion respected, contrast warnings working, responsive on mobile/tablet/desktop.
- **Performance:** no repeated CSS injection, no unnecessary refetch or re-renders, public theme cached + invalidated on publish, fonts limited to the active theme, no hydration mismatch.
- **Fallbacks:** API down → last valid cached/default theme; invalid stored JSON → resolve against defaults, never white-screen.
- **Final hardcode sweep:** re-run check:colors, look for duplicated tokens/duplicated engines, dead code from the old theme implementation (remove only if clearly unused, document it).
- **Docs** in `docs/theme-engine/`: THEME_ARCHITECTURE.md, THEME_ARCHITECTURE_AUDIT.md, DESIGN_TOKEN_REFERENCE.md, THEME_STUDIO_GUIDE.md, CUSTOM_THEME_GUIDE.md, THEME_API_REFERENCE.md, THEME_DATABASE_SCHEMA.md, THEME_TEST_REPORT.md, THEME_IMPLEMENTATION_LOG.md (include: how to add a new token, how to create/publish/rollback a theme, troubleshooting).

## ROUND 4 GATE
Full run: install, typecheck, lint, all tests (backend, admin, website), builds. Record real results in THEME_TEST_REPORT.md. Anything not executed is marked NOT RUN, never PASS.

---

# FINAL ACCEPTANCE CHECKLIST (mark only what you verified)

[ ] Admin can create unlimited custom themes (DB-driven, no code)
[ ] Every supported token is editable (colors light/dark, typography, shape, shadows, gradients, components, layout, effects, motion)
[ ] Website AND Admin UI fully follow the active theme (buttons, cards, forms, tables, sidebar, navbar, modals, charts, notifications)
[ ] Global / Website / Admin toggles work independently
[ ] Draft, preview, publish, activate, rollback, import/export work
[ ] Published theme persisted in DB; website SSR with no FOUC; admin loads dynamically
[ ] No redeploy needed for theme changes
[ ] System presets protected; active/default cannot be deleted
[ ] Validation + security checks in place; no draft leakage
[ ] Accessibility (focus, reduced motion, contrast warnings) and responsive layouts OK
[ ] Existing features, routes, auth and permissions still work
[ ] All tests actually executed and documented

# FINAL RESPONSE FORMAT (after ALL rounds)

1. Detected stack and architecture decisions
2. Audit summary (before/after hardcoded color counts)
3. Files created / modified
4. Database changes (migrations)
5. APIs implemented
6. Theme Studio implementation summary
7. Website + Admin integration summary
8. Presets implemented
9. Real test results (what ran, what passed/failed, what was NOT RUN)
10. Remaining issues / future work
11. Build and deployment instructions
12. Per-round status table: Round, Status (PASS/FAIL/PARTIAL), files affected, tests executed, issues

START NOW with Round 1, Step 1.1. Continue through Round 4 without stopping unless truly blocked.