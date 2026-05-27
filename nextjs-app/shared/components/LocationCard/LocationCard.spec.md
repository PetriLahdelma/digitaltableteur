# LocationCard

## Intent
Single, recognisable layout for the contact / locations grid. Replaces ad-hoc `Card` + `Stack` compositions where each location card drifted in spacing and rhythm.

## Interaction contract
- Keyboard: Focus reaches embedded interactive elements (map link, phone link) in document order.
- Pointer: Hover on the `elevated` variant raises the card. Click follows embedded links.
- Screen readers: Announced as 'article, {location name}' followed by the contact block as 'address: {street, city}'.

## Do / don't
- Do: Use on the contact page locations grid.
- Do: Keep the slot order: name → address → hours → action. Reviewers expect it.
- Don't: Use as a generic 'card with an icon and label' — that is `Card`.
- Don't: Stack two `LocationCard`s vertically with no spacing — they need rhythm via `Grid` or `Stack`.

## Design notes
- Colors: --color-text, --color-text-muted, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12, --space-internal-16
- Radii: --radius-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
