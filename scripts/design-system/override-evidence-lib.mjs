/**
 * Helpers for override-precedence evidence (Astryx-gap Phase 4,
 * docs/OVERRIDE_EVIDENCE_SPEC.md, increment A).
 *
 * OWNER DECISION (2026-08-07): className-override-wins IS the contract. A
 * consumer's single-class, no-!important selector applied via className must
 * beat component base styles for the probed properties on the root element,
 * given the documented consumer arrangement (design-system CSS imported
 * before consumer CSS). A failure is a defect or an explicitly baselined,
 * dated debt.
 */

/**
 * Probe set v1, sourced from the two shipped bug classes (#1280
 * Modal/Switch ink+surface, Title/Text spacing). Sentinels are valid,
 * visually meaningless values no token resolves to, so computed === sentinel
 * is unambiguous.
 */
export const PROBE_PROPERTIES = [
  { prop: "color", value: "rgb(9, 8, 7)" },
  { prop: "margin-block-start", value: "7px" },
  { prop: "background-color", value: "rgb(7, 8, 9)" },
];

export const PROBE_CLASS = "dtProbeOverride";

/** Single class, no !important: winning must come from honest precedence. */
export function probeStylesheet() {
  const declarations = PROBE_PROPERTIES.map(
    ({ prop, value }) => `  ${prop}: ${value};`,
  ).join("\n");
  return `.${PROBE_CLASS} {\n${declarations}\n}\n`;
}

/**
 * Derive a probe value for a theming var from its declared default. The goal
 * is liveness detection (computed output changes), not semantic correctness:
 * even an invalid value changes the computed result of any property the var
 * feeds, so unparseable defaults still detect a dead channel.
 */
export function varProbeValue(defaultValue) {
  const value = String(defaultValue ?? "").trim();
  if (/^(#|rgb|hsl|oklch|color-mix|light-dark)/i.test(value)) {
    return { value: "rgb(9, 8, 7)", rule: "color-like default → sentinel color" };
  }
  const length = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|ch|s|ms)$/);
  if (length) {
    const bumped = Number(length[1]) + 3;
    return {
      value: `${bumped}${length[2]}`,
      rule: "numeric default → bumped by 3, unit kept",
    };
  }
  return { value: "7px", rule: "unparseable default → 7px (liveness only)" };
}

/**
 * What the gate can check for a component, from its contract. className
 * eligibility for INV-1; declared theming vars for INV-2. Both empty means
 * the component is out of scope, recorded honestly.
 */
export function overrideTargetsFor(contract) {
  const hasClassName = Boolean(contract?.props?.className);
  const vars = (contract?.theming?.vars ?? []).map((entry) => ({
    name: entry.name,
    default: entry.default,
    probe: varProbeValue(entry.default),
  }));
  return { hasClassName, vars };
}

/**
 * Classify one component's in-browser measurement into the artifact record.
 * measurement: {
 *   skip?: string,
 *   classNameForwarded?: boolean,
 *   overrides?: { [prop]: { computed, pass } },
 *   vars?: { [name]: { changed, probeValue } },
 * }
 */
export function componentOverrideRecord(measurement) {
  if (measurement.skip) return { status: "skipped", reason: measurement.skip };
  if (measurement.renderError) {
    // A browser render throw is not an override defect; it gets its own
    // status so it can neither hide in skips nor inflate failures.
    return { status: "render-error", error: measurement.renderError };
  }
  const record = {};
  let failed = false;
  if (measurement.overrides) {
    if (measurement.classNameForwarded === false) {
      record.overrideWins = {
        ok: false,
        error: "className is not forwarded to the rendered root element",
      };
      failed = true;
    } else {
      const props = {};
      for (const [prop, result] of Object.entries(measurement.overrides)) {
        props[prop] = result.pass
          ? { pass: true }
          : { pass: false, computed: result.computed };
        if (!result.pass) failed = true;
      }
      record.overrideWins = { ok: !failed, props };
    }
  }
  if (measurement.vars && Object.keys(measurement.vars).length) {
    const vars = {};
    let varsFailed = false;
    for (const [name, result] of Object.entries(measurement.vars)) {
      vars[name] = result.changed
        ? { pass: true }
        : { pass: false, probeValue: result.probeValue };
      if (!result.changed) varsFailed = true;
    }
    record.themingVars = { ok: !varsFailed, vars };
    if (varsFailed) failed = true;
  }
  record.status = failed ? "fail" : "pass";
  return record;
}

/** Assemble the report substance with sorted keys and honest totals. */
export function assembleOverrideEvidence({
  packageName,
  packageVersion,
  environment,
  components,
}) {
  const sorted = {};
  const totals = {
    pass: 0,
    fail: 0,
    renderError: 0,
    skipped: 0,
    themingVarsDeclared: 0,
  };
  for (const name of Object.keys(components).sort()) {
    const record = components[name];
    sorted[name] = record;
    if (record.status === "skipped") totals.skipped += 1;
    else if (record.status === "render-error") totals.renderError += 1;
    else if (record.status === "fail") totals.fail += 1;
    else totals.pass += 1;
    if (record.themingVars) {
      totals.themingVarsDeclared += Object.keys(record.themingVars.vars).length;
    }
  }
  return {
    package: { name: packageName, version: packageVersion },
    contract:
      "OWNER DECISION 2026-08-07: className-override-wins. A consumer's single-class, no-!important selector applied via className wins over component base styles for the probed properties on the root element, under the documented consumer arrangement (design-system CSS before consumer CSS).",
    environment,
    methodology: {
      probe: `single class .${PROBE_CLASS} with ${PROBE_PROPERTIES.map((p) => p.prop).join(", ")}; sentinel values no token resolves to; probe stylesheet loads after design-system CSS, mirroring the documented consumer import order`,
      rendering:
        "components render from the built dist with the SSR-evidence render plans (contract playground defaults, type-driven function/ref synthesis, descriptor resolution); computed styles read in real Chromium with reduced motion",
      themingVars:
        "each contract-declared theming var is probed for liveness: setting it on a wrapper must change some computed style in the component subtree; zero declared vars is reported honestly, not hidden",
      skips:
        "a skip is a harness limitation (no className prop, no in-flow root such as portals, or an unrenderable plan), recorded with its reason and never counted as component evidence",
    },
    totals,
    components: sorted,
  };
}

/**
 * INV-3 (increment B, informational): formalized hostile-container scan.
 * A hostile container is a component whose stylesheet contains a universal
 * selector (`*` as a compound in any combinator position) — the selector
 * shape behind the #1280 Modal/Switch bug. Containers that also compose
 * consumer children (contract declares `children`) enter the encapsulation
 * matrix; the rest are inventoried as a watchlist.
 *
 * Input: [{ name, cssText, hasChildren }]. CSS comments are stripped before
 * matching so asterisks inside comment blocks never false-positive.
 */
export function hostileContainerScan(components) {
  const results = [];
  for (const { name, cssText, hasChildren } of components) {
    const css = String(cssText ?? "").replace(/\/\*[\s\S]*?\*\//g, "");
    const selectors = [...css.matchAll(/([^{}]+)\{/g)]
      .map((match) => match[1].trim())
      .filter(
        (selector) =>
          !selector.startsWith("@") &&
          /(^|[\s>+~(])\*/.test(selector),
      );
    if (selectors.length) {
      results.push({
        name,
        universalSelectors: [...new Set(selectors)].sort(),
        composesChildren: Boolean(hasChildren),
      });
    }
  }
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Assemble the informational encapsulation section from the scan and the
 * in-browser matrix measurements. Deterministic substance, but NEVER gated:
 * a difference on a pinned property is a fact to interpret (a container may
 * style children by design), not an automatic defect — that judgment is
 * increment C's.
 */
export function assembleEncapsulation({ scan, matrix }) {
  const affected = {};
  let measured = 0;
  let affectedCount = 0;
  const skips = {};
  for (const pair of matrix) {
    if (pair.skip) {
      skips[`${pair.container} × ${pair.child}`] = pair.skip;
      continue;
    }
    measured += 1;
    const diffs = {};
    for (const [prop, diff] of Object.entries(pair.diffs ?? {})) {
      diffs[prop] = diff;
    }
    if (Object.keys(diffs).length) {
      affectedCount += 1;
      affected[pair.container] = affected[pair.container] ?? {};
      affected[pair.container][pair.child] = diffs;
    }
  }
  return {
    note: "informational (increment B): container × child interference on properties the child PINS itself (standalone computed differs from a neutral div), so inherited-by-design values never count. Not gated; graduation to the baseline gate is increment C.",
    scan,
    matrix: {
      pairsMeasured: measured,
      pairsAffected: affectedCount,
      affected: sortObjectDeep(affected),
      skips: sortObject(skips),
    },
  };
}

function sortObject(object) {
  const sorted = {};
  for (const key of Object.keys(object).sort()) sorted[key] = object[key];
  return sorted;
}

function sortObjectDeep(object) {
  const sorted = {};
  for (const key of Object.keys(object).sort()) {
    const value = object[key];
    sorted[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? sortObjectDeep(value)
        : value;
  }
  return sorted;
}

/**
 * Baseline comparison. The baseline lists APPROVED failures as
 * { "<Component>": { note, on } } (agent-experience-baseline precedent:
 * dated, explained, never blanket-updated). Returns failures not covered by
 * the baseline plus baseline entries that no longer fail (to be pruned).
 */
export function compareToBaseline(report, baseline) {
  const approved = baseline?.entries ?? {};
  const newFailures = [];
  for (const [name, record] of Object.entries(report.components)) {
    if (record.status === "fail" && !approved[name]) newFailures.push(name);
  }
  const stale = Object.keys(approved).filter(
    (name) => report.components[name]?.status !== "fail",
  );
  return { newFailures, stale };
}
