# TableRow

A table row (`<tr>`) for the Table family.

## Intent

One of the composable `Table` parts (`Table` root, `TableRow`,
`TableHeaderCell`, `TableCell`). Works in both `<thead>` and `<tbody>`. Its only
prop, `selected`, renders the selection surface and sets `data-selected` — the
hover, zebra-stripe, and selection-tint treatments are cross-cutting styles
supplied by the `Table` root, so a row only looks striped/selected inside one.

## Interaction contract

- Presentational: no ARIA, no events of its own.
- `selected` is **visual only**. The semantic selection state belongs to a
  checkbox in the row or to the consuming application (`aria-selected` on a grid,
  etc.) — never to the row's appearance alone.

## Do / don't

- Do: Compose it inside a `Table` root, in `<thead>` or `<tbody>`.
- Do: Pair `selected` with a real selection control (a `Checkbox`).
- Don't: Render it outside a table.
- Don't: Treat `selected` as the source of truth for selection.

## Design notes

- The row itself is unstyled; the border, hover, zebra, and selection tint come
  from `Table.module.css` (shared across the family) so the whole table reads as
  one system.
- Forced-colors: borders map to `CanvasText` via the shared stylesheet.
