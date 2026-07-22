# Visual maturity rubric

Seven craft axes, scored 0–5, anchored to what a top studio does at 5/5. Unlike
`check:astryx-roadmap` (which ratchets machine-measurable structure), visual
maturity is a **design-lead judgment** — this rubric makes the judgment explicit,
comparable, and regression-guarded, not automated.

- **Human source of truth:** this file.
- **Machine state:** [`scripts/design-system/visual-maturity.state.json`](../../scripts/design-system/visual-maturity.state.json)
- **Guard:** `npm run check:visual-maturity` — fails if DT's per-axis or composite score drops below the recorded floor.

## The axes

| Axis | 5/5 anchor | Exemplar |
|------|-----------|----------|
| **Typographic voice** | Type is expression, not just legible — deliberate scale contrast, optical sizing, a display face doing real work | Pentagram, Collins |
| **Compositional tension** | Asymmetry and negative space used on purpose; a grid you can feel, not stacked centered sections | Pentagram |
| **Shape language** | One deliberate corner system applied with total consistency | Stripe, Linear |
| **Elevation & depth** | A physically-coherent light model; shadows read as one source, tuned per theme | Stripe, Linear |
| **Color conviction** | A palette with a point of view; disciplined accent use; color feels chosen | Koto, Collins |
| **Motion vocabulary** | A defined motion language — easing, duration, intent — applied consistently, reduced-motion honest | Koto, Active Theory |
| **Detail finish & states** | Every state considered: focus, disabled, forced-colors, edge cases | Linear, GitHub Primer |

## Current panel (2026-07-23)

Studio rows are homepage-based reference reads, not full audits. DT is scored
against the repo (tokens, components, gates, a11y) plus the live site.

| Subject | Voice | Comp | Shape | Elev | Color | Motion | Detail | **Composite** |
|---------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| **Digitaltableteur** | 2.5 | 2.5 | 4.0 | 3.5 | 3.0 | 3.0 | 4.5 | **3.29** |
| Pentagram | 5.0 | 5.0 | 4.0 | 3.5 | 4.0 | 4.5 | 4.5 | 4.36 |
| Koto | 4.5 | 4.5 | 4.0 | 3.5 | 5.0 | 4.5 | 4.0 | 4.29 |
| Collins | 5.0 | 4.0 | 3.5 | 3.0 | 4.5 | 4.0 | 4.5 | 4.07 |

**Target: 4.0.** DT trails the studio set by ~1.0 composite — and the gap is
entirely on the **expressive** axes (voice, composition, color conviction),
never on shape or detail finish, where DT already matches or leads. That is the
whole strategic read: **DT is system-strong and expression-light.**

## DT per-axis read

| Axis | Score | Evidence |
|------|:----:|----------|
| Typographic voice | 2.5 | Real type scale (`Title`/`Text`), but neutral-utility; no distinctive display treatment. |
| Compositional tension | 2.5 | Solid `Grid`/`FlexBox` primitives; layouts mostly conventional and symmetric. |
| Shape language | 4.0 | Tight radius scale + `check:radius-shadow` gate (#1308). |
| Elevation & depth | 3.5 | New `--shadow-sm/md/lg/xl` ramp, dark + forced-colors aware (#1308). |
| Color conviction | 3.0 | 198 AA-clean semantic tokens, full dark mode — but greys patched per-surface, accent plays safe. |
| Motion vocabulary | 3.0 | Motion is gated + reduced-motion honest, but there is no shared motion-token vocabulary. |
| Detail finish & states | 4.5 | 809 a11y criteria, forced-colors + focus tokens, 122 a11y-snapshot components, 2732 tests. DT's real edge. |

The two axes with a **machine floor** (shape, elevation) are the ones #1308
just moved — `check:radius-shadow` can't score taste but guarantees the
structural baseline a high score needs. The four sub-target axes are craft
calls no gate can rubber-stamp.

## How to (re-)score

1. **Reference board:** render DT's `Button`/`Card`/`Input` beside matched-scale
   competitor screenshots (reuse the `test:visual` + `check:rendered-parity`
   Storybook). The eye catches what the rubric misses.
2. **Score 0–5 per axis**, one sitting, one evidence line each. Score DT against
   the 5/5 anchor; score competitors on their live surfaces.
3. **Record** in `visual-maturity.state.json`.
4. **Ratchet:** after a craft PR raises a DT axis, run
   `npm run check:visual-maturity -- --update` to lift the floor. The guard then
   fails any future silent regression below it.

Re-score quarterly, or after a deliberate typography / motion / color pass —
the axes move slowly, so a changed number should reflect real craft change.

## Caveats

Studio columns name what 5/5 looks like, drawn from established craft reputation
and a current homepage read — not audits of their full sites. DT's scores are a
design-lead baseline to argue with, not a verdict. The instrument's value is the
shared axes and the trend, not the first decimal.
