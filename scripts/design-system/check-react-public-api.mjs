#!/usr/bin/env node
/**
 * Freeze the runtime public API of @digitaltableteur/react.
 *
 * The component maturity roadmap requires a documented, frozen package surface
 * before publish. This guard compares the built package's runtime exports and
 * package subpath exports against a checked-in manifest. Use --update only when
 * intentionally changing the public API.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_DIR = join(ROOT, "packages/react");
const DIST_ENTRY = join(PACKAGE_DIR, "dist/index.js");
const PACKAGE_JSON_PATH = join(PACKAGE_DIR, "package.json");
const MANIFEST_PATH = join(PACKAGE_DIR, "public-api.manifest.json");
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-public-api");
const UPDATE = process.argv.includes("--update");
const REPORT = process.argv.includes("--report");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sorted(value) {
  return [...value].sort((a, b) => a.localeCompare(b));
}

function normalizePackageExports(exportsMap) {
  return Object.fromEntries(
    Object.entries(exportsMap ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value]),
  );
}

function runBuildIfNeeded() {
  if (existsSync(DIST_ENTRY)) return;
  execFileSync("npm", ["--prefix", "packages/react", "run", "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

function diffLists(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    added: actual.filter((name) => !expectedSet.has(name)),
    removed: expected.filter((name) => !actualSet.has(name)),
  };
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function sourceExports(entryName) {
  const path = join(PACKAGE_DIR, `src/${entryName}.ts`);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const names = [];
  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      continue;
    }
    for (const element of statement.exportClause.elements) {
      names.push(element.name.text);
    }
  }
  return sorted(new Set(names));
}

async function currentManifest() {
  runBuildIfNeeded();
  const packageJson = readJson(PACKAGE_JSON_PATH);
  const runtime = await import(`${pathToFileURL(DIST_ENTRY).href}?t=${Date.now()}`);
  const familyEntries = Object.entries(packageJson.exports ?? {})
    .filter(
      ([key, value]) =>
        /^\.\/[a-z][a-z0-9-]*$/.test(key) &&
        typeof value === "object" &&
        value !== null &&
        "import" in value,
    )
    .map(([key]) => key.slice(2))
    .sort((a, b) => a.localeCompare(b));
  const runtimeExportsByEntry = {};
  const sourceExportsByEntry = {};
  for (const entryName of familyEntries) {
    const entry = await import(
      `${pathToFileURL(join(PACKAGE_DIR, `dist/${entryName}.js`)).href}?t=${Date.now()}`
    );
    runtimeExportsByEntry[entryName] = sorted(Object.keys(entry));
    sourceExportsByEntry[entryName] = sourceExports(entryName);
  }

  return {
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    packageExports: normalizePackageExports(packageJson.exports),
    runtimeExports: sorted(Object.keys(runtime)),
    runtimeExportsByEntry,
    sourceExportsByEntry,
  };
}

const current = await currentManifest();

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "latest.json"), `${JSON.stringify(current, null, 2)}\n`);

if (REPORT) {
  console.log(JSON.stringify(current, null, 2));
}

if (UPDATE) {
  writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(
      {
        ...current,
        generatedFrom: "packages/react/dist/*.js and packages/react/src/*.ts",
        note: "Checked by npm run check:react-public-api. Update only for intentional public API changes.",
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `✓ updated React public API manifest (${current.runtimeExports.length} exports): ${relative(ROOT, MANIFEST_PATH)}`,
  );
  process.exit(0);
}

if (!existsSync(MANIFEST_PATH)) {
  console.error(
    `React public API manifest is missing: ${relative(ROOT, MANIFEST_PATH)}. Run npm run check:react-public-api -- --update after reviewing the intended public surface.`,
  );
  process.exit(1);
}

const manifest = readJson(MANIFEST_PATH);
const errors = [];

if (manifest.packageName !== current.packageName) {
  errors.push(`packageName changed from ${manifest.packageName} to ${current.packageName}`);
}

if (!deepEqual(manifest.packageExports, current.packageExports)) {
  errors.push("package subpath exports changed");
}

const { added, removed } = diffLists(manifest.runtimeExports ?? [], current.runtimeExports);
if (added.length) errors.push(`runtime exports added: ${added.join(", ")}`);
if (removed.length) errors.push(`runtime exports removed: ${removed.join(", ")}`);

for (const field of ["runtimeExportsByEntry", "sourceExportsByEntry"]) {
  const expectedEntries = manifest[field] ?? {};
  const actualEntries = current[field];
  for (const entryName of sorted(
    new Set([...Object.keys(expectedEntries), ...Object.keys(actualEntries)]),
  )) {
    const entryDiff = diffLists(
      expectedEntries[entryName] ?? [],
      actualEntries[entryName] ?? [],
    );
    if (entryDiff.added.length) {
      errors.push(`${field}.${entryName} added: ${entryDiff.added.join(", ")}`);
    }
    if (entryDiff.removed.length) {
      errors.push(`${field}.${entryName} removed: ${entryDiff.removed.join(", ")}`);
    }
  }
}

if (errors.length) {
  console.error("React public API guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(
    `Review the change, then run npm run check:react-public-api -- --update only if this is an intentional public API change.`,
  );
  console.error(`Report: ${relative(ROOT, join(OUT_DIR, "latest.json"))}`);
  process.exit(1);
}

console.log(
  `✓ React public API verified (${current.runtimeExports.length} runtime exports, ${Object.keys(current.packageExports).length} package entrypoints)`,
);
console.log(`  Manifest: ${relative(ROOT, MANIFEST_PATH)}`);
console.log(`  Report: ${relative(ROOT, join(OUT_DIR, "latest.json"))}`);
