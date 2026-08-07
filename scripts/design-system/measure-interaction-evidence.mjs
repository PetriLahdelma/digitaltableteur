#!/usr/bin/env node
/**
 * Real-browser interaction cost evidence for @digitaltableteur/react
 * (Astryx-gap Phase 4). Renders every contracted export from the built dist
 * in Chromium via Playwright and measures mount / re-render commit cost
 * (flushSync, informational) plus deterministic DOM render weight
 * (substance); named recipes exercise the data primitives' documented hot
 * paths (DataTable sort, TreeView expand, VirtualList scroll re-window,
 * CommandPalette filter).
 *
 * Writes public/ds-health/interaction-evidence.json. Per-publish evidence:
 * requires a built dist (--build rebuilds first).
 *
 * Usage:
 *   npm run audit:interaction-evidence
 *   npm run audit:interaction-evidence -- --build
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
  assembleInteractionEvidence,
  componentInteractionRecord,
} from "./interaction-evidence-lib.mjs";
import { currentProvenance, runtimeStampFor } from "./evidence-stamp-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PKG_DIR = join(ROOT, "packages/react");
const MANIFEST = join(PKG_DIR, "public-api.manifest.json");
const OUT = join(ROOT, "public/ds-health/interaction-evidence.json");
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
const harnessDir = mkdtempSync(join(tmpdir(), "dt-interaction-evidence-"));
const cssLinks = [];
copyFileSync(
  require.resolve("@digitaltableteur/tokens-css/tokens.css"),
  join(harnessDir, "tokens.css"),
);
cssLinks.push("tokens.css");
for (const entry of entryNames) {
  const cssPath = join(PKG_DIR, "dist", `${entry}.css`);
  if (existsSync(cssPath)) {
    copyFileSync(cssPath, join(harnessDir, `${entry}.css`));
    cssLinks.push(`${entry}.css`);
  }
}

const entryImports = entryNames
  .map(
    (entry, index) =>
      `import * as entry${index} from ${JSON.stringify(join(PKG_DIR, "dist", `${entry}.js`))};`,
  )
  .join("\n");
const harnessEntrySource = `
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import { runInteractionEvidence } from ${JSON.stringify(join(ROOT, "scripts/design-system/interaction-evidence-harness-runtime.mjs"))};
${entryImports}
const modules = { ${entryNames.map((entry, index) => `${JSON.stringify(entry)}: entry${index}`).join(", ")} };
runInteractionEvidence({
  React,
  ReactDOM,
  ReactDOMClient,
  modules,
  components: window.__INTERACTION_DATA__.components,
})
  .then((payload) => {
    window.__INTERACTION_RESULTS__ = payload;
  })
  .catch((error) => {
    window.__INTERACTION_ERROR__ = String(error?.stack ?? error);
  });
`;

await build({
  stdin: {
    contents: harnessEntrySource,
    resolveDir: ROOT,
    sourcefile: "interaction-evidence-entry.js",
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
<script>window.__INTERACTION_DATA__ = ${JSON.stringify({ components })};</script>
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

console.log(`→ measuring ${components.length} components in Chromium…`);
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(
  "window.__INTERACTION_RESULTS__ !== undefined || window.__INTERACTION_ERROR__ !== undefined",
  undefined,
  { timeout: 180_000 },
);
const harnessError = await page.evaluate("window.__INTERACTION_ERROR__");
const payload = await page.evaluate("window.__INTERACTION_RESULTS__");
const chromiumVersion = browser.version();
await browser.close();
server.close();
rmSync(harnessDir, { recursive: true, force: true });

if (harnessError) {
  console.error("FAIL: harness crashed in the browser:\n", harnessError);
  process.exit(1);
}

// --- Assemble artifact ----------------------------------------------------
const records = {};
for (const { exportName } of components) {
  records[exportName] = componentInteractionRecord(
    payload.results[exportName] ?? { skip: "no measurement returned by the harness" },
  );
}
for (const exportName of noContract) {
  records[exportName] = componentInteractionRecord({
    skip: "no component contract (not a renderable component export)",
  });
}

const playwrightVersion = readJson(
  join(ROOT, "node_modules/@playwright/test/package.json"),
).version;
const substance = assembleInteractionEvidence({
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
  name: "measure-interaction-evidence",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance, ["informational"]);
const report = {
  generatedAt: stamp.generatedAt,
  ...substance,
  informational: { timings: payload.timings },
  provenance: stamp.provenance,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

const { totals } = substance;
console.log(
  `\n✓ interaction evidence written: ${totals.measured} measured (${totals.recipes} with recipes), ` +
    `${totals.renderError} render errors, ${totals.skipped} skipped → public/ds-health/interaction-evidence.json`,
);
process.exit(totals.measured === 0 ? 1 : 0);
