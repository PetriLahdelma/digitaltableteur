#!/usr/bin/env node
/**
 * Multi-brand theme generation.
 *
 * Emits a scoped block of semantic-token overrides for an alternate brand from a
 * brand override file, validated against the production token catalog so a brand
 * can only re-point tokens that actually exist. Output goes to the stylelint-
 * ignored dist dir. variables.css remains the source of truth; a brand theme is
 * an override layer, exactly like `.themeDark`.
 *
 * Usage: node scripts/design-system/generate-theme.mjs <brand.json>
 *
 * Brand file shape:
 *   { "name": "acme", "selector": "[data-brand=\"acme\"]",
 *     "tokens": { "--color-primary": "#123456", ... } }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG = resolve(ROOT, "nextjs-app/shared/foundations/token-catalog.json");
const OUT_DIR = resolve(ROOT, "nextjs-app/shared/foundations/dist/themes");

/** All defined token names (`--foo`) from the production catalog. */
export function loadTokenNames(catalogPath = CATALOG) {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const names = new Set();
  for (const group of catalog.groups ?? []) {
    for (const token of group.tokens ?? []) {
      if (token.name) names.add(token.name);
    }
  }
  return names;
}

/**
 * Build the scoped CSS for a brand override. Throws if any token is unknown
 * (a typo would silently do nothing at runtime otherwise).
 * @returns {string} CSS text.
 */
export function generateThemeCss(brand, validNames) {
  if (!brand || typeof brand !== "object") throw new Error("brand must be an object");
  const name = brand.name;
  if (!name) throw new Error("brand.name is required");
  const selector = brand.selector ?? `[data-brand="${name}"]`;
  const entries = Object.entries(brand.tokens ?? {});
  if (!entries.length) throw new Error(`brand "${name}" has no token overrides`);

  const unknown = entries.map(([k]) => k).filter((k) => !validNames.has(k));
  if (unknown.length) {
    throw new Error(`brand "${name}" overrides unknown tokens: ${unknown.join(", ")}`);
  }

  const decls = entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `/* Generated brand theme: ${name}. Do not edit; run \`npm run generate:theme <file>\`. */\n${selector} {\n${decls}\n}\n`;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: generate-theme.mjs <brand.json>");
    process.exit(1);
  }
  const brand = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
  const css = generateThemeCss(brand, loadTokenNames());
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const out = resolve(OUT_DIR, `${brand.name}.css`);
  writeFileSync(out, css);
  console.log(`✓ theme "${brand.name}" → ${out.replace(ROOT + "/", "")}`);
}
