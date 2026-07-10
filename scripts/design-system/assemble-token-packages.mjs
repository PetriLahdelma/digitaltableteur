#!/usr/bin/env node
/**
 * Assemble generated token package dist directories from the production token
 * pipeline. The app keeps importing variables.css directly.
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertTokenCssProjection, buildTokenCss } from "./build-token-css.mjs";
import { generateThemeCss, loadTokenNames } from "./generate-theme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const CATALOG_PATH = join(ROOT, "nextjs-app/shared/foundations/token-catalog.json");
const DTCG_DIR = join(ROOT, "nextjs-app/shared/foundations/tokens/production");
const FOUNDATIONS_DIST = join(ROOT, "nextjs-app/shared/foundations/dist");
const VARIABLES_CSS = join(ROOT, "nextjs-app/shared/styles/variables.css");
const ACME_BRAND = join(ROOT, "scripts/design-system/themes/acme.brand.json");
const TOKENS_DIST = join(ROOT, "packages/tokens/dist");
const TOKENS_CSS_DIST = join(ROOT, "packages/tokens-css/dist");
const SCHEMA = "https://design-tokens.github.io/community-group/format/";

function resetDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function tokenEntries(catalog) {
  return catalog.groups.flatMap((group) => group.tokens).sort((a, b) => a.name.localeCompare(b.name));
}

function buildTailwindRefs(catalog) {
  const refs = {};
  for (const { name } of tokenEntries(catalog)) {
    if (name.startsWith("--color-") || name.startsWith("--accent-")) {
      const base = name.replace(/^--/, "");
      const key = base.startsWith("color-") ? `color-dt-${base.slice(6)}` : `color-dt-${base}`;
      refs[key] = `var(${name})`;
    } else if (name.startsWith("--font-size-")) {
      refs[`text-dt-${name.replace(/^--font-size-/, "")}`] = `var(${name})`;
    }
  }
  return refs;
}

function buildCategories(catalog) {
  const categories = {};
  for (const group of catalog.groups) {
    categories[group.category] ??= [];
    for (const token of group.tokens) categories[group.category].push(token.name);
  }
  for (const names of Object.values(categories)) names.sort();
  return Object.fromEntries(Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)));
}

function mergeDtcgFiles() {
  const merged = { $schema: SCHEMA };
  const files = ["color", "elevation", "focus", "layout", "motion", "other", "radius", "size", "space", "typography"];
  for (const category of files) {
    const path = join(DTCG_DIR, `${category}.json`);
    try {
      const { $schema: _schema, ...body } = readJson(path);
      merged[category] = body;
    } catch {
      // Some categories may not exist if the token taxonomy changes.
    }
  }
  return merged;
}

function writeTokensPackage(catalog) {
  resetDir(TOKENS_DIST);
  const entries = tokenEntries(catalog);
  const tokenNames = entries.map((token) => token.name);
  const tokens = Object.fromEntries(entries.map((token) => [token.name, token.value]));
  const categories = buildCategories(catalog);
  const tailwindThemeRefs = buildTailwindRefs(catalog);

  writeFileSync(
    join(TOKENS_DIST, "index.js"),
    [
      "/** AUTO-GENERATED - npm run build:tokens */",
      `export const tokenNames = ${JSON.stringify(tokenNames, null, 2)};`,
      `export const tokens = ${JSON.stringify(tokens, null, 2)};`,
      `export const tokenCategories = ${JSON.stringify(categories, null, 2)};`,
      `export const tokenCount = ${tokenNames.length};`,
      "export default tokens;",
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(TOKENS_DIST, "index.d.ts"),
    [
      "/** AUTO-GENERATED - npm run build:tokens */",
      `export declare const tokenNames: readonly ${JSON.stringify(tokenNames)};`,
      "export type TokenName = (typeof tokenNames)[number];",
      "export declare const tokens: Record<TokenName, string>;",
      "export declare const tokenCategories: Record<string, readonly TokenName[]>;",
      "export declare const tokenCount: number;",
      "export default tokens;",
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(TOKENS_DIST, "tailwind.tokens.js"),
    [
      "/** AUTO-GENERATED - npm run build:tokens */",
      `export const tokenNames = ${JSON.stringify(tokenNames, null, 2)};`,
      `export const tokenCategories = ${JSON.stringify(categories, null, 2)};`,
      `export const tailwindThemeRefs = ${JSON.stringify(tailwindThemeRefs, null, 2)};`,
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(TOKENS_DIST, "tailwind.tokens.d.ts"),
    [
      "/** AUTO-GENERATED - npm run build:tokens */",
      "import type { TokenName } from './index.js';",
      "export declare const tokenNames: readonly TokenName[];",
      "export declare const tokenCategories: Record<string, readonly TokenName[]>;",
      "export declare const tailwindThemeRefs: Record<string, string>;",
      "",
    ].join("\n"),
  );

  writeFileSync(join(TOKENS_DIST, "tokens.dtcg.json"), `${JSON.stringify(mergeDtcgFiles(), null, 2)}\n`);
  copyFileSync(join(FOUNDATIONS_DIST, "tokens.d.ts"), join(TOKENS_DIST, "tokens.d.ts"));
  copyFileSync(join(FOUNDATIONS_DIST, "tokens-manifest.json"), join(TOKENS_DIST, "tokens-manifest.json"));
}

function writeTokensCssPackage() {
  resetDir(TOKENS_CSS_DIST);
  const sourceCss = readFileSync(VARIABLES_CSS, "utf8");
  const projectedCss = buildTokenCss(sourceCss);
  assertTokenCssProjection(sourceCss, projectedCss);
  writeFileSync(join(TOKENS_CSS_DIST, "tokens.css"), projectedCss);

  const acme = readJson(ACME_BRAND);
  mkdirSync(join(FOUNDATIONS_DIST, "themes"), { recursive: true });
  writeFileSync(join(FOUNDATIONS_DIST, "themes/acme.css"), generateThemeCss(acme, loadTokenNames(CATALOG_PATH)));

  const themesDir = join(FOUNDATIONS_DIST, "themes");
  const packageThemesDir = join(TOKENS_CSS_DIST, "themes");
  mkdirSync(packageThemesDir, { recursive: true });
  for (const file of readdirSync(themesDir)) {
    if (file.endsWith(".css")) {
      copyFileSync(join(themesDir, file), join(packageThemesDir, file));
    }
  }
}

function main() {
  const catalog = readJson(CATALOG_PATH);
  writeTokensPackage(catalog);
  writeTokensCssPackage();
  console.log("✓ Token packages assembled → packages/tokens/dist, packages/tokens-css/dist");
}

main();
