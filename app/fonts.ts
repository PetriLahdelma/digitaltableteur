import localFont from "next/font/local";

/**
 * Satoshi — the single typeface for the whole site (display, headings, body).
 * Variable font, 300-900. Source: Fontshare (Indian Type Foundry).
 *
 * Exposed via --font-body. variables.css maps --font-heading -> var(--font-body)
 * so the entire type system resolves to Satoshi (no separate heading face).
 */
export const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

/**
 * CSS class for applying the font variable to the document root.
 */
export const fontVariables = satoshi.variable;
