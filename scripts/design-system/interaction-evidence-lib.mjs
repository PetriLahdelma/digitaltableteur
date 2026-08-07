/**
 * Assembly helpers for real-browser interaction cost evidence
 * (Astryx-gap Phase 4). Companion to measure-interaction-evidence.mjs and
 * interaction-evidence-harness-runtime.mjs.
 *
 * Evidence model, following the family conventions:
 * - SUBSTANCE (stamped, byte-stable): what rendered — DOM element counts,
 *   recipe outcome facts (row/item/option counts, aria state) — and every
 *   skip with its reason. These are deterministic in a pinned Chromium.
 * - INFORMATIONAL (outside the stamp): all timings. Milliseconds vary by
 *   machine and run; they are published for reading, never for gating.
 *   Mount, re-render, and interaction costs are measured inside flushSync
 *   so they capture synchronous main-thread commit work without vsync
 *   quantization.
 */

/**
 * Classify one component's measurement into the substance record.
 * measurement: { skip?, renderError?, domNodes?, recipe? }
 */
export function componentInteractionRecord(measurement) {
  if (measurement.skip) return { status: "skipped", reason: measurement.skip };
  if (measurement.renderError) {
    return { status: "render-error", error: measurement.renderError };
  }
  const record = { status: "measured", domNodes: measurement.domNodes ?? 0 };
  if (measurement.recipe) {
    record.recipe = measurement.recipe;
  }
  return record;
}

/** Assemble the report substance with sorted keys and honest totals. */
export function assembleInteractionEvidence({
  packageName,
  packageVersion,
  environment,
  components,
}) {
  const sorted = {};
  const totals = { measured: 0, recipes: 0, renderError: 0, skipped: 0 };
  for (const name of Object.keys(components).sort()) {
    const record = components[name];
    sorted[name] = record;
    if (record.status === "skipped") totals.skipped += 1;
    else if (record.status === "render-error") totals.renderError += 1;
    else {
      totals.measured += 1;
      if (record.recipe) totals.recipes += 1;
    }
  }
  return {
    package: { name: packageName, version: packageVersion },
    environment,
    methodology: {
      rendering:
        "components render from the built dist with the SSR-evidence render plans (contract playground defaults, type-driven synthesis, descriptor resolution) in real Chromium with reduced motion",
      costs:
        "mount and re-render run inside ReactDOM flushSync — timings capture synchronous main-thread commit work, not frame scheduling; medians of 7 runs after a warmup, informational only",
      domNodes:
        "element count of the rendered wrapper subtree after mount — deterministic render weight, part of the stamped substance (portal content is excluded and noted where a recipe measures it)",
      recipes:
        "named interaction recipes exercise the documented hot paths of the data primitives with deterministic index-generated datasets (no randomness, no clock); outcome facts (counts, aria state) are substance, durations informational",
      timings:
        "all milliseconds live under `informational`, outside the substance stamp: they vary by machine and never gate anything",
    },
    totals,
    components: sorted,
  };
}
