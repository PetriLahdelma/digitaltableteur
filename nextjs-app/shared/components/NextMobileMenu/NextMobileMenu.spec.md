# NextMobileMenu

## Intent
Provide the small-viewport navigation drawer for the Next.js app. Catalog entry exists so the implementation is reachable; the high-level pattern is also documented inside `SiteHeader`.

## Interaction contract
- Keyboard: Esc closes; Tab cycles; focus is trapped.
- Pointer: Click outside the drawer or on the close button to dismiss.
- Screen readers: On open: 'dialog, navigation'. Each nav item announces as a link. On close: focus returns to the header trigger.

## Do / don't
- Do: Pair with `NextHeader` — the trigger lives there.
- Do: Honour `prefers-reduced-motion` — the slide animation already skips when set.
- Don't: Render outside `Layout` — depends on the theme provider and the header.
- Don't: Mount multiple instances simultaneously — focus management collapses.

## Design notes
- Colors: --color-text, --color-surface-elevated
- Spacing: --space-internal-16, --space-internal-24
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
