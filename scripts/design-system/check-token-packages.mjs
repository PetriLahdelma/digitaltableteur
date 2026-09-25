#!/usr/bin/env node
/**
 * Guard the generated token packages against drift and incomplete theme/a11y
 * output. This command may regenerate ignored package dist directories.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { assertTokenCssProjection, collectTokenCssEntries } from "./build-token-css.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG = join(ROOT, "nextjs-app/shared/foundations/token-catalog.json");
const VARIABLES_CSS = join(ROOT, "nextjs-app/shared/styles/variables.css");
const TOKENS_DIST = join(ROOT, "packages/tokens/dist");
const TOKENS_CSS_DIST = join(ROOT, "packages/tokens-css/dist");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectDtcgLeaves(node, leaves = []) {
  if (node && typeof node === "object" && "$value" in node) {
    leaves.push(node);
  }
  for (const [key, value] of Object.entries(node ?? {})) {
    // "$root" is the DTCG 2025.10 key for a group's own token.
    if ((key.startsWith("$") && key !== "$root") || !value || typeof value !== "object") continue;
    collectDtcgLeaves(value, leaves);
  }
  return leaves;
}

function assertFile(path) {
  if (!existsSync(path)) throw new Error(`Missing generated package file: ${path.replace(ROOT + "/", "")}`);
}

async function main() {
  execFileSync("npm", ["run", "build:tokens"], { cwd: ROOT, stdio: "pipe" });

  const requiredFiles = [
    "packages/tokens/dist/index.js",
    "packages/tokens/dist/index.d.ts",
    "packages/tokens/dist/tailwind.tokens.js",
    "packages/tokens/dist/tailwind.tokens.d.ts",
    "packages/tokens/dist/tokens.dtcg.json",
    "packages/tokens/dist/tokens-manifest.json",
    "packages/tokens-css/dist/tokens.css",
    "packages/tokens-css/dist/themes/acme.css",
  ];
  for (const rel of requiredFiles) assertFile(join(ROOT, rel));

  const catalog = readJson(CATALOG);
  const catalogNames = new Set(catalog.groups.flatMap((group) => group.tokens.map((token) => token.name)));
  const pkg = await import(resolve(TOKENS_DIST, "index.js"));
  if (pkg.tokenCount !== catalog.tokenCount || pkg.tokenNames.length !== catalog.tokenCount) {
    throw new Error(
      `@digitaltableteur/tokens count mismatch: package=${pkg.tokenNames.length}, catalog=${catalog.tokenCount}`,
    );
  }
  const missingFromPackage = [...catalogNames].filter((name) => !pkg.tokenNames.includes(name));
  if (missingFromPackage.length) {
    throw new Error(`@digitaltableteur/tokens missing token names: ${missingFromPackage.join(", ")}`);
  }

  const dtcgPath = join(TOKENS_DIST, "tokens.dtcg.json");
  const dtcg = readJson(dtcgPath);
  const dtcgExport = await import(pathToFileURL(dtcgPath), { with: { type: "json" } });
  if (!dtcgExport.default?.$schema) {
    throw new Error("Local DTCG JSON export did not resolve with an import attribute");
  }
  // The published document must validate against the official 2025.10 schema.
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  const validateFormat = ajv.compile(
    readJson(join(ROOT, "scripts/design-system/schemas/dtcg-2025.10-format.json")),
  );
  if (!validateFormat(dtcg)) {
    throw new Error(
      `DTCG package does not validate against DTCG 2025.10: ${JSON.stringify(validateFormat.errors?.[0])}`,
    );
  }

  // Every catalog token is either a DTCG 2025.10 leaf or listed (with a reason)
  // as having no DTCG form, never silently dropped.
  const leaves = collectDtcgLeaves(dtcg);
  const nonDtcg = dtcg.$extensions?.["com.digitaltableteur"]?.nonDtcg ?? [];
  const dtcgNames = new Set(
    [
      ...leaves.map((leaf) => leaf.$extensions?.["com.digitaltableteur"]?.cssVar),
      ...nonDtcg.map((entry) => entry.cssVar),
    ].filter((name) => typeof name === "string"),
  );
  if (leaves.length + nonDtcg.length !== catalog.tokenCount || dtcgNames.size !== catalog.tokenCount) {
    throw new Error(
      `DTCG package is incomplete: leaves=${leaves.length}, nonDtcg=${nonDtcg.length}, cssVarNames=${dtcgNames.size}, catalog=${catalog.tokenCount}`,
    );
  }
  const missingFromDtcg = [...catalogNames].filter((name) => !dtcgNames.has(name));
  if (missingFromDtcg.length) {
    throw new Error(`DTCG package missing token names: ${missingFromDtcg.join(", ")}`);
  }

  const sourceCss = readFileSync(VARIABLES_CSS, "utf8");
  const packageCss = readFileSync(join(TOKENS_CSS_DIST, "tokens.css"), "utf8");
  assertTokenCssProjection(sourceCss, packageCss);

  const sourceEntryCount = collectTokenCssEntries(sourceCss).length;
  const packageEntryCount = collectTokenCssEntries(packageCss).length;
  if (sourceEntryCount !== packageEntryCount) {
    throw new Error(`Token CSS declaration count mismatch: source=${sourceEntryCount}, package=${packageEntryCount}`);
  }

  // Local package export smoke. The app/root install resolves these packages
  // from npm; this guard validates the freshly generated package dist instead.
  const localPkg = await import(pathToFileURL(join(TOKENS_DIST, "index.js")));
  if (localPkg.tokenCount !== catalog.tokenCount) {
    throw new Error(`Local package import count mismatch: ${localPkg.tokenCount} !== ${catalog.tokenCount}`);
  }
  const manifestPkg = await import(pathToFileURL(join(TOKENS_DIST, "tokens-manifest.json")), {
    with: { type: "json" },
  });
  if (manifestPkg.default?.tokenCount !== catalog.tokenCount) {
    throw new Error(`Local manifest export mismatch: ${manifestPkg.default?.tokenCount} !== ${catalog.tokenCount}`);
  }
  const tailwindPkg = await import(pathToFileURL(join(TOKENS_DIST, "tailwind.tokens.js")));
  if (!tailwindPkg.tailwindThemeRefs || !tailwindPkg.tailwindThemeRefs["color-dt-primary"]) {
    throw new Error("Local tailwind export is missing color-dt-primary");
  }

  console.log(
    `✓ token packages verified (${catalog.tokenCount} DTCG tokens, ${packageEntryCount} CSS token/theme declarations)`,
  );
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
