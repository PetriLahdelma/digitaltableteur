# Layout

## Intent
Document the single page shell every route shares. Captured as a catalog entry so the global structure is discoverable; the component itself has no public API beyond children.

## Interaction contract
- Keyboard: Header → main → footer.
- Pointer: N/A — the shell is not interactive itself; its children are.
- Screen readers: Provides the main landmark; header and footer landmarks come from their respective patterns.

## Do / don't
- Do: Treat as the canonical page wrapper — every route in `app/` uses it.
- Do: When changing global structure, update this contract alongside `SiteHeader` / `SiteFooter`.
- Don't: Render `Layout` inside another `Layout` — there is one global shell per page.
- Don't: Use as a generic 'two-column with sidebar' wrapper — that is what a section pattern would be.

## Design notes
- No own tokens (inherits from container).
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
