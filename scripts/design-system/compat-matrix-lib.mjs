/**
 * Helpers for the React peer-range compatibility matrix
 * (Astryx-gap Phase 4). Companion to measure-compat-matrix.mjs.
 *
 * The declared peer range (react >=19.0.0) is a compatibility CLAIM; the
 * compatibility manifest records that only one resolved version backs it.
 * The matrix exercises the claim at its ENDPOINTS: the declared floor and
 * the currently resolved version, each in an isolated consumer install
 * running the SSR render-plan smoke over every renderable export.
 *
 * Gate invariant — combo equivalence: the set of SSR outcomes must be
 * IDENTICAL across combos. A component that fails at the floor but passes
 * at current (or vice versa) means the declared range is a lie, and the
 * gate exits 2. The two provider-required errors (CookieConsent, Tooltip)
 * appear in every combo and therefore never diverge.
 *
 * Scope note recorded in the artifact: next is an app dependency, not a
 * package peer — its single exercised version is app evidence in the
 * compatibility manifest, and pretending otherwise would be theater.
 */

/** Parse the floor version out of a ">=X.Y.Z"-style peer range. */
export function rangeFloor(range) {
  const match = String(range ?? "").match(/^>=\s*(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * Build the combo list from the package's declared react peer range and the
 * repo's resolved versions. Only the react dimension varies in v1; the
 * other peers ride at their resolved versions in every combo (recorded, so
 * the artifact never overclaims).
 */
export function buildCombos({ declaredReactRange, resolved }) {
  const floor = rangeFloor(declaredReactRange);
  const combos = [];
  if (floor && floor !== resolved.react) {
    combos.push({ label: `react-floor-${floor}`, react: floor });
  }
  combos.push({ label: `react-current-${resolved.react}`, react: resolved.react });
  return combos.map((combo) => ({
    ...combo,
    reactDom: combo.react,
    framerMotion: resolved.framerMotion,
    reactMarkdown: resolved.reactMarkdown,
  }));
}

/**
 * Compare SSR outcomes across combos. outcomesByCombo:
 * { [label]: { [component]: "pass" | "skip" | <error string> } }.
 * Returns component names whose outcome differs between any two combos.
 */
export function comboDivergence(outcomesByCombo) {
  const labels = Object.keys(outcomesByCombo);
  if (labels.length < 2) return [];
  const [first, ...rest] = labels;
  const diverged = new Set();
  const names = new Set(labels.flatMap((l) => Object.keys(outcomesByCombo[l])));
  for (const name of names) {
    const reference = outcomesByCombo[first][name];
    for (const label of rest) {
      if (outcomesByCombo[label][name] !== reference) diverged.add(name);
    }
  }
  return [...diverged].sort();
}

/** Assemble the artifact substance with sorted keys and honest totals. */
export function assembleCompatMatrix({
  packageName,
  packageVersion,
  declaredReactRange,
  combos,
  divergence,
}) {
  const sortedCombos = combos.map((combo) => ({
    ...combo,
    outcomes: Object.fromEntries(
      Object.keys(combo.outcomes)
        .sort()
        .map((name) => [name, combo.outcomes[name]]),
    ),
  }));
  return {
    package: { name: packageName, version: packageVersion },
    dimensions: {
      react: {
        declaredRange: declaredReactRange,
        combosExercised: combos.map((c) => c.react),
        note: "range endpoints: declared floor + resolved current; versions between the endpoints remain untested claims",
      },
      next: {
        note: "next is an app dependency, not a package peer; its single exercised version is app evidence recorded in the compatibility manifest",
      },
    },
    methodology: {
      isolation:
        "each combo installs the packed tarball plus pinned react/react-dom and resolved peers into a fresh consumer directory (ignore-scripts, no lockfile) and runs the SSR render-plan smoke with THAT consumer's React",
      smoke:
        "renderToString of every renderable export using the shared render plans (playground defaults, type-driven synthesis, descriptor resolution); outcome per component is pass, skip, or the error's first line",
      gate:
        "combo equivalence: outcome sets must be identical across combos; a divergence means the declared peer range is broken and the gate exits 2",
    },
    totals: {
      combos: combos.length,
      divergence: divergence.length,
    },
    divergence,
    combos: sortedCombos,
  };
}
