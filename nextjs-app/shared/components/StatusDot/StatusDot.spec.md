# StatusDot

## Intent
The smallest status signal: a semantic colored dot paired with a label.
Complements Badge (which carries a filled chip surface) for dense lines,
list rows, nav items, and dashboards where a chip is too heavy.

## Interaction contract
- Static, non-interactive.
- Screen readers: the dot is `aria-hidden`; meaning always comes from the
  visible children or the sr-only `label`. Color is never the only carrier.

## Do / don't
- Do: always provide `children` (visible) or `label` (sr-only).
- Do: use `pulse` only for genuinely live/ongoing states.
- Don't: use StatusDot for counts or removable chips — Badge owns those.
- Don't: rely on the color alone to convey state.

## Design notes
- Tone colors come straight from the semantic tokens (`--color-success`,
  `--color-warning`, `--color-error`, `--color-info`, `--color-muted`),
  which already remap under dark/HCB/HCW themes and forced colors.
- The dot is sized in `em` (0.5em) so it tracks the size token's font-size.
- Pulse ring uses `color-mix` on `currentcolor`; disabled under
  `prefers-reduced-motion`.
