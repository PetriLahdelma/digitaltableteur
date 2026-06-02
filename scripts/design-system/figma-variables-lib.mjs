/**
 * Parse production CSS themes for Figma variable sync.
 * Source of truth: nextjs-app/shared/styles/variables.css
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const VARIABLES_CSS = resolve(
  __dirname,
  "../../nextjs-app/shared/styles/variables.css",
);

export const FIGMA_MODES = [
  { id: "light", label: "Light", marker: null },
  { id: "dark", label: "Dark", marker: ".themeDark," },
  { id: "hcb", label: "HCB", marker: ".themeHCB," },
  { id: "hcw", label: "HCW", marker: ".themeHCW," },
];

function parseProps(block) {
  const props = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (m) props[m[1]] = m[2].trim();
  }
  return props;
}

function extractBlock(css, marker) {
  const i = css.indexOf(marker);
  if (i < 0) return "";
  const brace = css.indexOf("{", i);
  if (brace < 0) return "";
  let depth = 0;
  for (let j = brace; j < css.length; j++) {
    const c = css[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return css.slice(brace + 1, j);
    }
  }
  return "";
}

function parseRootTokens(css) {
  const chunks = css.split(":root {");
  const body = (chunks.length >= 3 ? chunks[2] : chunks[1]).split("\n}")[0];
  return parseProps(body);
}

export function resolveToken(map, value, depth = 0) {
  if (depth > 12 || value == null) return value;
  const v = String(value).trim();
  const varMatch = v.match(/^var\(\s*(--[^),\s]+)(?:\s*,\s*([^)]+))?\s*\)$/);
  if (varMatch) {
    const resolved = map[varMatch[1]] ?? varMatch[2];
    if (resolved != null) return resolveToken(map, resolved, depth + 1);
  }
  return v;
}

export function buildThemeMaps(css = readFileSync(VARIABLES_CSS, "utf8")) {
  const rootProps = parseRootTokens(css);
  const themes = {};
  for (const mode of FIGMA_MODES) {
    const overrides = mode.marker ? parseProps(extractBlock(css, mode.marker)) : {};
    themes[mode.id] = { ...rootProps, ...overrides };
  }
  return { rootProps, themes };
}

const HEX_RE = /^#([0-9a-f]{3,8})$/i;
const RGB_RE = /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+/i;

export function isResolvableColor(raw) {
  if (!raw || typeof raw !== "string") return false;
  const v = raw.trim();
  if (HEX_RE.test(v)) return true;
  if (RGB_RE.test(v)) return true;
  return false;
}

export function categorizeToken(name) {
  if (
    name.startsWith("--color-") ||
    name.startsWith("--accent-") ||
    name.startsWith("--main-body") ||
    name.startsWith("--link-") ||
    name.startsWith("--logo-") ||
    name.startsWith("--selection-")
  ) {
    return "color";
  }
  if (name.startsWith("--space-")) return "space";
  if (name.startsWith("--radius-")) return "radius";
  if (
    name.startsWith("--font-") ||
    name.startsWith("--line-height") ||
    name.startsWith("--tracking-") ||
    name.startsWith("--font-weight")
  ) {
    return "typography";
  }
  if (
    name.startsWith("--duration-") ||
    name.startsWith("--ease-") ||
    name.startsWith("--stagger-") ||
    name.startsWith("--motion-")
  ) {
    return "motion";
  }
  if (
    name.startsWith("--breakpoint-") ||
    name.startsWith("--container-") ||
    name.startsWith("--grid-") ||
    name.startsWith("--page-margin") ||
    name.startsWith("--rhythm-")
  ) {
    return "layout";
  }
  if (name.startsWith("--modal-") || name.startsWith("--gallery-")) return "elevation";
  if (name.startsWith("--focus-")) return "focus";
  if (name.startsWith("--size-")) return "size";
  return "other";
}

/** CSS var name → Figma slash path (strip leading --, keep semantic segments). */
export function cssVarToFigmaName(cssVar) {
  return cssVar.replace(/^--/, "").replace(/-/g, "/");
}

export function scopesForCategory(category) {
  switch (category) {
    case "color":
      return ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"];
    case "space":
      return ["GAP", "WIDTH_HEIGHT"];
    case "radius":
      return ["CORNER_RADIUS"];
    default:
      return [];
  }
}

export function figmaTypeForToken(name, category, resolvedByMode) {
  if (category === "color") {
    const allColor = Object.values(resolvedByMode).every(isResolvableColor);
    return allColor ? "COLOR" : null;
  }
  if (category === "space" || category === "radius" || category === "size") {
    const allPx = Object.values(resolvedByMode).every((v) => {
      const n = parseDimensionPx(v);
      return n != null;
    });
    return allPx ? "FLOAT" : null;
  }
  if (category === "typography" && name.startsWith("--font-") && !name.includes("size")) {
    return "STRING";
  }
  return null;
}

export function parseDimensionPx(value) {
  if (value == null) return null;
  const v = String(value).trim();
  const rem = v.match(/^([\d.]+)rem$/);
  if (rem) return Number(rem[1]) * 16;
  const px = v.match(/^([\d.]+)px$/);
  if (px) return Number(px[1]);
  const num = v.match(/^([\d.]+)$/);
  if (num) return Number(num[1]);
  return null;
}
