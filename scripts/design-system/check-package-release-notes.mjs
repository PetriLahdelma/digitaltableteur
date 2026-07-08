#!/usr/bin/env node
/**
 * Verify npm package release metadata before registry publication.
 *
 * This is intentionally local-only: it does not publish or mutate package
 * metadata. It checks that every design-system npm package has restricted
 * publish settings, semver, packed dist output, and a changelog entry for the
 * package version.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-release-notes");
const REPORT = process.argv.includes("--report");
const PACKAGES = [
  {
    dir: "packages/tokens",
    requiredExports: [".", "./dtcg", "./tailwind", "./manifest"],
  },
  {
    dir: "packages/tokens-css",
    requiredExports: [".", "./tokens.css", "./themes/*.css", "./themes/*"],
  },
  {
    dir: "packages/react",
    requiredExports: [".", "./style.css"],
  },
];

const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const EXPECTED_REPOSITORY_URL =
  "git+https://github.com/PetriLahdelma/digitaltableteur.git";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function hasChangelogEntry(changelog, version) {
  return new RegExp(`^##\\s+${version.replaceAll(".", "\\.")}(?:\\s|$)`, "m").test(
    changelog,
  );
}

function relativePath(path) {
  return relative(ROOT, path);
}

const errors = [];
const rows = [];

for (const definition of PACKAGES) {
  const packageDir = join(ROOT, definition.dir);
  const packageJsonPath = join(packageDir, "package.json");
  const changelogPath = join(packageDir, "CHANGELOG.md");

  if (!existsSync(packageJsonPath)) {
    errors.push(`${definition.dir} is missing package.json`);
    continue;
  }

  const pkg = readJson(packageJsonPath);
  const row = {
    name: pkg.name,
    version: pkg.version,
    dir: definition.dir,
    packageJson: relativePath(packageJsonPath),
    changelog: relativePath(changelogPath),
    packageExports: Object.keys(pkg.exports ?? {}).sort(),
    repository: pkg.repository ?? null,
  };
  rows.push(row);

  if (!pkg.name?.startsWith("@digitaltableteur/")) {
    errors.push(`${definition.dir} package name must stay under @digitaltableteur/*.`);
  }
  if (!SEMVER_RE.test(pkg.version ?? "")) {
    errors.push(`${pkg.name ?? definition.dir} version is not valid semver: ${pkg.version}`);
  }
  if (pkg.private !== false) {
    errors.push(`${pkg.name} must keep private:false so npm pack/publish shape is real.`);
  }
  if (pkg.license !== "UNLICENSED") {
    errors.push(`${pkg.name} must keep license UNLICENSED while packages are private/restricted.`);
  }
  if (pkg.publishConfig?.access !== "restricted") {
    errors.push(`${pkg.name} must publish with restricted access.`);
  }
  if (pkg.publishConfig?.registry !== "https://registry.npmjs.org/") {
    errors.push(`${pkg.name} must publish to https://registry.npmjs.org/.`);
  }
  if (pkg.repository?.type !== "git") {
    errors.push(`${pkg.name} repository.type must be git for npm Trusted Publisher matching.`);
  }
  if (pkg.repository?.url !== EXPECTED_REPOSITORY_URL) {
    errors.push(
      `${pkg.name} repository.url must be ${EXPECTED_REPOSITORY_URL} for npm Trusted Publisher matching.`,
    );
  }
  if (pkg.repository?.directory !== definition.dir) {
    errors.push(`${pkg.name} repository.directory must be ${definition.dir}.`);
  }
  if (!Array.isArray(pkg.files) || !pkg.files.includes("dist")) {
    errors.push(`${pkg.name} must pack dist through package.json files.`);
  }
  for (const exportKey of definition.requiredExports) {
    if (!pkg.exports?.[exportKey]) {
      errors.push(`${pkg.name} is missing required package export ${exportKey}.`);
    }
  }

  if (!existsSync(changelogPath)) {
    errors.push(`${pkg.name} is missing CHANGELOG.md.`);
    continue;
  }

  const changelog = readFileSync(changelogPath, "utf8");
  if (!changelog.startsWith("# Changelog")) {
    errors.push(`${pkg.name} changelog must start with "# Changelog".`);
  }
  if (!hasChangelogEntry(changelog, pkg.version)) {
    errors.push(`${pkg.name} changelog is missing an entry for version ${pkg.version}.`);
  }
  if (!/check:|Verified by/.test(changelog)) {
    errors.push(`${pkg.name} changelog must name the verification gate(s) for the release.`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  packages: rows,
  errors,
};
writeFileSync(join(OUT_DIR, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);

if (REPORT) {
  console.log(JSON.stringify(report, null, 2));
}

if (errors.length) {
  console.error("Package release metadata guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(join(OUT_DIR, "latest.json"))}`);
  process.exit(1);
}

console.log(
  `✓ package release metadata verified (${rows.length} packages: ${rows
    .map((row) => `${row.name}@${row.version}`)
    .join(", ")})`,
);
console.log(`  Report: ${relativePath(join(OUT_DIR, "latest.json"))}`);
