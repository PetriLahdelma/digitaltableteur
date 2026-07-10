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
  const names = new Set();
  const barrelImportRe = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']@digitaltableteur\/react["']/g;
  for (const match of source.matchAll(barrelImportRe)) {
    for (const raw of match[1].split(",")) {
      const cleaned = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/)[0].trim();
      if (cleaned) names.add(cleaned);
    }
  }
  return names;
}

const components = listComponents();
const files = collectSourceFiles();
const fileEntries = files.map((path) => {
  const source = readFileSync(path, "utf8");
  return {
    path: relative(ROOT, path),
    source,
    barrelNames: source.includes("@digitaltableteur/react") ? barrelImportedNames(source) : new Set(),
  };
});

const rows = components.map(({ name, kind, status }) => {
  const patterns = importPatternsFor(name);
  const importers = [];
  for (const entry of fileEntries) {
    // A component's own directory does not count as an importer of itself.
    if (entry.path.includes(`/${name}/`)) continue;
    const direct = patterns.some((re) => re.test(entry.source));
    const viaBarrel = entry.barrelNames.has(name);
    if (direct || viaBarrel) importers.push(entry.path);
  }
  const consumers = computeConsumersForComponent(name);
  return {
    name,
    kind,
    status,
    directImportCount: importers.length,
    directImporters: importers.sort(),
    prodPageCount: consumers.length,
    prodPages: consumers.map((c) => c.path),
  };
});

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(
  OUT_PATH,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), components: rows }, null, 2)}\n`,
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
console.log(`\n${rows.length} components; ${unused.length} with zero direct imports.`);
console.log(`Report: ${relative(ROOT, OUT_PATH)}`);
