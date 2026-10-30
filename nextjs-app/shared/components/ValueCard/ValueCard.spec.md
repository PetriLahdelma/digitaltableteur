# ValueCard

## Intent
Stable visual for the 'values', 'principles', and 'what we believe' grid layouts. Slot order is icon → title → description so the grid scans visually before reading.

## Interaction contract
- Keyboard: None — `ValueCard` is non-interactive.
- Pointer: Hover on `elevated` raises the card; the card body has no click target.
- Screen readers: Announced as 'article, {title}' followed by the body text.

## Do / don't
- Do: Use in 3 / 4 / 6-column grids on about / values / methodology pages.
- Do: Keep titles to ≤ 4 words for a clean grid rhythm.
- Don't: Use for content with a primary CTA — that is `ServiceCard` or `Card`.
- Don't: Mix `ValueCard` with `Card` in the same grid row — the rhythm desyncs.

## Design notes
- Colors: --color-text, --color-text-muted, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12, --space-internal-16
- Radii: --radius-md
- Figma: [ValueCard](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1431-2190) (node 1431:2190)
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
