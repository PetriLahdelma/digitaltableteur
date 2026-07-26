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
