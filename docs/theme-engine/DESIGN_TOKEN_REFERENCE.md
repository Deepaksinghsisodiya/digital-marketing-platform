# Nexora Design Token Reference

Source of truth: `packages/design-tokens/src/types.ts` and `packages/design-tokens/src/compiler.ts`.

## ThemeConfig

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | `number` | Currently `1` |
| `id` | `string` | Stable id (GUID for custom themes) |
| `slug` | `string` | URL-safe unique slug |
| `name` | `string` | Display name |
| `tagline` | `string` | Short marketing line |
| `badge` | `string?` | Optional preset badge |
| `isSystem` | `boolean?` | True for seeded presets |
| `colors` | `{ light: ColorTokens; dark: ColorTokens }` | Two full palettes |
| `typography` | `TypographyTokens` | Fonts, base size, heading weight, tracking |
| `shape` | `ShapeTokens` | Radii |
| `shadows` | `ShadowTokens` | Elevation + glow + glass blur |
| `gradients` | `GradientTokens` | Brand / hero / accent gradients |
| `layout` | `LayoutTokens` | Container, spacing, navbar, sidebar |
| `motion` | `MotionTokens` | Enabled flag, speed, three durations |
| `components` | `ComponentStyleTokens` | Button/card/table styles |
| `admin` | `AdminThemeTokens` | Sidebar/navbar/widget chrome |

## ColorTokens

Per palette (`light` and `dark`):

- Brand: `primary`, `primaryForeground`, `primaryHover`, `primaryActive`, `secondary`, `secondaryForeground`, `accent`, `accentForeground`
- Surfaces: `background`, `foreground`, `surface`, `surfaceElevated`, `card`, `cardForeground`, `navbar`, `footer`, `sidebar`, `modal`, `overlay`
- Text: `textPrimary`, `textSecondary`, `textMuted`, `textInverted`, `link`, `linkHover`
- UI: `border`, `borderStrong`, `divider`, `input`, `ring`, `selection`, `disabled`, `placeholder`
- Status: `success`, `warning`, `danger`, `info`
- Canvas: `navy`, `ink`

Generated CSS variables (prefix default `--nexora`):

- `--nexora-<token>` for every color
- `--nexora-<token>-rgb` for `primary`, `secondary`, `accent`, `background`, `foreground`, `surface`, `card` (used by Tailwind opacity modifiers)
- Legacy aliases: `--nexora-purple` → primary, `--nexora-blue` / `--nexora-cyan` → accent, `--nexora-paper` → background

Dark mode emits the same variables under `.dark, [data-theme-mode="dark"]`.

## TypographyTokens

| Key | CSS variable |
|---|---|
| `fontSans` | `--nexora-font-sans` |
| `fontHeading` | `--nexora-font-heading` |
| `fontButton` | `--nexora-font-button` |
| `fontNav` | `--nexora-font-nav` |
| `fontMono` | `--nexora-font-mono` |
| `baseFontSize` | `--nexora-font-size-base` |
| `headingWeight` | `--nexora-font-weight-heading` |
| `letterSpacingHeading` | `--nexora-letter-spacing-heading` |

Tailwind utilities: `font-sans`, `font-heading`, `font-mono`.

## ShapeTokens

`radiusSm`, `radiusMd`, `radiusLg`, `radiusXl`, `radiusFull`, `buttonRadius`, `cardRadius`, `inputRadius`.

CSS variables: `--nexora-radius-sm|md|lg|xl|full`, `--nexora-button-radius`, `--nexora-card-radius`, `--nexora-input-radius`.

Tailwind utilities: `rounded-sm|md|lg|xl|full`, `rounded-button`, `rounded-card`, `rounded-input`.

## ShadowTokens

`shadowSm`, `shadowMd`, `shadowLg`, `glow`, `glassBlur` → `--nexora-shadow-sm|md|lg`, `--nexora-glow`, `--nexora-glass-blur`.

Tailwind utilities: `shadow-sm|md|lg`, `shadow-glow`.

## GradientTokens

`gradientBrand`, `gradientHero`, `gradientAccent` → `--nexora-gradient`, `--nexora-gradient-brand`, `--nexora-gradient-hero`, `--nexora-gradient-accent`.

## LayoutTokens

`containerWidth`, `sectionSpacing`, `navbarHeight`, `sidebarWidth` → `--nexora-container-width`, `--nexora-section-spacing`, `--nexora-navbar-height`, `--nexora-sidebar-width`.

## MotionTokens

`enabled`, `speed` (`fast` | `normal` | `slow`), `durationFast`, `durationNormal`, `durationSlow`.

Compiled to `--nexora-anim-duration` and `--nexora-anim-play`. When disabled, duration is `0.001s` and play state is `paused`.

## ComponentStyleTokens

`buttonStyle` (`rounded` | `sharp` | `pill`), `cardStyle` (`flat` | `elevated` | `glass` | `outlined` | `gradient`), `tableDensity` (`compact` | `normal` | `spacious`).

Consumed through Tailwind `rounded-button` / `rounded-card` and Studio-level class selection.

## AdminThemeTokens

`sidebarBg`, `sidebarBorder`, `sidebarActiveItem`, `navbarBg`, `navbarBorder`, `widgetCardBg` → `--nexora-admin-*`.

## Adding a New Token

1. Add the field to the relevant interface in `types.ts`.
2. Add values to every preset in `presets.ts`, including `CYBER_EMERALD_PRESET`.
3. Emit the CSS variable in `compiler.ts` (and an `-rgb` variant if it needs opacity support).
4. Optionally map it to a Tailwind key in `tailwind-preset.ts`.
5. Add validation in `validator.ts` if the value has constrained syntax.
6. Update this document and the Studio panel that edits it.
7. Run `pnpm run check:colors`, `pnpm --filter @nexora/admin build`, `pnpm --filter @nexora/website build`.
