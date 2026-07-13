#!/usr/bin/env node
/**
 * Component usage report: for every catalog component, count direct imports
 * across app + shared source and the production entry files that transitively
 * render it (via consumers-lib's module graph). Writes
 * nextjs-app/shared/foundations/dist/component-usage.json for the Storybook
 * usage docs page and prints a summary table.
 *
 * Direct-import matching is word-boundary exact on the path segment
 * (`@dt/Button`, `components/Button`, `patterns/Button`) plus named imports
 * from the "@digitaltableteur/react" barrel, so `EnhancedArticleCard` never
 * counts as `ArticleCard` (the raw-grep substring trap).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeConsumersForComponent } from "./consumers-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_PATH = join(ROOT, "nextjs-app/shared/foundations/dist/component-usage.json");
const COMPONENT_ROOTS = [
  { base: "nextjs-app/shared/components", kind: "component" },
  { base: "nextjs-app/shared/patterns", kind: "pattern" },
];
const SCAN_ROOTS = ["app", "providers", "nextjs-app/shared", "lib", "components"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".mjs"]);
const EXCLUDED_DIR_NAMES = new Set(["node_modules", "dist", ".next", "__a11y-snapshots__"]);

function listComponents() {
  const items = [];
  for (const { base, kind } of COMPONENT_ROOTS) {
    const abs = join(ROOT, base);
    if (!existsSync(abs)) continue;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const contractPath = join(abs, entry.name, `${entry.name}.contract.json`);
      let status = null;
      if (existsSync(contractPath)) {
        try {
          status = JSON.parse(readFileSync(contractPath, "utf8")).status ?? null;
        } catch {
          status = "unreadable-contract";
        }
      }
      items.push({ name: entry.name, kind, status });
    }
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

function* walkFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      yield* walkFiles(join(dir, entry.name));
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    if (!SCAN_EXTENSIONS.has(ext)) continue;
    if (/\.(test|stories)\.(ts|tsx)$/.test(entry.name)) continue;
    yield join(dir, entry.name);
  }
}

function collectSourceFiles() {
  const files = [];
  for (const rootDir of SCAN_ROOTS) {
    const abs = join(ROOT, rootDir);
    if (!existsSync(abs)) continue;
    files.push(...walkFiles(abs));
  }
  return files;
}

function importPatternsFor(name) {
  return [
    // Any import specifier where a path segment equals the component name
    // exactly: "@dt/Name", ".../components/Name", "../Name/Name", "./Name".
    // Component dirs are PascalCase, so lowercase packages (next/link) and
    // css-module files (./Name.module.css) never match a segment.
    new RegExp(`from\\s+["'](?:[^"']*/)?${name}(?:/[^"']*)?["']`),
    // Dynamic imports (next/dynamic lazy chunks): import("../Name/Name")
    new RegExp(`import\\(\\s*["'](?:[^"']*/)?${name}(?:/[^"']*)?["']\\s*\\)`),
  ];
}

function barrelImportedNames(source) {
  // value = runtime imports (real package consumption); typeOnly = statement-
  // or specifier-level `type` imports, which don't consume the shipped code.
  const value = new Set();
  const typeOnly = new Set();
  const barrelImportRe = /import\s+(type\s+)?\{([^}]+)\}\s+from\s+["']@digitaltableteur\/react["']/g;
  for (const match of source.matchAll(barrelImportRe)) {
    const statementTypeOnly = Boolean(match[1]);
    for (const raw of match[2].split(",")) {
      const inlineType = /\btype\b/.test(raw);
      const cleaned = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/)[0].trim();
      if (!cleaned) continue;
      (statementTypeOnly || inlineType ? typeOnly : value).add(cleaned);
    }
  }
  return { value, typeOnly };
}

// Runtime-value exports of the @digitaltableteur/react barrel: the names an
// external consumer can import as running code. Powers the "shipped in the
// package" signal — `export type {}` blocks and inline `type` specifiers are
// skipped because they carry no runtime surface.
function packageExportedValueNames() {
  const barrelPath = join(ROOT, "packages/react/src/index.ts");
  if (!existsSync(barrelPath)) return new Set();
  const src = readFileSync(barrelPath, "utf8");
  const names = new Set();
  for (const match of src.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)) {
    if (match[1]) continue; // `export type { … }` block — no runtime surface
    for (const raw of match[2].split(",")) {
      const spec = raw.trim();
      if (!spec || /^type\s/.test(spec)) continue; // inline `type X` specifier
      const parts = spec.split(/\s+as\s+/);
      const exportedName = (parts.length > 1 ? parts[1] : parts[0]).trim();
      if (/^[A-Z][A-Za-z0-9]*$/.test(exportedName)) names.add(exportedName);
    }
  }
  return names;
}

const components = listComponents();
const exportedValueNames = packageExportedValueNames();
const files = collectSourceFiles();
const fileEntries = files.map((path) => {
  const source = readFileSync(path, "utf8");
  const barrel = source.includes("@digitaltableteur/react")
    ? barrelImportedNames(source)
    : { value: new Set(), typeOnly: new Set() };
  return {
    path: relative(ROOT, path),
    source,
    barrelNames: barrel,
  };
});

const rows = components.map(({ name, kind, status }) => {
  const patterns = importPatternsFor(name);
  const importers = [];
  const packageImporters = [];
  for (const entry of fileEntries) {
    // A component's own directory does not count as an importer of itself.
    if (entry.path.includes(`/${name}/`)) continue;
    const direct = patterns.some((re) => re.test(entry.source));
    const viaBarrelValue = entry.barrelNames.value.has(name);
    const viaBarrel = viaBarrelValue || entry.barrelNames.typeOnly.has(name);
    if (direct || viaBarrel) importers.push(entry.path);
    if (viaBarrelValue) packageImporters.push(entry.path);
  }
  const consumers = computeConsumersForComponent(name);
  // governed = a contract-bearing DS component (the honest denominator); the
  // catalog also lists non-component dirs (animations, icons, navigation…) and
  // bespoke one-off page components (Tulli, VertaaUX…) that carry no contract.
  const governed = status !== null;
  const exported = exportedValueNames.has(name);
  return {
    name,
    kind,
    status,
    governed,
    exported,
    directImportCount: importers.length,
    directImporters: importers.sort(),
    packageImportCount: packageImporters.length,
    packageImporters: packageImporters.sort(),
    prodPageCount: consumers.length,
    prodPages: consumers.map((c) => c.path),
  };
});

// Two honest consumption signals over the governed denominator:
//  - strict: this repo imports the component as a runtime value from the barrel
//    (pure dogfooding; capped low because the app renders the DS through page
//    shells that live inside the package boundary and cannot self-import it).
//  - transitive: the component ships in the package AND is rendered by at least
//    one production page, i.e. it reaches production as a package-shipped unit.
const governedRows = rows.filter((row) => row.governed);
const strictConsumed = governedRows.filter((row) => row.packageImportCount > 0);
const transitiveConsumed = governedRows.filter(
  (row) => row.exported && row.prodPageCount > 0,
);
const summary = {
  catalogCount: rows.length,
  governedCount: governedRows.length,
  exportedCount: rows.filter((row) => row.exported).length,
  strictConsumedCount: strictConsumed.length,
  transitiveConsumedCount: transitiveConsumed.length,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(
  OUT_PATH,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, components: rows }, null, 2)}\n`,
);

const sorted = [...rows].sort(
  (a, b) => b.directImportCount - a.directImportCount || a.name.localeCompare(b.name),
);
const pad = (value, width) => String(value).padEnd(width);
console.log(pad("component", 30), pad("kind", 10), pad("status", 8), pad("imports", 8), "prod pages");
for (const row of sorted) {
  console.log(
    pad(row.name, 30),
    pad(row.kind, 10),
    pad(row.status ?? "-", 8),
    pad(row.directImportCount, 8),
    row.prodPageCount,
  );
}
const unused = sorted.filter((row) => row.directImportCount === 0);
console.log(
  `\n${summary.catalogCount} catalog entries; ${summary.governedCount} governed (contract-bearing) components; ${unused.length} with zero direct imports.`,
);
console.log(
  `${summary.strictConsumedCount}/${summary.governedCount} directly imported from @digitaltableteur/react (strict runtime dogfooding).`,
);
console.log(
  `${summary.transitiveConsumedCount}/${summary.governedCount} shipped in the package and rendered in production (transitive).`,
);
console.log(`Report: ${relative(ROOT, OUT_PATH)}`);
