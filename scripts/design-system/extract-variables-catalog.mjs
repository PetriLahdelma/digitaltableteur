#!/usr/bin/env node
/**
 * Extract production tokens + contrast audit into foundations/token-catalog.json
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import {
  SEMANTIC_CONTRAST_PAIRS,
  colorToRgb,
  contrastRatio,
  wcagLevel,
} from "./contrast-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VARIABLES_CSS = resolve(__dirname, "../../nextjs-app/shared/styles/variables.css");
const OUT_JSON = resolve(__dirname, "../../nextjs-app/shared/foundations/token-catalog.json");

const USAGE_OVERRIDES = {
  "--color-primary": "Primary actions, links, focus rings, and key UI chrome.",
  "--color-text": "Default body copy color.",
  "--color-title": "Heading color; usually aligned with primary text.",
  "--main-body-background-color": "Page canvas / body background.",
  "--color-success": "Success feedback, positive badges, and confirmations.",
  "--color-info": "Informational alerts and neutral-positive emphasis.",
  "--color-warning": "Warning surfaces; pair with --color-warning-text.",
  "--color-error": "Errors, destructive actions, and critical alerts.",
  "--color-border": "Default 1px borders on inputs, cards, and dividers.",
  "--link-color": "Hyperlink color in prose and inline links.",
  "--focus-ring-color": "Keyboard focus outline color (WCAG focus appearance).",
  "--font-title": "Heading font stack (Satoshi via next/font).",
  "--font-text": "Body/UI font stack (Satoshi via next/font).",
  "--selection-background": "Text selection highlight background.",
  "--selection-color": "Text selection foreground.",
};

function inferUsage(name) {
  if (USAGE_OVERRIDES[name]) return USAGE_OVERRIDES[name];
  if (name.startsWith("--accent-")) return "Brand/marketing accent — not default UI chrome.";
  if (name.startsWith("--space-layout-")) {
    const step = name.replace("--space-layout-", "");
    return `Layout spacing step ${step}: margins, section gaps, grid gutters.`;
  }
  if (name.startsWith("--space-internal-")) {
    const step = name.replace("--space-internal-", "");
    return `Internal spacing step ${step}: padding inside components.`;
  }
  if (name.startsWith("--font-size-")) return `Fluid type size token (${name.replace("--font-size-", "")}); uses clamp().`;
  if (name === "--font-mono") return "Monospace font stack for code and technical UI.";
  if (name.startsWith("--line-height-")) return `Line-height for ${name.replace("--line-height-", "")} typography rhythm.`;
  if (name.startsWith("--tracking-")) return `Letter-spacing for ${name.replace("--tracking-", "")} display/heading styles.`;
  if (name.startsWith("--duration-")) return `Motion duration for ${name.replace("--duration-", "")} transitions.`;
  if (name.startsWith("--ease-")) return `Cubic-bezier easing curve (${name.replace("--ease-", "")}).`;
  if (name.startsWith("--stagger-")) return `Animation stagger delay between siblings.`;
  if (name.startsWith("--motion-distance-")) return `Translate distance for entrance animations.`;
  if (name.startsWith("--breakpoint-")) return `Responsive breakpoint reference for media queries.`;
  if (name.startsWith("--container-")) return `Max inline size for content containers.`;
  if (name.startsWith("--grid-")) return "Grid system token (columns or gap).";
  if (name.startsWith("--page-margin-")) return "Horizontal page margin at a viewport tier.";
  if (name.startsWith("--radius-")) return `Border radius (${name.replace("--radius-", "")}).`;
  if (name.startsWith("--focus-ring-")) return "Focus ring token for keyboard accessibility.";
  if (name.startsWith("--shadow-")) return `Elevation shadow (${name.replace("--shadow-", "")}) — resting through modal.`;
  if (name.startsWith("--modal-") || name.startsWith("--gallery-")) return "Overlay or elevation token.";
  if (name.startsWith("--color-")) return `Color token (${name.replace("--color-", "")}).`;
  if (name === "--home-gradient") return "Brand gradient used for expressive homepage and marketing treatments.";
  return "";
}

function withoutGeneratedAt(catalog) {
  const { generatedAt: _generatedAt, ...rest } = catalog;
  return rest;
}

function resolveGeneratedAt(nextCatalog) {
  if (!existsSync(OUT_JSON)) {
    return new Date().toISOString();
  }

  try {
    const previous = JSON.parse(readFileSync(OUT_JSON, "utf8"));
    if (
      previous.generatedAt &&
      JSON.stringify(withoutGeneratedAt(previous)) ===
        JSON.stringify(withoutGeneratedAt(nextCatalog))
    ) {
      return previous.generatedAt;
    }
  } catch {
    // Fall through to a fresh timestamp if the existing catalog is unreadable.
  }

  return new Date().toISOString();
}

function parsePropsFromRule(rule) {
  const props = {};
  for (const node of rule?.nodes ?? []) {
    if (node.type === "decl" && node.prop.startsWith("--")) {
      props[node.prop] = node.value.trim();
    }
  }
  return props;
}

function selectorsFor(rule) {
  return rule.selector.split(",").map((selector) => selector.trim());
}

function parseStylesheet(css) {
  return postcss.parse(css, { from: VARIABLES_CSS });
}

function findProductionRootRule(root) {
  for (const node of root.nodes ?? []) {
    if (node.type === "rule" && node.selector.trim() === ":root") {
      return node;
    }
  }
  throw new Error("Could not find top-level :root token block in variables.css");
}

function findThemeRule(root, className) {
  for (const node of root.nodes ?? []) {
    if (node.type !== "rule") continue;
    const selectors = selectorsFor(node);
    if (selectors.includes(`.${className}`) || selectors.includes(`.${className} :root`)) {
      return node;
    }
  }
  return null;
}

function parseRootTokens(root) {
  return parsePropsFromRule(findProductionRootRule(root));
}

function parseThemeTokens(root, className) {
  return parsePropsFromRule(findThemeRule(root, className));
}

function resolveToken(map, value, depth = 0) {
  if (depth > 8 || !value) return value;
  const v = value.trim();
  const varMatch = v.match(/^var\(\s*(--[^),\s]+)(?:\s*,\s*([^)]+))?\s*\)$/);
  if (varMatch) {
    const resolved = map[varMatch[1]] ?? varMatch[2];
    if (resolved) return resolveToken(map, resolved, depth + 1);
  }
  if (v.startsWith("color-mix(")) return v;
  return v;
}

function buildThemeMap(base, overrides) {
  return { ...base, ...overrides };
}

function auditContrast(themeMap, themeId) {
  return SEMANTIC_CONTRAST_PAIRS.map((pair) => {
    const fgRaw = resolveToken(themeMap, themeMap[pair.fg] ?? "");
    const bgRaw = resolveToken(themeMap, themeMap[pair.bg] ?? "");
    const fgRgb = colorToRgb(fgRaw);
    const bgRgb = colorToRgb(bgRaw);
    if (!fgRgb || !bgRgb) {
      return { ...pair, themeId, fgRaw, bgRaw, ratio: null, level: "N/A", pass: null };
    }
    const ratio = contrastRatio(fgRgb, bgRgb);
    // Pairs with a DS-defined minimum (e.g. disabled tokens, WCAG-exempt)
    // grade against that per-theme bar instead of the AA/AAA ladder.
    const minRatio = pair.minRatioByTheme?.[themeId];
    const level =
      minRatio != null
        ? ratio >= minRatio
          ? `DS ≥${minRatio}:1`
          : "Fail"
        : wcagLevel(ratio, pair.largeText);
    const pass = level !== "Fail";
    return { ...pair, themeId, fgRaw, bgRaw, ratio: Math.round(ratio * 100) / 100, level, pass };
  });
}

function categorize(name) {
  if (name.startsWith("--color-") || name.startsWith("--accent-") || name.startsWith("--main-body") || name.startsWith("--link-") || name.startsWith("--logo-") || name.startsWith("--selection-"))
    return "color";
  if (name === "--home-gradient") return "color";
  if (name.startsWith("--font-") || name.startsWith("--line-height") || name.startsWith("--tracking-") || name.startsWith("--font-weight"))
    return "typography";
  if (name.startsWith("--space-")) return "space";
  if (name.startsWith("--duration-") || name.startsWith("--ease-") || name.startsWith("--stagger-") || name.startsWith("--motion-"))
    return "motion";
  if (name.startsWith("--breakpoint-") || name.startsWith("--container-") || name.startsWith("--grid-") || name.startsWith("--page-margin") || name.startsWith("--rhythm-"))
    return "layout";
  if (name.startsWith("--radius-")) return "radius";
  if (name.startsWith("--shadow-") || name.startsWith("--modal-") || name.startsWith("--gallery-")) return "elevation";
  if (name.startsWith("--focus-")) return "focus";
  if (name.startsWith("--size-")) return "size";
  return "other";
}

const SUBGROUP = {
  color: (n) => {
    if (n.includes("success") || n.includes("error") || n.includes("warning") || n.includes("info") || n.includes("neutral"))
      return "Status & feedback";
    if (n.startsWith("--accent-")) return "Brand accents";
    if (n.includes("gray") || n.includes("black") || n.includes("white") || n.includes("muted") || n.includes("disabled"))
      return "Greyscale & borders";
    if (n.includes("background") || n.includes("surface") || n.includes("body"))
      return "Surfaces";
    return "Semantic";
  },
  typography: (n) => {
    if (n.includes("font-size")) return "Type scale";
    if (n.includes("line-height") || n.includes("tracking")) return "Rhythm";
    if (n.includes("font-weight")) return "Weight";
    return "Families & aliases";
  },
  space: (n) => (n.includes("layout") ? "Layout (margin & gap)" : "Internal (padding)"),
};

function main() {
  const css = readFileSync(VARIABLES_CSS, "utf8");
  const root = parseStylesheet(css);
  const rootProps = parseRootTokens(root);
  const baseEntries = Object.entries(rootProps);

  const themes = [
    { id: "light", className: "", label: "Light", marker: null },
    { id: "dark", className: "themeDark", label: "Dark", marker: ".themeDark," },
    { id: "hcb", className: "themeHCB", label: "High contrast (black)", marker: ".themeHCB," },
    { id: "hcw", className: "themeHCW", label: "High contrast (white)", marker: ".themeHCW," },
  ];

  const contrastByTheme = {};
  for (const theme of themes) {
    const overrides = theme.className ? parseThemeTokens(root, theme.className) : {};
    const map = buildThemeMap(rootProps, overrides);
    contrastByTheme[theme.id] = auditContrast(map, theme.id);
  }

  const tokens = baseEntries.map(([name, value]) => ({
    name,
    value,
    usage: inferUsage(name),
    category: categorize(name),
    subgroup: SUBGROUP[categorize(name)]?.(name) ?? "General",
  }));

  const groups = {};
  for (const t of tokens) {
    const key = `${t.category}::${t.subgroup}`;
    groups[key] ??= { category: t.category, subgroup: t.subgroup, title: t.subgroup, tokens: [] };
    groups[key].tokens.push(t);
  }

  const usageCoverage = tokens.filter((t) => t.usage).length;

  const catalogPayload = {
    source: "nextjs-app/shared/styles/variables.css",
    tokenCount: tokens.length,
    usageCoverage,
    themes: themes.map(({ id, className, label }) => ({ id, className, label })),
    contrastPairs: SEMANTIC_CONTRAST_PAIRS,
    contrastByTheme,
    groups: Object.values(groups).sort(
      (a, b) => a.category.localeCompare(b.category) || a.subgroup.localeCompare(b.subgroup),
    ),
  };
  const catalog = {
    source: catalogPayload.source,
    generatedAt: resolveGeneratedAt(catalogPayload),
    tokenCount: catalogPayload.tokenCount,
    usageCoverage: catalogPayload.usageCoverage,
    themes: catalogPayload.themes,
    contrastPairs: catalogPayload.contrastPairs,
    contrastByTheme: catalogPayload.contrastByTheme,
    groups: catalogPayload.groups,
  };

  writeFileSync(OUT_JSON, `${JSON.stringify(catalog, null, 2)}\n`);
  const fails = Object.values(contrastByTheme).flat().filter((r) => r.pass === false);
  console.log(`✓ ${catalog.tokenCount} tokens (${usageCoverage} with usage) → token-catalog.json`);
  if (fails.length) console.warn(`⚠ ${fails.length} contrast pair(s) below AA — see Foundations/Contrast`);
}

main();
