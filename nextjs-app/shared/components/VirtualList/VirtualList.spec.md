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
- Rows render as `VirtualListItem` (which composes `ListItem`), supplied via
  `getItemProps`; the viewport is `role="list"`, each row `role="listitem"`.

## Accessibility limitations

Windowing has inherent accessibility trade-offs; know them before reaching for
it:

- **Off-screen rows are not in the DOM.** Only the visible window (+ overscan)
  is mounted, so a screen-reader virtual cursor cannot navigate to item 500
  until it scrolls into view. `aria-posinset`/`aria-setsize` announce each
  row's true position, but do not make unmounted rows reachable. If a surface
  needs full screen-reader traversal of the whole set, prefer a plain
  (non-virtualized) list or provide search/filter to shrink the set.
- **Keep items non-interactive.** Rows are presentational. Don't place focusable
  content (links, buttons, inputs) inside `getItemProps` chrome — a focused row
  can unmount on scroll and drop focus. Interactive virtualization needs a
  focus-management layer this component does not yet provide.
- **The viewport is the keyboard target.** It is `tabIndex={0}` so keyboard
  users can scroll it with the arrow / Page keys; the rows themselves are not
  in the tab order.

## Layout requirement

The rows are absolutely positioned, so the viewport takes its width from its
container. Render VirtualList inside a block/flex context that gives it a width;
in a shrink-to-fit container (a centered flex item, inline-block) it collapses
to zero width and only its border shows.
- Performance evidence (2026-08-04, dev-mode Storybook, active Chromium,
  DOM-settled timing): 100 deep scroll jumps (~96 rows each) across a
  10,000-row collection re-window in ~8 ms on average (p95 10.3 ms), and the
  mounted row count never exceeds visible + 2 x overscan (13 rows at a
  320 px viewport). Native key scrolling of the focusable viewport (arrows,
  PageUp/PageDown, Home/End) is trusted-event browser behavior that synthetic
  test events cannot trigger; the play verifies focusability and drives the
  same scroll pathway programmatically.
- Harness trap (2026-08-07, interaction-evidence build): a synthetically
  dispatched `Event("scroll")` — bubbling or not — never reaches React's
  `onScroll`, so the window does not move. Only a plain `scrollTop`
  assignment fires the native scroll event React listens for, and the
  element must be laid out first or the assignment clamps to 0. Scroll
  harnesses must assign and await a paint, measuring assignment → painted
  re-window (see audit:interaction-evidence).
