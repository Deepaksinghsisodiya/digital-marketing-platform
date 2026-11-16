/**
 * Nexora Platform - Central Semantic Design Tokens & Theme Types
 */

export type ColorMode = "light" | "dark";

export interface ColorTokens {
  // Brand
  primary: string; // e.g. "#10b981" or "16 185 129"
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Surfaces
  background: string;
  foreground: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardForeground: string;
  navbar: string;
  footer: string;
  sidebar: string;
  modal: string;
  overlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;
  link: string;
  linkHover: string;

  // UI elements
  border: string;
  borderStrong: string;
  divider: string;
  input: string;
  ring: string;
  selection: string;
  disabled: string;
  placeholder: string;

  // Status
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Dark Canvas Foundation
  navy: string;
  ink: string;
}

export interface TypographyTokens {
  fontSans: string;
  fontHeading: string;
  fontButton: string;
  fontNav: string;
  fontMono: string;
  baseFontSize: string; // e.g. "16px"
  headingWeight: string; // e.g. "700"
  letterSpacingHeading: string; // e.g. "-0.025em"
}

export interface ShapeTokens {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusFull: string;
  buttonRadius: string;
  cardRadius: string;
  inputRadius: string;
}

export interface ShadowTokens {
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  glow: string;
  glassBlur: string;
}

export interface GradientTokens {
  gradientBrand: string;
  gradientHero: string;
  gradientAccent: string;
}

export interface LayoutTokens {
  containerWidth: string; // e.g. "1280px"
  sectionSpacing: string; // e.g. "5rem"
  navbarHeight: string; // e.g. "4.5rem"
  sidebarWidth: string; // e.g. "16rem"
}

export interface MotionTokens {
  enabled: boolean;
  speed: "fast" | "normal" | "slow";
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
}

export interface ComponentStyleTokens {
  buttonStyle: "rounded" | "sharp" | "pill";
  cardStyle: "flat" | "elevated" | "glass" | "outlined" | "gradient";
  tableDensity: "compact" | "normal" | "spacious";
}

export interface AdminThemeTokens {
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActiveItem: string;
  navbarBg: string;
  navbarBorder: string;
  widgetCardBg: string;
}

export interface ThemeConfig {
  schemaVersion: number;
  id: string;
  slug: string;
  name: string;
  tagline: string;
  badge?: string;
  isSystem?: boolean;
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  typography: TypographyTokens;
  shape: ShapeTokens;
  shadows: ShadowTokens;
  gradients: GradientTokens;
  layout: LayoutTokens;
  motion: MotionTokens;
  components: ComponentStyleTokens;
  admin: AdminThemeTokens;
}

export interface ThemeSettingsState {
  globalEngineEnabled: boolean;
  websiteThemeEnabled: boolean;
  websiteThemeId: string;
  adminThemeEnabled: boolean;
  adminThemeId: string;
  fallbackThemeId: string;
  updatedAt: string;
}

export interface ContrastResult {
  pair: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: "PASS" | "WARNING" | "FAIL";
}
