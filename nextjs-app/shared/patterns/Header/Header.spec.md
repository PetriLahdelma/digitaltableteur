# Header

## Intent
DEPRECATED. Legacy site header pattern, replaced in production by
**SiteHeader** (`patterns/navigation`). This spec stays only to document
why the folder still exists.

## Interaction contract
- See SiteHeader for the living header contract (nav, language switcher,
  theme cycle, MobileDrawer).
- This component keeps its previous behavior frozen; no new interaction
  work lands here.

## Do / don't
- Do: use `SiteHeader` from `@dt/patterns/navigation` for every new
  surface.
- Don't: mount `Header` in new work; it is out of the beta matrix and
  excluded from promotion gates.
- Don't: delete the CSS Modules yet — `Header.module.css` and
  `MobileMenu.module.css` are still imported by NextHeader and
  NextMobileMenu.

## Design notes
- Deprecated 2026-07-03 (Astryx batch follow-up). Removal blocked on the
  legacy `Layout` component and on extracting the shared CSS Modules;
  tracked for the Tier 2 sweep.
- Storybook: lives under `Deprecated/Header` with a struck red lifecycle
  dot and a deprecation banner on the docs page.
