# CategoryFilter

## Intent
Render the canonical filter-by-category row used on list pages. Owns the active-state announcement and the visual variants so list-page consumers do not reinvent them.

## Interaction contract
- Keyboard: Tab between filters; Enter / Space toggles.
- Pointer: Click a filter to activate.
- Screen readers: Filter buttons announce as 'toggle button, {label}, pressed' for the active filter and 'not pressed' for the rest.

## Do / don't
- Do: Use on list pages where filtering is the primary UI affordance.
- Do: Keep the filter labels short — they sit in a row.
- Don't: Use as primary navigation — `CategoryFilter` is a UI control, not a nav surface; use `NavLink` for routes.
- Don't: Stack two filter rows when one composite control would do — readability collapses.

## Design notes
- Colors: --color-text, --color-accent, --color-border-default
- Spacing: --space-internal-4, --space-internal-8
- Typography: --font-size-sm, --font-size-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
