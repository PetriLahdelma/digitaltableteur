# Badge

## Intent
Carry a compact piece of status or category meaning. Badge is the display atom
for "one short label, optionally coloured by tone, and sometimes removable."
Two orthogonal axes: `variant` (visual weight — filled vs outlined) and `tone`
(semantic colour — neutral / error / warning / success / info).

## Interaction contract
- Keyboard: none on the badge itself; the embedded remove button (when
  `removable`) is a real Button (Enter / Space activate it, with press feedback).
- Pointer: hover on the remove button shows a tonal highlight; click dismisses
  and calls `onRemove`.
- Screen readers: silent by default. With `role="status"` the badge becomes a
  polite live region and announces text changes.

## Do / don't
- Do: use `variant="primary"` for filled, emphasis-bearing tags and
  `"secondary"` for outlined/tonal tags (categories, filters).
- Do: set `tone` for semantic colour; a matching icon is supplied automatically
  for non-neutral tones.
- Do: pass `role="status"` only when the content actually changes at runtime.
- Don't: rely on colour alone to convey tone — pair it with the icon or include
  the state word in the text.
- Don't: nest a Button inside a Badge beyond the built-in removable affordance.

## Design notes
- Colour: filled (`variant="primary"`) tones fill with `--color-success` /
  `--color-info` / `--color-error` / `--color-warning-contrast` (or
  `--color-neutral-bg`) and white text; outlined (`secondary`) tones apply the
  same colour to border and text over a transparent background.
- Size: `sm | md | lg` adjust padding and font-size; pill radius (999px) by
  default, squared via `square`.
- Motion: the badge is static; the removable close button inherits Button's
  tokenized press feedback plus a tonal hover, suppressed under
  `prefers-reduced-motion`.
- Translation: the remove button label is `t("badgeRemove")` (EN / FI / SV).
