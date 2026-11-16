# Theme Studio Guide

Route: `/settings/theme-studio` (visible to users with `themes.view` or `themes.manage`).

The Studio is a three-column workspace:

- Left: theme list + configuration sections.
- Center: token editor for the selected section.
- Right: live preview iframe with desktop / tablet / mobile viewports and light / dark toggle.

## Sections

| Section | Edits |
|---|---|
| Overview | Theme name, tagline, badge, slug; global / website / admin toggles; fallback theme; assignment buttons |
| Presets | Browse and clone the six built-in presets |
| My Themes | Select, duplicate, delete, export, import |
| Colors | Light and dark palettes with contrast badges and per-token reset |
| Typography | Font families, base size, heading weight, heading tracking |
| Components | Button style, card style, table density |
| Layout | Container width, section spacing, navbar height, sidebar width |
| Effects | Shadows, glow, glass blur, gradients, motion |
| History | Published versions with rollback |
| Advanced | Raw JSON editing, import/export, validation feedback |

## Workflow

1. Select a theme. Drafts load automatically if present.
2. Edit tokens. The preview updates immediately from the in-memory config.
3. `Save draft` persists `DraftConfigJson` (optimistic concurrency via `BaseVersionToken`).
4. `Publish` opens a confirmation modal; publishing writes a new `ThemeVersion` and clears the draft.
5. Assign the theme:
   - `Assign to Website` updates `WebsiteThemeId`.
   - `Assign to Admin` updates `AdminThemeId`.
   - `Assign to Both` updates both.
6. The Studio calls `refreshServerTheme()` after publish, assign, rollback, and settings changes, so the Admin UI restyles immediately.

## Preview Isolation

The preview is a sandboxed `<iframe srcDoc>` built from `themeToCss(theme, { mode: "both" })`. It never injects preview CSS into the Admin document.

## Draft Safety

- `beforeunload` warns when the draft has unsaved changes.
- `Discard` restores the baseline; `Restore published` resets to the published configuration.
- `BaseVersionToken` rejects stale draft writes with a conflict message.

## Permissions

| Permission | Capability |
|---|---|
| `themes.view` | Open the Studio, read themes, versions, and settings |
| `themes.manage` | Create, draft, publish, delete, duplicate, activate, rollback, import, export, update settings |

## Troubleshooting

| Symptom | Check |
|---|---|
| Studio not in navigation | User lacks `themes.view` |
| Preview blank | Invalid config; check Advanced panel errors |
| Save returns conflict | Reload the theme to get a fresh `versionToken` |
| Activation has no visible effect | Toggle must be enabled and the assigned slug must exist; check `GET /api/v1/public/theme?app=…` |
| Theme missing on website | `WebsiteThemeEnabled` must be true and the public API reachable |
