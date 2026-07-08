#!/usr/bin/env node
/**
 * Non-regression guard for the Astryx-parity roadmap.
 *
 * The roadmap (docs/design-system/astryx-parity-roadmap.md) is the human source
 * of truth; astryx-roadmap.state.json is the machine state. This gate enforces
 * the invariants that must hold once established, so completed progress cannot
 * silently regress:
 *
 *   1. Anti-goal components never appear in the catalog (scope-creep guard).
 *   2. Utilities marked "operational" keep their file present + exported.
 *   3. Coupling ratchets: catalog imports of @/, next/*, and i18n never climb
 *      above the recorded ceiling (decoupling can only move forward).
 *   4. Stable-count floor: the catalog never drops below the recorded floor.
 *
 * Run with --report to print measured metrics without failing (used to seed
 * the ratchets after a task lands).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");
const PATTERNS = join(ROOT, "nextjs-app/shared/patterns");
const REPORT = process.argv.includes("--report");

const state = existsSync(STATE_PATH)
  ? JSON.parse(readFileSync(STATE_PATH, "utf8"))
  : { antiGoalComponents: [], utilities: [], ratchets: {} };
const errors = [];

/** All contract dirs under a base (optionally excluding pages/). */
function contractDirs(base, { excludePages = false } = {}) {
  if (!existsSync(base)) return [];
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name === "__a11y-snapshots__" || e.name === "__tests__") continue;
      const full = join(dir, e.name);
      if (existsSync(join(full, `${e.name}.contract.json`))) out.push(full);
      walk(full);
    }
  };
  walk(base);
  return excludePages ? out.filter((d) => !d.includes("/pages/")) : out;
}

/** Catalog source .tsx (non test/story) for the publishable catalog. */
function catalogSourceFiles() {
  const files = [];
  for (const dir of contractDirs(COMPONENTS, { excludePages: true })) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isFile() || !e.name.endsWith(".tsx")) continue;
      if (e.name.endsWith(".test.tsx") || e.name.endsWith(".stories.tsx")) continue;
      files.push(join(dir, e.name));
    }
  }
  return files;
}

function countMatching(files, re) {
  let n = 0;
  for (const f of files) {
    if (re.test(readFileSync(f, "utf8"))) n += 1;
  }
  return n;
}

function stableCount() {
  let n = 0;
  for (const base of [COMPONENTS, PATTERNS]) {
    for (const dir of contractDirs(base)) {
      const name = dir.split("/").pop();
      const c = JSON.parse(readFileSync(join(dir, `${name}.contract.json`), "utf8"));
      if (c.status === "stable") n += 1;
    }
  }
  return n;
}

// ---- Measurements ----
const catalogFiles = catalogSourceFiles();
const measured = {
  catalogAppImports: countMatching(catalogFiles, /from "@\//),
  catalogNextImports: countMatching(catalogFiles, /from "next\//),
  catalogI18nImports: countMatching(catalogFiles, /i18next|react-i18next|useTranslation/),
  stableCount: stableCount(),
  catalogComponents: contractDirs(COMPONENTS, { excludePages: true }).length,
};

if (REPORT) {
  console.log("Astryx-roadmap measured metrics:");
  for (const [k, v] of Object.entries(measured)) console.log(`  ${k} = ${v}`);
  process.exit(0);
}

// ---- 1. Anti-goal components ----
const catalogNames = new Set(
  [...contractDirs(COMPONENTS), ...contractDirs(PATTERNS)].map((d) => d.split("/").pop()),
);
for (const name of state.antiGoalComponents ?? []) {
  if (catalogNames.has(name)) {
    errors.push(`Anti-goal component "${name}" appeared in the catalog (scope creep). Remove it or amend the roadmap deliberately.`);
  }
}

// ---- 2. Operational utilities present ----
for (const u of state.utilities ?? []) {
  if (u.status !== "operational") continue;
  if (!u.file) {
    errors.push(`Utility "${u.name}" is marked operational but has no file recorded in state.`);
    continue;
  }
  if (!existsSync(join(ROOT, u.file))) {
    errors.push(`Operational utility "${u.name}" file missing: ${u.file}`);
    continue;
  }
  const src = readFileSync(join(ROOT, u.file), "utf8");
  if (!new RegExp(`\\b${u.name}\\b`).test(src)) {
    errors.push(`Operational utility "${u.name}" not found/exported in ${u.file}`);
  }
}

// ---- 3. Coupling ratchets ----
for (const [key, r] of Object.entries(state.ratchets ?? {})) {
  if (r.ceiling != null && measured[key] > r.ceiling) {
    errors.push(`Ratchet breach: ${key} = ${measured[key]} exceeds ceiling ${r.ceiling}. Coupling may only decrease.`);
  }
  if (r.floor != null && measured[key] < r.floor) {
    errors.push(`Ratchet breach: ${key} = ${measured[key]} below floor ${r.floor}.`);
  }
}

// ---- Report ----
if (errors.length) {
  console.error("✗ Astryx-roadmap guard FAILED:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nMeasured:", JSON.stringify(measured));
  process.exit(1);
}
console.log(`✓ Astryx-roadmap guard passed (${JSON.stringify(measured)})`);
