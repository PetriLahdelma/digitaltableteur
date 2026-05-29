# AspectRatio

## Intent
Reserve layout space at a fixed aspect ratio so the page does not jump when the contained media (image, video, embed, illustration) loads. The wrapper is unopinionated about what sits inside.

## Interaction contract
- Keyboard: None — the wrapper is non-interactive.
- Pointer: Click events pass through to children.
- Screen readers: Wrapper is silent. Announcements come from the contained element (alt text on an img, figcaption on a figure, etc.).

## Do / don't
- Do: Wrap a single media-shaped child (img, video, iframe, illustration).
- Do: Use the canonical ratios (16:9 for video, 1:1 for square thumbs) so the catalog stays small.
- Don't: Use this as a generic flex/grid item — pick a layout primitive instead.
- Don't: Add padding or margin via className — children will overlap their own padding because the wrapper is `position: relative`.

## Design notes
- No own tokens (inherits from container).
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
