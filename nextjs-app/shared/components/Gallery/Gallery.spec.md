# Gallery

## Intent
Show a grid of images that the reader can dwell on or expand. Hover motion is decorative; the lightbox is the primary affordance.

## Interaction contract
- Keyboard: Tab between items; Enter / Space opens; Esc closes the lightbox.
- Pointer: Click an item to open the lightbox; click outside or on close to dismiss.
- Screen readers: Each item announces as 'button, {alt text}, image'. Lightbox opens as a modal; the source image alt becomes the dialog name.

## Do / don't
- Do: Use for work-detail / case-study image rows where the image is the content.
- Do: Provide real `alt` text on each image; it doubles as the lightbox's accessible name.
- Don't: Use as a navigation surface — gallery items are not links.
- Don't: Auto-open the lightbox on mount — confine motion to explicit user actions.

## Design notes
- Colors: --color-text, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12
- Radii: --radius-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
