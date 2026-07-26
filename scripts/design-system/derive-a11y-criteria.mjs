/**
 * Derive DSDS-style accessibility criteria from a component contract's a11y block.
 *
 * The contract records accessibility state as booleans: reviewed, forcedColorsVerified,
 * accessibilityTreeVerified, realBrowserForcedColorsVerified, screenReaderVerified.
 * Each asserts that something was checked. None records *how*, so a claim proven by CI
 * on every push and a claim a human made once in March are the same shape on disk.
 *
 * DSDS's `criterion` type splits those apart with `verificationMode`. This module does
 * the same for our contracts, using the check names already documented in prose in
 * contract.schema.v2.json. The mapping lives here, in one place, rather than in each of
 * the 168 contracts.
 *
 * Deliberate design choice: a requirement that is documented but proven by nothing is
 * emitted as `unverified` rather than omitted. An absent criterion looks like "not
 * applicable"; an `unverified` criterion looks like what it is, which is a gap.
 */

/**
 * Static criteria that apply to every component, gated on contract fields.
 *
 * `when` decides whether the criterion is emitted at all.
 * `mode` decides automated / manual / unverified for the emitted criterion.
 */
// The command that actually proves the browser-run a11y criteria on CI (axe, the
// accessibility tree, keyboard play functions) is the theme matrix run the farm executes
// in .github/workflows/pr-validation.yml. There is no bare `test:stories` script; naming a
// command an agent cannot run is exactly the cold-start dead end this criterion is meant to
// close, so point every derived check at the real script.
const A11Y_MATRIX_CHECK = "npm run test:stories:matrix:ci";

const RULES = [
  {
    id: "axe-no-violations",
    statement: "Required stories produce no axe violations at the configured severity.",
    // Every component is in scope unless it carries a written exemption.
    when: (a11y) => !a11y.axeTestExempt,
    mode: () => ({ verificationMode: "automated", check: A11Y_MATRIX_CHECK }),
  },
  {
    id: "accessibility-tree",
    statement:
      "The accessibility tree (role, name, state) matches the committed snapshot for every required story.",
    when: () => true,
    mode: (a11y) =>
      a11y.accessibilityTreeVerified
        ? { verificationMode: "automated", check: A11Y_MATRIX_CHECK }
        : { verificationMode: "unverified" },
  },
  {
    id: "forced-colors-real-browser",
    statement:
      "The component remains legible and operable under a real browser forced-colors: active pass.",
    when: () => true,
    mode: (a11y) =>
      a11y.realBrowserForcedColorsVerified
        ? { verificationMode: "automated", check: "npm run test:stories:hc" }
        : a11y.forcedColorsVerified
          ? // The Storybook addon simulates forced-colors with CSS injection; that is a
            // human-driven check against a simulation, not the real media query.
            { verificationMode: "manual", note: "Storybook forced-colors addon (simulated, not real browser HC)." }
          : { verificationMode: "unverified" },
  },
  {
    id: "reduced-motion",
    statement: "Positional, scale, and opacity motion is suppressed under prefers-reduced-motion.",
    // Only meaningful for components that actually move.
    when: (a11y) => a11y.motion === true,
    mode: (a11y) =>
      a11y.reducedMotion ? { verificationMode: "manual" } : { verificationMode: "unverified" },
  },
  {
    id: "keyboard-contract",
    statement: "Every documented keyboard interaction works as specified.",
    when: (a11y) => Array.isArray(a11y.keyboard) && a11y.keyboard.length > 0,
    mode: (a11y, contract) => {
      // A play function exercises the keyboard path in CI.
      if (!a11y.playFunctionExempt) {
        return contract.status === "alpha"
          ? { verificationMode: "manual" }
          : { verificationMode: "automated", check: A11Y_MATRIX_CHECK };
      }

      // Exempt, but that alone does not mean unproven. A composition that renders
      // @dt/Tabs does not re-implement roving arrow focus, and a footer of links does
      // not implement Tab. When every documented key is accounted for by a delegation
      // that check:keyboard-delegation has verified, the contract IS covered, just not
      // here. Anything left over is a real gap.
      const delegation = Array.isArray(a11y.keyboardDelegation) ? a11y.keyboardDelegation : [];
      const covered = new Set(delegation.flatMap((d) => d.keys ?? []));
      const uncovered = (a11y.keyboard ?? []).filter((k) => !covered.has(k));

      if (delegation.length === 0 || uncovered.length > 0) {
        return {
          verificationMode: "unverified",
          note: uncovered.length
            ? `Play-function exempt and no delegation covers: ${uncovered.join(", ")}.`
            : `Play-function exempt: ${a11y.playFunctionExempt}`,
        };
      }

      const targets = delegation.map((d) => d.to);
      const evidence = delegation.filter((d) => d.evidence).map((d) => d.evidence);
      return {
        verificationMode: "automated",
        // The check is the delegation gate: it re-proves, on every run, that the named
        // evidence still exercises the delegated keys.
        check: "npm run check:keyboard-delegation",
        note: `Delegated to ${targets.join(", ")}${evidence.length ? ` (${evidence.join(", ")})` : ""}.`,
      };
    },
  },
  {
    id: "aria-requirements",
    statement: "Documented ARIA roles, states, and properties are present on the rendered output.",
    when: (a11y) => Array.isArray(a11y.ariaRequirements) && a11y.ariaRequirements.length > 0,
    mode: (a11y) =>
      a11y.accessibilityTreeVerified
        ? { verificationMode: "automated", check: A11Y_MATRIX_CHECK }
        : { verificationMode: "unverified" },
  },
  {
    id: "screen-reader",
    statement: "Announcements were verified against a real screen reader, beyond the a11y tree.",
    // Aspirational: only emitted where someone actually claims it.
    when: (a11y) => a11y.screenReaderVerified === true,
    mode: (a11y) => ({
      verificationMode: "manual",
      note: a11y.screenReaderNote || undefined,
    }),
  },
  {
    id: "live-region",
    statement: "Dynamic content is announced with the documented live-region politeness.",
    when: (a11y) => a11y.announces != null,
    mode: (a11y) =>
      a11y.accessibilityTreeVerified
        ? { verificationMode: "automated", check: A11Y_MATRIX_CHECK }
        : { verificationMode: "unverified" },
  },
  {
    id: "human-a11y-review",
    statement: "A human completed an end-to-end accessibility review of this component.",
    when: (a11y) => a11y.reviewed === true,
    mode: (a11y) => ({ verificationMode: "manual", note: a11y.reviewedNote || undefined }),
  },
];

/**
 * @param {Record<string, any>} contract A parsed component contract (v2).
 * @returns {Array<{id: string, statement: string, verificationMode: string, check?: string, note?: string}>}
 */
export function deriveA11yCriteria(contract) {
  const a11y = contract?.a11y ?? {};
  const derived = [];

  for (const rule of RULES) {
    if (!rule.when(a11y, contract)) continue;
    const resolved = rule.mode(a11y, contract) ?? { verificationMode: "unverified" };
    const criterion = {
      id: rule.id,
      statement: rule.statement,
      verificationMode: resolved.verificationMode,
    };
    if (resolved.check) criterion.check = resolved.check;
    if (resolved.note) criterion.note = resolved.note;
    derived.push(criterion);
  }

  // Hand-authored criteria in the contract win over a derived one with the same id.
  const authored = Array.isArray(a11y.criteria) ? a11y.criteria : [];
  const authoredIds = new Set(authored.map((c) => c.id));
  return [...authored, ...derived.filter((c) => !authoredIds.has(c.id))];
}

/**
 * Roll criteria up into counts, for gates and reporting.
 * @param {ReturnType<typeof deriveA11yCriteria>} criteria
 */
export function summarizeCriteria(criteria) {
  const summary = { total: criteria.length, automated: 0, manual: 0, unverified: 0 };
  for (const c of criteria) {
    if (c.verificationMode in summary) summary[c.verificationMode] += 1;
  }
  return summary;
}
