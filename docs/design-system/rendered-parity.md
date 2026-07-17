# Rendered parity: React as the visual source of truth

The native web components must look and behave exactly like their React
counterparts. Story-name parity, contracts, and jsdom tests verify
*declarations*; none of them look at rendering, which is how visual drift
(menu row highlights, empty-state icon sizes, clipped panels) reached
production repeatedly. This document defines the program that closes that
gap. Owner-specified, 2026-07-17.

## The two causes of drift

1. **Manual CSS duplication.** Native styles are hand-transcribed from React
   CSS Modules into shadow-DOM template literals. Property-level fidelity is
   usually high; drift comes from *context* the transcription cannot carry
   (wrapper display modes changing flex sizing, shadow boundaries breaking
   outside-in sizing, `position: fixed` under transformed ancestors,
   attributes arriving post-connect) and from unrequested "improvements".
2. **No rendered comparison.** Nothing held the output against the React
   benchmark, so every gate could pass while the components looked wrong.

## The program

| # | Measure | Status |
|---|---------|--------|
| 1 | **Framework-neutral recipes.** Extract tokens, part styles, states, dimensions, and responsive rules per component; *generate* both the React CSS Module and the shadow-DOM stylesheet from the recipe instead of transcribing. Eliminates duplication at the source. | Planned — largest work item; needs its own design (recipe schema, generator, migration order). Until then the parity gate below contains the damage. |
| 2 | **Explicit story pairing.** Every native story identifies its React counterpart and uses identical args, content, viewport, theme, locale, and state. | Active — pairing is by identical story name within the canonical folder (`storyParity` equivalents/exclusions cover renames); content alignment is part of each component's audit (#8). |
| 3 | **Screenshot comparison.** Playwright renders each pair and pixel-diffs across desktop + mobile, light/dark/forced-colors. | **Shipped** — `check:rendered-parity` matrix: Default (desktop-light) + Example (desktop-light, mobile-light, desktop-dark, desktop-forced-colors). State matrix (hover/focus/disabled/error/loading/open) extends per-component during audits. |
| 4 | **Geometry assertions.** Content bounding boxes compared with px/% tolerances; catches structural drift pixels miss (first catch: native Menu panel 10 px wider than React). Spacing/typography/per-part boxes extend during audits. | **Shipped** (content-box level). |
| 5 | **Interaction parity.** The same keyboard/pointer scripts run against both implementations; resulting state and accessibility trees compared. | Planned — builds on the existing farm aria-snapshot machinery; needs paired capture plumbing. |
| 6 | **Documented exceptions only.** Intentional divergence needs a narrow, reviewed exception (component/story/mode + measured ratio + concrete reason) in `scripts/design-system/rendered-parity.roster.mjs`. No blanket thresholds, no automatic baseline acceptance; stale exceptions fail the gate. | **Shipped.** |
| 7 | **Honest metrics.** Separate scores: API parity (`check:react-public-api`, contracts), story coverage (`web-component-story-parity`), behavioral parity (#5), accessibility parity (aria snapshots + #5), visual parity + geometry parity (`check:rendered-parity` report). "100 % parity" may only be claimed when every dimension passes. | Partially shipped — visual + geometry scores reported in `.omx/state/design-system/rendered-parity/latest.json`; a combined scorecard lands with #5. |
| 8 | **Incremental fleet audit.** Fix each React/native pair, establish its approved comparison, then ratchet: `--update-roster` enrols clean components into enforcement; enforcement is never removed. Priority order: overlays, menus, forms, navigation, icon-heavy components. | Active — roster seeded from the first full sweep. |
| 9 | **Stability gate.** A web component stays `beta` until its paired visual and interaction tests pass; production consumption remains an additional requirement for `stable`. | Planned — wire roster membership into the lifecycle/promotion checks once the initial audit wave lands. |

## Running the gate

```bash
npm run check:rendered-parity            # against a running Storybook (6010)
npm run check:rendered-parity:ci         # boots Storybook itself
node scripts/design-system/check-rendered-parity.mjs --component=Menu
node scripts/design-system/check-rendered-parity.mjs --update-roster
```

- Failures write `<pair>-react.png` / `<pair>-native.png` / `<pair>-diff.png`
  into `.omx/state/design-system/rendered-parity/` for inspection.
- `check:web-components:dod` runs the gate after the story checks on the same
  Storybook boot.
- Determinism: fixed viewports, `reducedMotion: reduce`, animations disabled,
  fonts awaited, play-function completion awaited (`storyFinished`), residual
  focus blurred, WIP-badge chrome hidden, content-box cropping so
  story-layout offsets don't count against component fidelity.

## Audit workflow (per component)

1. `check:rendered-parity --component=X` — read the diff artifacts.
2. Align the native story to the canonical args/content, then fix the
   component where the difference is real drift (React is the source of
   truth; native-side "improvements" are drift unless the owner approves
   them, in which case they belong in React too).
3. Intentional divergence → narrow exception with reason in the roster file.
4. `--update-roster` to enrol; commit the roster change with the fix.
