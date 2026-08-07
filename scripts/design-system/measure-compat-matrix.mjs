#!/usr/bin/env node
/**
 * React peer-range compatibility matrix for @digitaltableteur/react
 * (Astryx-gap Phase 4). Packs the local package tarball, installs it into a
 * fresh consumer per combo (declared react floor + resolved current), and
 * runs the SSR render-plan smoke with each consumer's own React. Gate:
 * combo equivalence — outcome sets must match across combos or the declared
 * range is broken (exit 2).
 *
 * Writes public/ds-health/compat-matrix.json. Per-publish evidence:
 * requires a built dist (--build rebuilds first). Network required for the
 * floor react install (public registry).
 *
 * Usage:
 *   npm run audit:compat-matrix
 *   npm run audit:compat-matrix -- --build
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadComponentContract } from "./ssr-evidence-lib.mjs";
import {
  assembleCompatMatrix,
  buildCombos,
  comboDivergence,
} from "./compat-matrix-lib.mjs";
import { currentProvenance, runtimeStampFor } from "./evidence-stamp-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PKG_DIR = join(ROOT, "packages/react");
const MANIFEST = join(PKG_DIR, "public-api.manifest.json");
const OUT = join(ROOT, "public/ds-health/compat-matrix.json");
const GENERATOR_VERSION = 1;

const shouldBuild = process.argv.includes("--build");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

if (shouldBuild) {
  console.log("→ building packages/react dist…");
  run("npm", ["--prefix", "packages/react", "run", "build"], { stdio: "inherit" });
}

if (!existsSync(join(PKG_DIR, "dist", "index.js"))) {
  console.error(
    "FAIL: packages/react dist missing. Run `npm --prefix packages/react run build` or pass --build.",
  );
  process.exit(1);
}

const packageJson = readJson(join(PKG_DIR, "package.json"));
const manifest = readJson(MANIFEST);
const exportsByEntry = manifest.runtimeExportsByEntry ?? {};

const resolved = {
  react: readJson(join(ROOT, "node_modules/react/package.json")).version,
  framerMotion: readJson(join(ROOT, "node_modules/framer-motion/package.json"))
    .version,
  reactMarkdown: readJson(
    join(ROOT, "node_modules/react-markdown/package.json"),
  ).version,
};
const declaredReactRange = packageJson.peerDependencies?.react;
const combos = buildCombos({ declaredReactRange, resolved });

// Contracts embed once; every combo smoke re-derives the same render plans.
const contractsByExport = {};
for (const exportNames of Object.values(exportsByEntry)) {
  for (const exportName of exportNames) {
    const contract = loadComponentContract(ROOT, exportName);
    if (contract) contractsByExport[exportName] = contract;
  }
}

const scratch = mkdtempSync(join(tmpdir(), "dt-compat-matrix-"));

console.log("→ packing @digitaltableteur/react…");
const packOutput = run("npm", ["pack", "--json", "--pack-destination", scratch], {
  cwd: PKG_DIR,
});
const tarball = join(scratch, JSON.parse(packOutput)[0].filename);

const SMOKE = `
import { readFileSync, writeFileSync } from "node:fs";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  renderPlanFor,
  resolveDescriptors,
} from ${JSON.stringify(pathToFileURL(join(ROOT, "scripts/design-system/ssr-evidence-lib.mjs")).href)};
import * as DS from "@digitaltableteur/react";

const contracts = JSON.parse(readFileSync("./contracts.json", "utf8"));
const lookup = (name) => DS[name];
const outcomes = {};
for (const [name, contract] of Object.entries(contracts)) {
  const Component = DS[name];
  if (!Component) {
    outcomes[name] = "skip: not exported";
    continue;
  }
  const plan = renderPlanFor(name, contract);
  if (plan.skip) {
    outcomes[name] = "skip";
    continue;
  }
  try {
    const props = resolveDescriptors(plan.props, React.createElement, lookup);
    renderToString(React.createElement(Component, props));
    outcomes[name] = "pass";
  } catch (error) {
    outcomes[name] = String(error?.message ?? error).split("\\n")[0].slice(0, 200);
  }
}
writeFileSync(
  "./outcomes.json",
  JSON.stringify({ reactVersion: React.version, outcomes }),
);
`;

const comboResults = [];
const outcomesByCombo = {};
try {
  for (const combo of combos) {
    const consumer = join(scratch, combo.label);
    mkdirSync(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({ name: `dt-compat-${combo.label}`, private: true, type: "module" }),
    );
    writeFileSync(join(consumer, "contracts.json"), JSON.stringify(contractsByExport));
    writeFileSync(join(consumer, "smoke.mjs"), SMOKE);
    console.log(`→ ${combo.label}: installing react@${combo.react} + tarball…`);
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        `react@${combo.react}`,
        `react-dom@${combo.reactDom}`,
        `framer-motion@${combo.framerMotion}`,
        `react-markdown@${combo.reactMarkdown}`,
        tarball,
      ],
      { cwd: consumer },
    );
    run("node", ["smoke.mjs"], { cwd: consumer });
    const smoke = readJson(join(consumer, "outcomes.json"));
    if (smoke.reactVersion !== combo.react) {
      console.error(
        `FAIL: ${combo.label} ran React ${smoke.reactVersion}, expected ${combo.react}.`,
      );
      process.exit(1);
    }
    const passes = Object.values(smoke.outcomes).filter((o) => o === "pass").length;
    console.log(`  ✓ react ${smoke.reactVersion}: ${passes} components pass SSR`);
    outcomesByCombo[combo.label] = smoke.outcomes;
    comboResults.push({ ...combo, outcomes: smoke.outcomes });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const divergence = comboDivergence(outcomesByCombo);
const substance = assembleCompatMatrix({
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  declaredReactRange,
  combos: comboResults,
  divergence,
});

const provenance = currentProvenance(ROOT, {
  name: "measure-compat-matrix",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance);
const report = { generatedAt: stamp.generatedAt, ...substance, provenance: stamp.provenance };
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `\n✓ compat matrix written: ${combos.length} combos (react ${combos.map((c) => c.react).join(", ")}), ` +
    `${divergence.length} divergent components → public/ds-health/compat-matrix.json`,
);
if (divergence.length) {
  console.error(
    `\nFAIL: SSR outcomes diverge across the declared react range: ${divergence.join(", ")}`,
  );
  process.exit(2);
}
