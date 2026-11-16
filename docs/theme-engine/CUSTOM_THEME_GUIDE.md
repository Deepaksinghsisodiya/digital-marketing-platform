# Custom Theme Guide

## Create a Theme in the Studio

1. Open `/settings/theme-studio`.
2. Either:
   - Go to `My Themes` → `New theme`, or
   - Go to `Presets` and clone an existing preset.
3. Set the identity fields (name, slug, tagline).
4. Edit colors for both light and dark modes. Watch the contrast badge:
   - `PASS` is safe.
   - `WARNING` should be reviewed.
   - `FAIL` should be fixed before publishing.
5. Adjust typography, shape, shadows, gradients, layout, effects, and motion.
6. `Save draft`, then `Publish`.
7. Assign to `Website`, `Admin`, or `Both`.

No code change or redeploy is required.

## Import a Theme

Use `Advanced` → import, or:

```
POST /api/v1/admin/themes/import
{
  "name": "Acme Brand",
  "slug": "acme-brand",
  "description": "Corporate palette",
  "configJson": "{ ...full ThemeConfig... }"
}
```

The validator rejects invalid JSON, oversized payloads, and unsafe CSS values.

## Export a Theme

`My Themes` → export downloads the theme JSON, or call:

```
GET /api/v1/admin/themes/{id}/export
```

## Publish and Roll Back

- Publishing increments `CurrentVersion` and appends a `ThemeVersion`.
- `History` lists versions; `Rollback` restores a previous version as a new current version.
- Rolling back does not delete history.

## Activation Semantics

- `WebsiteThemeId` / `AdminThemeId` / `FallbackThemeId` store theme slugs.
- Assigning by theme id is mapped to its slug by the service.
- When a toggle is off, that application resolves to the fallback theme.
- When the fallback is missing or deleted, the system default is used.

## Recommended Design Rules

- Keep `primary` and `primaryForeground` at high contrast.
- Keep `background` and `foreground` at high contrast in both modes.
- Use `surface` for section bands and `card` for raised panels.
- Use `border` sparingly; prefer spacing and elevation.
- Keep radii consistent across button/card/input.
- Keep motion subtle; the compiler honors the motion toggle and `prefers-reduced-motion` in app CSS.

## Validation Limits

- Max config size: 256 KB.
- Required: `name`.
- Rejected: unsafe characters, `javascript:`, `expression(`, `<script`.
- Colors, shadows, gradients, and motion values must match accepted CSS patterns.

## Delete Rules

- System presets cannot be deleted.
- The active default theme cannot be deleted.
- Deleting a custom theme soft-deletes it; history is retained.
