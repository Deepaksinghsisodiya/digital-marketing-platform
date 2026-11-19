import type { ThemeConfig, ColorMode, ColorTokens } from "./types.js";
import { parseColorToRgb } from "./contrast.js";

function toRgbChannel(colorStr: string): string {
  const parsed = parseColorToRgb(colorStr);
  if (!parsed) return "16 185 129";
  return `${parsed[0]} ${parsed[1]} ${parsed[2]}`;
}

function sanitizeCssVal(val: string): string {
  if (!val) return "";
  return val
    .replace(/[<>{}\\]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/url\((?!['"]?(https?:|\/))/gi, "")
    .trim();
}

function compileColorVars(colors: ColorTokens, prefix = "--nexora"): string[] {
  const vars: string[] = [];

  vars.push(`${prefix}-primary: ${sanitizeCssVal(colors.primary)};`);
  vars.push(`${prefix}-primary-rgb: ${toRgbChannel(colors.primary)};`);
  vars.push(`${prefix}-primary-foreground: ${sanitizeCssVal(colors.primaryForeground)};`);
  vars.push(`${prefix}-primary-hover: ${sanitizeCssVal(colors.primaryHover)};`);
  vars.push(`${prefix}-primary-active: ${sanitizeCssVal(colors.primaryActive)};`);

  vars.push(`${prefix}-secondary: ${sanitizeCssVal(colors.secondary)};`);
  vars.push(`${prefix}-secondary-rgb: ${toRgbChannel(colors.secondary)};`);
  vars.push(`${prefix}-secondary-foreground: ${sanitizeCssVal(colors.secondaryForeground)};`);

  vars.push(`${prefix}-accent: ${sanitizeCssVal(colors.accent)};`);
  vars.push(`${prefix}-accent-rgb: ${toRgbChannel(colors.accent)};`);
  vars.push(`${prefix}-accent-foreground: ${sanitizeCssVal(colors.accentForeground)};`);

  vars.push(`${prefix}-background: ${sanitizeCssVal(colors.background)};`);
  vars.push(`${prefix}-background-rgb: ${toRgbChannel(colors.background)};`);
  vars.push(`${prefix}-foreground: ${sanitizeCssVal(colors.foreground)};`);
  vars.push(`${prefix}-foreground-rgb: ${toRgbChannel(colors.foreground)};`);

  vars.push(`${prefix}-surface: ${sanitizeCssVal(colors.surface)};`);
  vars.push(`${prefix}-surface-rgb: ${toRgbChannel(colors.surface)};`);
  vars.push(`${prefix}-surface-elevated: ${sanitizeCssVal(colors.surfaceElevated)};`);
  vars.push(`${prefix}-surface-raised: ${sanitizeCssVal(colors.surfaceElevated)};`);
  vars.push(`${prefix}-surface-inverse: ${sanitizeCssVal(colors.textInverted)};`);

  vars.push(`${prefix}-card: ${sanitizeCssVal(colors.card)};`);
  vars.push(`${prefix}-card-rgb: ${toRgbChannel(colors.card)};`);
  vars.push(`${prefix}-card-foreground: ${sanitizeCssVal(colors.cardForeground)};`);

  vars.push(`${prefix}-navbar: ${sanitizeCssVal(colors.navbar)};`);
  vars.push(`${prefix}-footer: ${sanitizeCssVal(colors.footer)};`);
  vars.push(`${prefix}-sidebar: ${sanitizeCssVal(colors.sidebar)};`);
  vars.push(`${prefix}-modal: ${sanitizeCssVal(colors.modal)};`);
  vars.push(`${prefix}-overlay: ${sanitizeCssVal(colors.overlay)};`);

  vars.push(`${prefix}-text-primary: ${sanitizeCssVal(colors.textPrimary)};`);
  vars.push(`${prefix}-text-secondary: ${sanitizeCssVal(colors.textSecondary)};`);
  vars.push(`${prefix}-text-muted: ${sanitizeCssVal(colors.textMuted)};`);
  vars.push(`${prefix}-text-inverted: ${sanitizeCssVal(colors.textInverted)};`);
  vars.push(`${prefix}-link: ${sanitizeCssVal(colors.link)};`);
  vars.push(`${prefix}-link-hover: ${sanitizeCssVal(colors.linkHover)};`);

  vars.push(`${prefix}-border: ${sanitizeCssVal(colors.border)};`);
  vars.push(`${prefix}-border-strong: ${sanitizeCssVal(colors.borderStrong)};`);
  vars.push(`${prefix}-border-subtle: ${sanitizeCssVal(colors.divider)};`);
  vars.push(`${prefix}-divider: ${sanitizeCssVal(colors.divider)};`);
  vars.push(`${prefix}-input: ${sanitizeCssVal(colors.input)};`);
  vars.push(`${prefix}-ring: ${sanitizeCssVal(colors.ring)};`);
  vars.push(`${prefix}-focus-ring: ${sanitizeCssVal(colors.ring)};`);
  vars.push(`${prefix}-selection: ${sanitizeCssVal(colors.selection)};`);
  vars.push(`${prefix}-disabled: ${sanitizeCssVal(colors.disabled)};`);
  vars.push(`${prefix}-placeholder: ${sanitizeCssVal(colors.placeholder)};`);

  vars.push(`${prefix}-success: ${sanitizeCssVal(colors.success)};`);
  vars.push(`${prefix}-warning: ${sanitizeCssVal(colors.warning)};`);
  vars.push(`${prefix}-danger: ${sanitizeCssVal(colors.danger)};`);
  vars.push(`${prefix}-info: ${sanitizeCssVal(colors.info)};`);

  vars.push(`${prefix}-navy: ${sanitizeCssVal(colors.navy)};`);
  vars.push(`${prefix}-ink: ${sanitizeCssVal(colors.ink)};`);

  vars.push(`${prefix}-purple: ${sanitizeCssVal(colors.primary)};`);
  vars.push(`${prefix}-blue: ${sanitizeCssVal(colors.accent)};`);
  vars.push(`${prefix}-cyan: ${sanitizeCssVal(colors.accent)};`);
  vars.push(`${prefix}-emerald: ${sanitizeCssVal(colors.primary)};`);
  vars.push(`${prefix}-teal: ${sanitizeCssVal(colors.accent)};`);
  vars.push(`${prefix}-paper: ${sanitizeCssVal(colors.background)};`);
  vars.push(`${prefix}-white: #ffffff;`);

  return vars;
}

export interface CompileOptions {
  mode?: ColorMode | "both";
  prefix?: string;
  scopeSelector?: string;
}

export function themeToCss(
  theme: ThemeConfig,
  options: CompileOptions = {}
): string {
  const { mode = "both", prefix = "--nexora", scopeSelector = ":root" } = options;

  const sharedVars: string[] = [];

  sharedVars.push(`${prefix}-theme-id: "${sanitizeCssVal(theme.id)}";`);
  sharedVars.push(`${prefix}-theme-slug: "${sanitizeCssVal(theme.slug)}";`);

  if (theme.typography) {
    sharedVars.push(`${prefix}-font-sans: ${sanitizeCssVal(theme.typography.fontSans)};`);
    sharedVars.push(`${prefix}-font-heading: ${sanitizeCssVal(theme.typography.fontHeading)};`);
    sharedVars.push(`${prefix}-font-button: ${sanitizeCssVal(theme.typography.fontButton)};`);
    sharedVars.push(`${prefix}-font-nav: ${sanitizeCssVal(theme.typography.fontNav)};`);
    sharedVars.push(`${prefix}-font-mono: ${sanitizeCssVal(theme.typography.fontMono)};`);
    sharedVars.push(`${prefix}-font-size-base: ${sanitizeCssVal(theme.typography.baseFontSize)};`);
    sharedVars.push(`${prefix}-font-weight-heading: ${sanitizeCssVal(theme.typography.headingWeight)};`);
    sharedVars.push(`${prefix}-letter-spacing-heading: ${sanitizeCssVal(theme.typography.letterSpacingHeading)};`);
  }

  if (theme.shape) {
    sharedVars.push(`${prefix}-radius-sm: ${sanitizeCssVal(theme.shape.radiusSm)};`);
    sharedVars.push(`${prefix}-radius-md: ${sanitizeCssVal(theme.shape.radiusMd)};`);
    sharedVars.push(`${prefix}-radius-lg: ${sanitizeCssVal(theme.shape.radiusLg)};`);
    sharedVars.push(`${prefix}-radius-xl: ${sanitizeCssVal(theme.shape.radiusXl)};`);
    sharedVars.push(`${prefix}-radius-full: ${sanitizeCssVal(theme.shape.radiusFull)};`);
    sharedVars.push(`${prefix}-button-radius: ${sanitizeCssVal(theme.shape.buttonRadius)};`);
    sharedVars.push(`${prefix}-card-radius: ${sanitizeCssVal(theme.shape.cardRadius)};`);
    sharedVars.push(`${prefix}-input-radius: ${sanitizeCssVal(theme.shape.inputRadius)};`);
  }

  if (theme.shadows) {
    sharedVars.push(`${prefix}-shadow-sm: ${sanitizeCssVal(theme.shadows.shadowSm)};`);
    sharedVars.push(`${prefix}-shadow-md: ${sanitizeCssVal(theme.shadows.shadowMd)};`);
    sharedVars.push(`${prefix}-shadow-lg: ${sanitizeCssVal(theme.shadows.shadowLg)};`);
    sharedVars.push(`${prefix}-glow: ${sanitizeCssVal(theme.shadows.glow)};`);
    sharedVars.push(`${prefix}-glass-blur: ${sanitizeCssVal(theme.shadows.glassBlur)};`);
  }

  if (theme.gradients) {
    sharedVars.push(`${prefix}-gradient: ${sanitizeCssVal(theme.gradients.gradientBrand)};`);
    sharedVars.push(`${prefix}-gradient-brand: ${sanitizeCssVal(theme.gradients.gradientBrand)};`);
    sharedVars.push(`${prefix}-gradient-hero: ${sanitizeCssVal(theme.gradients.gradientHero)};`);
    sharedVars.push(`${prefix}-gradient-accent: ${sanitizeCssVal(theme.gradients.gradientAccent)};`);
  }

  if (theme.layout) {
    sharedVars.push(`${prefix}-container-width: ${sanitizeCssVal(theme.layout.containerWidth)};`);
    sharedVars.push(`${prefix}-section-spacing: ${sanitizeCssVal(theme.layout.sectionSpacing)};`);
    sharedVars.push(`${prefix}-navbar-height: ${sanitizeCssVal(theme.layout.navbarHeight)};`);
    sharedVars.push(`${prefix}-sidebar-width: ${sanitizeCssVal(theme.layout.sidebarWidth)};`);
  }

  if (theme.motion) {
    if (!theme.motion.enabled) {
      sharedVars.push(`${prefix}-anim-duration: 0.001s;`);
      sharedVars.push(`${prefix}-anim-play: paused;`);
    } else {
      const duration =
        theme.motion.speed === "fast"
          ? theme.motion.durationFast
          : theme.motion.speed === "slow"
            ? theme.motion.durationSlow
            : theme.motion.durationNormal;
      sharedVars.push(`${prefix}-anim-duration: ${sanitizeCssVal(duration)};`);
      sharedVars.push(`${prefix}-anim-play: running;`);
    }
  }

  if (theme.components) {
    const buttonRadius =
      theme.components.buttonStyle === "sharp"
        ? "0px"
        : theme.components.buttonStyle === "pill"
          ? "9999px"
          : theme.shape?.buttonRadius || "0.5rem";
    sharedVars.push(`${prefix}-button-radius: ${sanitizeCssVal(buttonRadius)};`);

    const cardStyle = theme.components.cardStyle;
    const cardBg =
      cardStyle === "outlined"
        ? "transparent"
        : cardStyle === "gradient"
          ? `var(${prefix}-gradient-brand)`
          : `var(${prefix}-card)`;
    const cardBorder =
      cardStyle === "outlined"
        ? `var(${prefix}-border-strong)`
        : `var(${prefix}-border)`;
    const cardShadow =
      cardStyle === "flat" || cardStyle === "outlined"
        ? "none"
        : cardStyle === "glass"
          ? `var(${prefix}-shadow-lg)`
          : cardStyle === "elevated"
            ? `var(${prefix}-shadow-md)`
            : `var(${prefix}-shadow-sm)`;

    sharedVars.push(`${prefix}-card-bg: ${sanitizeCssVal(cardBg)};`);
    sharedVars.push(`${prefix}-card-border-color: ${sanitizeCssVal(cardBorder)};`);
    sharedVars.push(`${prefix}-card-shadow: ${sanitizeCssVal(cardShadow)};`);
    sharedVars.push(
      `${prefix}-card-backdrop: ${
        cardStyle === "glass" ? `blur(var(${prefix}-glass-blur, 12px))` : "none"
      };`,
    );

    const cellPadding =
      theme.components.tableDensity === "compact"
        ? "6px 8px"
        : theme.components.tableDensity === "spacious"
          ? "14px 12px"
          : "10px 10px";
    sharedVars.push(`${prefix}-table-cell-padding: ${cellPadding};`);
  }

  if (theme.admin) {
    sharedVars.push(`${prefix}-admin-sidebar-bg: ${sanitizeCssVal(theme.admin.sidebarBg)};`);
    sharedVars.push(`${prefix}-admin-sidebar-border: ${sanitizeCssVal(theme.admin.sidebarBorder)};`);
    sharedVars.push(`${prefix}-admin-sidebar-active-item: ${sanitizeCssVal(theme.admin.sidebarActiveItem)};`);
    sharedVars.push(`${prefix}-admin-navbar-bg: ${sanitizeCssVal(theme.admin.navbarBg)};`);
    sharedVars.push(`${prefix}-admin-navbar-border: ${sanitizeCssVal(theme.admin.navbarBorder)};`);
    sharedVars.push(`${prefix}-admin-widget-card-bg: ${sanitizeCssVal(theme.admin.widgetCardBg)};`);
  }

  sharedVars.push(`${prefix}-muted: var(${prefix}-text-muted);`);

  let cssOutput = "";

  if (mode === "both") {
    const lightColorVars = compileColorVars(theme.colors.light, prefix);
    const darkColorVars = compileColorVars(theme.colors.dark, prefix);

    cssOutput += `${scopeSelector} {\n  ${[...sharedVars, ...lightColorVars].join("\n  ")}\n}\n\n`;
    cssOutput += `.dark, [data-theme-mode="dark"] {\n  ${darkColorVars.join("\n  ")}\n}`;
  } else if (mode === "light") {
    const lightColorVars = compileColorVars(theme.colors.light, prefix);
    cssOutput += `${scopeSelector} {\n  ${[...sharedVars, ...lightColorVars].join("\n  ")}\n}`;
  } else if (mode === "dark") {
    const darkColorVars = compileColorVars(theme.colors.dark, prefix);
    cssOutput += `${scopeSelector} {\n  ${[...sharedVars, ...darkColorVars].join("\n  ")}\n}`;
  }

  return cssOutput;
}
