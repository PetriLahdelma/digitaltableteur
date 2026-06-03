/**
 * Static replacement guidance for agent blocks — what raw UI this @dt component supersedes.
 */

/** @type {Record<string, string[]>} */
export const REPLACEMENT_FOR = {
  Button: ["raw <button>", "@/components/ui/button", "shadcn Button"],
  Title: [
    "raw <h1>",
    "raw <h2>",
    "raw <h3>",
    "raw <h4>",
    "raw <h5>",
    "raw <h6>",
  ],
  Text: ["raw <p>", "raw <span> for body copy"],
  Link: ["raw <a> for styled navigation"],
  Icon: ["inline SVG without Icon wrapper", "react-icons used directly in product UI"],
  AlertBanner: ["custom div alert", "Toast for persistent page-level status"],
  Toast: ["AlertBanner for transient feedback", "window.alert"],
  Card: ["unstyled div wrapper for grouped content"],
  Modal: ["custom overlay dialog"],
  Stack: ["manual flex column with arbitrary gap literals"],
  Row: ["manual flex row with arbitrary gap literals"],
  Grid: ["manual CSS grid with arbitrary gap literals"],
  Container: ["max-width div without tokens"],
  FormField: ["label + input wired manually"],
  Inputs: ["raw <input> without design-system field shell"],
};

/** @type {Record<string, string[]>} */
export const PREFERS_OVER = {
  Title: ["raw heading elements"],
  Text: ["raw paragraph elements"],
  Button: ["raw button", "Link for in-copy navigation"],
  Link: ["Button with href for body-copy links"],
  AlertBanner: ["Toast for non-persistent status"],
  Toast: ["AlertBanner for page-level persistent status"],
  HelperText: ["AlertBanner for field-level hints"],
};

/**
 * @param {string} name
 * @returns {string[]}
 */
export function getReplacementFor(name) {
  return REPLACEMENT_FOR[name] ?? [];
}

/**
 * @param {string} name
 * @returns {string[]}
 */
export function getPrefersOver(name) {
  return PREFERS_OVER[name] ?? [];
}
