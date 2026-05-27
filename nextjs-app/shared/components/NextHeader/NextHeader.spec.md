# NextHeader

## Intent
Render the site-wide header for the Next.js app. Documented as a catalog pattern so the implementation file is reachable from the catalog; the high-level pattern contract lives in `SiteHeader`.

## Interaction contract
- Keyboard: Logo → nav links → theme switcher → mobile menu trigger.
- Pointer: Click any element to follow its action (link / toggle / open menu).
- Screen readers: Header landmark announces. Nav landmark announces the link count. Theme switcher announces 'Theme, {current}'.

## Do / don't
- Do: Pair with `NextMobileMenu` — the mobile trigger here opens that menu.
- Do: Update this and `SiteHeader` together when changing navigation surface.
- Don't: Render `NextHeader` outside `Layout` — it expects the global shell context (theme provider, router).
- Don't: Duplicate the header in routes — `Layout` already mounts it once.

## Design notes
- Colors: --color-text, --color-surface-elevated, --color-accent
- Spacing: --space-internal-12, --space-internal-16
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
