import { Source_Code_Pro } from "next/font/google";
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
 * Source Code Pro: the code and monospace face (CodeBlock, Snippet, Code, Kbd,
 * mono labels). Variable font, self-hosted by next/font at build time (no request
 * to Google at runtime). Exposed as --font-code; variables.css puts it first
 * in --font-mono, so every monospace use resolves to it.
 */
export const sourceCodePro = Source_Code_Pro({
  subsets: ["latin", "latin-ext"],
  variable: "--font-code",
  display: "swap",
});

/**
 * CSS classes for applying the font variables to the document root.
 */
export const fontVariables = `${satoshi.variable} ${sourceCodePro.variable}`;
