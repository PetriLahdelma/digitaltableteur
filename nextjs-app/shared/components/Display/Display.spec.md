# Display

## Intent
Provide a marketing-scale heading distinct from `Title`. Used for landing-page heroes where the visual hierarchy starts with a single, dominant phrase.

## Interaction contract
- Keyboard: None — heading is non-interactive.
- Pointer: None.
- Screen readers: Announced as a heading at the level chosen via `as` (defaults to h1). Ensure `as` reflects the document outline.

## Do / don't
- Do: Reach for `Display` on hero bands and landing-page titles.
- Do: Pair with `Text` for the supporting paragraph below.
- Don't: Use `Display` for in-page section headings — that is `Title`.
- Don't: Stack two `Display` headings in the same viewport — the marketing visual collapses.

## Design notes
- Colors: --color-text
- Typography: --font-display, --font-size-display, --font-weight-bold, --line-height-tight
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
