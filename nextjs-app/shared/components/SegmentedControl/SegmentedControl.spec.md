# SegmentedControl

## Intent
A compact row of mutually exclusive options with one visibly selected, for
switching a small closed set of views or modes (e.g. list/grid, day/week/month)
inline without opening a menu. It is the single-select counterpart to
`ButtonGroup`, which is a non-exclusive row of actions.

## Interaction contract
- Keyboard: Tab moves focus to the selected segment (roving tabindex — exactly one
  segment is tabbable); Arrow Left/Up and Right/Down move selection to the
  previous/next enabled segment, wrapping; Home/End jump to the first/last enabled
  segment. Disabled segments are skipped.
- Pointer: clicking a segment selects it.
- Controlled only: `value` + `onValueChange` own the selection; the component
  holds no selection state.
- Screen readers: the container is `role=radiogroup` with a required `ariaLabel`;
  each segment is `role=radio` with `aria-checked` reflecting selection.

## Do / don't
- Do: keep to 2–5 short segments; it is a glance-and-switch control, not a menu.
- Do: give a meaningful `ariaLabel` naming what is being switched.
- Don't: use it for actions or navigation that commits/routes — use `ButtonGroup`
  or links. Selecting must only change the bound value.
- Don't: overflow it; if the options do not fit on one line, use `Select`.

## Design notes
- Tokens: track fill from `--color-muted`; segment text `--color-muted` →
  `--color-text` (hover/selected); selected surface `--color-surface` with a
  subtle shadow; focus via `--focus-ring-*`; spacing/radius from `--space-internal-*`
  / `--radius-*`. No hardcoded colors.
- Selection is shown by a raised neutral surface, not a brand fill, so it reads
  consistently across light/dark; forced-colors maps the selected segment to a
  `Highlight` outline. Motion respects `prefers-reduced-motion`.
- Figma: TODO (parity build; no Figma node yet).

## Promotion notes
Parity build (Astryx `Segmented Control`). Ships at alpha with the WIP badge. Do
not promote past alpha/beta without a documented production consumer, AT
snapshots, and forced-colors + light/dark verification.
