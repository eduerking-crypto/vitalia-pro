import type { Config } from "tailwindcss";

/**
 * VITALIA PRO — Design tokens.
 * Paleta: sage #87A878 (primario) | serene #4A6fa5 (secundario) | bone #F9F9F9 (fondo).
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e6ede6",
          200: "#cddacd",
          300: "#a8c0a8",
          400: "#87A878",
          500: "#6b8c5c",
          600: "#557048",
          700: "#445a3a",
        },
        serene: {
          50: "#f0f4f9",
          100: "#dce5f0",
          200: "#b8c9df",
          300: "#8aa7c8",
          400: "#5d83ad",
          500: "#4A6fa5",
          600: "#3b5884",
          700: "#2f466a",
        },
        bone: "#F9F9F9",
        ink: "#1a1a1a",
        muted: "#6b7280",
        danger: "#dc2626",
        warning: "#f59e0b",
        success: "#10b981",
        info: "#3b82f6",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2.25rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "5xl": ["3rem", { lineHeight: "3.5rem" }],
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        card: "0 4px 16px rgba(0,0,0,0.07)",
        elevated: "0 8px 32px rgba(0,0,0,0.10)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s cubic-bezier(0.4,0,0.2,1)",
        "slide-up": "slide-up 0.3s cubic-bezier(0.4,0,0.2,1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.4,0,0.2,1)",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        typing: "typing 1.2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        vitalia: "cubic-bezier(0.4,0,0.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
