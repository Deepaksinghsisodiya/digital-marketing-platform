import type { Config } from "tailwindcss";
import { tokens, nexoraTailwindPreset } from "@nexora/design-tokens";

const config: Config = {
  presets: [nexoraTailwindPreset as any],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        "7xl": "85%",
        "6xl": "85%",
      },
      colors: {
        navy: tokens.colors.navy,
        ink: tokens.colors.ink,
        muted: tokens.colors.muted,
        paper: tokens.colors.paper,
        purple: tokens.colors.purple,
        blue: tokens.colors.blue,
        cyan: tokens.colors.cyan,
        pink: tokens.colors.pink,
        orange: tokens.colors.orange,
        green: tokens.colors.green,
        border: tokens.colors.border,
      },
      borderRadius: tokens.radii,
      fontFamily: {
        sans: [tokens.fonts.sans],
        mono: [tokens.fonts.mono],
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "500ms",
        slower: "700ms",
      },
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(calc(-100% - var(--gap, 2rem)))" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(calc(-100% - var(--gap, 2rem)))" },
          "100%": { transform: "translateX(0%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
