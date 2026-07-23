# FilterChip

## Intent
One toggle-chip implementation for single-select filters. CategoryFilter and BlogCategoryFilter each hand-rolled the same aria-pressed button in three visual treatments; FilterChip collapses the six copies into one control.

## Interaction contract
- Keyboard: Tab focuses each chip; Enter/Space toggles (native button).
- Pointer: click toggles; hover shifts muted → text ink.
- Screen readers: announced as a toggle button with pressed state; a filter is a UI control, not a tablist, so parents wrap chips in a labelled role="group".

## Do / don't
- Do: keep exactly one chip pressed per group (single-select filters).
- Do: pass counts via the count prop so the "(n)" suffix stays in the accessible name.
- Don't: use for navigation between panels (that is Tabs).
- Don't: nest interactive content inside the label.

## Design notes
- Tokens: --color-muted/-text/-border ink+chrome, --focus-ring-color, --space-internal-{6,8,12,16,24} paddings, --font-size-text-{xs,s,m}.
- Pressed pill inverts (text bg / canvas ink); rectangle matches pill with 8px (--radius-lg) corners; underline variant sits on the group border (-1px margin); forced colors use Highlight/HighlightText.
- Figma: pending (alpha); create in DT-Site-stuff Atoms before beta.
