# DataTable

## Intent

Present structured records when users need to compare values across columns,
sort the result, or select rows for a follow-up action.

## Interaction contract

- Renders native table semantics with an accessible caption.
- Sortable columns cycle ascending, descending, and unsorted.
- Optional selection uses native checkboxes and stable row identifiers.
- Controlled sort and selection state remain owned by the consumer.

## Do / don't

- Do provide a meaningful caption, even when it is visually hidden.
- Do use identifiers that remain stable when rows reorder.
- Don't use DataTable for page layout or highly visual card collections.
- Don't add row actions that are available only on pointer hover.

## Design notes

- Horizontal overflow is contained by the table wrapper at narrow widths.
- Density, stripes, and selection styling use semantic design tokens.
- Native table elements remain intact so assistive technology receives the
  expected row and column relationships.
- Loading and error presentation are deliberately consumer-level concerns:
  the table renders data it is given, and skeleton or error panels belong to
  the surface that owns the fetch. `emptyState` is the only in-table state.
- Performance evidence (2026-08-03, dev-mode Storybook, active Chromium,
  MutationObserver/DOM-poll timed): sorting 1,000 rows re-ranks the full set
  and re-renders the 50-row page in 10-16 ms; a last-page jump renders rows
  951-1000 in 12 ms; page-level select-all commits in under 1 ms. Pagination
  keeps the DOM at one page (50 rows) regardless of data size, so large-data
  cost is dominated by the sort comparator, not row rendering.
