# BlogCategoryFilter

## Intent
Single-select tag filter for the blog archive: a labelled tablist with an implicit All tab, three visual treatments and optional per-tag counts.

## Interaction contract
- Keyboard: Arrow keys (and Up/Down) move between tabs with automatic activation; Home/End jump to the ends; Enter/Space or click activates the focused tab
- Pointer: click a tab to select that tag (or All)
- Screen readers: `role="tablist"` labelled via blogFilterByTag; each filter is a `role="tab"` with `aria-selected`; roving tabindex keeps only the active tab in the tab order
- Controlled: `selectedTag` and `onTagChange` are supplied by the parent

## Do / don't
- Do: pass the tag list plus the current `selectedTag` (null = All) and an `onTagChange` handler
- Do: enable `showCounts` with a `tagCounts` map to show per-tag totals
- Don't: invent parallel primitives inside this folder
- Don't: use this for generic list pages — that is CategoryFilter

## Design notes
- Tokens: Tailwind utilities mapped to theme tokens (foreground/background/muted/border)
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1035-110
