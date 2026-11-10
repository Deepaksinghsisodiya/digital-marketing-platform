/**
 * Nexora Platform - Central Semantic Design Tokens
 * Driven by CSS Variables for dynamic runtime theming via Agency Admin,
 * with standard design fallback values.
 */

export const defaultCssVariables = {
  "--nexora-navy": "#10162f",
  "--nexora-ink": "#17213d",
  "--nexora-muted": "#65708b",
  "--nexora-paper": "#f5f7ff",
  "--nexora-white": "#ffffff",
  "--nexora-purple": "#7657ff",
  "--nexora-purple-light": "#f0ecff",
  "--nexora-purple-dark": "#4b39a3",
  "--nexora-blue": "#3685ff",
  "--nexora-blue-light": "#eaf2ff",
  "--nexora-blue-dark": "#1e40af",
  "--nexora-cyan": "#25c7d9",
  "--nexora-cyan-light": "#e6fbfc",
  "--nexora-pink": "#f05aa6",
  "--nexora-pink-light": "#fdf2f8",
  "--nexora-orange": "#ff9d4d",
  "--nexora-orange-light": "#fff7ed",
  "--nexora-green": "#20b889",
  "--nexora-green-light": "#e7fbf4",
  "--nexora-green-dark": "#087e5d",
  "--nexora-border": "#e6eafb",
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
    navy: "var(--nexora-navy, #10162f)",
    ink: "var(--nexora-ink, #17213d)",
    muted: "var(--nexora-muted, #65708b)",
    paper: "var(--nexora-paper, #f5f7ff)",
    white: "var(--nexora-white, #ffffff)",
    purple: {
      light: "var(--nexora-purple-light, #f0ecff)",
      DEFAULT: "var(--nexora-purple, #7657ff)",
      dark: "var(--nexora-purple-dark, #4b39a3)",
    },
    blue: {
      light: "var(--nexora-blue-light, #eaf2ff)",
      DEFAULT: "var(--nexora-blue, #3685ff)",
      dark: "var(--nexora-blue-dark, #1e40af)",
    },
    cyan: {
      light: "var(--nexora-cyan-light, #e6fbfc)",
      DEFAULT: "var(--nexora-cyan, #25c7d9)",
    },
    pink: {
      light: "var(--nexora-pink-light, #fdf2f8)",
      DEFAULT: "var(--nexora-pink, #f05aa6)",
    },
    orange: {
      light: "var(--nexora-orange-light, #fff7ed)",
      DEFAULT: "var(--nexora-orange, #ff9d4d)",
    },
    green: {
      light: "var(--nexora-green-light, #e7fbf4)",
      DEFAULT: "var(--nexora-green, #20b889)",
      dark: "var(--nexora-green-dark, #087e5d)",
    },
    border: "var(--nexora-border, #e6eafb)",
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
