# ProjectGallery

## Intent
Responsive case-study image gallery: a labelled grid of figures where each thumbnail opens a shared lightbox.

## Interaction contract
- Keyboard: each thumbnail is a button; Enter/Space opens the lightbox
- Pointer: click a thumbnail to open it fullscreen (when the lightbox is enabled)
- Screen readers: grid is `role="list"` labelled "Project gallery"; each image is a listitem figure with a fullscreen-action button name
- Reduced motion: the GSAP scroll-stagger is skipped when prefers-reduced-motion is set

## Do / don't
- Do: pass `images` with width/height; tune `columns`, `gap` and `aspectRatio` per surface
- Do: set `enableLightbox={false}` for static, non-interactive figure grids
- Don't: invent parallel primitives inside this folder
- Don't: use this for decorative marquees — it is for case-study imagery

## Design notes
- Tokens: Tailwind grid utilities mapped to theme spacing; thumbnails use rounded-lg
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1032-110
