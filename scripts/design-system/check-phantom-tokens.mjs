#!/usr/bin/env node
/**
 * Phantom-token gate: fail when CSS references a `var(--name)` that is
 * defined nowhere in the repo (see phantom-tokens-lib.mjs for the failure
 * mode). References are scanned in app/ and nextjs-app/shared/ CSS;
 * definitions are collected from ALL app/ + nextjs-app/ CSS and TS/TSX
 * (style objects, setProperty, next/font `variable:` configs).
 *
 * Baseline (scripts/design-system/phantom-tokens-baseline.json) allowlists
 * intentional exceptions — tokens injected by external runtimes the scanner
 * cannot see (Storybook manager, third-party widgets). Regenerate with
 * `npm run check:phantom-tokens -- --update`; treat any baseline growth as
 * a design-system bug to investigate, not a formality.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractCssDefinitions,
  extractCssReferences,
  extractTsxDefinitions,
  findPhantomTokens,
} from "./phantom-tokens-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE = join(
  ROOT,
  "scripts/design-system/phantom-tokens-baseline.json",
);
const update = process.argv.includes("--update");

/** Mirrors .stylelintignore: generated/build output is not authored source. */
const SKIP_DIRECTORIES = new Set([
  ".design-sync",
  ".ds-sync",
  ".next",
  "coverage",
  "dist",
  "ds-bundle",
  "node_modules",
  "storybook-static",
]);

const REFERENCE_ROOTS = ["app", "nextjs-app/shared"];
const DEFINITION_ROOTS = ["app", "nextjs-app"];

function walk(directory, extensions, out = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name)) {
        walk(join(directory, entry.name), extensions, out);
      }
    } else if (
      extensions.some((extension) => entry.name.endsWith(extension)) &&
      !entry.name.endsWith(".min.css")
    ) {
      out.push(join(directory, entry.name));
    }
  }
  return out;
}

// Collect definitions.
const defined = new Set();
for (const root of DEFINITION_ROOTS) {
  for (const file of walk(join(ROOT, root), [".css"])) {
    for (const token of extractCssDefinitions(readFileSync(file, "utf8"))) {
      defined.add(token);
    }
  }
  for (const file of walk(join(ROOT, root), [".ts", ".tsx"])) {
    for (const token of extractTsxDefinitions(readFileSync(file, "utf8"))) {
      defined.add(token);
    }
  }
}

// Collect references.
const referencesByFile = new Map();
for (const root of REFERENCE_ROOTS) {
  for (const file of walk(join(ROOT, root), [".css"])) {
    const references = extractCssReferences(readFileSync(file, "utf8"));
    if (references.length > 0) {
      referencesByFile.set(relative(ROOT, file), references);
    }
  }
}

const phantoms = findPhantomTokens(referencesByFile, defined);
const phantomTokenNames = phantoms.map((entry) => entry.token);

if (update) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify(
      {
        allowedTokens: phantomTokenNames,
        generatedBy: "npm run check:phantom-tokens -- --update",
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `✓ Phantom-token baseline updated (${phantomTokenNames.length} allowed token(s))`,
  );
  process.exit(0);
}

let allowed = new Set();
try {
  allowed = new Set(JSON.parse(readFileSync(BASELINE, "utf8")).allowedTokens);
} catch {
  console.error(
    "FAIL: missing/unreadable phantom-token baseline. Run npm run check:phantom-tokens -- --update.",
  );
  process.exit(1);
}

const fresh = phantoms.filter((entry) => !allowed.has(entry.token));
const stale = [...allowed].filter(
  (token) => !phantomTokenNames.includes(token),
);

if (fresh.length > 0) {
  console.error(
    `FAIL: ${fresh.length} phantom token(s) — referenced in CSS but defined nowhere.`,
  );
  for (const { hard, token, uses } of fresh) {
    console.error(
      `\n${token} ${hard ? "(no fallback — declaration invalidated at runtime)" : "(fallback-only — fallback value is operative)"}`,
    );
    for (const use of uses.slice(0, 10)) {
      console.error(`  ${use.file}:${use.line}`);
    }
    if (uses.length > 10) console.error(`  … and ${uses.length - 10} more`);
  }
  console.error(
    "\nFix: define the token (variables.css or component-local), correct the name, or — for tokens injected by external runtimes only — baseline via npm run check:phantom-tokens -- --update.",
  );
  process.exit(1);
}

if (stale.length > 0) {
  console.log(
    `note: ${stale.length} baseline entr${stale.length === 1 ? "y is" : "ies are"} no longer phantom (${stale.join(", ")}). Tighten with npm run check:phantom-tokens -- --update.`,
  );
}

console.log(
  `✓ Phantom tokens verified (${referencesByFile.size} files scanned, ${defined.size} tokens defined, ${phantomTokenNames.length} baselined)`,
);
