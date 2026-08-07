#!/usr/bin/env node
/**
 * Web-component parity evidence (Astryx-gap Phase 4). Runs the rendered
 * parity sweep (check:rendered-parity:ci — React↔native pixel + geometry
 * comparison across the viewport/theme matrix, its own Storybook lifecycle)
 * and elevates its report into the committed per-publish evidence family.
 *
 * Substance (stamped): coverage (native tags vs contracted React exports),
 * the enforcement roster and its reviewed exceptions, per-component gate
 * verdicts and geometry deltas (integer pixels, stable). Raw pixel-diff
 * ratios are INFORMATIONAL: antialiasing can wobble them run to run, so
 * they are published for reading, never compared byte-for-byte.
 *
 * A sweep failure (enforced regression) fails this script — the evidence
 * cannot be regenerated over a red gate.
 *
 * Usage:
 *   npm run audit:wc-parity            # runs the sweep (boots Storybook)
 *   npm run audit:wc-parity -- --from-report   # reuse a fresh existing report
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { currentProvenance, runtimeStampFor } from "./evidence-stamp-lib.mjs";
import { enforced, exceptions } from "./rendered-parity.roster.mjs";
import elements from "../../packages/web-components/web-components.config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT = join(ROOT, ".omx/state/design-system/rendered-parity/latest.json");
const OUT = join(ROOT, "public/ds-health/wc-parity.json");
const GENERATOR_VERSION = 1;
const MAX_REPORT_AGE_MS = 30 * 60 * 1000;

const fromReport = process.argv.includes("--from-report");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

if (!fromReport) {
  console.log("→ running rendered-parity sweep (boots Storybook)…");
  execFileSync("npm", ["run", "check:rendered-parity:ci"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

if (!existsSync(REPORT)) {
  console.error("FAIL: no rendered-parity report; run npm run check:rendered-parity:ci");
  process.exit(1);
}
const report = readJson(REPORT);
const age = Date.now() - Date.parse(report.generatedAt);
if (Number.isNaN(age) || age > MAX_REPORT_AGE_MS) {
  console.error(
    `FAIL: rendered-parity report is ${Number.isNaN(age) ? "unstamped" : `${Math.round(age / 60000)} min old`}; rerun without --from-report.`,
  );
  process.exit(1);
}

const manifest = readJson(join(ROOT, "packages/react/public-api.manifest.json"));
const reactExports = Object.values(manifest.runtimeExportsByEntry ?? {}).flat();

// Group per component; gate verdicts + geometry are substance, ratios are not.
const byComponent = {};
const informationalRatios = {};
for (const entry of report.results ?? []) {
  if (entry.skipped) continue;
  const bucket = (byComponent[entry.component] = byComponent[entry.component] ?? {
    comparisons: 0,
    visualPass: 0,
    geometryPass: 0,
    enforced: entry.enforced,
    exceptedStories: [],
    maxGeometryDelta: { width: 0, height: 0 },
  });
  bucket.comparisons += 1;
  if (entry.pass) bucket.visualPass += 1;
  if (entry.geometryPass) bucket.geometryPass += 1;
  if (entry.excepted) bucket.exceptedStories.push(`${entry.story} (${entry.mode})`);
  bucket.maxGeometryDelta.width = Math.max(
    bucket.maxGeometryDelta.width,
    Math.abs(entry.geometryDelta?.width ?? 0),
  );
  bucket.maxGeometryDelta.height = Math.max(
    bucket.maxGeometryDelta.height,
    Math.abs(entry.geometryDelta?.height ?? 0),
  );
  (informationalRatios[entry.component] =
    informationalRatios[entry.component] ?? {})[
    `${entry.story} (${entry.mode})`
  ] = entry.ratio;
}
for (const bucket of Object.values(byComponent)) {
  bucket.exceptedStories.sort();
}

const componentNames = Object.keys(byComponent).sort();
const substance = {
  package: {
    name: "@digitaltableteur/web-components",
    version: readJson(join(ROOT, "packages/web-components/package.json")).version,
    reactPackageVersion: readJson(join(ROOT, "packages/react/package.json")).version,
  },
  coverage: {
    nativeTags: elements.length,
    contractedReactExports: reactExports.filter((name) =>
      existsSync(join(ROOT, "nextjs-app/shared/components", name)) ||
      existsSync(join(ROOT, "nextjs-app/shared/patterns", name)),
    ).length,
    pairsCompared: componentNames.length,
    note: "native twins are built component by component (tribunal order); absence of a twin means not built yet, not divergence",
  },
  roster: {
    enforced: [...enforced].sort(),
    enforcedCount: enforced.length,
    exceptions: exceptions.map((entry) => ({
      component: entry.component,
      story: entry.story,
      mode: entry.mode,
      reason: entry.reason,
    })),
  },
  methodology: {
    source:
      "check:rendered-parity:ci — React story vs native twin screenshotted in the same Storybook across the viewport/theme matrix; pixel comparison at the gate's tolerance plus integer geometry deltas",
    substance:
      "gate verdicts (pass/geometryPass counts) and max geometry deltas are stamped substance; raw pixel-diff ratios wobble with antialiasing and live under informational",
    enforcement:
      "roster-based ratchet: enforced components fail the underlying gate on regression, and this evidence cannot regenerate over a red gate",
  },
  totals: {
    comparisons: report.comparisons,
    visualParity: report.visualParity,
    geometryParity: report.geometryParity,
    pixelTolerance: report.pixelTolerance,
  },
  components: Object.fromEntries(
    componentNames.map((name) => [name, byComponent[name]]),
  ),
};

const provenance = currentProvenance(ROOT, {
  name: "generate-wc-parity-evidence",
  version: GENERATOR_VERSION,
});
const stamp = runtimeStampFor(OUT, substance, provenance, ["informational"]);
const artifact = {
  generatedAt: stamp.generatedAt,
  ...substance,
  informational: { pixelRatios: informationalRatios, sweepGeneratedAt: report.generatedAt },
  provenance: stamp.provenance,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(
  `\n✓ wc parity evidence written: ${componentNames.length} pairs, visual ${report.visualParity}, ` +
    `geometry ${report.geometryParity}, ${enforced.length} enforced, ${exceptions.length} exceptions → public/ds-health/wc-parity.json`,
);
