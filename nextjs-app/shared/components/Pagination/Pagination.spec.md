# Pagination

## Intent
Render a familiar paged-list navigation surface with the announcements, current-page state, and edge-case behaviour (long ranges, missing pages) handled once.

## Interaction contract
- Keyboard: Tab through Previous → numbered pages → Next. Enter / Space activates. Arrow keys are intentionally not bound — pagination is rare-use and Tab is the predictable path.
- Pointer: Click on a page number, previous, or next.
- Screen readers: The `<nav>` landmark is announced as 'Pagination, navigation'. The current page is announced with 'current page'.

## Do / don't
- Do: Show 5 to 7 page numbers max; truncate the middle with an ellipsis.
- Do: Always include Previous and Next so keyboard users have one-step neighbour navigation.
- Don't: Remove Previous/Next on edges — use `aria-disabled` so the visual stays stable.
- Don't: Render more than ~10 page numbers inline — switch to a 'Page X of Y' label with prev/next only.

## Design notes
- Colors: --color-text, --color-accent, --color-surface-elevated
- Spacing: --space-internal-4, --space-internal-8
- Typography: --font-size-sm, --font-size-md
- Figma: [Pagination](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1430-2182) (node 1430:2182)
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.

## Naming the landmark
- `label` sets the navigation landmark's accessible name. Use it whenever a page has more than one nav, for example "Questionnaire pages" on a multi-page form, so screen reader users can tell the landmarks apart. Without it the localized "Page navigation" applies.
