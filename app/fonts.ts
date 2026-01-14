import { Syne } from "next/font/google";
import localFont from "next/font/local";

/**
 * Syne — Display/heading font (variable, 400-800)
 * Experimental, widening weights for bold studio aesthetic
 * Source: Google Fonts
 */
export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * Satoshi — Body/text font (variable, 300-900)
 * Clean geometric sans-serif for excellent readability
 * Source: Fontshare (Indian Type Foundry)
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
 * CSS classes for applying fonts to the document root
 */
export const fontVariables = `${syne.variable} ${satoshi.variable}`;
