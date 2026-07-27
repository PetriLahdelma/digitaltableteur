# TableHeaderCell

A table header cell (`<th>`) for the Table family.

## Intent

Header cell with an explicit `scope`. `scope="col"` (default) labels a column
and can carry a three-state sort control; `scope="row"` marks the identifying
cell of a body row so a screen reader announces the row context ("Ada
Lovelace") along with every other cell in that row — the accessibility feature a
plain `<td>` grid can't provide.

## Interaction contract

- Column headers (`scope="col"`) with `sortable` render an inner `<button>` and
  expose `aria-sort` only while actively sorted. Wire `sortDirection`/`onSort`
  from `useTableSortable`.
- The sort caret is a DS `Icon` (`caret-up-down` unsorted / `caret-up` asc /
  `caret-down` desc), decorative (`aria-hidden`); state is carried by
  `aria-sort`, never the icon alone.
- Row headers (`scope="row"`) never render a sort control — they name a row,
  they are not interactive.

## Do / don't

Do:

- Use `scope="row"` on the identifying cell of each body row for accessible
  data tables.
- Drive sorting with `useTableSortable`.

Don't:

- Make a `scope="row"` header sortable.
- Convey sort state with the caret colour alone.
- Render it outside a table.

## Design notes

- Quiet column headers: small uppercase `--font-size-text-xs` labels in
  `--color-muted`; the active sort caret uses `--color-primary`, the unsorted
  one `--color-muted` so a sorted column reads at a glance and clears ≥3:1
  contrast in every theme.
- Padding/borders/sticky behaviour come from the shared `Table.module.css`.
