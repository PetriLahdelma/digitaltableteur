#!/usr/bin/env node
/**
 * Registry-shape consumer install smoke.
 *
 * Builds/verifies the local package sources, packs their npm tarballs, installs
 * those tarballs into a clean temporary consumer, and imports the public
 * package surface from node_modules. This is the closest local substitute for
 * post-publish registry dogfooding while npm auth is unavailable.
 */
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/npm-consumer-install");
const OUT_JSON = join(OUT_DIR, "latest.json");
const KEEP = process.env.DT_KEEP_NPM_CONSUMER_SMOKE === "1";
const REACT_FAMILY_ENTRIES = {
  actions: "Button",
  consent: "CookieConsent",
  content: "CodeSnippet",
  feedback: "AlertBanner",
  forms: "TextInput",
  hooks: "useStreamingText",
  identity: "Avatar",
  layout: "Grid",
  navigation: "Tabs",
  patterns: "PageLayout",
  runtime: "LayerProvider",
  typography: "Text",
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? ROOT,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: { ...process.env, ...(options.env ?? {}) },
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

const PACKAGE_DIRS = {
  "@digitaltableteur/tokens": "packages/tokens",
  "@digitaltableteur/tokens-css": "packages/tokens-css",
  "@digitaltableteur/react": "packages/react",
};

function packageDir(packageName) {
  const dir = PACKAGE_DIRS[packageName];
  if (!dir)
    throw new Error(`Unknown package for consumer smoke: ${packageName}`);
  return join(ROOT, dir);
}

function parsePackJson(stdout, packageName) {
  const parsed = JSON.parse(stdout);
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed?.[packageName]
      ? [parsed[packageName]]
      : [parsed];
  if (rows.length !== 1) {
    throw new Error(
      `npm pack for ${packageName} returned ${rows.length} package rows.`,
    );
  }
  return rows[0];
}

function pack(packageName, destination) {
  const result = run(
    "npm",
    ["pack", "--pack-destination", destination, "--json"],
    { cwd: packageDir(packageName), capture: true },
  );
  const packed = parsePackJson(result, packageName);
  if (!packed?.filename) {
    throw new Error(`npm pack did not return a filename for ${packageName}`);
  }
  return join(destination, packed.filename);
}

function assertPackedFile(pack, file) {
  if (!pack.files.some((entry) => entry.path === file)) {
    throw new Error(`${pack.name} tarball is missing ${file}`);
  }
}

function inspectPack(packageName) {
  const result = run("npm", ["pack", "--dry-run", "--json"], {
    cwd: packageDir(packageName),
    capture: true,
  });
  return parsePackJson(result, packageName);
}

const rootPackage = readJson(join(ROOT, "package.json"));
const roadmapState = readJson(
  join(ROOT, "scripts/design-system/astryx-roadmap.state.json"),
);
const forbiddenReactExports =
  roadmapState.reactPublicSurface?.forbiddenExports ?? [];
const reactVersion =
  rootPackage.dependencies?.react ?? rootPackage.devDependencies?.react;
const reactDomVersion =
  rootPackage.dependencies?.["react-dom"] ??
  rootPackage.devDependencies?.["react-dom"];
const typescriptVersion =
  rootPackage.dependencies?.typescript ??
  rootPackage.devDependencies?.typescript;
const reactTypesVersion =
  rootPackage.dependencies?.["@types/react"] ??
  rootPackage.devDependencies?.["@types/react"];
const reactDomTypesVersion =
  rootPackage.dependencies?.["@types/react-dom"] ??
  rootPackage.devDependencies?.["@types/react-dom"];
// framer-motion is a package peerDependency; the repo installs with
// legacy-peer-deps so the consumer must install it explicitly like react.
const framerMotionVersion =
  rootPackage.dependencies?.["framer-motion"] ??
  rootPackage.devDependencies?.["framer-motion"];

if (
  !reactVersion ||
  !reactDomVersion ||
  !typescriptVersion ||
  !reactTypesVersion ||
  !reactDomTypesVersion ||
  !framerMotionVersion
) {
  throw new Error(
    "Root package.json must declare react, react-dom, framer-motion, typescript, @types/react, and @types/react-dom for the consumer smoke.",
  );
}

const scratch = mkdtempSync(join(tmpdir(), "dt-npm-consumer-"));
const artifacts = join(scratch, "artifacts");
const consumer = join(scratch, "consumer");
mkdirSync(artifacts);
mkdirSync(consumer);

const report = {
  generatedAt: new Date().toISOString(),
  status: "running",
  scratchKept: KEEP,
  packages: [],
  consumer: null,
  errors: [],
};

try {
  run("npm", ["run", "check:token-packages"]);
  run("npm", ["run", "check:react-package"]);

  const tokenPack = inspectPack("@digitaltableteur/tokens");
  const tokenCssPack = inspectPack("@digitaltableteur/tokens-css");
  const reactPack = inspectPack("@digitaltableteur/react");
  assertPackedFile(tokenPack, "dist/index.js");
  assertPackedFile(tokenPack, "dist/tokens.dtcg.json");
  assertPackedFile(tokenPack, "dist/tailwind.tokens.js");
  assertPackedFile(tokenCssPack, "dist/tokens.css");
  assertPackedFile(tokenCssPack, "dist/themes/acme.css");
  assertPackedFile(reactPack, "dist/index.js");
  assertPackedFile(reactPack, "dist/index.d.ts");
  assertPackedFile(reactPack, "dist/style.css");
  for (const entryName of Object.keys(REACT_FAMILY_ENTRIES)) {
    assertPackedFile(reactPack, `dist/${entryName}.js`);
    assertPackedFile(reactPack, `dist/${entryName}.d.ts`);
    assertPackedFile(reactPack, `dist/${entryName}.css`);
  }
  report.packages = [tokenPack, tokenCssPack, reactPack].map((row) => ({
    name: row.name,
    version: row.version,
    filename: row.filename,
    entryCount: row.entryCount,
    unpackedSize: row.unpackedSize,
    requiredFilesPresent: true,
  }));

  const tarballs = [
    pack("@digitaltableteur/tokens", artifacts),
    pack("@digitaltableteur/tokens-css", artifacts),
    pack("@digitaltableteur/react", artifacts),
  ];

  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify(
      {
        name: "digitaltableteur-npm-consumer-smoke",
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
    join(consumer, "smoke.mjs"),
    `
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tokenCount, tokenNames } from "@digitaltableteur/tokens";
import dtcg from "@digitaltableteur/tokens/dtcg" with { type: "json" };
import manifest from "@digitaltableteur/tokens/manifest" with { type: "json" };
import { tailwindThemeRefs } from "@digitaltableteur/tokens/tailwind";
import * as DS from "@digitaltableteur/react";

const require = createRequire(import.meta.url);
const tokenCss = require.resolve("@digitaltableteur/tokens-css/tokens.css");
const tokenCssRoot = require.resolve("@digitaltableteur/tokens-css");
const acmeTheme = require.resolve("@digitaltableteur/tokens-css/themes/acme");
const acmeThemeWithExt = require.resolve("@digitaltableteur/tokens-css/themes/acme.css");
const reactCss = require.resolve("@digitaltableteur/react/style.css");
const familyEntries = ${JSON.stringify(REACT_FAMILY_ENTRIES)};
for (const [entryName, expectedExport] of Object.entries(familyEntries)) {
  const family = await import("@digitaltableteur/react/" + entryName);
  if (!family[expectedExport]) {
    throw new Error("Missing " + expectedExport + " from @digitaltableteur/react/" + entryName);
  }
  require.resolve("@digitaltableteur/react/" + entryName + "/style.css");
}

if (tokenCount < 180 || tokenNames.length !== tokenCount) {
  throw new Error("Token package export count is incomplete");
}
if (manifest.tokenCount !== tokenCount || !dtcg.$schema) {
  throw new Error("Token JSON exports are incomplete");
}
if (!tailwindThemeRefs["color-dt-primary"]) {
  throw new Error("Tailwind token export missing color-dt-primary");
}

for (const key of [
  "AlertBanner",
  "AnimationRuntimeProvider",
  "Breadcrumb",
  "Button",
  "Card",
  "EmptyState",
  "ImageProvider",
  "LayerProvider",
  "LinkProvider",
  "NavigationProvider",
  "Progress",
  "Tabs",
  "ToastRuntimeProvider",
  "TranslationProvider",
  "useFocusTrap",
  "useLayer",
  "useMediaQuery",
  "useOverflow",
  "useScrollLock",
  "useScrollOverflow",
  "useToast",
  "useTranslate",
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
          { label: "Install smoke" },
        ],
      }),
      React.createElement(DS.EmptyState, {
        title: "No package items",
        description: "The installed package rendered EmptyState.",
        headingLevel: "h3",
      }),
      React.createElement(DS.AlertBanner, {
        tone: "error",
        title: "Package alert",
        description: "The installed package rendered AlertBanner.",
      }),
      React.createElement(DS.Tabs, {
        tabs: [
          { key: "install", label: "Install tab" },
          { key: "verify", label: "Verify tab" },
        ],
        activeTab: "install",
        ariaLabel: "Package tabs",
      }),
      React.createElement(DS.Progress, {
        indeterminate: true,
        label: "Package progress",
        size: "sm",
        state: "info",
      }),
      React.createElement(DS.Button, { variant: "primary" }, "Install smoke"),
    ),
  ),
);

if (
  !markup.includes("Install smoke") ||
  !markup.includes("Install tab") ||
  !markup.includes("Package progress") ||
  !markup.includes("Package alert") ||
  !markup.includes("Breadcrumb") ||
  !markup.includes("No package items")
) {
  throw new Error("React package SSR smoke did not render the Button, Breadcrumb, AlertBanner, EmptyState, Progress, and Tabs children");
}

console.log(JSON.stringify({
  tokenCount,
  tokenCss,
  tokenCssRoot,
  acmeTheme,
  acmeThemeWithExt,
  reactCss,
  reactExports: Object.keys(DS).length,
}));
`.trimStart(),
  );
  writeFileSync(
    join(consumer, "smoke.tsx"),
    `
import * as React from "react";
import {
  Button as FamilyButton,
  type ButtonProps as FamilyButtonProps,
} from "@digitaltableteur/react/actions";
import {
  CookieConsent as FamilyCookieConsent,
  type CookieConsentProps as FamilyCookieConsentProps,
} from "@digitaltableteur/react/consent";
import {
  CodeSnippet as FamilyCodeSnippet,
  type CodeSnippetProps as FamilyCodeSnippetProps,
} from "@digitaltableteur/react/content";
import {
  AlertBanner as FamilyAlertBanner,
  type AlertBannerProps as FamilyAlertBannerProps,
} from "@digitaltableteur/react/feedback";
import {
  TextInput as FamilyTextInput,
  type TextInputProps as FamilyTextInputProps,
} from "@digitaltableteur/react/forms";
import {
  useStreamingText as useFamilyStreamingText,
  type UseStreamingTextOptions as FamilyStreamingTextOptions,
} from "@digitaltableteur/react/hooks";
import {
  Avatar as FamilyAvatar,
  type AvatarProps as FamilyAvatarProps,
} from "@digitaltableteur/react/identity";
import {
  Grid as FamilyGrid,
  type GridProps as FamilyGridProps,
} from "@digitaltableteur/react/layout";
import {
  Tabs as FamilyTabs,
  type TabsProps as FamilyTabsProps,
} from "@digitaltableteur/react/navigation";
import {
  PageLayout as FamilyPageLayout,
  type PageLayoutProps as FamilyPageLayoutProps,
} from "@digitaltableteur/react/patterns";
import {
  LayerProvider as FamilyLayerProvider,
  resolveMotionPlan as resolveFamilyMotionPlan,
  type LayerProviderProps as FamilyLayerProviderProps,
  type MotionRequest as FamilyMotionRequest,
} from "@digitaltableteur/react/runtime";
import {
  Text as FamilyText,
  type TextProps as FamilyTextProps,
} from "@digitaltableteur/react/typography";
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
  getTabPanelProps,
  useLayer,
  useOverflow,
  useScrollOverflow,
} from "@digitaltableteur/react";

type FamilyTypeProbe = [
  FamilyButtonProps,
  FamilyCookieConsentProps,
  FamilyCodeSnippetProps,
  FamilyAlertBannerProps,
  FamilyTextInputProps,
  FamilyStreamingTextOptions,
  FamilyAvatarProps,
  FamilyGridProps,
  FamilyTabsProps,
  FamilyPageLayoutProps,
  FamilyLayerProviderProps,
  FamilyTextProps,
];

const familyTypeProbe: FamilyTypeProbe | undefined = undefined;
const familyMotionRequest: FamilyMotionRequest = {
  preference: "reduced",
  hydrated: true,
  isReady: true,
  kind: "continuous",
  userInitiated: false,
  essential: false,
  durationMs: 1000,
  distancePx: 100,
  iterations: -1,
};
const familyMotionPlan = resolveFamilyMotionPlan(familyMotionRequest);
void FamilyButton;
void FamilyCookieConsent;
void FamilyCodeSnippet;
void FamilyAlertBanner;
void FamilyTextInput;
void useFamilyStreamingText;
void FamilyAvatar;
void FamilyGrid;
void FamilyTabs;
void FamilyPageLayout;
void FamilyLayerProvider;
void FamilyText;
void familyTypeProbe;
void familyMotionPlan;

const translate: Translate = (key, fallbackOrOptions) => {
  if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
  return String(fallbackOrOptions?.defaultValue ?? key);
};

const LinkAdapter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const navigationRuntime: NavigationRuntime = {
  pathname: "/",
  searchParams: new URLSearchParams(),
  push: () => undefined,
  replace: () => undefined,
};

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Package smoke" },
];
const tabs: TabItem[] = [
  { key: "install", label: "Install" },
  { key: "verify", label: "Verify" },
];

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
          <AlertBanner
            tone="error"
            title="Package alert"
            description="The installed package rendered AlertBanner."
          />
          <EmptyState title="No package items" headingLevel="h3" />
          <Tabs tabs={tabs} activeTab="install" ariaLabel="Package tabs" />
          <div {...getTabPanelProps("install", true)}>Install panel</div>
          <Progress indeterminate label="Package progress" size="sm" state="info" />
          <UtilityProbe />
          <Button variant="primary" size="md" onClick={() => undefined}>
            Typed Button
          </Button>
        </LinkProvider>
      </NavigationProvider>
    </LayerProvider>
  </TranslationProvider>
);

void tree;
`.trimStart(),
  );
  writeFileSync(
    join(consumer, "tsconfig.json"),
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
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      "--prefer-offline",
      `react@${reactVersion}`,
      `react-dom@${reactDomVersion}`,
      `framer-motion@${framerMotionVersion}`,
      `typescript@${typescriptVersion}`,
      `@types/react@${reactTypesVersion}`,
      `@types/react-dom@${reactDomTypesVersion}`,
      ...tarballs,
    ],
    { cwd: consumer },
  );

  const output = run("npm", ["run", "smoke", "--silent"], {
    cwd: consumer,
    capture: true,
  }).trim();
  const smoke = JSON.parse(output);
  run("npm", ["run", "typecheck", "--silent"], { cwd: consumer });
  report.status = "passed";
  report.generatedAt = new Date().toISOString();
  report.consumer = {
    tokenCount: smoke.tokenCount,
    reactExports: smoke.reactExports,
    tokenCssResolved: Boolean(smoke.tokenCss),
    tokenCssRootResolved: Boolean(smoke.tokenCssRoot),
    acmeThemeResolved: Boolean(smoke.acmeTheme),
    acmeThemeWithExtResolved: Boolean(smoke.acmeThemeWithExt),
    reactCssResolved: Boolean(smoke.reactCss),
    typecheck: "passed",
  };
  writeReport(report);
  console.log(
    `\u2713 npm consumer install verified (${smoke.tokenCount} tokens, ${smoke.reactExports} react exports, runtime + types, temp ${scratch})`,
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
    console.log(`kept npm consumer smoke workspace: ${scratch}`);
  }
}
