#!/usr/bin/env node
/**
 * Guard the root app/package boundary for the private npm design-system packages.
 *
 * The app must consume @digitaltableteur/* packages from npm, while local package
 * verification still builds from packages/* explicitly. This catches accidental
 * workspace/symlink regressions and shared React context splits.
 */
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-consumption-boundaries");
const OUT_JSON = join(OUT_DIR, "latest.json");
const PACKAGE_NAMES = [
  "@digitaltableteur/react",
  "@digitaltableteur/tokens",
  "@digitaltableteur/tokens-css",
];
const LOCAL_PACKAGE_WORKSPACES = [
  "packages/react",
  "packages/tokens",
  "packages/tokens-css",
];
const CONTEXT_ROOTS = [
  "app",
  "providers",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/components/pages",
  "nextjs-app/shared/components/NextLayout",
  "nextjs-app/shared/components/TailwindTest",
];
const FORBIDDEN_CONTEXT_IMPORT = /from\s+["'][^"']*(?:nextjs-app\/shared\/lib\/(?:cookieConsent|navigation)|(?:^|\/)\.{1,2}\/.*lib\/(?:cookieConsent|navigation))["']/;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx"]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(ROOT, path).replaceAll("\\", "/");
}

function pathExists(path) {
  return existsSync(path);
}

function packageInstallPath(packageName) {
  const [scope, name] = packageName.split("/");
  return join(ROOT, "node_modules", scope, name);
}

function isUnder(child, parent) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !resolve(rel).startsWith(sep));
}

function walkFiles(rootRel, files = []) {
  const root = join(ROOT, rootRel);
  if (!pathExists(root)) return files;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") continue;
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(relativePath(full), files);
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    if (!SOURCE_EXTENSIONS.has(ext)) continue;
    if (/\.(test|stories)\.[cm]?[tj]sx?$/.test(entry.name)) continue;
    files.push(full);
  }
  return files;
}

function exportedComponentDirs() {
  const index = readFileSync(join(ROOT, "packages/react/src/index.ts"), "utf8");
  const dirs = new Set();
  const re = /["']\.\.\/\.\.\/\.\.\/nextjs-app\/shared\/components\/([^/"']+)/g;
  for (const match of index.matchAll(re)) {
    dirs.add(match[1]);
  }
  return dirs;
}

const packageJson = readJson(join(ROOT, "package.json"));
const packageLock = readJson(join(ROOT, "package-lock.json"));
const npmrc = readFileSync(join(ROOT, ".npmrc"), "utf8");
const npmUserconfig = readFileSync(join(ROOT, ".npm-userconfig"), "utf8");
const localPackageRoots = LOCAL_PACKAGE_WORKSPACES.map((path) => join(ROOT, path));
const exportedDirs = exportedComponentDirs();
const errors = [];
const rows = [];

if (!/^\s*userconfig=.npm-userconfig\s*$/m.test(npmrc)) {
  errors.push(".npmrc must keep userconfig=.npm-userconfig so machine-wide registry auth cannot leak into this repo");
}
if (!/\/\/registry\.npmjs\.org\/:_authToken=\$\{NPM_TOKEN\}/.test(npmUserconfig)) {
  errors.push(".npm-userconfig must keep the ${NPM_TOKEN} registry read-auth placeholder for private package installs");
}

for (const workspace of packageJson.workspaces ?? []) {
  if (LOCAL_PACKAGE_WORKSPACES.includes(workspace)) {
    errors.push(`root package.json still declares ${workspace} as a workspace`);
  }
}

for (const packageName of PACKAGE_NAMES) {
  const installPath = packageInstallPath(packageName);
  const lockRow = packageLock.packages?.[`node_modules/${packageName}`];
  const installed = pathExists(installPath);
  const symlink = installed ? lstatSync(installPath).isSymbolicLink() : false;
  const realPath = installed ? realpathSync(installPath) : null;
  const installedPkg = installed ? readJson(join(installPath, "package.json")) : null;
  const localResolution = Boolean(
    realPath && localPackageRoots.some((localRoot) => isUnder(realPath, localRoot)),
  );

  if (!packageJson.dependencies?.[packageName]) {
    errors.push(`root package.json is missing registry dependency ${packageName}`);
  }
  if (!installed) {
    errors.push(`${packageName} is not installed in node_modules`);
  }
  if (symlink) {
    errors.push(`${packageName} resolves through a symlink instead of the registry package`);
  }
  if (localResolution) {
    errors.push(`${packageName} resolves inside packages/* instead of node_modules registry content`);
  }
  if (!lockRow?.resolved?.startsWith("https://registry.npmjs.org/")) {
    errors.push(`${packageName} package-lock entry is not a registry tarball`);
  }
  if (!lockRow?.integrity) {
    errors.push(`${packageName} package-lock entry is missing integrity`);
  }

  rows.push({
    name: packageName,
    dependency: packageJson.dependencies?.[packageName] ?? null,
    installedVersion: installedPkg?.version ?? null,
    symlink,
    realPath: realPath ? relativePath(realPath) : null,
    lockResolved: lockRow?.resolved ?? null,
    lockIntegrity: Boolean(lockRow?.integrity),
  });
}

const contextViolations = [];
for (const root of CONTEXT_ROOTS) {
  for (const file of walkFiles(root)) {
    const source = readFileSync(file, "utf8");
    if (FORBIDDEN_CONTEXT_IMPORT.test(source)) {
      contextViolations.push(relativePath(file));
    }
  }
}
for (const file of contextViolations) {
  errors.push(`${file} imports a local shared context that must come from @digitaltableteur/react in app-facing code`);
}

const selfImportViolations = [];
for (const dir of exportedDirs) {
  const componentRoot = join(ROOT, "nextjs-app/shared/components", dir);
  for (const file of walkFiles(relativePath(componentRoot))) {
    const source = readFileSync(file, "utf8");
    if (/from\s+["']@digitaltableteur\/react["']/.test(source)) {
      selfImportViolations.push(relativePath(file));
    }
  }
}
for (const file of selfImportViolations) {
  errors.push(`${file} is re-exported by @digitaltableteur/react and must not self-import @digitaltableteur/react`);
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  packages: rows,
  contextViolations,
  selfImportViolations,
  errors,
};
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Package consumption boundary guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

console.log(`✓ package consumption boundaries verified (${PACKAGE_NAMES.length} registry packages)`);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
