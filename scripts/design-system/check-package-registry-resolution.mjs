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
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/package-registry-resolution");
const OUT_JSON = join(OUT_DIR, "latest.json");
const REACT_PUBLIC_API_MANIFEST = join(ROOT, "packages/react/public-api.manifest.json");

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

const APP_LOCAL_IMPORT_ROOTS = ["app", "providers", "lib", "components", "i18n"];
const ALLOWED_APP_LOCAL_IMPORTS = new Map([
  [
    "@dt/EmailSignatureGenerator",
    "product tool surface; intentionally outside @digitaltableteur/react",
  ],
  ["@dt/NextLayout", "site shell surface; intentionally outside @digitaltableteur/react"],
  ["@dt/SiteTree", "site structure type; intentionally outside @digitaltableteur/react"],
  ["@dt/SocialShare", "blog/social sharing surface; intentionally outside @digitaltableteur/react"],
  [
    "@dt/ToastStack",
    "alpha component, not yet a package export; migrate this import to @digitaltableteur/react when ToastStack reaches the published surface",
  ],
]);

// Local shared-source imports of package-exported symbols. Each entry must
// explain why the LOCAL module instance is required instead of the registry
// package (the #1019 context split came from exactly this pattern going
// unclassified). Keyed `file :: importPath`, both exact.
const ALLOWED_LOCAL_SHARED_IMPORTS = new Map([
  [
    "providers/NextLinkProvider.tsx :: @/nextjs-app/shared/lib/linkComponent",
    "dual-provides the LOCAL LinkProvider instance alongside the package one (#1019)",
  ],
  [
    "providers/NextImageProvider.tsx :: @/nextjs-app/shared/lib/imageComponent",
    "dual-provides the LOCAL ImageProvider instance alongside the package one (#1019)",
  ],
  [
    "providers/NextNavigationProvider.tsx :: @/nextjs-app/shared/lib/navigation",
    "dual-provides the LOCAL NavigationProvider instance alongside the package one (#1019)",
  ],
  [
    "providers/AnimationProvider.tsx :: @/nextjs-app/shared/lib/animation",
    "dual-provides the LOCAL AnimationRuntimeProvider instance alongside the package one (#1019)",
  ],
  [
    "app/layout.tsx :: @/nextjs-app/shared/lib/cookieConsent",
    "local shell (NextLayout -> CookieConsent) provides and consumes the LOCAL consent context end-to-end; the package instance is unused",
  ],
  [
    "providers/ToastProvider.tsx :: ../nextjs-app/shared/lib/toast",
    "toast runtime is LOCAL end-to-end (ToastStack + LanguageNotice read this instance); dual-provide if a package component ever calls useToast",
  ],
  [
    "providers/ToastProvider.tsx :: ../nextjs-app/shared/components/Toast/Toast",
    "ToastTone/ToastPosition: local source leads the published barrel until 0.1.8 ships the #1124 neutral tone (LanguageNotice passes tone:'neutral'); flip to @digitaltableteur/react after the 0.1.8 consume",
  ],
  [
    "providers/ToastProvider.tsx :: ../nextjs-app/shared/components/ToastStack/ToastStack",
    "ToastStack + ToastStackItem: presentational stack rides the same local source until the 0.1.8 consume ships it to the registry barrel; flip to @digitaltableteur/react then",
  ],
  [
    "app/components/LanguageNotice/LanguageNotice.tsx :: @/nextjs-app/shared/lib/toast",
    "reads the LOCAL toast instance mounted by providers/ToastProvider",
  ],
  [
    "app/components/LanguageNotice/LanguageNotice.tsx :: @/nextjs-app/shared/lib/translation",
    "translation runtime is globalThis-bridged; kept local to match the toast import in the same file",
  ],
  [
    "providers/ThemeProvider.tsx :: ../nextjs-app/shared/components/ThemeProvider/ThemeProvider",
    "theme runtime is globalThis-bridged; the local wrapper is the canonical mount",
  ],
  [
    "providers/I18nProvider.tsx :: ../nextjs-app/shared/lib/translation",
    "translation runtime is globalThis-bridged; the local provider is the canonical mount",
  ],
  [
    "app/blog/[slug]/ServerArticleHero.tsx :: @/nextjs-app/shared/components/Container",
    "React Server Component; the package dist is 'use client' so the local import keeps this subtree server-rendered",
  ],
  [
    "app/blog/[slug]/ServerRelatedPosts.tsx :: @/nextjs-app/shared/components/Container",
    "React Server Component; the package dist is 'use client' so the local import keeps this subtree server-rendered",
  ],
]);

function installedReactExports() {
  const distPath = join(
    ROOT,
    "node_modules/@digitaltableteur/react/dist/index.js",
  );
  const source = readFileSync(distPath, "utf8");
  const blocks = [...source.matchAll(/export\s*\{([^}]*)\}/g)];
  if (blocks.length === 0) {
    throw new Error(
      `no export block found in ${relativePath(distPath)}; cannot derive the installed export surface`,
    );
  }
  const names = new Set();
  for (const block of blocks) {
    for (const entry of block[1].split(",")) {
      const parts = entry.trim().split(/\s+as\s+/);
      const publicName = (parts[1] ?? parts[0]).trim();
      if (/^[A-Za-z_$][\w$]*$/.test(publicName)) names.add(publicName);
    }
  }
  return names;
}

function namedSpecifiers(clause) {
  if (!clause) return [];
  const braced = clause.match(/\{([^}]*)\}/);
  if (!braced) return [];
  return braced[1]
    .split(",")
    .map((entry) => entry.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim())
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
}

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

function sourceFiles(root) {
  const absoluteRoot = join(ROOT, root);
  if (!existsSync(absoluteRoot)) return [];
  const entries = [];
  const visit = (path) => {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        visit(join(path, entry));
      }
      return;
    }
    if (
      /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path) &&
      !/\.(?:test|spec|stories)\.|__tests__|__mocks__/.test(path)
    ) {
      // Test/story files mount whichever module instance the code under test
      // reads; they are not part of the app runtime bundle.
      entries.push(path);
    }
  };
  visit(absoluteRoot);
  return entries.sort((a, b) => a.localeCompare(b));
}

// Matches every module-specifier form that can pull local shared source into
// the app bundle: static import/export-from (incl. `import type`), dynamic
// import(), and bare side-effect import. The original guard only matched
// `from "..."` and missed dynamic import() (the ChatWidget/next-dynamic class)
// and `export ... from` re-export shims.
const MODULE_SPECIFIER_RE =
  /(?:import|export)\s+(?:type\s+)?([\w*$][\w*$]*|[\w*{},\s$]+?)\s+from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']/g;

function findAppLocalImports(publicExports) {
  const imports = [];
  for (const root of APP_LOCAL_IMPORT_ROOTS) {
    for (const file of sourceFiles(root)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(MODULE_SPECIFIER_RE)) {
        const clause = match[1] ?? null;
        const importPath = match[2] ?? match[3] ?? match[4];
        const form = match[2] ? "static" : match[3] ? "dynamic" : "bare";
        if (importPath.startsWith("@dt/")) {
          const exportName = importPath.slice("@dt/".length).split("/")[0];
          imports.push({
            kind: "dt-alias",
            form,
            file: relativePath(file),
            importPath,
            exportName,
            publicExport: publicExports.has(exportName),
            allowedReason: ALLOWED_APP_LOCAL_IMPORTS.get(importPath) ?? null,
          });
          continue;
        }
        if (importPath.includes("nextjs-app/shared/")) {
          // Package-exported symbols reached through local shared source
          // create a second module instance (the #1019 context split).
          const specifiers = namedSpecifiers(clause);
          const pathTail = importPath.split("/").filter(Boolean);
          const componentCandidate =
            importPath.includes("/shared/components/") ||
            importPath.includes("/shared/patterns/")
              ? pathTail[pathTail.indexOf("shared") + 2]
              : null;
          const packageHits = new Set(
            specifiers.filter((name) => publicExports.has(name)),
          );
          if (
            specifiers.length === 0 &&
            componentCandidate &&
            publicExports.has(componentCandidate)
          ) {
            // default / dynamic / bare import of an exported component dir
            packageHits.add(componentCandidate);
          }
          if (packageHits.size === 0) continue;
          const allowKey = `${relativePath(file)} :: ${importPath}`;
          imports.push({
            kind: "local-shared",
            form,
            file: relativePath(file),
            importPath,
            exportName: [...packageHits].join(", "),
            publicExport: true,
            allowedReason: ALLOWED_LOCAL_SHARED_IMPORTS.get(allowKey) ?? null,
          });
        }
      }
    }
  }
  return imports;
}

const packageJson = readJson(join(ROOT, "package.json"));
const packageLock = readJson(join(ROOT, "package-lock.json"));
const reactPublicApi = readJson(REACT_PUBLIC_API_MANIFEST);
const manifestExports = new Set(reactPublicApi.runtimeExports ?? []);
// Validate app imports against what the INSTALLED package actually exports,
// not the source-HEAD manifest: a symbol added to shared source but not yet
// published must keep resolving locally until it ships.
const reactPublicExports = installedReactExports();
const manifestOnlyExports = [...manifestExports].filter(
  (name) => !reactPublicExports.has(name),
);
const installedOnlyExports = [...reactPublicExports].filter(
  (name) => !manifestExports.has(name),
);
const workspaces = packageJson.workspaces ?? [];
const errors = [];
const rows = [];

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

const appLocalImports = findAppLocalImports(reactPublicExports);
for (const row of appLocalImports) {
  if (row.kind === "dt-alias") {
    if (row.publicExport) {
      errors.push(
        `${row.file} imports ${row.importPath} locally (${row.form}), but ${row.exportName} is exported from the installed @digitaltableteur/react; use the registry package instead.`,
      );
    }
    if (!row.allowedReason) {
      errors.push(
        `${row.file} imports ${row.importPath} (${row.form}); app @dt imports must be explicitly classified as non-package app/product/site surfaces.`,
      );
    }
    continue;
  }
  if (!row.allowedReason) {
    errors.push(
      `${row.file} imports ${row.exportName} from ${row.importPath} (${row.form}); these symbols are exported from the installed @digitaltableteur/react — import from the registry package, or classify the local-instance requirement in ALLOWED_LOCAL_SHARED_IMPORTS.`,
    );
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  rows,
  appLocalImports,
  exportDrift: {
    manifestOnly: manifestOnlyExports,
    installedOnly: installedOnlyExports,
  },
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
if (appLocalImports.length) {
  console.log(
    `  App-local imports of package territory classified (${appLocalImports.length})`,
  );
}
if (manifestOnlyExports.length) {
  console.log(
    `  ⓘ ${manifestOnlyExports.length} manifest export(s) not yet in the installed package (pending publish): ${manifestOnlyExports.join(", ")}`,
  );
}
if (installedOnlyExports.length) {
  console.log(
    `  ⓘ ${installedOnlyExports.length} installed export(s) missing from the source manifest: ${installedOnlyExports.join(", ")}`,
  );
}
console.log(`  Report: ${relativePath(OUT_JSON)}`);
