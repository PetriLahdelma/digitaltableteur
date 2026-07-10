#!/usr/bin/env node
/**
 * Run npm publish dry-runs for the design-system packages.
 *
 * `npm pack --dry-run` verifies tarball contents. This guard verifies the
 * dry-run publish command shape used by the GitHub OIDC workflow:
 * `npm publish --dry-run --access restricted`.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-publish-dry-run");
const OUT_JSON = join(OUT_DIR, "latest.json");
const PACKAGES = [
  { dir: "packages/tokens", name: "@digitaltableteur/tokens", requiredFiles: ["package.json", "dist/index.js"] },
  { dir: "packages/tokens-css", name: "@digitaltableteur/tokens-css", requiredFiles: ["package.json", "dist/tokens.css"] },
  { dir: "packages/react", name: "@digitaltableteur/react", requiredFiles: ["package.json", "dist/index.js", "dist/style.css"] },
];

function relativePath(path) {
  return relative(ROOT, path);
}

function parsePublishJson(stdout, packageName) {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`npm publish dry-run for ${packageName} did not return JSON.`);
  }
  const parsed = JSON.parse(stdout.slice(start, end + 1));
  const row = parsed[packageName] ?? parsed;
  if (!row || (row.name !== packageName && !row.id?.startsWith(`${packageName}@`))) {
    throw new Error(`npm publish dry-run JSON did not include ${packageName}.`);
  }
  return row;
}

function publishDryRun(definition) {
  const stdout = execFileSync(
    "npm",
    ["publish", "--dry-run", "--access", "restricted", "--json"],
    {
      cwd: join(ROOT, definition.dir),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  return parsePublishJson(stdout, definition.name);
}

const rows = [];
const errors = [];

for (const definition of PACKAGES) {
  const row = publishDryRun(definition);
  const files = new Set((row.files ?? []).map((file) => file.path));
  const packageRow = {
    name: row.name,
    version: row.version,
    id: row.id,
    filename: row.filename,
    size: row.size,
    unpackedSize: row.unpackedSize,
    entryCount: row.entryCount,
    shasum: row.shasum,
    integrity: row.integrity,
    requiredFiles: definition.requiredFiles,
    missingFiles: definition.requiredFiles.filter((file) => !files.has(file)),
    fileCount: row.files?.length ?? 0,
    files: [...files].sort(),
    errors: [],
  };

  if (row.name !== definition.name) {
    packageRow.errors.push(`expected ${definition.name}, got ${row.name}`);
  }
  if (row.id !== `${definition.name}@${row.version}`) {
    packageRow.errors.push(`publish id ${row.id} does not match ${definition.name}@${row.version}`);
  }
  if (!row.integrity || !row.shasum) {
    packageRow.errors.push("publish dry-run did not report package integrity and shasum");
  }
  for (const missing of packageRow.missingFiles) {
    packageRow.errors.push(`missing required publish file ${missing}`);
  }

  rows.push(packageRow);
  for (const error of packageRow.errors) {
    errors.push(`${definition.name}: ${error}`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  commandShape: "npm publish --dry-run --access restricted --json from package directory",
  packages: rows,
  errors,
};
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Package publish dry-run guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

console.log(
  `✓ package publish dry-runs verified (${rows
    .map((row) => `${row.name}@${row.version}: ${row.entryCount} files`)
    .join(", ")})`,
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
