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
 *
 * Phase 1 (prove-a11y): the browser-run criteria (axe, the accessibility tree, forced
 * colors) are resolved from FRESH evidence records under the component's
 * __a11y-evidence__/ dir, not from the hand-set booleans above. `automated` now means
 * "a real browser proved this at a commit the source has not moved past". Booleans remain
 * the fallback only where no evidence check exists yet (keyboard, reduced-motion,
 * screen-reader, human review). Callers pass `{ componentDir }`; without it there is no
 * evidence and the browser-run criteria report `unverified`.
 */
import { evidenceCheckVerdicts } from "./a11y-evidence-lib.mjs";

// The command that proves the browser-run a11y criteria on CI (axe, the accessibility
// tree, keyboard play functions) is the theme matrix run the farm executes in
// .github/workflows/pr-validation.yml. There is no bare `test:stories` script; naming a
// command an agent cannot run is exactly the cold-start dead end this criterion closes,
// so point every derived check at a real script.
const A11Y_MATRIX_CHECK = "npm run test:stories:matrix:ci";

/**
 * Resolve a browser-run criterion from FRESH evidence rather than a hand-set boolean:
 * `automated` only when a fresh run passed and none failed. A failing fresh run, or no
 * evidence at all, is `unverified` (honestly) — with an optional `fallback` for criteria
 * that still carry a non-evidence signal, and a `check` override for the re-prove command.
 *
 * @param {{ verdicts: Record<string, { pass: number, fail: number }> }} ctx
 * @param {string} checkId
 * @param {{ check?: string, fallback?: () => object }} [opts]
 */
function evidenceBackedMode(ctx, checkId, opts = {}) {
  const check = opts.check ?? A11Y_MATRIX_CHECK;
  const v = ctx.verdicts[checkId];
  if (v && v.fail === 0 && v.pass > 0) {
    return { verificationMode: "automated", check };
  }
  if (v && v.fail > 0) {
    return {
      verificationMode: "unverified",
      note: `Latest a11y evidence for '${checkId}' is failing; re-run ${check}.`,
    };
  }
  if (opts.fallback) return opts.fallback();
  return {
    verificationMode: "unverified",
    note: `No fresh a11y evidence for '${checkId}'; run ${check} to capture.`,
  };
}

/**
 * Static criteria that apply to every component, gated on contract fields.
 *
 * `when` decides whether the criterion is emitted at all.
 * `mode(a11y, contract, ctx)` decides automated / manual / unverified. `ctx.verdicts`
 * holds the component's fresh evidence tally, keyed by check id.
 */
const RULES = [
  {
    id: "axe-no-violations",
    statement: "Required stories produce no axe violations at the configured severity.",
    // Every component is in scope unless it carries a written exemption.
    when: (a11y) => !a11y.axeTestExempt,
    mode: (_a11y, _contract, ctx) => evidenceBackedMode(ctx, "axe-no-violations"),
  },
  {
    id: "accessibility-tree",
    statement:
      "The accessibility tree (role, name, state) matches the committed snapshot for every required story.",
    when: () => true,
    mode: (_a11y, _contract, ctx) => evidenceBackedMode(ctx, "accessibility-tree"),
  },
  {
    id: "forced-colors-real-browser",
    statement:
      "The component remains legible and operable under a real browser forced-colors: active pass.",
    when: () => true,
    mode: (a11y, _contract, ctx) =>
      evidenceBackedMode(ctx, "forced-colors-real-browser", {
        check: "npm run test:stories:hc",
        fallback: () =>
          a11y.forcedColorsVerified
            ? // The Storybook addon simulates forced-colors with CSS injection; that is a
              // human-driven check against a simulation, not the real media query.
              {
                verificationMode: "manual",
                note: "Storybook forced-colors addon (simulated, not real browser HC).",
              }
            : { verificationMode: "unverified" },
      }),
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
      // A play function exercises the keyboard path in CI. (No evidence check emits a
      // per-key result yet, so this stays on the run-based signal.)
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
    // Proven by the same accessibility-tree capture that records role/name/state.
    mode: (_a11y, _contract, ctx) => evidenceBackedMode(ctx, "accessibility-tree"),
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
    // The live region's role/politeness is part of the captured accessibility tree.
    mode: (_a11y, _contract, ctx) => evidenceBackedMode(ctx, "accessibility-tree"),
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
 * @param {{ componentDir?: string, now?: number, staleDays?: number }} [options]
 *   `componentDir` enables evidence-backed resolution (reads __a11y-evidence__/).
 * @returns {Array<{id: string, statement: string, verificationMode: string, check?: string, note?: string}>}
 */
export function deriveA11yCriteria(contract, options = {}) {
  const a11y = contract?.a11y ?? {};
  const ctx = {
    verdicts: options.componentDir
      ? evidenceCheckVerdicts(options.componentDir, options)
      : {},
  };
  const derived = [];

  for (const rule of RULES) {
    if (!rule.when(a11y, contract)) continue;
    const resolved = rule.mode(a11y, contract, ctx) ?? { verificationMode: "unverified" };
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
