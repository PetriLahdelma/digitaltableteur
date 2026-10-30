# CategoryFilter

## Intent
Render the canonical filter-by-category row used on list pages. Owns the active-state announcement and the visual variants so list-page consumers do not reinvent them.

## Interaction contract
- Keyboard: Tab between filters; Enter / Space toggles.
- Pointer: Click a filter to activate.
- Screen readers: Filter buttons announce as 'toggle button, {label}, pressed' for the active filter and 'not pressed' for the rest.
- Collapsible: only the active chip and a leading disclosure button (`aria-expanded`, `aria-controls` on the group, named by `disclosureLabel`, default "All categories") show. Expanding reveals every chip with a height transition (none under reduced motion); picking a chip collapses back to it. The button keeps its place and focus while chips appear. Shares hooks/useFilterDisclosure and styles/filter-disclosure.module.css with BlogCategoryFilter.

## Do / don't
- Do: Use on list pages where filtering is the primary UI affordance.
- Do: Keep the filter labels short; they sit in a row.
- Do: Use `collapsible` when the row wraps above content.
- Don't: Use as primary navigation — `CategoryFilter` is a UI control, not a nav surface; use `NavLink` for routes.
- Don't: Stack two filter rows when one composite control would do — readability collapses.

## Design notes
- Colors: --color-text, --color-accent, --color-border-default
- Spacing: --space-internal-4, --space-internal-8
- Typography: --font-size-sm, --font-size-md
- Figma: [CategoryFilter](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1429-2346) (node 1429:2346)
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
