#!/usr/bin/env node
/**
 * SSR + hydration evidence for @digitaltableteur/react
 * (Astryx-gap Phase 4, increment 2).
 *
 * Phase A (this process, NO DOM globals): import each dist entry and
 * renderToString every renderable component export — the honest server
 * condition. Phase B (child process with jsdom globals installed BEFORE any
 * React import): hydrate the captured server HTML and record recoverable
 * hydration errors and hydration console errors.
 *
 * Writes public/ds-health/ssr-evidence.json. Deterministic substance
 * (statuses, error messages, HTML bytes); render timings are informational
 * runtime data outside the stamp. Per-publish evidence: requires a built
 * dist (pass --build to rebuild first).
 *
 * Usage:
 *   npm run audit:ssr-evidence
 *   npm run audit:ssr-evidence -- --build
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
import {
  assembleSsrEvidence,
  componentRecord,
  hydrationContainerChainFor,
  renderPlanFor,
  stableErrorMessage,
} from "./ssr-evidence-lib.mjs";
import { currentProvenance, runtimeStampFor } from "./evidence-stamp-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PKG_DIR = join(ROOT, "packages/react");
const MANIFEST = join(PKG_DIR, "public-api.manifest.json");
const OUT = join(ROOT, "public/ds-health/ssr-evidence.json");
const HYDRATE_WORKER = join(
  ROOT,
  "scripts/design-system/ssr-evidence-hydrate-worker.mjs",
);
const GENERATOR_VERSION = 1;

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

if (typeof globalThis.window !== "undefined") {
  console.error(
    "FAIL: DOM globals present before SSR measurement; run in plain Node.",
  );
  process.exit(1);
}

const manifest = readJson(MANIFEST);
const exportsByEntry = manifest.runtimeExportsByEntry ?? {};
const packageJson = readJson(join(PKG_DIR, "package.json"));

const missingDist = Object.keys(exportsByEntry).filter(
  (entry) => !existsSync(join(PKG_DIR, "dist", `${entry}.js`)),
);
if (missingDist.length) {
  console.error(
    `FAIL: built dist entries missing (${missingDist.join(", ")}). ` +
      "Run `npm --prefix packages/react run build` or pass --build.",
  );
  process.exit(1);
}

function contractFor(name) {
  for (const base of [
    "nextjs-app/shared/components",
    "nextjs-app/shared/patterns",
  ]) {
    const path = join(ROOT, base, name, `${name}.contract.json`);
    if (existsSync(path)) return readJson(path);
  }
  return null;
}

const { createElement } = await import("react");
const { renderToString } = await import("react-dom/server");
const reactVersion = (await import("react")).version;
const jsdomVersion = readJson(join(ROOT, "node_modules/jsdom/package.json")).version;

const entries = {};
const informationalTimings = {};
const hydrationJobs = [];

for (const [entryName, exportNames] of Object.entries(exportsByEntry)) {
  const components = {};
  let entryModule = null;
  let importError = null;
  try {
    entryModule = await import(
      pathToFileURL(join(PKG_DIR, "dist", `${entryName}.js`)).href
    );
  } catch (error) {
    importError = stableErrorMessage(error);
  }
  for (const exportName of exportNames) {
    if (importError) {
      components[exportName] = componentRecord({
        ssrError: `entry import failed: ${importError}`,
      });
      continue;
    }
    const contract = contractFor(exportName);
    const plan = renderPlanFor(exportName, contract);
    if (plan.skip) {
      components[exportName] = componentRecord({ skip: plan.skip });
      continue;
    }
    const Component = entryModule[exportName];
    let html = null;
    try {
      const element = createElement(Component, plan.props);
      // Warmup render, then timed median of 5 (informational only).
      html = renderToString(element);
      const runs = [];
      for (let i = 0; i < 5; i += 1) {
        const start = performance.now();
        renderToString(createElement(Component, plan.props));
        runs.push(performance.now() - start);
      }
      runs.sort((a, b) => a - b);
      informationalTimings[exportName] = {
        renderToStringMs: Number(runs[2].toFixed(3)),
      };
    } catch (error) {
      components[exportName] = componentRecord({
        ssrError: stableErrorMessage(error),
      });
      continue;
    }
    components[exportName] = componentRecord({
      htmlBytes: Buffer.byteLength(html),
      hydrationErrors: null, // filled by the hydration phase
    });
    hydrationJobs.push({
      entry: entryName,
      exportName,
      props: plan.props,
      html,
      containerChain: hydrationContainerChainFor(contract?.element),
    });
  }
  entries[entryName] = { importError, components };
  const measured = Object.values(components).filter((c) => c.ssr?.ok).length;
  console.log(`✓ ssr ${entryName}: ${measured}/${exportNames.length} exports rendered`);
}

// Phase B: hydration in a child process so DOM globals exist BEFORE React
// loads (React reads the environment at module scope; polluting this process
// after renderToString would test neither condition honestly).
console.log(`→ hydrating ${hydrationJobs.length} components in jsdom worker…`);
const workerInput = JSON.stringify(hydrationJobs);
let hydrationResults;
try {
  const stdout = execFileSync("node", [HYDRATE_WORKER], {
    cwd: ROOT,
    input: workerInput,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  hydrationResults = JSON.parse(stdout);
} catch (error) {
  console.error("FAIL: hydration worker crashed:", stableErrorMessage(error));
  process.exit(1);
}

for (const result of hydrationResults) {
  const record = entries[result.entry].components[result.exportName];
  const hydration = result.errors.length
    ? { ok: false, errors: result.errors }
    : { ok: true };
  record.hydration = hydration;
  record.status = hydration.ok ? "pass" : "hydration-error";
}

const substance = assembleSsrEvidence({
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  reactVersion,
  jsdomVersion,
  entries,
});

const provenance = currentProvenance(ROOT, {
  name: "measure-ssr-evidence",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance, ["informational"]);
const report = {
  generatedAt: stamp.generatedAt,
  ...substance,
  informational: { timings: informationalTimings },
  provenance: stamp.provenance,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
const { totals } = substance;
console.log(
  `\n✓ ssr evidence written: ${totals.ssrPass} ssr pass, ${totals.hydrationClean} hydration clean, ` +
    `${totals.ssrError} ssr errors, ${totals.hydrationError} hydration errors, ${totals.skipped} skipped → public/ds-health/ssr-evidence.json`,
);
process.exit(totals.ssrPass === 0 ? 1 : 0);
