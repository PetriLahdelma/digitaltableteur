# SkillsGrid

## Intent
Single, repeatable visual for the 'capabilities' / 'tools we use' grid on marketing pages. Owns the column-count axis so the same data can render as a tight or sparse grid.

## Interaction contract
- Keyboard: None — the grid is non-interactive unless logos are linkified by the caller.
- Pointer: None unless individual logos are wrapped in links by the caller.
- Screen readers: Announced as 'region, {grid label}' followed by each logo's alt text.

## Do / don't
- Do: Use on the about page and capability sections.
- Do: Pick a column count that matches the viewport (4 mobile, 6 desktop default).
- Don't: Use for a small set of (≤ 4) capabilities — the grid rhythm collapses; use `Card` instead.
- Don't: Mix logos and text in the same grid — pick one visual language.

## Design notes
- Colors: --color-text, --color-text-muted
- Spacing: --space-layout-12, --space-layout-24
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
