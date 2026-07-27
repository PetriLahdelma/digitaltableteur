# VirtualListItem

A single windowed list row. It is the item `VirtualList` renders for each
visible index, and the reason a virtualized list stays announceable.

## Intent

Give `VirtualList` a real item component instead of ad-hoc row markup, sharing
the same chrome as menus and other lists. It **composes the stable `ListItem`**
(leading `icon`, truncating label, end `meta` such as Badge / Kbd / StatusDot,
`trailingIcon`, `selected` check, `destructive` tone) rather than duplicating
it — exactly how `MenuItem` reuses `ListItem`. On top of that chrome it owns the
windowed-row semantics: `role="listitem"` plus `aria-posinset` / `aria-setsize`
so a screen reader can announce "item 500 of 1000" even though only the ~10
visible rows are mounted.

## Interaction contract

- `VirtualList` injects `posInSet`, `setSize`, and the positioning `style`
  (absolute + `translateY` + `block-size`); consumers supply the chrome via
  `getItemProps`.
- Selection is **visual only** (`selected` renders a check); the semantic
  selection model, if any, belongs to the surrounding application.
- Must live inside a `role="list"` container — `VirtualList`'s viewport
  provides it. Rendering it standalone without a list ancestor is invalid.

## Do / don't

Do:

- Compose it from `VirtualList` via `getItemProps`, or use it directly inside
  your own `role="list"`.
- Use `meta` for end-aligned status (Badge / StatusDot / Kbd / a value).

Don't:

- Render it outside a `role="list"` container.
- Reimplement the ListItem chrome — compose it.
- Attach interactive semantics to the row; selection is presentational.

## Design notes

- The row is a bordered container (`--color-border-light` divider); the composed
  `ListItem` fills it and supplies padding, the icon gutter, and truncation.
- Positioning is not baked into the item — it arrives via `style` so the item
  stays reusable outside a virtualized context.
- Forced-colors: the divider maps to `CanvasText`.
