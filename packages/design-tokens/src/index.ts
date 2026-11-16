/**
 * Nexora Platform - Central Semantic Design Tokens Engine
 * Single Source of Truth for Dynamic Multi-Theming
 */

export * from "./types.js";
export * from "./schema.js";
export * from "./presets.js";
export * from "./compiler.js";
export * from "./validator.js";
export * from "./contrast.js";
export * from "./resolver.js";
export * from "./tailwind-preset.js";

import { SYSTEM_THEME_PRESETS } from "./presets.js";
import type { ThemeConfig } from "./types.js";

// Backwards compatibility for existing ThemePreset interface
export interface LegacyThemePreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  navyColor: string;
  gradient: string;
  glowColor: string;
}

export type { LegacyThemePreset as ThemePreset };

export const THEME_PRESETS: LegacyThemePreset[] = SYSTEM_THEME_PRESETS.map((p: ThemeConfig) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  badge: p.badge || "Nexora",
  primaryColor: p.colors.light.primary,
  accentColor: p.colors.light.accent,
  navyColor: p.colors.light.navy,
  gradient: p.gradients.gradientBrand,
  glowColor: p.shadows.glow,
}));

export const defaultCssVariables = {
  "--nexora-navy": "#080c14",
  "--nexora-ink": "#0d1422",
  "--nexora-muted": "#64748b",
  "--nexora-paper": "#ffffff",
  "--nexora-white": "#ffffff",
  "--nexora-primary": "#10b981",
  "--nexora-accent": "#06b6d4",
  "--nexora-purple": "#10b981",
  "--nexora-purple-light": "#ecfdf5",
  "--nexora-purple-dark": "#047857",
  "--nexora-blue": "#059669",
  "--nexora-blue-light": "#ecfdf5",
  "--nexora-blue-dark": "#064e3b",
  "--nexora-cyan": "#06b6d4",
  "--nexora-cyan-light": "#ecfeff",
  "--nexora-pink": "#14b8a6",
  "--nexora-pink-light": "#f0fdfa",
  "--nexora-orange": "#f59e0b",
  "--nexora-orange-light": "#fffbeb",
  "--nexora-green": "#10b981",
  "--nexora-green-light": "#ecfdf5",
  "--nexora-green-dark": "#047857",
  "--nexora-border": "#e2e8f0",
  "--nexora-font-sans":
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  "--nexora-font-mono":
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  "--nexora-radius-sm": "0.375rem",
  "--nexora-radius-md": "0.5rem",
  "--nexora-radius-lg": "0.75rem",
  "--nexora-radius-xl": "1rem",
} as const;

export const tokens = {
  colors: {
    navy: "var(--nexora-navy, #080c14)",
    ink: "var(--nexora-ink, #0d1422)",
    muted: "var(--nexora-muted, #64748b)",
    paper: "var(--nexora-paper, #ffffff)",
    white: "var(--nexora-white, #ffffff)",
    primary: "var(--nexora-primary, #10b981)",
    accent: "var(--nexora-accent, #06b6d4)",
    purple: {
      light: "var(--nexora-purple-light, #ecfdf5)",
      DEFAULT: "var(--nexora-purple, #10b981)",
      dark: "var(--nexora-purple-dark, #047857)",
    },
    blue: {
      light: "var(--nexora-blue-light, #ecfdf5)",
      DEFAULT: "var(--nexora-blue, #059669)",
      dark: "var(--nexora-blue-dark, #064e3b)",
    },
    cyan: {
      light: "var(--nexora-cyan-light, #ecfeff)",
      DEFAULT: "var(--nexora-cyan, #06b6d4)",
    },
    pink: {
      light: "var(--nexora-pink-light, #f0fdfa)",
      DEFAULT: "var(--nexora-pink, #14b8a6)",
    },
    orange: {
      light: "var(--nexora-orange-light, #fffbeb)",
      DEFAULT: "var(--nexora-orange, #f59e0b)",
    },
    green: {
      light: "var(--nexora-green-light, #ecfdf5)",
      DEFAULT: "var(--nexora-green, #10b981)",
      dark: "var(--nexora-green-dark, #047857)",
    },
    border: "var(--nexora-border, #e2e8f0)",
  },
  fonts: {
    sans: "var(--nexora-font-sans, Inter, ui-sans-serif, system-ui, sans-serif)",
    mono: "var(--nexora-font-mono, ui-monospace, monospace)",
  },
  radii: {
    sm: "var(--nexora-radius-sm, 0.375rem)",
    md: "var(--nexora-radius-md, 0.5rem)",
    lg: "var(--nexora-radius-lg, 0.75rem)",
    xl: "var(--nexora-radius-xl, 1rem)",
    full: "9999px",
  },
} as const;

export type DesignTokens = typeof tokens;
