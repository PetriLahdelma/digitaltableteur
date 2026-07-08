#!/usr/bin/env node
/**
 * Verify the exact npm tarball contents for all design-system packages.
 *
 * This guard uses `npm pack --dry-run --json` and fails if a package would
 * publish source files, config, screenshots, tests, env files, lockfiles, or
 * anything outside the intended package payload.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-tarball-contents");
const OUT_JSON = join(OUT_DIR, "latest.json");

const PACKAGE_DEFINITIONS = [
  {
    dir: "packages/tokens",
    name: "@digitaltableteur/tokens",
    maxEntryCount: 20,
    maxTarballSize: 40_000,
    maxUnpackedSize: 250_000,
    requiredFiles: [
      "LICENSE",
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/tailwind.tokens.d.ts",
      "dist/tailwind.tokens.js",
      "dist/tokens-manifest.json",
      "dist/tokens.dtcg.json",
      "package.json",
    ],
  },
  {
    dir: "packages/tokens-css",
    name: "@digitaltableteur/tokens-css",
    maxEntryCount: 12,
    maxTarballSize: 20_000,
    maxUnpackedSize: 60_000,
    requiredFiles: [
      "LICENSE",
      "README.md",
      "dist/themes/acme.css",
      "dist/tokens.css",
      "package.json",
    ],
  },
  {
    dir: "packages/react",
    name: "@digitaltableteur/react",
    maxEntryCount: 1_100,
    maxTarballSize: 900_000,
    maxUnpackedSize: 3_500_000,
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/package-globals.d.ts",
      "dist/style.css",
      "package.json",
    ],
  },
];

const ROOT_FILE_ALLOWLIST = new Set(["LICENSE", "README.md", "package.json"]);
const DIST_FILE_ALLOWLIST = /^dist\/.+\.(?:css|d\.ts|d\.ts\.map|js|json)$/;
const FORBIDDEN_PATTERNS = [
  { label: "environment file", re: /(^|\/)\.env(?:\.|$)|(^|\/)\.npmrc$|(^|\/)\.npm-userconfig$/ },
  {
    label: "source/config directory",
    re: /(^|\/)(?:src|app|scripts|tests?|__tests__|__mocks__|__snapshots__|__a11y-snapshots__|\.storybook|\.next|coverage|storybook-static)(?:\/|$)/,
  },
  { label: "lockfile or npm debug log", re: /(^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|npm-debug\.log)$/ },
  { label: "test or story source", re: /\.(?:test|spec|stories)\.[cm]?[tj]sx?$/ },
  { label: "raw TypeScript source", re: /\.(?:ts|tsx)$/ },
  { label: "image/media artifact", re: /\.(?:avif|gif|jpe?g|mov|mp4|pdf|png|svg|webp)$/ },
  { label: "tool config", re: /(^|\/)(?:eslint|next|playwright|tsconfig|vite|vitest)\.config\./ },
  { label: "node_modules payload", re: /(^|\/)node_modules(?:\/|$)/ },
];

function relativePath(path) {
  return relative(ROOT, path);
}

function parsePackJson(stdout, packageName) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`npm pack for ${packageName} did not return JSON.`);
  }
  const parsed = JSON.parse(stdout.slice(start, end + 1));
  if (!Array.isArray(parsed) || parsed.length !== 1) {
    throw new Error(`npm pack for ${packageName} returned ${parsed.length} package rows.`);
  }
  return parsed[0];
}

function packPackage(definition) {
  const stdout = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json"],
    {
      cwd: join(ROOT, definition.dir),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  return parsePackJson(stdout, definition.name);
}

function isAllowedPath(path) {
  return ROOT_FILE_ALLOWLIST.has(path) || DIST_FILE_ALLOWLIST.test(path);
}

function validatePack(definition, pack) {
  const paths = pack.files.map((file) => file.path).sort();
  const pathSet = new Set(paths);
  const errors = [];
  const unexpectedFiles = [];
  const forbiddenFiles = [];
  const missingFiles = [];

  if (pack.name !== definition.name) {
    errors.push(`expected ${definition.name}, got ${pack.name}`);
  }
  if (pack.entryCount > definition.maxEntryCount) {
    errors.push(
      `entry count ${pack.entryCount} exceeds ceiling ${definition.maxEntryCount}`,
    );
  }
  if (pack.size > definition.maxTarballSize) {
    errors.push(`tarball size ${pack.size} exceeds ceiling ${definition.maxTarballSize}`);
  }
  if (pack.unpackedSize > definition.maxUnpackedSize) {
    errors.push(
      `unpacked size ${pack.unpackedSize} exceeds ceiling ${definition.maxUnpackedSize}`,
    );
  }

  for (const required of definition.requiredFiles) {
    if (!pathSet.has(required)) {
      missingFiles.push(required);
      errors.push(`missing required tarball file ${required}`);
    }
  }

  for (const path of paths) {
    if (path.startsWith("/") || path.includes("..") || path.includes("\\")) {
      forbiddenFiles.push({ path, reason: "unsafe path" });
      errors.push(`unsafe tarball path ${path}`);
      continue;
    }

    if (!isAllowedPath(path)) {
      unexpectedFiles.push(path);
      errors.push(`unexpected tarball file ${path}`);
    }

    for (const forbidden of FORBIDDEN_PATTERNS) {
      if (!forbidden.re.test(path)) continue;
      if (forbidden.label === "source/config directory" && path.startsWith("dist/types/")) continue;
      if (forbidden.label === "raw TypeScript source" && /\.d\.ts$/.test(path)) continue;
      forbiddenFiles.push({ path, reason: forbidden.label });
      errors.push(`forbidden ${forbidden.label}: ${path}`);
    }
  }

  return {
    name: pack.name,
    version: pack.version,
    filename: pack.filename,
    entryCount: pack.entryCount,
    maxEntryCount: definition.maxEntryCount,
    tarballSize: pack.size,
    maxTarballSize: definition.maxTarballSize,
    unpackedSize: pack.unpackedSize,
    maxUnpackedSize: definition.maxUnpackedSize,
    requiredFiles: definition.requiredFiles,
    fileCount: paths.length,
    files: paths,
    missingFiles,
    unexpectedFiles,
    forbiddenFiles,
    errors,
  };
}

const rows = [];
const errors = [];

for (const definition of PACKAGE_DEFINITIONS) {
  const pack = packPackage(definition);
  const row = validatePack(definition, pack);
  rows.push(row);
  for (const error of row.errors) {
    errors.push(`${definition.name}: ${error}`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  packages: rows,
  errors,
};
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Package tarball contents guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

console.log(
  `✓ package tarball contents verified (${rows
    .map((row) => `${row.name}@${row.version}: ${row.entryCount} files`)
    .join(", ")})`,
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
