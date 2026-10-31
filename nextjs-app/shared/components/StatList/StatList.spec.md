# StatList

## Intent
Show a few key figures with what each one counts, so a reader can take in the
numbers at a glance and still hear them in order with a screen reader.

## Interaction contract
- Keyboard: not interactive.
- Pointer: not interactive.
- Screen readers: a description list; each label is read, then its figure,
  then the note. The figure is drawn first with CSS order only.

## Do / don't
- Do: keep labels short and concrete, and put the source or date in the note.
- Do: pass `of` for a figure out of a total instead of writing "191/208".
- Don't: animate figures counting up; the figure is the content, not a decoration.
- Don't: put more than a short qualifier in the note; long explanations belong in the text around the list.
- Don't: use it for tables of several values per row; use Table.

## Design notes
- Tokens: --font-size-title-s and -m for figures, --color-border hairlines
  (rule) or --color-surface tiles (card), --space-layout-24/32 gaps.
- Figures use the regular-weight display face, as on the site's display lines.
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=2066-359 (Variant x Size x Align; items are the `StatList/Item` part).
