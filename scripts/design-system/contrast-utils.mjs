/**
 * WCAG 2.x contrast helpers (shared by CLI + catalog export).
 */

export function parseHex(hex) {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    return [0, 1, 2].map((i) => parseInt(h[i] + h[i], 16));
  }
  if (h.length === 6) {
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  return null;
}

export function parseRgbString(value) {
  const m = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return null;
  return [m[1], m[2], m[3]].map((n) => Math.round(Number(n)));
}

export function luminanceFromRgb([r, g, b]) {
  const lin = [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(fg, bg) {
  const l1 = luminanceFromRgb(fg);
  const l2 = luminanceFromRgb(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function colorToRgb(value) {
  const v = value.trim();
  const hex = parseHex(v);
  if (hex) return hex;
  const rgb = parseRgbString(v);
  if (rgb) return rgb;
  return null;
}

export function wcagLevel(ratio, largeText = false) {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return "AAA";
  if (ratio >= aa) return "AA";
  return "Fail";
}

export const SEMANTIC_CONTRAST_PAIRS = [
  { id: "text-on-canvas", fg: "--color-text", bg: "--main-body-background-color", label: "Body text on canvas", largeText: false },
  { id: "bodycopy-on-canvas", fg: "--main-body-copy-color", bg: "--main-body-background-color", label: "Body copy on canvas", largeText: false },
  { id: "primary-text-on-canvas", fg: "--primary-text-color", bg: "--main-body-background-color", label: "Primary text ink on canvas", largeText: false },
  { id: "title-on-canvas", fg: "--color-title", bg: "--main-body-background-color", label: "Title on canvas", largeText: true },
  { id: "primary-on-canvas", fg: "--color-primary", bg: "--main-body-background-color", label: "Primary on canvas", largeText: false },
  { id: "link-on-canvas", fg: "--link-color", bg: "--main-body-background-color", label: "Link on canvas", largeText: false },
  { id: "error-on-canvas", fg: "--color-error", bg: "--main-body-background-color", label: "Error on canvas", largeText: false },
  { id: "error-text-on-error-bg", fg: "--color-error-text", bg: "--color-error-bg", label: "Error text on error surface", largeText: false },
  { id: "warning-text-on-warning", fg: "--color-warning-text", bg: "--color-warning", label: "Warning text on warning", largeText: false },
  // Disabled controls are WCAG-1.4.3-exempt, so these two enforce the DS's own
  // dim-but-legible bar instead of AA: 3:1 on the normal themes, 4.3:1 on the
  // high-contrast themes. Guards against the silent 1.7-2.6:1 regressions
  // fixed in #1099.
  { id: "disabled-text-on-disabled-bg", fg: "--color-disabled-placeholder", bg: "--color-disabled-bg", label: "Disabled text on disabled fill", minRatioByTheme: { light: 3, dark: 3, hcb: 4.3, hcw: 4.3 } },
  { id: "disabled-text-on-disabled-bg-light", fg: "--color-disabled-placeholder", bg: "--color-disabled-bg-light", label: "Disabled text on disabled field", minRatioByTheme: { light: 3, dark: 3, hcb: 4.3, hcw: 4.3 } },
];
