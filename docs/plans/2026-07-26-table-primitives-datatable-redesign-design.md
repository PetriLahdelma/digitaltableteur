# Table primitives + DataTable redesign

Date: 2026-07-26
Reference: Astryx Table (composable primitives + headless hooks).

## Goal

Give the DS an Astryx-style composable table layer and rebuild the (alpha)
DataTable on top of it with corrected iconography and polished chrome. Scope
chosen with the owner: **redesign + primitives + core hooks** (defer advanced
hooks — tree/grouped/resize/sticky-columns/column-settings/row-expansion —
until a real consumer needs them).

## Architecture

One new compound DS component, `Table/` (molecule, `data-display`), following
the **Menu** subParts precedent — four subParts exported from one folder:

- **`Table`** — scroll wrapper + `<table>`; owns `size` (sm/md/lg), `striped`,
  `stickyHeader`, caption (with `hideCaption`). Presentational.
- **`TableRow`** — `<tr>`; `selected` (→ `data-selected`), optional `onSelect`.
- **`TableHeaderCell`** — `<th scope="col">`; `sortable`, `sortDirection`
  (`ascending`/`descending`/`none`), `align`, `onSort`. Renders a sort button
  whose indicator is a **DS `Icon`**: `caret-up-down` (unsorted, muted),
  `caret-up` (ascending), `caret-down` (descending). `aria-sort` reflects state.
- **`TableCell`** — `<td>`; `align`, `numeric`.

Three core hooks in `nextjs-app/shared/hooks/` (flat, beside
`useTableOfContents.ts`):

- **`useTableSortable`** — three-state sort cycle (asc → desc → none) +
  `sortRows` comparator. Controlled/uncontrolled.
- **`useTableSelection`** / **`useTableSelectionState`** — row selection with
  select-all + indeterminate. Controlled/uncontrolled.
- **`useTablePagination`** — page/pageSize/pageCount + `paginate` slice.

## Consumption (mandate)

`DataTable` (organism) is rebuilt to **compose the `Table` primitives and drive
them with the hooks** — so every new piece has a real consumer. DataTable keeps
its typed-column config API (`columns`/`data`/`getRowId`/…) so existing
consumers do not break; internals delegate to the primitives + hooks.

## Visual redesign (DataTable)

- Sort indicator: text glyphs `↕ ↑ ↓` → DS `Icon` carets (muted unsorted,
  full-strength active).
- Selection: raw `<input type=checkbox>` → DS `Checkbox` (hidden label carries
  the accessible name).
- Chrome: header surface + weight, hairline borders via border tokens (not
  spacing tokens), row hover, zebra option, optional sticky header, refined
  density scale, better empty state.

## Testing / gates

Per-component: axe unit tests, Storybook a11y gate, AT snapshots. Hooks: unit
tests (React Testing Library `renderHook`). `npm run build:icons` for new caret
icons. Full DS + repo gate before each PR; one component/PR per the owner method
(Table primitive, hooks, DataTable redesign may split).
