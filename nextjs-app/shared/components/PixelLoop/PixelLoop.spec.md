# PixelLoop

## Intent

PixelLoop is a compact decorative motion signature for hero and editorial
compositions. It lays out a three-column field of cells; each cell continuously
cross-fades through its own slice of the pool of 20 × 20 constellations, and the
cells together cover every variant. The Primary Studio reference informed the
modular format, but the artwork and choreography are deliberately distinct.

## Visual and motion contract

- The default `md` size is 100 × 60 CSS pixels: 20-pixel glyphs separated by
  20-pixel gaps.
- Every constellation is authored as a literal 5 × 5 on/off cell grid and
  rendered as vector SVG marks (never raster). Marks may only occupy the 25 cell
  centers at 2, 6, 10, 14, and 18 SVG units.
- `dots` uses 2.5-unit fully rounded circles, leaving 1.5 units of breathing
  room inside every 4-unit cell.
- `strokes` replaces each circle with a short, 1.5-unit round-capped 45° vector
  mark that also stays within its cell boundary.
- `rows={1}`, `rows={2}`, and `rows={3}` render three, six, or nine cells. Each
  cell owns a distinct slice of the pool (pool indices `i` where
  `i % cellCount === cellIndex`) and cross-fades through it one glyph at a time
  (600 ms per glyph, discrete step-end). Because the slices partition the pool,
  the cells collectively show every variant. Cells are time-offset so they change
  in a wave rather than in unison.
- `cycle` renders a single cell (one row, one column) that holds the whole pool
  and steps through it the same way. Reduced motion and `animate={false}` hold
  the first glyph.
- Every cell shows exactly one glyph at any instant; over a full cycle it steps
  through all of them. Changes are discrete: glyphs do not slide, scale, or
  interpolate.
- The glyph pool includes the studio **D** and **T** initials, authored as full
  5 × 5 cell grids exactly like every other constellation (same 4-unit cells,
  same 2.5-unit dots or 45° strokes), so they share its dot scale and spacing.
- The graphic inherits `--color-text`; consumers do not need a color prop.
- `sm`, `md`, and `lg` scale both glyphs and gaps together.

## Interaction contract

- Keyboard: none; the component is never focusable.
- Pointer: none; the component has no hover or click behavior.
- Screen readers: the root is `aria-hidden` because the loop is ornamental.
- Reduced motion: `prefers-reduced-motion: reduce` freezes the first frame.
- `animate={false}` also freezes the first frame for intentional static use.

## Do / don't

- Do use it as a visual accent alongside real page content.
- Do choose the row count to suit the available composition width and height.
- Do let the inherited text color adapt it to its surrounding composition.
- Don't use it to communicate loading, progress, status, or instructions.
- Don't add labels or interaction to the glyphs.
- Don't replace the stepped cross-fade with smooth motion.

## Design notes

- Tokens: `--color-text`, `--space-layout-4`, `--space-layout-16`,
  `--space-layout-32`, and `--duration-fast`.
- Figma:
  [DT Site stuff, node 1490:2401](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1490-2401&m=dev)
- Reference:
  [Primary Studio](https://www.primary.studio/)
