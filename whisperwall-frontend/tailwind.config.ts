import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: designTokens.colors.light.primary,
          dark: designTokens.colors.dark.primary,
        },
        secondary: {
          DEFAULT: designTokens.colors.light.secondary,
          dark: designTokens.colors.dark.secondary,
        },
        accent: {
          DEFAULT: designTokens.colors.light.accent,
          dark: designTokens.colors.dark.accent,
        },
        background: designTokens.colors.light.background,
        surface: designTokens.colors.light.surface,
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.sizes,
      borderRadius: {
        sm: designTokens.borderRadius.sm,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg,
        xl: designTokens.borderRadius.xl,
        full: designTokens.borderRadius.full,
      },
      boxShadow: {
        "neu-raised": designTokens.shadows.neumorphism.light.raised,
        "neu-pressed": designTokens.shadows.neumorphism.light.pressed,
        "neu-flat": designTokens.shadows.neumorphism.light.flat,
        ...designTokens.shadows.standard,
      },
      transitionDuration: {
        DEFAULT: designTokens.transitions.duration.normal,
        fast: designTokens.transitions.duration.fast,
        smooth: designTokens.transitions.duration.smooth,
      },
      spacing: {
        unit: `${designTokens.spacing.unit}px`,
      },
    },
  },
  plugins: [],
};

export default config;


