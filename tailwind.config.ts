import type { Config } from "tailwindcss";

/**
 * Tailwind CSS 4.x Configuration
 *
 * NOTE: With Tailwind CSS 4.x, most configuration is done in CSS via @theme blocks.
 * This file provides additional configuration for:
 * - Content paths (for tree-shaking)
 * - Extended theme values that reference CSS custom properties
 * - Dark mode configuration
 *
 * See app/tailwind.css for the primary theme configuration.
 */
const config: Config = {
  // Enable dark mode via class (supports our 4-theme system)
  darkMode: "class",

  // Content paths for tree-shaking unused styles
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./nextjs-app/shared/components/**/*.{ts,tsx}",
    "./nextjs-app/shared/patterns/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],

  theme: {
    // Container configuration
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      // Typography - reference existing CSS custom properties
      fontFamily: {
        // Primary fonts (new system - Syne + Satoshi)
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],

        // Semantic aliases
        display: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],

        // Legacy compatibility (maps old tokens to new fonts)
        title: ["var(--font-heading)", "system-ui", "sans-serif"],
        text: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["var(--font-heading)", "system-ui", "sans-serif"],
        "body-primary": ["var(--font-body)", "system-ui", "sans-serif"],
        "body-secondary": ["var(--font-heading)", "system-ui", "sans-serif"],
        "heading-primary": ["var(--font-heading)", "system-ui", "sans-serif"],
        "heading-secondary": ["var(--font-body)", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Responsive clamp-based sizes from variables.css
        "text-s": "var(--font-size-text-s)",
        "text-m": "var(--font-size-text-m)",
        "text-l": "var(--font-size-text-l)",
        "title-s": "var(--font-size-title-s)",
        "title-m": "var(--font-size-title-m)",
        "title-l": "var(--font-size-title-l)",
        "title-xl": "var(--font-size-title-xl)",
        display: "var(--font-size-display)",
        "button-s": "var(--font-size-button-s)",
        "button-m": "var(--font-size-button-m)",
        "button-l": "var(--font-size-button-l)",
      },

      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },

      // Spacing - reference existing CSS custom properties
      spacing: {
        // Internal (component) spacing
        "internal-0": "var(--space-internal-0)",
        "internal-2": "var(--space-internal-2)",
        "internal-4": "var(--space-internal-4)",
        "internal-6": "var(--space-internal-6)",
        "internal-8": "var(--space-internal-8)",
        "internal-12": "var(--space-internal-12)",
        "internal-16": "var(--space-internal-16)",
        "internal-24": "var(--space-internal-24)",
        "internal-32": "var(--space-internal-32)",

        // Layout (outer) spacing
        "layout-0": "var(--space-layout-0)",
        "layout-4": "var(--space-layout-4)",
        "layout-6": "var(--space-layout-6)",
        "layout-8": "var(--space-layout-8)",
        "layout-16": "var(--space-layout-16)",
        "layout-24": "var(--space-layout-24)",
        "layout-32": "var(--space-layout-32)",
        "layout-40": "var(--space-layout-40)",
        "layout-48": "var(--space-layout-48)",
        "layout-64": "var(--space-layout-64)",
        "layout-80": "var(--space-layout-80)",
        "layout-96": "var(--space-layout-96)",
      },

      // Container/sizing
      maxWidth: {
        "container-sm": "var(--container-sm)",
        "container-md": "var(--container-md)",
        "container-lg": "var(--container-lg)",
        "container-xl": "var(--container-xl)",
        form: "var(--size-width-form)",
      },

      // Breakpoints matching our design system
      screens: {
        mobile: "480px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1440px",
        ultra: "1920px",
      },

      // Animation keyframes for shadcn/ui components
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [],
};

export default config;
