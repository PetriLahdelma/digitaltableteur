# Table

Composable table primitives — `Table`, `TableRow`, `TableHeaderCell`, and
`TableCell` — that render semantic `<table>` markup with design-system chrome.
They are the presentational layer beneath `DataTable`; behavior (sorting,
selection, pagination) lives in the `useTable*` hooks.

## Intent

Give the design system a low-level, composable table so product surfaces can
assemble bespoke tables from DS-styled parts, while `DataTable` provides the
batteries-included configuration on top. Compose with native `<thead>` and
`<tbody>`:

- **Table** — scroll wrapper + `<table>` with the `<caption>`; owns density
  (`sm`/`md`/`lg`), `striped`, and `stickyHeader`.
- **TableRow** — `<tr>`; `selected` renders the selected surface and sets
  `data-selected`.
- **TableHeaderCell** — `<th scope="col">`; `sortable` + `sortDirection` render
  a sort button whose caret is a DS `Icon` (`caret-up-down` unsorted,
  `caret-up` ascending, `caret-down` descending).
- **TableCell** — `<td>`; `align` and `numeric` (tabular figures, end-aligned).

## Interaction contract

- Sortable headers toggle via an inner `<button>`; drive the actual sort with
  `useTableSortable` and pass the resulting `sortDirection`/`onSort`.
- `aria-sort` is exposed only while a column is actively sorted; the caret is
  decorative (`aria-hidden`) and never the sole carrier of state.
- Row selection is presentational here (`selected`) — the state lives in
  `useTableSelection`; render a DS `Checkbox` in the leading cell.

## Do / don't

- Do: Give every table a concise `caption`.
- Do: Drive sorting/selection with the `useTable*` hooks rather than local state.
- Do: Use `numeric` for figures so columns align on the decimal.
- Don't: Use Table for page layout.
- Don't: Put sort logic inside a cell instead of the hooks.
- Don't: Rely on the caret color alone to convey sort state.

## Design notes

- Quiet header: small uppercase `--font-size-text-xs` labels in `--color-muted`
  on a `--color-light-bg` surface, with hairline (`1px`) row dividers.
- The active sort caret uses `--color-primary`; the unsorted caret sits at
  `--color-muted` so a sorted column reads at a glance while the unsorted
  affordance still clears ≥3:1 non-text contrast in every theme (including
  HCB, where `--color-border` would fail).
- Density scales header/cell padding across `sm`/`md`/`lg`.
- Forced-colors: borders map to `CanvasText`, the focus ring to `Highlight`.
