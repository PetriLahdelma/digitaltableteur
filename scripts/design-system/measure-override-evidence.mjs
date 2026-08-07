#!/usr/bin/env node
/**
 * Override-precedence evidence for @digitaltableteur/react
 * (docs/OVERRIDE_EVIDENCE_SPEC.md, increment A).
 *
 * Package-honest and browser-real: bundles the built dist plus the harness
 * runtime with esbuild, serves a page that loads the shipped entry CSS and
 * tokens-css exactly like a registry consumer, and drives it with Playwright
 * Chromium (reduced motion) to read computed styles.
 *
 * INV-1: a consumer's single-class, no-!important selector via className
 * wins over component base styles for the probed properties on the root
 * element (owner decision 2026-08-07: this IS the contract).
 * INV-2: every contract-declared theming var is a live override channel.
 *
 * Writes public/ds-health/override-evidence.json and gates against
 * override-evidence-baseline.json: exit 2 on any failure not explicitly
 * baselined with a dated note.
 *
 * Usage:
 *   npm run audit:override-evidence            # requires an existing dist
 *   npm run audit:override-evidence -- --build # rebuild dist first
 */
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { loadComponentContract } from "./ssr-evidence-lib.mjs";
import {
  assembleOverrideEvidence,
  compareToBaseline,
  componentOverrideRecord,
  probeStylesheet,
} from "./override-evidence-lib.mjs";
import { currentProvenance, runtimeStampFor } from "./evidence-stamp-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PKG_DIR = join(ROOT, "packages/react");
const MANIFEST = join(PKG_DIR, "public-api.manifest.json");
const OUT = join(ROOT, "public/ds-health/override-evidence.json");
const BASELINE = join(
  ROOT,
  "scripts/design-system/override-evidence-baseline.json",
);
const GENERATOR_VERSION = 1;
const require = createRequire(import.meta.url);

const shouldBuild = process.argv.includes("--build");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

if (shouldBuild) {
  console.log("→ building packages/react dist…");
  execFileSync("npm", ["--prefix", "packages/react", "run", "build"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

if (!existsSync(MANIFEST)) {
  console.error("FAIL: packages/react/public-api.manifest.json missing.");
  process.exit(1);
}
const manifest = readJson(MANIFEST);
const exportsByEntry = manifest.runtimeExportsByEntry ?? {};
const entryNames = Object.keys(exportsByEntry);
const packageJson = readJson(join(PKG_DIR, "package.json"));

const missingDist = entryNames.filter(
  (entry) => !existsSync(join(PKG_DIR, "dist", `${entry}.js`)),
);
if (missingDist.length) {
  console.error(
    `FAIL: built dist entries missing (${missingDist.join(", ")}). ` +
      "Run `npm --prefix packages/react run build` or pass --build.",
  );
  process.exit(1);
}

// Components with a contract get measured; the rest (hooks, runtime
// adapters) are recorded as out-of-scope skips by the runtime's plan check
// or here when no contract exists at all.
const components = [];
const noContract = [];
for (const [entry, exportNames] of Object.entries(exportsByEntry)) {
  for (const exportName of exportNames) {
    const contract = loadComponentContract(ROOT, exportName);
    if (contract) components.push({ entry, exportName, contract });
    else noContract.push(exportName);
  }
}

// --- Assemble the harness in a temp dir -----------------------------------
const harnessDir = mkdtempSync(join(tmpdir(), "dt-override-evidence-"));
const cssLinks = [];

const tokensCss = require.resolve("@digitaltableteur/tokens-css/tokens.css");
copyFileSync(tokensCss, join(harnessDir, "tokens.css"));
cssLinks.push("tokens.css");

for (const entry of entryNames) {
  const cssPath = join(PKG_DIR, "dist", `${entry}.css`);
  if (existsSync(cssPath)) {
    copyFileSync(cssPath, join(harnessDir, `${entry}.css`));
    cssLinks.push(`${entry}.css`);
  }
}

// Probe stylesheet loads LAST: the documented consumer arrangement is
// design-system CSS before consumer CSS.
writeFileSync(join(harnessDir, "probe.css"), probeStylesheet());
cssLinks.push("probe.css");

const entryImports = entryNames
  .map(
    (entry, index) =>
      `import * as entry${index} from ${JSON.stringify(join(PKG_DIR, "dist", `${entry}.js`))};`,
  )
  .join("\n");
const harnessEntrySource = `
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { runOverrideEvidence } from ${JSON.stringify(join(ROOT, "scripts/design-system/override-evidence-harness-runtime.mjs"))};
${entryImports}
const modules = { ${entryNames.map((entry, index) => `${JSON.stringify(entry)}: entry${index}`).join(", ")} };
runOverrideEvidence({
  React,
  ReactDOMClient,
  modules,
  components: window.__OVERRIDE_DATA__.components,
})
  .then((results) => {
    window.__OVERRIDE_RESULTS__ = results;
  })
  .catch((error) => {
    window.__OVERRIDE_ERROR__ = String(error?.stack ?? error);
  });
`;

await build({
  stdin: {
    contents: harnessEntrySource,
    resolveDir: ROOT,
    sourcefile: "override-evidence-entry.js",
    loader: "js",
  },
  bundle: true,
  format: "iife",
  platform: "browser",
  outfile: join(harnessDir, "bundle.js"),
  logLevel: "silent",
  alias: {
    "node:fs": join(ROOT, "scripts/design-system/override-evidence-node-stubs.mjs"),
    "node:path": join(ROOT, "scripts/design-system/override-evidence-node-stubs.mjs"),
  },
});

const html = `<!doctype html>
<html><head><meta charset="utf-8">
${cssLinks.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n")}
<script>window.__OVERRIDE_DATA__ = ${JSON.stringify({ components })};</script>
</head><body><script src="bundle.js"></script></body></html>`;
writeFileSync(join(harnessDir, "index.html"), html);

// --- Serve and drive ------------------------------------------------------
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
const server = createServer((request, response) => {
  const path = request.url === "/" ? "/index.html" : request.url;
  const file = join(harnessDir, path.slice(1));
  if (!file.startsWith(harnessDir) || !existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
  });
  response.end(readFileSync(file));
});
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const port = server.address().port;

const { chromium } = await import("@playwright/test");
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error).slice(0, 200)));

console.log(
  `→ measuring ${components.length} components in Chromium (${cssLinks.length} stylesheets)…`,
);
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(
  "window.__OVERRIDE_RESULTS__ !== undefined || window.__OVERRIDE_ERROR__ !== undefined",
  undefined,
  { timeout: 120_000 },
);
const harnessError = await page.evaluate("window.__OVERRIDE_ERROR__");
const rawResults = await page.evaluate("window.__OVERRIDE_RESULTS__");
const chromiumVersion = browser.version();
await browser.close();
server.close();
rmSync(harnessDir, { recursive: true, force: true });

if (harnessError) {
  console.error("FAIL: harness crashed in the browser:\n", harnessError);
  process.exit(1);
}
if (pageErrors.length) {
  console.error(`note: ${pageErrors.length} uncaught page error(s):`, pageErrors[0]);
}

// --- Assemble artifact ----------------------------------------------------
const records = {};
for (const { exportName } of components) {
  records[exportName] = componentOverrideRecord(rawResults[exportName] ?? {
    skip: "no measurement returned by the harness",
  });
}
for (const exportName of noContract) {
  records[exportName] = componentOverrideRecord({
    skip: "no component contract (not a renderable component export)",
  });
}

const playwrightVersion = readJson(
  join(ROOT, "node_modules/@playwright/test/package.json"),
).version;
const substance = assembleOverrideEvidence({
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  environment: {
    chromium: chromiumVersion,
    playwright: playwrightVersion,
    reducedMotion: true,
  },
  components: records,
});

const provenance = currentProvenance(ROOT, {
  name: "measure-override-evidence",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance);
const report = {
  generatedAt: stamp.generatedAt,
  ...substance,
  provenance: stamp.provenance,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

// --- Baseline gate --------------------------------------------------------
const baseline = existsSync(BASELINE) ? readJson(BASELINE) : { entries: {} };
const { newFailures, stale } = compareToBaseline(substance, baseline);
const { totals } = substance;
console.log(
  `\n✓ override evidence written: ${totals.pass} pass, ${totals.fail} fail ` +
    `(${Object.keys(baseline.entries ?? {}).length} baselined), ${totals.renderError} render errors, ` +
    `${totals.skipped} skipped, ${totals.themingVarsDeclared} theming vars declared → public/ds-health/override-evidence.json`,
);
if (stale.length) {
  console.log(
    `note: baseline entries no longer failing (prune them): ${stale.join(", ")}`,
  );
}
if (newFailures.length) {
  console.error(
    `\nFAIL: ${newFailures.length} override failure(s) not in the baseline:`,
  );
  for (const name of newFailures) {
    console.error(`  x ${name}: ${JSON.stringify(records[name]).slice(0, 200)}`);
  }
  console.error(
    "  Fix the component, or add a dated, explained entry to scripts/design-system/override-evidence-baseline.json.",
  );
  process.exit(2);
}
