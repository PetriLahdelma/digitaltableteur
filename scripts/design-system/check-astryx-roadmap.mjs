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
 *   3. Coupling ratchets: the curated @digitaltableteur/react package graph
 *      never reintroduces @/, next/*, or i18n coupling.
 *   4. Stable-count floor: the internal catalog never drops below the recorded
 *      floor without a deliberate roadmap update.
 *
 * Run with --report to print measured metrics without failing (used to seed
 * the ratchets after a task lands).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");
const PATTERNS = join(ROOT, "nextjs-app/shared/patterns");
const REACT_ENTRY = join(ROOT, "packages/react/src/index.ts");
const REPORT = process.argv.includes("--report");
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const I18N_COUPLING_RE =
  /from\s+["'](?:i18next|react-i18next)["']|useTranslation\s*\(/;

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

function resolveSourceFile(basePath) {
  for (const ext of ["", ...SOURCE_EXTENSIONS]) {
    const file = `${basePath}${ext}`;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  for (const ext of SOURCE_EXTENSIONS) {
    const file = join(basePath, `index${ext}`);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

function resolveImport(fromFile, spec) {
  if (spec.startsWith("@dt/")) {
    return resolveSourceFile(join(COMPONENTS, spec.slice("@dt/".length)));
  }
  if (spec === "@dt") {
    return resolveSourceFile(join(COMPONENTS, "index"));
  }
  if (spec.startsWith(".")) {
    return resolveSourceFile(resolve(dirname(fromFile), spec));
  }
  return null;
}

function importSpecs(source) {
  return [
    ...source.matchAll(/\bimport\s+(?:[^"'()]+?\s+from\s+)?["']([^"']+)["']/g),
    ...source.matchAll(/\bexport\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g),
    ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
  ].map((match) => match[1]);
}

function reactPackageSourceFiles() {
  if (!existsSync(REACT_ENTRY)) return [];
  const seen = new Set();
  const queue = [REACT_ENTRY];

  while (queue.length) {
    const file = queue.shift();
    if (!file || seen.has(file)) continue;
    seen.add(file);

    const source = readFileSync(file, "utf8");
    for (const spec of importSpecs(source)) {
      const resolved = resolveImport(file, spec);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }

  return [...seen].sort();
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
const reactPackageFiles = reactPackageSourceFiles();
const measured = {
  catalogAppImports: countMatching(catalogFiles, /from "@\//),
  catalogNextImports: countMatching(catalogFiles, /from "next\//),
  catalogI18nImports: countMatching(catalogFiles, I18N_COUPLING_RE),
  reactPackageAppImports: countMatching(reactPackageFiles, /from "@\//),
  reactPackageNextImports: countMatching(reactPackageFiles, /from "next\//),
  reactPackageI18nImports: countMatching(
    reactPackageFiles,
    I18N_COUPLING_RE,
  ),
  stableCount: stableCount(),
  catalogStableCount: stableCount(),
  catalogComponents: contractDirs(COMPONENTS, { excludePages: true }).length,
  reactPackageSourceFiles: reactPackageFiles.length,
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
  if (!(key in measured)) {
    errors.push(`Ratchet "${key}" has no measurement in check-astryx-roadmap.mjs.`);
    continue;
  }
  if (r.ceiling != null && measured[key] > r.ceiling) {
    errors.push(`Ratchet breach: ${key} = ${measured[key]} exceeds ceiling ${r.ceiling}. Coupling may only decrease.`);
  }
  if (r.floor != null && measured[key] < r.floor) {
    errors.push(`Ratchet breach: ${key} = ${measured[key]} below floor ${r.floor}.`);
  }
}

// ---- 4. Checkpoint tasks cannot be "done" without recorded human clearance ----
// Structural enforcement of the stopping contract: publishing (authorization)
// and the i18n / navigation decoupling (unverifiable-regression) may not be
// auto-completed by an autonomous loop. Marking one done requires an explicit
// approval record, which forces a stop-and-ask before it can pass this gate.
const tasks = state.tasks ?? {};
for (const cp of state.checkpoints ?? []) {
  const t = tasks[cp.id];
  if (t && t.status === "done") {
    const a = t.approval;
    if (!a || !a.clearedBy || !a.on) {
      errors.push(
        `Checkpoint task ${cp.id} (${cp.type}) is marked done without a recorded approval {clearedBy, on}. ` +
          `It requires explicit human clearance before it can pass: ${cp.reason}`,
      );
    }
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
