# BlogCategoryFilter

## Intent
Single-select tag filter for the blog archive: a labelled group of toggle chips with an implicit All, three visual treatments, optional per-tag counts and an optional collapsed mode.

## Interaction contract
- Keyboard: Tab moves between chips; Enter/Space toggles the focused chip
- Pointer: click a chip to select that tag (or All)
- Screen readers: `role="group"` labelled via blogFilterByTag; each chip is a toggle button with `aria-pressed`
- Collapsible: only the selected chip and a disclosure button (`aria-expanded`, `aria-controls` on the group, named "All topics") show. Expanding reveals every chip with a height transition (none under reduced motion); picking a chip collapses back to it. The disclosure button is always the first child: it keeps its place open or closed, precedes the chips in the focus order and focus stays on it while chips appear
- Controlled: `selectedTag` and `onTagChange` are supplied by the parent

## Do / don't
- Do: pass the tag list plus the current `selectedTag` (null = All) and an `onTagChange` handler
- Do: enable `showCounts` with a `tagCounts` map to show per-tag totals
- Do: use `collapsible` when the tag list wraps to several rows above content
- Don't: invent parallel primitives inside this folder
- Don't: use this for generic list pages; that is CategoryFilter

## Design notes
- Tokens: Tailwind utilities mapped to theme tokens (foreground/background/muted/border); the disclosure button uses the pill chip's border, radius and padding
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1035-110
