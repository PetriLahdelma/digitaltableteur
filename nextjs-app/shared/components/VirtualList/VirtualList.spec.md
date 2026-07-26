# VirtualList

## Intent

Keep long, fixed-row collections responsive by rendering only the visible
range plus a small overscan buffer.

## Interaction contract

- Scroll position determines the rendered range.
- The viewport keeps list semantics and each rendered item reports its
  position and total set size.
- `onRangeChange` reports both the visible and overscanned boundaries.
- `initialScrollOffset` restores a known position without making scroll state
  controlled.

## Do / don't

- Do provide an accurate fixed `itemHeight`.
- Do keep item keys stable across filtering and updates.
- Don't use VirtualList for short collections where normal rendering is
  simpler.
- Don't use it when row heights are unknown or highly variable.

## Design notes

- A full-height spacer preserves the browser's native scroll range.
- Rendered items are translated to their calculated vertical offset.
- Viewport height and item offsets are intentionally runtime inline values.
