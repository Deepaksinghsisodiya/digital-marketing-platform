# Nexora Theme Engine — Architecture Audit Report

**Date:** 2026-11-15  
**Audit Type:** Monorepo Static & Dynamic Codebase Audit  
**Author:** Principal Software Architect & Full-Stack Lead  

---

## 1. Detected Stack & Architecture

| Layer | Detected Technology / Version | Verification Location |
|---|---|---|
| **Backend Framework** | .NET 10.0.403 (C# 13, ASP.NET Core) | `backend/src/Nexora.Api/Program.cs` |
| **ORM & Database** | Entity Framework Core with Microsoft SQL Server (`UseSqlServer`) | `backend/src/Nexora.Infrastructure/DependencyInjection.cs` |
| **Admin App** | React 19 + Vite 6.4.5 + TypeScript (strict) | `apps/admin/package.json` |
| **Admin State Management** | Redux Toolkit (RTK) + RTK Query | `apps/admin/src/store/index.ts`, `adminApi.ts` |
| **Website App** | Next.js 15.5.29 App Router + TypeScript + Tailwind CSS | `apps/website/package.json` |
| **CSS Framework** | Tailwind CSS 3.4.17 with PostCSS 8.4.49 | `apps/website/tailwind.config.ts`, `apps/admin/tailwind.config.ts` |
| **Shared Design Tokens** | TypeScript module `@nexora/design-tokens` | `packages/design-tokens/src/index.ts` |

---

## 2. Current Theme Implementation Status

### What Exists:
1. `packages/design-tokens/src/index.ts`:
   - Basic CSS variable mapping: `--nexora-navy`, `--nexora-purple`, `--nexora-blue`, etc.
   - 6 theme presets defined (`THEME_PRESETS`).
2. `apps/admin/src/context/ThemeContext.tsx`:
   - Local dark/light mode toggle storing `"nexora_admin_theme"` in `localStorage`.
   - Modifies `document.documentElement.classList` (`dark`).
3. `apps/website/src/app/globals.css`:
   - Hardcoded CSS blocks for `:root` and `[data-theme="*"]` for 6 presets.
   - Specific effect classes (`.glow-emerald`, `.text-gradient-electric`).
4. `apps/website/src/app/layout.tsx`:
   - Partial SSR dynamic injection parsing `settings.themeTokensJson` from public site settings.
5. `apps/admin/src/pages/settings/SettingsPage.tsx`:
   - Monolithic Settings Page containing a Theme tab with preset picking and color inputs, saving into `themeTokensJson` string column on `SiteSettings`.

### What Was Missing vs Spec:
1. **Dynamic Theme Engine Database Entities:**
   - Dedicated `Theme` entity (with draft vs published config, slug, system flag, versioning).
   - `ThemeVersion` entity for full rollback/audit history.
   - `ThemeSettings` toggles (GlobalEngineEnabled, WebsiteThemeEnabled, AdminThemeEnabled, FallbackThemeId).
2. **Dedicated Theme Management APIs:**
   - CRUD for themes, duplicate, draft save, publish, rollback, import/export, and activate.
   - Public theme endpoint `/api/v1/public/theme?app=website|admin` with ETag and cache control.
3. **RGB Channel Token System in `packages/design-tokens`:**
   - Tokens were in raw hex or `var()` references rather than `<r> <g> <b>` channel format for full Tailwind opacity modifiers (`bg-primary/50`).
   - Missing explicit light/dark semantic color mappings for surfaces, borders, rings, foregrounds.
4. **Theme Studio (Admin UI):**
   - No dedicated `/settings/theme-studio` route with split three-panel layout, live multi-device iframe/container preview, and WCAG contrast check.
5. **Linting / Guardrails:**
   - No `check:colors` script to enforce token usage.

---

## 3. Hardcoded Color Analysis

Total raw hex / rgb / rgba occurrences found in source code: **299**

### Top Files by Hardcoded Color Count:
1. `apps/website/src/app/globals.css`: **194** (theme preset fallback blocks & glow shadows)
2. `apps/admin/src/index.css`: **29** (default token fallbacks and scrollbars)
3. `apps/admin/src/pages/settings/SettingsPage.tsx`: **17** (color picker defaults & preview swatches)
4. `apps/admin/src/pages/clients/ClientsPage.tsx`: **10** (status pill colors)
5. `apps/admin/src/pages/leads/LeadsPage.tsx`: **8** (pipeline stage badges)
6. `apps/admin/src/pages/cms/PagesListPage.tsx`: **8** (status badges)
7. `apps/admin/src/pages/dashboard/DashboardPage.tsx`: **7** (chart & metric borders)
8. `apps/website/src/components/blocks/HeroBlock.tsx`: **4** (gradient overlay fallbacks)
9. `apps/admin/src/components/ui/button.tsx`: **4**
10. `apps/website/src/app/page.tsx`: **4**

---

## 4. Migration Plan & Risks

### Migration Order:
1. **Round 1:** Update `packages/design-tokens` with full RGB-channel semantic token set, Zod schema, WCAG contrast helper, theme-to-css compiler, and shared Tailwind preset. Add `check:colors` script.
2. **Round 2:** Implement EF Core entities (`Theme`, `ThemeVersion`, `ThemeSettings`), seed the 6 system presets, build the ASP.NET Core API endpoints, and wire runtime injection into both Next.js SSR (`layout.tsx`) and React Admin (`ThemeContext.tsx`).
3. **Round 3:** Build the dedicated `/settings/theme-studio` UI with live preview, preset browser, draft/publish workflow, rollback, import/export, and keep existing settings backwards compatible.
4. **Round 4:** Verification, security hardening, performance testing, and full documentation suite.

### Risks & Mitigations:
- **Risk:** FOUC (flash of unstyled content) on website.
  - *Mitigation:* Next.js Server Component `layout.tsx` generates `<style id="nexora-theme">` synchronously in initial HTML payload before client hydration.
- **Risk:** Breaking existing `SettingsPage.tsx` settings (announcement bar, section visibility, SMTP, identity).
  - *Mitigation:* Preserve all existing settings schemas and provide clean bidirectional sync between `SiteSettings.ThemeTokensJson` and the new `Theme` entities.
