# BlogMediaImage

## Intent
Blog-optimized responsive image: renders raster sources through next/image and SVG sources as a plain img, with fill, cover/contain fit and a fluid full-bleed mode.

## Interaction contract
- Keyboard: none (non-interactive image)
- Pointer: none (wrap in a link if the image should be actionable)
- Screen readers: exposes the required `alt` text; pass an empty `alt` for decorative images

## Do / don't
- Do: pass meaningful `alt`; choose `fit` (contain for diagrams, cover for photos)
- Do: use `fill` inside a positioned container, or `fluid` for full-bleed prose images
- Don't: invent parallel primitives inside this folder
- Don't: use a raw `<img>` in article bodies — this handles SVG, external and sizing concerns

## Design notes
- Tokens: none of its own; sizing driven by width/height/fill/fluid props
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1036-109
