/**
 * Pure assembly for the per-publish compatibility manifest
 * (Astryx-gap Phase 4).
 *
 * The manifest records the toolchain COMBINATIONS ACTUALLY EXERCISED by the
 * repo's gates at publish time — resolved versions, not semver ranges — and
 * states explicitly that nothing beyond those combinations has been tested.
 * Honesty over breadth: a declared peer range like react >=19.0.0 is a
 * compatibility CLAIM; the manifest shows which single resolved version backs
 * it with evidence.
 */

/**
 * Which gates exercise which toolchain facets. Static by design: this list
 * describes what the react publish preflight actually runs, and the preflight
 * results are attached separately when available.
 */
export const GATE_EXERCISES = [
  {
    gate: "typecheck",
    exercises: ["typescript", "next", "react (types)"],
    proves: "package + app sources compile against the resolved React/Next type surface",
  },
  {
    gate: "test",
    exercises: ["react", "react-dom", "vitest", "jsdom"],
    proves: "components render and behave under the resolved React runtime in jsdom",
  },
  {
    gate: "storybook-build",
    exercises: ["storybook", "vite", "react", "react-dom"],
    proves: "every story compiles and bundles under the resolved Storybook/Vite toolchain",
  },
  {
    gate: "build",
    exercises: ["next", "react", "react-dom"],
    proves: "the production Next build compiles, prerenders, and hydrates the consuming app",
  },
  {
    gate: "test:visual / AT evidence capture",
    exercises: ["@playwright/test", "storybook"],
    proves: "rendered output, accessibility trees, and forced-colors behavior in a real Chromium",
  },
];

/**
 * Build the manifest substance from injected inputs so the assembly is
 * fully testable.
 *
 * @param {object} input
 * @param {Record<string,string>} input.workspacePackages  name → version of the repo's own packages
 * @param {Record<string,string|null>} input.resolvedVersions  toolchain name → installed version (null when absent)
 * @param {Record<string,string>} input.declaredPeerRanges  react package peerDependencies
 * @param {{node: string, platform: string, arch: string}} input.runtime
 * @param {object|null} input.preflight  summary of the latest preflight run, or null
 */
export function assembleCompatibilityManifest({
  workspacePackages,
  resolvedVersions,
  declaredPeerRanges,
  runtime,
  preflight,
}) {
  const exercised = {};
  for (const name of Object.keys(resolvedVersions).sort()) {
    exercised[name] = resolvedVersions[name];
  }

  const peerCoverage = Object.keys(declaredPeerRanges)
    .sort()
    .map((name) => ({
      package: name,
      declaredRange: declaredPeerRanges[name],
      exercisedVersion: resolvedVersions[name] ?? null,
      note:
        resolvedVersions[name] == null
          ? "declared peer is not installed in this repo; NO version of it is exercised by the gates"
          : "only this resolved version is exercised by the gates; other versions inside the declared range are untested claims",
    }));

  return {
    scope:
      "combinations actually exercised by the local gates at generation time. Absence from this manifest means untested, not incompatible.",
    packages: sortObject(workspacePackages),
    runtime,
    exercised,
    peerCoverage,
    gates: GATE_EXERCISES,
    preflight: preflight ?? null,
  };
}

/**
 * Reduce a preflight latest.json report to the summary the manifest embeds:
 * when it ran and which automated checks passed. Returns null for anything
 * unusable.
 */
export function summarizePreflight(report) {
  if (!report || !Array.isArray(report.checks)) return null;
  const checks = {};
  for (const check of report.checks) {
    if (typeof check?.name === "string") {
      checks[check.name] = check.status === "passed";
    }
  }
  if (!Object.keys(checks).length) return null;
  return {
    note: "most recent RECORDED preflight run at manifest generation time; when the manifest is regenerated inside a preflight run, this describes the previous run",
    generatedAt: report.generatedAt ?? null,
    status: report.status ?? null,
    checks: sortObject(checks),
  };
}

function sortObject(object) {
  const sorted = {};
  for (const key of Object.keys(object).sort()) sorted[key] = object[key];
  return sorted;
}
