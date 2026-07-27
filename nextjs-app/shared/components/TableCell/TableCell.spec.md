# TableCell

A table data cell (`<td>`) for the Table family.

## Intent

The body cell of the composable `Table`. `align` sets text alignment; `numeric`
right-aligns with tabular figures so numbers line up on the decimal. It pairs
with `TableHeaderCell` (`scope="col"`/`"row"`) so cells inherit their column and
row context for assistive tech.

## Interaction contract

- Presentational: native `<td>`, no ARIA of its own.
- `numeric` defaults the alignment to `end`; an explicit `align` overrides it.
- Native attributes pass through, so `colSpan` (e.g. an empty-state cell that
  spans the table) works as usual.

## Do / don't

Do:

- Use `numeric` for figures so columns align.
- Let `TableHeaderCell scope="row"` name the row; keep other cells as
  `TableCell`.

Don't:

- Use `TableCell` for a header — use `TableHeaderCell` so context is announced.
- Render it outside a table row.

## Design notes

- Padding scales with the `Table` root's density (`sm`/`md`/`lg`); the row
  divider and last-row border come from the shared `Table.module.css`.
- `numeric` applies `font-variant-numeric: tabular-nums`.
- Forced-colors: borders map to `CanvasText`.
