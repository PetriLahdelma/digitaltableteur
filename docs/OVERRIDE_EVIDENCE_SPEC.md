# Override-precedence evidence (Phase 4, next increment)

Status: **increments A and B implemented** (`npm run audit:override-evidence`).
Owner decisions recorded: className-override-wins IS the contract (2026-08-07,
open question 1 resolved); root-only probing for A; probe set v1 as specced.

Increment B ships INV-3 informationally: the formalized universal-selector
scan (3 package exports today: Menu composes children; ProcessBlock and
ToastStack are watchlist-only) and the container × child matrix with a
pinned-property discriminator — a child participates only for properties
whose standalone computed value differs from a neutral div in the same
context, so inherited-by-design values never register as interference.
Current artifact: Menu × 23 children, 0 affected. A `--containers` debug
flag exercises the machinery against any renderable export.

Increment C remains open: graduate INV-3 to the baseline gate, compose
children inside semantic sub-slots (e.g. Menu items) rather than only as
direct children, and extend the probe set.

## Why

StyleX guarantees "the last style applied always wins" at compile time. DT
cannot and should not adopt StyleX (CSS Modules are a repo non-negotiable),
but the guarantee itself is worth having as a *verified invariant*, which is
the repo's whole thesis: claims about components carry machine-checked
evidence.

DT has shipped two bugs in exactly this class, both currently documented only
as memory gotchas:

1. **Modal descendant reset vs Switch** (fixed #1280): a container's
   descendant reset outranked a child component's own classes, producing
   transparent Switch knobs inside modals. Fixed by scoping the reset to
   direct children; nothing prevents the next container from reintroducing
   the pattern. 47 component stylesheets currently contain descendant or
   universal selectors.
2. **Title/Text base beats override classes at equal specificity**: a
   consumer's single-class override loses to the typography base class when
   specificity ties and source order favors the base. Documented as a
   gotcha; not machine-enforced.

The gate turns both into red-gate regressions.

## Invariants

### INV-1: consumer override wins (increment A)

For every exported component that declares a `className` prop (125 of 179
contracts), a consumer's **single-class, no-`!important`** selector applied
via `className` must win over the component's base styles for each probed
property on the component's root element.

This encodes bug class 2. It is exactly what a consumer does when they write
`<Title className={styles.tight} />` expecting their margin to apply.

### INV-2: declared theming vars take effect (increment A)

For every contract with `theming.vars`, setting each declared `--var` on a
wrapper element must change the component's rendered computed style relative
to the default render. The contract documents the var as the sanctioned
override channel; this proves the channel is live, the same move Phase 4 made
for SSR claims.

Assertion is change-detection (computed output differs from baseline render),
not value-equality, because a var may feed derived values (e.g.
`calc`, `color-mix`).

### INV-3: encapsulation survives DS ancestors (increment B, informational first)

Each component keeps its probed computed styles when composed inside DS
container components whose stylesheets contain descendant or universal
selectors (the scan above). This encodes bug class 1 (Modal × Switch).

Pure-CSS caveat: when an ancestor's descendant selector ties on specificity
with a child's class, stylesheet order decides, and no convention can
guarantee the outcome. That is precisely why this is evidence rather than a
lint rule: the probe detects the regression the moment it exists. Increment B
ships this as informational; it graduates to gating once the container ×
child matrix and runtime cost are known.

## Measurement architecture

**Package-honest, browser-real.** The gate measures the built dist (JS and
per-entry CSS), not app source, in a real Chromium via `@playwright/test`
(already a dependency; jsdom is unsuitable because its `getComputedStyle`
does not apply stylesheet rules).

Render plans are **reused from the SSR evidence harness**
(`ssr-evidence-lib.mjs`): contract playground defaults, type-driven
function/ref synthesis, `{ __element }` descriptor resolution. One source of
truth for "how do we render component X from its contract" across all Phase 4
evidence.

Mechanics:

1. `measure-override-evidence.mjs` esbuild-bundles a harness entry that
   imports all dist entries plus react/react-dom from the repo's installed
   versions, and serves a static page linking every `dist/<entry>.css` plus a
   generated probe stylesheet.
2. Playwright loads the page. For each component the harness:
   - renders the base plan, records computed values of the probe set on the
     root element;
   - re-renders with `className` extended by the probe class, asserts each
     probed property computes to its sentinel (INV-1);
   - re-renders inside a wrapper carrying each declared theming var with a
     probe value, asserts computed output changed (INV-2).
3. Results cross back via a page global; the node side assembles the
   artifact.

### Probe set (v1)

Sourced from the two shipped bug classes, deliberately small and extendable:

| Property | Sentinel | Bug class |
|---|---|---|
| `color` | `rgb(9, 8, 7)` | Modal/Switch ink |
| `margin-block-start` | `7px` | Title/Text spacing |
| `background-color` | `rgb(7, 8, 9)` | Modal/Switch surface |

Sentinels are valid, visually meaningless values that no token resolves to,
so `computed === sentinel` is unambiguous. The probe class is a single class
selector with no `!important`; winning must come from honest precedence.

## Artifact

`public/ds-health/override-evidence.json`, following the established
evidence conventions:

- shared provenance stamp (`evidence-stamp-lib.mjs`), substance-stable
  reruns; Chromium and Playwright versions recorded in provenance since
  computed styles depend on them;
- deterministic substance: per component `{ overrideWins: { <prop>:
  pass/fail }, themingVars: { <var>: pass/fail }, status }` plus recorded
  skips (`no className prop`, `no theming.vars`, and the SSR harness's
  render-plan skips carried through);
- totals block for at-a-glance reading.

## Gate semantics

- **Baseline, not raw count.** First run will likely find pre-existing
  failures. Known failures live in an explicit
  `override-evidence-baseline.json` listing component × property pairs with
  dated `note` fields, per the agent-experience-baseline precedent (never
  blanket-update; each entry is an approved, explained debt). The gate exits
  2 on any failure **not** in the baseline. Baseline entries are burn-down
  chips.
- **Placement:** per-publish, inside `check:react-publish-preflight`
  directly after `ssr-evidence` (dist is fresh; render plans identical).
  Standalone: `npm run audit:override-evidence` with the same `--build`
  escape as the other dist measurers.
- Not in `release:gate` (browser cost, dist dependency), same reasoning as
  the other Phase 4 artifacts.

## Increments

- **A** (next PR): INV-1 + INV-2, artifact, baseline, preflight wiring,
  lib + tests following the ssr-evidence file layout
  (`override-evidence-lib.mjs`, `measure-override-evidence.mjs`, Playwright
  runner).
- **B**: INV-3 informational: container scan (descendant/universal selector
  grep formalized), container × child probe matrix, results in the artifact
  without gating.
- **C**: graduate INV-3 to the baseline gate; consider extending the probe
  set (gap, font-size) once A has run across a few publishes.

## Open questions for the owner

1. **Is `className`-override-wins actually the contract?** INV-1 asserts it
   is. The alternative position, "only `theming.vars` are sanctioned;
   className overrides are best-effort", would invert INV-1 into evidence
   *against* relying on className. The gate mechanics are identical; the
   baseline semantics flip. Spec assumes override-wins because that is what
   the two shipped bugs treated as broken behavior.
2. **Root element only, or deep probe?** v1 probes the root (where className
   lands). The Modal/Switch bug was about descendants, covered by INV-3 in
   increment B, so root-only for A seems right.
3. Probe set additions beyond the three v1 properties?
