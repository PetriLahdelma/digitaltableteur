# Spinner

## Intent
The smallest loading primitive: a bare indeterminate ring for short waits
of unknown duration. One decision rule across the loading family:
Spinner for sub-second unknown waits, Progress for measurable or long
work, Skeleton for placeholder layouts. (BusyIndicator was deleted in
Astryx batch 4, 2026-07-03 — it duplicated this atom with off-convention
s/m/l sizes and a Progress-overlapping determinate mode.)

## Interaction contract
- Keyboard: not focusable; purely presentational chrome with a status role.
- Pointer: no pointer interactions.
- Screen readers: `role="status"` with `aria-label` from the `label`
  prop (fallback "Loading"). Name the actual wait ("Validating
  password"), not the mechanism.

## Do / don't
- Do: pick `sm` inside inputs/buttons, `md` standalone, `lg` for regions.
- Do: compose a visible, `aria-hidden` text label when sighted users
  need the word (AppLoading pattern).
- Don't: leave a spinner as the end state — resolve to an outcome.
- Don't: bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: track uses `--color-border`, the moving terminal
  `--color-primary`; rotation duration `--duration-slow`.
- Reduced motion: the rotation slows (never freezes) so "still working"
  stays perceivable.
- Figma: linked from the component contract `figma` URL.
