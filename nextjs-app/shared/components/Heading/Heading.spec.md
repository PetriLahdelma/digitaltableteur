# Heading

## Intent
Decouple heading level from visual size — let pages have a sensible outline (single h1, h2 sections) without forcing every visual to inherit the level's default size.

## Interaction contract
- Keyboard: None.
- Pointer: None.
- Screen readers: Announced as a heading at `level`. Screen-reader users navigate by headings; the document outline only works if `level` is honest.

## Do / don't
- Do: Pick `level` from the page outline you would expect a screen reader to navigate.
- Do: Pick `size` from the visual design language — the two are independent.
- Don't: Skip levels for visual effect (h1 → h3) — screen-reader navigation breaks.
- Don't: Use the same level twice for the same scope when one is a subheading of the other.

## Design notes
- Colors: --color-text
- Typography: --font-display, --font-size-display, --font-size-xl, --font-size-lg, --font-size-md, --font-size-sm, --line-height-tight
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
