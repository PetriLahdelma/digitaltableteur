#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = resolve(new URL("../..", import.meta.url).pathname);
const reactPackage = join(root, "packages/react");
const dist = join(reactPackage, "dist");
const roadmapState = JSON.parse(
  readFileSync(join(root, "scripts/design-system/astryx-roadmap.state.json"), "utf8"),
);
const forbiddenExports = roadmapState.reactPublicSurface?.forbiddenExports ?? [];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function assertFile(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} missing: ${path}`);
  }
}

function parsePackJson(stdout, packageName) {
  const parsed = JSON.parse(stdout);
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed?.[packageName]
      ? [parsed[packageName]]
      : [parsed];
  if (rows.length !== 1) {
    throw new Error(`npm pack for ${packageName} returned ${rows.length} package rows.`);
  }
  return rows[0];
}

run("npm", ["--prefix", "packages/react", "run", "build"]);

assertFile(join(dist, "index.js"), "React package JS entry");
assertFile(join(dist, "index.d.ts"), "React package type entry");
assertFile(join(dist, "style.css"), "React package CSS export");

const jsEntry = readFileSync(join(dist, "index.js"), "utf8");
if (!jsEntry.startsWith('"use client";')) {
  throw new Error(
    'React package JS entry must start with "use client"; for Next App Router consumers.',
  );
}

// Design tokens ship ONCE, via @digitaltableteur/tokens-css. A variables.css
// side-effect import anywhere in the package module graph snapshots the whole
// token sheet into dist/style.css at publish time — a stale duplicate that
// fights the app's live variables.css on cascade order (fixed for 0.1.4).
// The only allowed :root custom-prop definitions are the bundled third-party
// react-phone-number-input sheet (--PhoneInput* namespace).
const cssEntry = readFileSync(join(dist, "style.css"), "utf8");
for (const match of cssEntry.matchAll(/:root\s*{([^}]*)}/g)) {
  const foreign = [...match[1].matchAll(/--([\w-]+)\s*:/g)]
    .map((def) => def[1])
    .filter((name) => !name.startsWith("PhoneInput"));
  if (foreign.length > 0) {
    throw new Error(
      `dist/style.css defines design tokens at :root (${foreign.slice(0, 5).join(", ")}${foreign.length > 5 ? ", …" : ""}); tokens must ship only via @digitaltableteur/tokens-css — remove the variables.css side-effect import from the package module graph.`,
    );
  }
}

const smoke = run(
  "node",
  [
    "--input-type=module",
    "-e",
    [
      `const m = await import(${JSON.stringify(pathToFileURL(join(dist, "index.js")).href)});`,
      "for (const key of ['AlertBanner','Breadcrumb','Button','Card','Container','CookieConsentProvider','ImageProvider','LayerProvider','LinkProvider','NavigationProvider','Progress','Tabs','TranslationProvider','useCookieConsent','useFocusTrap','useLayer','useMediaQuery','useOverflow','useScrollLock','useScrollOverflow','useStreamingText','useToast','useTranslate']) { if (!m[key]) throw new Error(`missing public export: ${key}`); }",
      `for (const key of ${JSON.stringify(forbiddenExports)}) { if (m[key]) throw new Error(\`forbidden app/product export leaked: \${key}\`); }`,
      "console.log(Object.keys(m).length);",
    ].join(" "),
  ],
  { capture: true },
).trim();

const packJson = run(
  "npm",
  ["pack", "./packages/react", "--dry-run", "--json"],
  { capture: true },
);
const pack = parsePackJson(packJson, "@digitaltableteur/react");
const files = new Set(pack.files.map((file) => file.path));
for (const required of ["dist/index.js", "dist/index.d.ts", "dist/style.css"]) {
  if (!files.has(required)) {
    throw new Error(`npm pack is missing ${required}`);
  }
}

run("npm", ["run", "check:react-public-api"]);

console.log(
  `✓ react package verified (${smoke} exports, ${pack.entryCount} packed files, ${(pack.unpackedSize / 1024 / 1024).toFixed(2)} MiB unpacked)`,
);
