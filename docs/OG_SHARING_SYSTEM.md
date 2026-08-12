# OG Sharing Image System

Postcard-derived social sharing images (2026-08 refresh). Every shareable URL
resolves to either a pre-rendered brand composite or the shared postcard
template, both built from the printed promotional postcard photography.

## Visual system

Source material: the A6 promotional postcards (moss DX marks on white, chrome
DX marks on black, owner-produced). The print PDFs embed each photographic
mark with an alpha mask; the extracted transparent PNGs live in
`public/images/brand/postcard/` (`moss-{tl,tr,bl,br}.png`,
`chrome-{tl,tr,bl,br}.png`, 1024px source scale).

Shared grammar across all surfaces: JetBrains Mono ExtraBold, postcard black
`#050505` or white, brand lime `#DFFF00` accents, corner label vocabulary
(`EST 09 HKI FI`, `UX UI`), marks bleeding past the canvas edge.

## Surface mapping

| Surface | Kind | Composition |
|---|---|---|
| `/` + `twitter-image` | static | chrome hero, lime `& AI` |
| `/about` | static | moss hero, blue butterfly |
| `/contact` | static | moss grid, email footer |
| `/work` | static | chrome grid, corner labels |
| `/blog` | static | hybrid moss/chrome split |
| everything else | dynamic | postcard template (below) |

## Static composites

Authored as fixed 1200x630 HTML in `scripts/og/mocks/*.html`, rendered by:

```bash
node scripts/og/render-og-images.mjs
```

The script screenshots each mock with Playwright at 2x, downsamples to
1200x630 JPEG (mozjpeg q88), and writes straight into the app router as
`opengraph-image.jpg` / `twitter-image.jpg` (Next.js static file metadata
convention, with `.alt.txt` siblings). Needs network for Google Fonts.
Rerun only when a mock or a source mark changes, then commit the JPEGs.

## Dynamic template

`generatePostcardOgImage({ title, tag, meta })` in
`app/lib/og-image-utils.tsx`: black canvas, lime section tag top-left,
`digitaltableteur.com` top-right, ExtraBold title, dimmed meta segments
bottom-left (accent flag renders white), chrome mark rotated 6deg bleeding
from the bottom-right corner. The mark ships as a palette-quantized base64
data URL (`app/lib/og-postcard-mark.ts`, ~59KB) so edge functions fetch no
assets at runtime; the only runtime fetch is the JetBrains Mono 800 TTF.

Wrappers preserved for existing call sites:

- `generatePageOgImage({ title, subtitle, tag })` - static-content pages and
  pSEO routes; subtitle becomes the meta line
- `generateBlogOgImage({ title, author, date, readTime })` - tag `BLOG`
- `generateWorkOgImage({ title, category, tags })` - tag `WORK`; case-study
  routes go through `app/work/workOgImage.ts`, which pulls title and tags
  from `nextjs-app/shared/data/projects.ts` by slug and falls back to the
  passed title for standalone studies (intrum, tulli, raw-view)

## Gotchas

- The old shared `MONO_FONT_URL` (v18 `...yKxjPVmUsaaDhw.ttf`) is the
  400-weight file even though call sites declared `weight: 800`; satori does
  not synthesize bold, so those OGs rendered faux-bold. The 800 TTF is the
  v24 `...RD8SKtjPQ.ttf` URL.
- Page-level `openGraph.images` in `generateMetadata` would override the
  file-convention images; none of the swept routes set one.
- Favicons and manifest icons are intentionally untouched: photographic
  marks do not survive 16-32px, the vector DX mark remains correct there.
