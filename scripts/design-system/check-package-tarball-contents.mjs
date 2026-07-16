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
      "dist/actions.d.ts",
      "dist/actions.js",
      "dist/actions.css",
      "dist/consent.d.ts",
      "dist/consent.js",
      "dist/consent.css",
      "dist/content.d.ts",
      "dist/content.js",
      "dist/content.css",
      "dist/feedback.d.ts",
      "dist/feedback.js",
      "dist/feedback.css",
      "dist/forms.d.ts",
      "dist/forms.js",
      "dist/forms.css",
      "dist/hooks.d.ts",
      "dist/hooks.js",
      "dist/hooks.css",
      "dist/identity.d.ts",
      "dist/identity.js",
      "dist/identity.css",
      "dist/layout.d.ts",
      "dist/layout.js",
      "dist/layout.css",
      "dist/navigation.d.ts",
      "dist/navigation.js",
      "dist/navigation.css",
      "dist/patterns.d.ts",
      "dist/patterns.js",
      "dist/patterns.css",
      "dist/runtime.d.ts",
      "dist/runtime.js",
      "dist/runtime.css",
      "dist/typography.d.ts",
      "dist/typography.js",
      "dist/typography.css",
      "package.json",
    ],
  },
  {
    dir: "packages/web-components",
    name: "@digitaltableteur/web-components",
    maxEntryCount: 168,
    maxTarballSize: 250_000,
    maxUnpackedSize: 1_450_000,
    requiredFiles: [
      "README.md",
      "custom-elements.json",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/native.d.ts",
      "dist/native.js",
      "dist/react.d.ts",
      "dist/react.js",
      "dist/register.js",
      "package.json",
    ],
  },
];

const ROOT_FILE_ALLOWLIST = new Set([
  "LICENSE",
  "README.md",
  "custom-elements.json",
  "package.json",
]);
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
  const trimmed = stdout.trim();
  const candidates = [
    trimmed,
    stdout.slice(stdout.indexOf("["), stdout.lastIndexOf("]") + 1),
    stdout.slice(stdout.indexOf("{"), stdout.lastIndexOf("}") + 1),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const rows = Array.isArray(parsed)
        ? parsed
        : parsed?.[packageName]
          ? [parsed[packageName]]
          : [parsed];
      if (rows.length !== 1) {
        throw new Error(`npm pack for ${packageName} returned ${rows.length} package rows.`);
      }
      return rows[0];
    } catch {
      // Try the next candidate. npm may wrap JSON in notice output.
    }
  }

  throw new Error(`npm pack for ${packageName} did not return parseable JSON.`);
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
