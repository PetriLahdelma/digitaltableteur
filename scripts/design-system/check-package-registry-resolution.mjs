#!/usr/bin/env node
/**
 * Verify the app/root install resolves design-system runtime packages from the
 * npm registry, not local package source directories.
 *
 * Local package sources remain in packages/* for build and publish checks. They
 * must not be npm workspaces in the app install, otherwise React contexts and
 * token exports can silently resolve through symlinks instead of the same
 * registry artifacts consumers receive.
 */
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-registry-resolution");
const OUT_JSON = join(OUT_DIR, "latest.json");

const PACKAGE_CHECKS = [
  {
    name: "@digitaltableteur/react",
    importPath: "@digitaltableteur/react",
    packageDir: "packages/react",
  },
  {
    name: "@digitaltableteur/tokens",
    importPath: "@digitaltableteur/tokens",
    packageDir: "packages/tokens",
  },
  {
    name: "@digitaltableteur/tokens-css",
    importPath: "@digitaltableteur/tokens-css/tokens.css",
    packageDir: "packages/tokens-css",
  },
];
const RUNTIME_SCAN_ROOTS = ["app", "providers", "nextjs-app", ".storybook"];
const RUNTIME_SCAN_EXTENSIONS = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".cts",
  ".ts",
  ".tsx",
]);
const FORBIDDEN_LOCAL_PACKAGE_IMPORT = /from\s+["'][^"']*packages\/(?:react|tokens|tokens-css)(?:\/package\.json)?["']|import\s*\(\s*["'][^"']*packages\/(?:react|tokens|tokens-css)(?:\/package\.json)?["']\s*\)|require\s*\(\s*["'][^"']*packages\/(?:react|tokens|tokens-css)(?:\/package\.json)?["']\s*\)/;
const CONTEXT_SCAN_ROOTS = ["app", "providers"];
const FORBIDDEN_LOCAL_CONTEXT_IMPORT =
  /from\s+["'](?:@dt\/(?:ThemeProvider|Toast(?:\/Toast)?|CookieConsent(?:\/[^"']*)?|NavigationProvider|NavLink|NavMenuList|LinkProvider|ImageProvider|LayerProvider|useFocusTrap|useMediaQuery|useOverflow|useScrollLock)|@\/nextjs-app\/shared\/(?:lib\/(?:toast|cookieConsent|navigation|linkComponent|imageComponent|layer)(?:\/[^"']*)?|hooks\/(?:useFocusTrap|useMediaQuery|useOverflow|useScrollLock)|components\/(?:ThemeProvider|Toast|CookieConsent|NavLink|NavMenuList)(?:\/[^"']*)?))["']/;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

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

function nodeModulesPath(packageName) {
  const [scope, name] = packageName.split("/");
  return join(ROOT, "node_modules", scope, name);
}

function* sourceFiles(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "storybook-static") {
        continue;
      }
      yield* sourceFiles(path);
      continue;
    }
    if (entry.isFile() && RUNTIME_SCAN_EXTENSIONS.has(extname(path))) {
      yield path;
    }
  }
}

const packageJson = readJson(join(ROOT, "package.json"));
const packageLock = readJson(join(ROOT, "package-lock.json"));
const workspaces = packageJson.workspaces ?? [];
const errors = [];
const rows = [];
const forbiddenRuntimeImports = [];
const forbiddenLocalContextImports = [];

if (Array.isArray(workspaces) && workspaces.length > 0) {
  errors.push(
    `root package.json must not declare npm workspaces for app registry dogfood; found ${JSON.stringify(workspaces)}`,
  );
} else if (workspaces && !Array.isArray(workspaces)) {
  errors.push("root package.json workspaces must be absent, not an object.");
}

for (const check of PACKAGE_CHECKS) {
  const dependencyRange = packageJson.dependencies?.[check.name] ?? null;
  const sourceDir = join(ROOT, check.packageDir);
  const lockNodeModules = packageLock.packages?.[`node_modules/${check.name}`] ?? null;
  const lockSource = packageLock.packages?.[check.packageDir] ?? null;
  const installedDir = nodeModulesPath(check.name);
  let resolved = null;
  let installedIsSymlink = null;
  let resolveError = null;

  try {
    resolved = fileURLToPath(await import.meta.resolve(check.importPath));
  } catch (error) {
    resolveError = error instanceof Error ? error.message : String(error);
  }

  if (!dependencyRange) {
    errors.push(`${check.name} must be a root dependency so the app consumes the registry package.`);
  }
  if (!lockNodeModules) {
    errors.push(`package-lock.json is missing node_modules/${check.name}. Run npm install after changing package.json.`);
  } else {
    if (lockNodeModules.link) {
      errors.push(`package-lock.json links node_modules/${check.name}; expected registry package entry.`);
    }
    if (
      typeof lockNodeModules.resolved !== "string" ||
      !lockNodeModules.resolved.startsWith(`https://registry.npmjs.org/${check.name}/-/`)
    ) {
      errors.push(
        `package-lock.json node_modules/${check.name} must resolve from the npm registry, got ${lockNodeModules.resolved ?? "missing"}.`,
      );
    }
  }
  if (lockSource) {
    errors.push(`package-lock.json still contains ${check.packageDir} as a workspace package.`);
  }
  if (existsSync(installedDir)) {
    installedIsSymlink = lstatSync(installedDir).isSymbolicLink();
    if (installedIsSymlink) {
      errors.push(`${relativePath(installedDir)} is a symlink; expected installed registry package.`);
    }
  }
  if (!resolved) {
    errors.push(`${check.importPath} did not resolve from the root install: ${resolveError}`);
  } else if (isWithin(resolved, sourceDir)) {
    errors.push(`${check.importPath} resolves inside ${check.packageDir}; expected node_modules registry package.`);
  } else if (!isWithin(resolved, installedDir)) {
    errors.push(`${check.importPath} resolves outside ${relativePath(installedDir)}: ${relativePath(resolved)}`);
  }

  rows.push({
    name: check.name,
    importPath: check.importPath,
    dependencyRange,
    resolved: resolved ? relativePath(resolved) : null,
    sourceDir: check.packageDir,
    installedDir: relativePath(installedDir),
    installedIsSymlink,
    lockVersion: lockNodeModules?.version ?? null,
    lockResolved: lockNodeModules?.resolved ?? null,
    lockHasSourceWorkspaceEntry: Boolean(lockSource),
  });
}

for (const root of RUNTIME_SCAN_ROOTS) {
  const rootDir = join(ROOT, root);
  if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) continue;
  for (const file of sourceFiles(rootDir)) {
    const source = readFileSync(file, "utf8");
    if (FORBIDDEN_LOCAL_PACKAGE_IMPORT.test(source)) {
      const relativeFile = relativePath(file);
      forbiddenRuntimeImports.push(relativeFile);
      errors.push(
        `${relativeFile} imports local packages/* design-system source; runtime and Storybook code must consume installed @digitaltableteur/* packages from node_modules.`,
      );
    }
  }
}

for (const root of CONTEXT_SCAN_ROOTS) {
  const rootDir = join(ROOT, root);
  if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) continue;
  for (const file of sourceFiles(rootDir)) {
    const source = readFileSync(file, "utf8");
    if (FORBIDDEN_LOCAL_CONTEXT_IMPORT.test(source)) {
      const relativeFile = relativePath(file);
      forbiddenLocalContextImports.push(relativeFile);
      errors.push(
        `${relativeFile} imports local design-system provider/hook context; app consumers must import shared providers/hooks from @digitaltableteur/react so registry and local React contexts cannot diverge.`,
      );
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  rows,
  runtimeScanRoots: RUNTIME_SCAN_ROOTS,
  contextScanRoots: CONTEXT_SCAN_ROOTS,
  forbiddenRuntimeImports,
  forbiddenLocalContextImports,
  errors,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error("Package registry resolution guard failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  process.exit(1);
}

console.log(
  `✓ package registry resolution verified (${rows.map((row) => `${row.name}@${row.lockVersion}`).join(", ")})`,
);
console.log(`  Report: ${relativePath(OUT_JSON)}`);
