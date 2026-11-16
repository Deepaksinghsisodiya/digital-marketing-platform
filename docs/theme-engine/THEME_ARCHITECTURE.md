# Nexora Dynamic Theme Engine — Architecture

## Goals

- Themes are data, not code. Creating, editing, activating, and rolling back a theme requires no build or redeploy.
- One theme drives both the public website (Next.js SSR) and the Admin dashboard (React SPA).
- Global / Website / Admin activation scopes are independent.
- Safe defaults: any failure (API down, malformed JSON, missing theme) falls back to a valid theme.

## Layers

| Layer | Location | Responsibility |
|---|---|---|
| Token schema + compiler | `packages/design-tokens/src` | TypeScript types, presets, validation, contrast, CSS variable compiler, Tailwind preset |
| Persistence | `backend/.../Persistence` | `Theme`, `ThemeVersion`, `SiteSettings` theme fields |
| Service | `backend/.../Nexora.Infrastructure/Services/ThemeService.cs` | CRUD, drafts, publish, activate, rollback, public resolution, in-memory cache |
| API | `backend/.../Nexora.Api/Endpoints/ThemeEndpoints.cs` | Admin + public HTTP endpoints, ETag, audit, permissions |
| Studio | `apps/admin/src/pages/theme-studio` | Visual editor, preview iframe, publish/activate/import/export |
| Admin runtime | `apps/admin/src/context/ThemeContext.tsx` | Fetch public theme, cache in localStorage, inject `<style>` |
| Website runtime | `apps/website/src/app/layout.tsx` | SSR fetch, resolve, inject `<style>` before content (no FOUC) |

## Data Flow

1. Themes are stored as JSON (`ConfigJson`) with an optional `DraftConfigJson`.
2. `ThemeConfigValidator` rejects unsafe or oversized payloads.
3. On publish, the draft becomes `ConfigJson`, `CurrentVersion` increments, and a `ThemeVersion` row is written.
4. Activation updates `SiteSettings` (`WebsiteThemeId`, `AdminThemeId`, `FallbackThemeId`) with theme slugs, and invalidates the public theme cache.
5. Public clients call `GET /api/v1/public/theme?app=website|admin`.
6. Clients run `resolveTheme()` to merge the payload over a baseline, then `themeToCss()` to generate `:root` + `.dark` CSS variables.

## CSS Variable Contract

The compiler emits variables such as:

```
--nexora-primary: #10b981;
--nexora-primary-rgb: 16 185 129;
--nexora-background: #ffffff;
--nexora-surface: #f8fafc;
--nexora-border: #e2e8f0;
--nexora-radius-md: 0.5rem;
--nexora-shadow-md: ...;
--nexora-font-sans: Inter, ...;
--nexora-gradient-hero: ...;
```

Tailwind reads these variables through `nexoraTailwindPreset`, so components can use semantic utilities:
`bg-primary`, `text-foreground`, `border-border`, `bg-card`, `text-muted`, `rounded-card`, `shadow-glow`.

## Theming Scope

- Global toggle: `GlobalThemeEngineEnabled`.
- Website toggle: `WebsiteThemeEnabled` + `WebsiteThemeId`.
- Admin toggle: `AdminThemeEnabled` + `AdminThemeId`.
- Fallback: `FallbackThemeId` (also Cyber Emerald by default).

## Caching and Freshness

- `ThemeService` caches resolved public themes in `IMemoryCache` (`nexora:theme:website`, `nexora:theme:admin`).
- Publish / activate / rollback / settings changes invalidate the cache.
- The public endpoint replies with SHA256 ETag and `Cache-Control: public, max-age=30, stale-while-revalidate=120`.
- The website SSR fetch uses `no-store` so an activation is visible on the next request.
- The Admin caches the last payload plus compiled CSS in `localStorage` for an instant first paint, then refreshes on load and on window focus.

## Failure Behavior

| Failure | Behavior |
|---|---|
| Public API unreachable | Website `getPublicTheme` returns `null`; `resolveTheme(null)` yields Cyber Emerald |
| Malformed cached payload | Admin ignores the cache and retries the network request |
| Malformed stored JSON | Service resolves against the default preset |
| Missing / deleted active theme | Service falls back to `FallbackThemeId`, then the system default |
| Invalid import | Validator returns errors; no DB write |

## Security Boundaries

- Admin endpoints require `themes.view` / `themes.manage`.
- Mutations are audited via `IAuditLogService`.
- Theme JSON is validated for size, JSON shape, color syntax, gradient syntax, shadow syntax, motion syntax, and forbidden tokens (`javascript:`, `expression(`, `<script`, unsafe characters).
- System presets cannot be deleted; the active/default theme cannot be deleted.
