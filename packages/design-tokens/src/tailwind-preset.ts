/**
 * Shared Tailwind CSS Preset for Nexora Platform
 * Consumed by apps/website and apps/admin for unified design token binding.
 */

function withOpacity(variableName: string, fallbackChannels: string) {
  return `rgb(var(${variableName}, ${fallbackChannels}) / <alpha-value>)`;
}

export const nexoraTailwindPreset = {
  theme: {
    extend: {
      colors: {
        // Semantic Token Set
        primary: {
          DEFAULT: withOpacity("--nexora-primary-rgb", "13 148 136"),
          foreground: "var(--nexora-primary-foreground, #ffffff)",
          hover: "var(--nexora-primary-hover, #0F766E)",
          active: "var(--nexora-primary-active, #115E59)",
        },
        secondary: {
          DEFAULT: withOpacity("--nexora-secondary-rgb", "11 31 42"),
          foreground: "var(--nexora-secondary-foreground, #ffffff)",
        },
        accent: {
          DEFAULT: withOpacity("--nexora-accent-rgb", "251 113 133"),
          foreground: "var(--nexora-accent-foreground, #0B1F2A)",
        },
        background: withOpacity("--nexora-background-rgb", "255 255 255"),
        foreground: withOpacity("--nexora-foreground-rgb", "11 31 42"),
        surface: {
          DEFAULT: withOpacity("--nexora-surface-rgb", "248 250 252"),
          elevated: "var(--nexora-surface-elevated, #ffffff)",
        },
        card: {
          DEFAULT: withOpacity("--nexora-card-rgb", "255 255 255"),
          foreground: "var(--nexora-card-foreground, #0f172a)",
        },
        border: "var(--nexora-border, #e2e8f0)",
        ring: "var(--nexora-ring, #10b981)",
        input: "var(--nexora-input, #ffffff)",

        // Status Colors
        success: "var(--nexora-success, #10b981)",
        warning: "var(--nexora-warning, #f59e0b)",
        danger: "var(--nexora-danger, #ef4444)",
        info: "var(--nexora-info, #06b6d4)",

        // Dark Canvas & Legacy Backwards-Compatible Tokens
        navy: "var(--nexora-navy, #080c14)",
        ink: "var(--nexora-ink, #0d1422)",
        muted: "var(--nexora-muted, #64748b)",
        paper: "var(--nexora-paper, #ffffff)",
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

        // Legacy palette compatibility: the Admin dashboard and Website components
        // use indigo/emerald/teal/slate utility classes. Binding them to active theme
        // tokens guarantees that every existing UI component immediately adapts.
        indigo: {
          50: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.05)",
          100: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.1)",
          200: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.2)",
          300: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.3)",
          400: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.6)",
          500: withOpacity("--nexora-primary-rgb", "16 185 129"),
          600: withOpacity("--nexora-primary-rgb", "16 185 129"),
          700: "var(--nexora-primary-hover, #059669)",
          800: "var(--nexora-primary-active, #047857)",
          900: "var(--nexora-primary-active, #065f46)",
          950: "var(--nexora-navy, #080c14)",
        },
        emerald: {
          50: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.05)",
          100: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.1)",
          200: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.2)",
          300: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.3)",
          400: "rgb(var(--nexora-primary-rgb, 16 185 129) / 0.6)",
          500: withOpacity("--nexora-primary-rgb", "16 185 129"),
          600: withOpacity("--nexora-primary-rgb", "16 185 129"),
          700: "var(--nexora-primary-hover, #059669)",
          800: "var(--nexora-primary-active, #047857)",
          900: "var(--nexora-primary-active, #065f46)",
          950: "var(--nexora-navy, #080c14)",
        },
        teal: {
          50: "rgb(var(--nexora-accent-rgb, 6 182 212) / 0.05)",
          100: "rgb(var(--nexora-accent-rgb, 6 182 212) / 0.1)",
          200: "rgb(var(--nexora-accent-rgb, 6 182 212) / 0.2)",
          300: "rgb(var(--nexora-accent-rgb, 6 182 212) / 0.3)",
          400: "rgb(var(--nexora-accent-rgb, 6 182 212) / 0.6)",
          500: withOpacity("--nexora-accent-rgb", "6 182 212"),
          600: withOpacity("--nexora-accent-rgb", "6 182 212"),
          700: "var(--nexora-accent, #0891b2)",
          800: "var(--nexora-accent, #0e7490)",
          900: "var(--nexora-accent, #155e75)",
          950: "var(--nexora-navy, #080c14)",
        },
        slate: {
          50: "rgb(var(--nexora-surface-rgb, 248 250 252) / <alpha-value>)",
          100: "rgb(var(--nexora-surface-rgb, 248 250 252) / <alpha-value>)",
          200: "var(--nexora-border, #e2e8f0)",
          300: "var(--nexora-border, #cbd5e1)",
          400: "var(--nexora-muted, #94a3b8)",
          500: "var(--nexora-muted, #64748b)",
          600: "var(--nexora-muted, #475569)",
          700: withOpacity("--nexora-foreground-rgb", "51 65 85"),
          800: "var(--nexora-ink, #1e293b)",
          900: "var(--nexora-ink, #0f172a)",
          950: "var(--nexora-navy, #020617)",
        },
      },
      borderRadius: {
        sm: "var(--nexora-radius-sm, 0.375rem)",
        DEFAULT: "var(--nexora-radius-md, 0.5rem)",
        md: "var(--nexora-radius-md, 0.5rem)",
        lg: "var(--nexora-radius-lg, 0.75rem)",
        xl: "var(--nexora-radius-xl, 1rem)",
        full: "9999px",
        button: "var(--nexora-button-radius, 0.5rem)",
        card: "var(--nexora-card-radius, 0.75rem)",
        input: "var(--nexora-input-radius, 0.5rem)",
      },
      fontFamily: {
        sans: "var(--nexora-font-sans, Inter, ui-sans-serif, system-ui, sans-serif)",
        heading: "var(--nexora-font-heading, Plus Jakarta Sans, Inter, sans-serif)",
        mono: "var(--nexora-font-mono, ui-monospace, monospace)",
      },
      boxShadow: {
        sm: "var(--nexora-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
        DEFAULT: "var(--nexora-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))",
        md: "var(--nexora-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))",
        lg: "var(--nexora-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
        glow: "0 0 50px -10px var(--nexora-glow, rgba(16, 185, 129, 0.28))",
      },
    },
  },
};
