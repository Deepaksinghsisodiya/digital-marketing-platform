import type { Config } from "tailwindcss";
import { tokens } from "@nexora/design-tokens";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
} satisfies Config;
