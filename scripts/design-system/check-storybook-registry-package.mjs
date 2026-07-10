#!/usr/bin/env node
/**
 * Guard Storybook's registry package path.
 *
 * Storybook documents local catalog source stories, but it must also be able
 * to compile the installed private npm packages. This catches accidental Vite
 * aliases that redirect @digitaltableteur/* back into packages/*, and it keeps
 * a package smoke story in the Storybook graph.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/storybook-registry-package");
const OUT_JSON = join(OUT_DIR, "latest.json");
const STORY_PATH = join(
  ROOT,
  "nextjs-app/shared/stories/RegistryPackageSmoke.stories.tsx",
);
const STORYBOOK_FILES = [
  ".storybook/main.ts",
  ".storybook/preview.tsx",
  "nextjs-app/shared/stories/RegistryPackageSmoke.stories.tsx",
];
const PACKAGE_CHECKS = [
  {
    name: "@digitaltableteur/react",
    importPath: "@digitaltableteur/react",
    packageDir: "packages/react",
    installedDir: "node_modules/@digitaltableteur/react",
  },
  {
    name: "@digitaltableteur/react/style.css",
    importPath: "@digitaltableteur/react/style.css",
    packageDir: "packages/react",
    installedDir: "node_modules/@digitaltableteur/react",
  },
  {
    name: "@digitaltableteur/tokens",
    importPath: "@digitaltableteur/tokens",
    packageDir: "packages/tokens",
    installedDir: "node_modules/@digitaltableteur/tokens",
  },
  {
    name: "@digitaltableteur/tokens-css/tokens.css",
    importPath: "@digitaltableteur/tokens-css/tokens.css",
    packageDir: "packages/tokens-css",
    installedDir: "node_modules/@digitaltableteur/tokens-css",
  },
];

function relativePath(path) {
  return relative(ROOT, path) || ".";
}

function normalize(path) {
  return resolve(path).split(sep).join("/");
}

function isWithin(child, parent) {
  const normalizedChild = normalize(child);
  const normalizedParent = normalize(parent);
  return (
    normalizedChild === normalizedParent ||
    normalizedChild.startsWith(`${normalizedParent}/`)
  );
}

function readProjectFile(path) {
  return readFileSync(join(ROOT, path), "utf8");
}

function findForbiddenAliases(source, path) {
  return source
    .split(/\r?\n/)
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /@digitaltableteur\//.test(line) && /packages\//.test(line))
    .map(({ line, number }) => ({
      file: path,
      line: number,
      text: line.trim(),
    }));
}

const errors = [];
const rows = [];

if (!existsSync(STORY_PATH)) {
  errors.push(`Missing Storybook registry smoke story: ${relativePath(STORY_PATH)}`);
}

for (const check of PACKAGE_CHECKS) {
  const sourceDir = join(ROOT, check.packageDir);
  const installedDir = join(ROOT, check.installedDir);
  let resolved = null;
  let error = null;

  try {
    resolved = fileURLToPath(await import.meta.resolve(check.importPath));
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  if (!resolved) {
    errors.push(`${check.importPath} did not resolve: ${error}`);
  } else if (isWithin(resolved, sourceDir)) {
    errors.push(`${check.importPath} resolves inside ${check.packageDir}; expected registry node_modules.`);
  } else if (!isWithin(resolved, installedDir)) {
    errors.push(`${check.importPath} resolves outside ${check.installedDir}: ${relativePath(resolved)}`);
  }

  rows.push({
    name: check.name,
    importPath: check.importPath,
    resolved: resolved ? relativePath(resolved) : null,
    sourceDir: check.packageDir,
    installedDir: check.installedDir,
    error,
  });
}

const storySource = existsSync(STORY_PATH) ? readFileSync(STORY_PATH, "utf8") : "";
for (const requiredImport of [
  "@digitaltableteur/react",
  "@digitaltableteur/react/style.css",
  "@digitaltableteur/tokens-css/tokens.css",
]) {
  if (!storySource.includes(requiredImport)) {
    errors.push(`Registry smoke story must import ${requiredImport}.`);
  }
}

const forbiddenAliases = [];
for (const file of STORYBOOK_FILES) {
  if (!existsSync(join(ROOT, file))) continue;
  forbiddenAliases.push(...findForbiddenAliases(readProjectFile(file), file));
}
if (forbiddenAliases.length) {
  errors.push(
    `Storybook must not alias @digitaltableteur/* to local packages/*: ${forbiddenAliases
      .map((alias) => `${alias.file}:${alias.line}`)
      .join(", ")}`,
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  storyPath: relativePath(STORY_PATH),
  rows,
  forbiddenAliases,
  errors,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Storybook registry package guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

console.log(
  `✓ Storybook registry package path verified (${rows
    .map((row) => row.importPath)
    .join(", ")})`,
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
