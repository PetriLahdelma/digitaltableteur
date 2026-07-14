#!/usr/bin/env node
/**
 * Guard the public contract surface of @digitaltableteur/react.
 *
 * The React package exposes an explicit package surface. The publish roadmap
 * says no alpha contracts may ship in that surface. Default mode ratchets the
 * current alpha exposure so it cannot grow. Strict mode is for the final publish
 * gate and fails unless the public surface has zero alpha contracts.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");
const PATTERNS = join(ROOT, "nextjs-app/shared/patterns");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const REACT_ENTRY = join(ROOT, "packages/react/src/index.ts");
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-public-surface");
const REPORT = process.argv.includes("--report");
const REQUIRE_PUBLISHABLE =
  process.argv.includes("--require-publishable") ||
  process.env.DT_REQUIRE_REACT_PUBLIC_SURFACE_STABLE === "1";

const IGNORED_EXPORT_NAMES = new Set([
  "MobileDrawer",
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function walkContracts(base, out = new Map()) {
  if (!existsSync(base)) return out;
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    const full = join(base, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__a11y-snapshots__" || entry.name === "__tests__") continue;
      walkContracts(full, out);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".contract.json")) continue;
    const contract = readJson(full);
    const name = contract.name || dirname(full).split("/").pop();
    out.set(name, {
      name,
      status: contract.status,
      file: relative(ROOT, full),
      group: contract.group ?? null,
      description: contract.description ?? "",
    });
  }
  return out;
}

function extractExportedNames(source) {
  const names = new Set();

  for (const match of source.matchAll(/export\s+\{\s*([^}]+)\s*\}\s+from\s+["'][^"']+["']/gs)) {
    const body = match[1];
    for (const part of body.split(",")) {
      const cleaned = part
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\btype\b/g, "")
        .trim();
      if (!cleaned) continue;
      const aliasMatch = cleaned.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
      const directMatch = cleaned.match(/^([A-Za-z_$][\w$]*)/);
      const name = aliasMatch?.[1] ?? directMatch?.[1];
      if (name) names.add(name);
    }
  }

  for (const match of source.matchAll(/export\s+\{\s*default\s+as\s+([A-Za-z_$][\w$]*)\s*\}/g)) {
    names.add(match[1]);
  }

  return names;
}

function resolveRelativeModule(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  return [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]
    .find((candidate) => existsSync(candidate));
}

function collectExportedNames(entryPath, visited = new Set()) {
  if (visited.has(entryPath)) return new Set();
  visited.add(entryPath);

  const source = readFileSync(entryPath, "utf8");
  const names = extractExportedNames(source);
  for (const match of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    if (!match[1].startsWith(".")) continue;
    const target = resolveRelativeModule(entryPath, match[1]);
    if (!target) {
      throw new Error(
        `Cannot resolve public barrel export ${match[1]} from ${relative(ROOT, entryPath)}`,
      );
    }
    for (const name of collectExportedNames(target, visited)) names.add(name);
  }
  return names;
}

function exportedContractRows() {
  const contracts = walkContracts(COMPONENTS);
  walkContracts(PATTERNS, contracts);

  const exported = collectExportedNames(REACT_ENTRY);

  const rows = [];
  const unmapped = [];
  for (const name of [...exported].sort()) {
    if (IGNORED_EXPORT_NAMES.has(name)) continue;
    const contract = contracts.get(name);
    if (contract) rows.push(contract);
    else if (/^[A-Z]/.test(name) && !name.endsWith("Provider")) unmapped.push(name);
  }

  return {
    rows: rows.sort((a, b) => a.name.localeCompare(b.name)),
    unmapped: [...new Set(unmapped)].sort(),
    exported,
    contracts,
  };
}

function summarize(rows) {
  return rows.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0 },
  );
}

const state = readJson(STATE_PATH);
const surfaceState = state.reactPublicSurface ?? {};
const { rows, unmapped, exported, contracts } = exportedContractRows();
const summary = summarize(rows);
const alphaRows = rows.filter((row) => row.status === "alpha");
const betaRows = rows.filter((row) => row.status === "beta");
const stableRows = rows.filter((row) => row.status === "stable");
const allStableRows = [...contracts.values()]
  .filter((row) => row.status === "stable")
  .sort((a, b) => a.name.localeCompare(b.name));
const missingStableRows = allStableRows.filter((row) => !exported.has(row.name));
const alphaCeiling = surfaceState.alphaCeiling ?? alphaRows.length;
const allowedAlphaExports = new Set(surfaceState.allowedAlphaExports ?? alphaRows.map((row) => row.name));
const requiredContractExports = new Set(
  surfaceState.requiredContractExports ?? allStableRows.map((row) => row.name),
);
const forbiddenExports = new Set(surfaceState.forbiddenExports ?? []);
const allowedUnmappedExports = new Set(surfaceState.allowedUnmappedExports ?? unmapped);
const requiredRows = [...requiredContractExports]
  .map((name) => contracts.get(name) ?? { name, status: "unknown", file: null, group: null })
  .sort((a, b) => a.name.localeCompare(b.name));
const missingRequiredRows = requiredRows.filter((row) => !exported.has(row.name));
const forbiddenPresent = [...forbiddenExports].filter((name) => exported.has(name)).sort();
const unexpectedUnmapped = unmapped.filter((name) => !allowedUnmappedExports.has(name));
const errors = [];

if (missingRequiredRows.length) {
  errors.push(
    `Required React package contract exports are missing: ${missingRequiredRows
      .map((row) => row.name)
      .join(", ")}`,
  );
}

if (forbiddenPresent.length) {
  errors.push(
    `Forbidden app/product exports entered the React package surface: ${forbiddenPresent.join(", ")}`,
  );
}

if (unexpectedUnmapped.length) {
  errors.push(
    `Unexpected unmapped public exports entered the React package surface: ${unexpectedUnmapped.join(", ")}`,
  );
}

if (alphaRows.length > alphaCeiling) {
  errors.push(
    `React public surface alpha exports increased to ${alphaRows.length}; ceiling is ${alphaCeiling}.`,
  );
}

const unexpectedAlphaRows = alphaRows.filter((row) => !allowedAlphaExports.has(row.name));
if (unexpectedAlphaRows.length) {
  errors.push(
    `Unexpected alpha exports entered the React public surface: ${unexpectedAlphaRows
      .map((row) => row.name)
      .join(", ")}`,
  );
}

if (REQUIRE_PUBLISHABLE && alphaRows.length) {
  errors.push(
    `React publish requires zero alpha contract exports; current alpha exports: ${alphaRows
      .map((row) => row.name)
      .join(", ")}`,
  );
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  requirePublishable: REQUIRE_PUBLISHABLE,
  summary,
  alphaCeiling,
  stableContractCount: allStableRows.length,
  stableExportCount: stableRows.length,
  requiredContractCount: requiredRows.length,
  requiredExportCount: requiredRows.filter((row) => exported.has(row.name)).length,
  missingStableExports: missingStableRows.map((row) => row.name),
  missingRequiredExports: missingRequiredRows.map((row) => row.name),
  forbiddenExports: [...forbiddenExports].sort(),
  forbiddenPresent,
  allowedUnmappedExports: [...allowedUnmappedExports].sort(),
  unexpectedUnmapped,
  alphaExports: alphaRows.map((row) => row.name),
  betaExports: betaRows.map((row) => row.name),
  stableExports: stableRows.map((row) => row.name),
  unmapped,
  rows,
};
writeFileSync(join(OUT_DIR, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);

if (REPORT) {
  console.log(JSON.stringify(report, null, 2));
}

if (errors.length) {
  console.error("React public surface guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relative(ROOT, join(OUT_DIR, "latest.json"))}`);
  process.exit(1);
}

console.log(
  `✓ React public surface verified (${summary.total} contract exports: ${requiredRows.filter((row) => exported.has(row.name)).length}/${requiredRows.length} required, ${stableRows.length}/${allStableRows.length} stable, ${betaRows.length} beta, ${alphaRows.length} alpha; alpha ceiling ${alphaCeiling})`,
);
if (alphaRows.length) {
  console.log(`  Alpha exports kept as pre-publish debt: ${alphaRows.map((row) => row.name).join(", ")}`);
}
console.log(`  Report: ${relative(ROOT, join(OUT_DIR, "latest.json"))}`);
