#!/usr/bin/env node
/**
 * Post-publish registry smoke for @digitaltableteur/react.
 *
 * The pre-publish local substitute is check:npm-consumer-install, which installs
 * packed workspace tarballs. This guard is for the real registry path after
 * @digitaltableteur/react has been published privately: install the exact
 * prepared version from npm into a clean consumer, import CSS/package exports,
 * SSR-render a small stable surface, and compile a strict TypeScript consumer.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY = "https://registry.npmjs.org/";
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-registry-install");
const OUT_JSON = join(OUT_DIR, "latest.json");
const KEEP = process.env.DT_KEEP_REACT_REGISTRY_SMOKE === "1";
const EXPECT_UNPUBLISHED = process.argv.includes("--expect-unpublished");

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? ROOT,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(ROOT, path);
}

function writeReport(report) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
}

function npmArgs(args) {
  return ["--registry", REGISTRY, ...args];
}

function readCommandJson(command, args) {
  const output = run(command, args, { capture: true }).trim();
  return output ? JSON.parse(output) : {};
}

function runNpmResult(args) {
  try {
    const stdout = run("npm", npmArgs(args), { capture: true }).trim();
    return {
      ok: true,
      stdout,
      json: stdout ? JSON.parse(stdout) : null,
      status: 0,
      notFound: false,
    };
  } catch (error) {
    const stdout = typeof error.stdout === "string" ? error.stdout : String(error.stdout ?? "");
    const stderr = typeof error.stderr === "string" ? error.stderr : String(error.stderr ?? "");
    const text = `${stdout}\n${stderr}`;
    return {
      ok: false,
      stdout,
      stderr,
      json: parseMaybeJson(stdout),
      status: typeof error.status === "number" ? error.status : null,
      notFound: /\bE404\b|Not Found|not in this registry/i.test(text),
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseMaybeJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function accessValue(accessReport, packageName) {
  const value = accessReport?.[packageName];
  return typeof value === "string" ? value : null;
}

/**
 * npm `access` APIs need org-level permission that a least-privilege
 * install token (read-only, package-scoped) intentionally lacks and 403s
 * on. Readability is proven by `npm view` + the scratch install, so the
 * access metadata is best-effort: null when the token cannot list it.
 */
function readCommandJsonOptional(command, args) {
  try {
    return readCommandJson(command, args);
  } catch {
    return null;
  }
}

const rootPackage = readJson(join(ROOT, "package.json"));
const roadmapState = readJson(join(ROOT, "scripts/design-system/astryx-roadmap.state.json"));
const reactPackage = readJson(join(ROOT, "packages/react/package.json"));
const tokensVersion = readJson(join(ROOT, "packages/tokens/package.json")).version;
const tokensCssVersion = readJson(join(ROOT, "packages/tokens-css/package.json")).version;
const reactVersion = reactPackage.version;
const reactDependencyVersion =
  rootPackage.dependencies?.react ?? rootPackage.devDependencies?.react;
const reactDomDependencyVersion =
  rootPackage.dependencies?.["react-dom"] ?? rootPackage.devDependencies?.["react-dom"];
const typescriptVersion =
  rootPackage.dependencies?.typescript ?? rootPackage.devDependencies?.typescript;
const reactTypesVersion =
  rootPackage.dependencies?.["@types/react"] ?? rootPackage.devDependencies?.["@types/react"];
const reactDomTypesVersion =
  rootPackage.dependencies?.["@types/react-dom"] ?? rootPackage.devDependencies?.["@types/react-dom"];
// framer-motion is a package peerDependency; the repo installs with
// legacy-peer-deps so the scratch consumer must install it explicitly.
const framerMotionVersion =
  rootPackage.dependencies?.["framer-motion"] ?? rootPackage.devDependencies?.["framer-motion"];
const forbiddenReactExports = roadmapState.reactPublicSurface?.forbiddenExports ?? [];

if (
  !reactDependencyVersion ||
  !reactDomDependencyVersion ||
  !typescriptVersion ||
  !reactTypesVersion ||
  !reactDomTypesVersion ||
  !framerMotionVersion
) {
  throw new Error(
    "Root package.json must declare react, react-dom, framer-motion, typescript, @types/react, and @types/react-dom for the registry smoke.",
  );
}

const userconfig = run("npm", ["config", "get", "userconfig"], { capture: true }).trim();
const userconfigArgs =
  userconfig && userconfig !== "undefined" ? ["--userconfig", userconfig] : [];
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function readReactView() {
  return runNpmResult([
    ...userconfigArgs,
    "view",
    `@digitaltableteur/react@${reactVersion}`,
    "version",
    "--json",
  ]);
}

function readReactViewWithRetry() {
  let result = readReactView();
  if (EXPECT_UNPUBLISHED || result.ok) return result;
  const attempts = 12;
  for (let attempt = 2; attempt <= attempts; attempt += 1) {
    sleep(5000);
    result = readReactView();
    if (result.ok) return result;
    console.log(
      `waiting for @digitaltableteur/react@${reactVersion} to appear in npm (${attempt}/${attempts})`,
    );
  }
  return result;
}

const reactView = readReactViewWithRetry();
const accessPackages = readCommandJsonOptional(
  "npm",
  npmArgs([...userconfigArgs, "access", "list", "packages", "digitaltableteur", "--json"]),
);
const report = {
  generatedAt: new Date().toISOString(),
  status: "running",
  registry: REGISTRY,
  expectedReactState: EXPECT_UNPUBLISHED ? "unpublished" : "published",
  packages: [
    {
      name: "@digitaltableteur/tokens",
      expectedVersion: tokensVersion,
      orgAccess: accessValue(accessPackages, "@digitaltableteur/tokens"),
    },
    {
      name: "@digitaltableteur/tokens-css",
      expectedVersion: tokensCssVersion,
      orgAccess: accessValue(accessPackages, "@digitaltableteur/tokens-css"),
    },
    {
      name: "@digitaltableteur/react",
      expectedVersion: reactVersion,
      registryVersion: reactView.ok ? reactView.json : null,
      actualState: reactView.ok ? "published" : reactView.notFound ? "unpublished" : "unknown",
      orgAccess: accessValue(accessPackages, "@digitaltableteur/react"),
      npmViewStatus: reactView.status,
    },
  ],
  consumer: null,
  scratchKept: KEEP,
  errors: [],
};

if (EXPECT_UNPUBLISHED) {
  report.status = reactView.notFound ? "expected-unpublished" : "failed";
  if (!reactView.notFound) {
    report.errors.push(
      `@digitaltableteur/react@${reactVersion} is ${report.packages[2].actualState}; expected unpublished.`,
    );
  }
  writeReport(report);
  if (report.errors.length) {
    console.error("React registry install pre-publish check failed:");
    for (const error of report.errors) console.error(`  - ${error}`);
    console.error(`Report: ${relativePath(OUT_JSON)}`);
    process.exit(1);
  }
  console.log(
    `✓ react registry install is correctly waiting for publish (@digitaltableteur/react@${reactVersion} unpublished)`,
  );
  console.log(`  Report: ${relativePath(OUT_JSON)}`);
  process.exit(0);
}

const scratch = mkdtempSync(join(tmpdir(), "dt-react-registry-smoke-"));

try {
  if (!reactView.ok || reactView.json !== reactVersion) {
    throw new Error(
      `Registry @digitaltableteur/react version mismatch: expected ${reactVersion}, got ${reactView.ok ? reactView.json : "unpublished"}`,
    );
  }
  if (
    report.packages[2].orgAccess !== null &&
    report.packages[2].orgAccess !== "read-only" &&
    report.packages[2].orgAccess !== "read-write"
  ) {
    throw new Error(
      `Registry @digitaltableteur/react org access mismatch: expected read-only or read-write, got ${report.packages[2].orgAccess}`,
    );
  }

  writeFileSync(
    join(scratch, "package.json"),
    JSON.stringify(
      {
        name: "digitaltableteur-react-registry-smoke",
        private: true,
        type: "module",
        scripts: {
          smoke: "node smoke.mjs",
          typecheck: "tsc --noEmit -p tsconfig.json",
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(scratch, "smoke.mjs"),
    `
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tokenCount } from "@digitaltableteur/tokens";
import * as DS from "@digitaltableteur/react";

const require = createRequire(import.meta.url);
const reactCss = require.resolve("@digitaltableteur/react/style.css");
const tokenCss = require.resolve("@digitaltableteur/tokens-css/tokens.css");

for (const key of [
  "AlertBanner",
  "Breadcrumb",
  "Button",
  "Card",
  "EmptyState",
  "LayerProvider",
  "LinkProvider",
  "NavigationProvider",
  "Progress",
  "Tabs",
  "TranslationProvider",
  "useFocusTrap",
  "useLayer",
  "useMediaQuery",
  "useOverflow",
  "useScrollLock",
  "useScrollOverflow",
]) {
  if (!DS[key]) throw new Error("Missing @digitaltableteur/react export: " + key);
}
for (const key of ${JSON.stringify(forbiddenReactExports)}) {
  if (DS[key]) throw new Error("Forbidden app/product export leaked from @digitaltableteur/react: " + key);
}

const markup = renderToStaticMarkup(
  React.createElement(
    DS.TranslationProvider,
    {
      translate: (key, fallbackOrOptions) =>
        typeof fallbackOrOptions === "string"
          ? fallbackOrOptions
          : fallbackOrOptions?.defaultValue ?? key,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: () => undefined,
      getResourceBundle: () => ({}),
    },
    React.createElement(
      DS.LinkProvider,
      {
        component: ({ href, children, ...rest }) =>
          React.createElement("a", { href, ...rest }, children),
      },
      React.createElement(DS.Breadcrumb, {
        items: [
          { label: "Home", href: "/" },
          { label: "Registry smoke" },
        ],
      }),
      React.createElement(DS.AlertBanner, {
        tone: "error",
        title: "Registry alert",
        description: "The registry package rendered AlertBanner.",
      }),
      React.createElement(DS.EmptyState, {
        title: "No registry items",
        headingLevel: "h3",
      }),
      React.createElement(DS.Tabs, {
        tabs: [
          { key: "install", label: "Install" },
          { key: "verify", label: "Verify" },
        ],
        activeTab: "install",
        ariaLabel: "Registry tabs",
      }),
      React.createElement(DS.Progress, {
        indeterminate: true,
        label: "Registry progress",
        size: "sm",
        state: "info",
      }),
      React.createElement(DS.Button, { variant: "primary" }, "Registry smoke"),
    ),
  ),
);

if (
  !markup.includes("Registry smoke") ||
  !markup.includes("Registry alert") ||
  !markup.includes("No registry items") ||
  !markup.includes("Registry progress")
) {
  throw new Error("React registry package SSR smoke did not render the expected stable surface");
}

console.log(JSON.stringify({
  tokenCount,
  reactCss: reactCss.includes("node_modules"),
  tokenCss: tokenCss.includes("node_modules"),
  reactExports: Object.keys(DS).length,
}));
`.trimStart(),
  );
  writeFileSync(
    join(scratch, "smoke.tsx"),
    `
import * as React from "react";
import {
  AlertBanner,
  Breadcrumb,
  Button,
  EmptyState,
  LayerProvider,
  LinkProvider,
  NavigationProvider,
  Progress,
  Tabs,
  TranslationProvider,
  type BreadcrumbItem,
  type LinkComponentProps,
  type NavigationRuntime,
  type TabItem,
  type Translate,
  useLayer,
  useOverflow,
  useScrollOverflow,
} from "@digitaltableteur/react";

const translate: Translate = (key, fallbackOrOptions) => {
  if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
  return String(fallbackOrOptions?.defaultValue ?? key);
};
const LinkAdapter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>{children}</a>
);
const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Registry smoke" },
];
const tabs: TabItem[] = [
  { key: "install", label: "Install" },
  { key: "verify", label: "Verify" },
];
const navigationRuntime: NavigationRuntime = {
  pathname: "/",
  searchParams: new URLSearchParams(),
  push: () => undefined,
  replace: () => undefined,
};

function UtilityProbe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const layer = useLayer({ role: "popover" });
  const overflow = useOverflow(ref);
  const scrollOverflow = useScrollOverflow(ref);

  return (
    <div
      ref={ref}
      data-layer-role={layer.role}
      data-overflow={String(overflow.isOverflowing)}
      data-scroll-end={String(scrollOverflow.canScrollEnd)}
    />
  );
}

const tree: React.ReactElement = (
  <TranslationProvider
    translate={translate}
    language="en"
    resolvedLanguage="en"
    changeLanguage={() => undefined}
    getResourceBundle={() => ({})}
  >
    <LayerProvider>
      <NavigationProvider runtime={navigationRuntime}>
        <LinkProvider component={LinkAdapter}>
          <Breadcrumb items={breadcrumbItems} />
          <AlertBanner tone="error" title="Registry alert" />
          <EmptyState title="No registry items" headingLevel="h3" />
          <Tabs tabs={tabs} activeTab="install" ariaLabel="Registry tabs" />
          <Progress indeterminate label="Registry progress" />
          <UtilityProbe />
          <Button variant="primary">Registry smoke</Button>
        </LinkProvider>
      </NavigationProvider>
    </LayerProvider>
  </TranslationProvider>
);

void tree;
`.trimStart(),
  );
  writeFileSync(
    join(scratch, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ["smoke.tsx"],
      },
      null,
      2,
    ),
  );

  run(
    "npm",
    npmArgs([
      ...userconfigArgs,
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      `react@${reactDependencyVersion}`,
      `react-dom@${reactDomDependencyVersion}`,
      `framer-motion@${framerMotionVersion}`,
      `typescript@${typescriptVersion}`,
      `@types/react@${reactTypesVersion}`,
      `@types/react-dom@${reactDomTypesVersion}`,
      `@digitaltableteur/tokens@${tokensVersion}`,
      `@digitaltableteur/tokens-css@${tokensCssVersion}`,
      `@digitaltableteur/react@${reactVersion}`,
    ]),
    { cwd: scratch },
  );

  const output = run("npm", ["run", "smoke", "--silent"], {
    cwd: scratch,
    capture: true,
  }).trim();
  const smoke = JSON.parse(output);
  run("npm", ["run", "typecheck", "--silent"], { cwd: scratch });

  if (!smoke.reactCss || !smoke.tokenCss) {
    throw new Error("React registry package CSS exports did not resolve from node_modules");
  }

  report.status = "passed";
  report.generatedAt = new Date().toISOString();
  report.consumer = {
    tokenCount: smoke.tokenCount,
    reactExports: smoke.reactExports,
    reactCssResolvedFromNodeModules: Boolean(smoke.reactCss),
    tokenCssResolvedFromNodeModules: Boolean(smoke.tokenCss),
    typecheck: "passed",
  };
  writeReport(report);
  console.log(
    `\u2713 react registry install verified (@digitaltableteur/react@${reactVersion}, ${smoke.reactExports} exports, runtime + types)`,
  );
  console.log(`  Report: ${relativePath(OUT_JSON)}`);
} catch (error) {
  report.status = "failed";
  report.generatedAt = new Date().toISOString();
  report.errors = [error instanceof Error ? error.message : String(error)];
  writeReport(report);
  throw error;
} finally {
  if (!KEEP) {
    rmSync(scratch, { recursive: true, force: true });
  } else {
    console.log(`kept react registry smoke workspace: ${scratch}`);
  }
}
