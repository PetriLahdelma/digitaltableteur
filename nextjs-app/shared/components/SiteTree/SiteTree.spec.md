# SiteTree

## Intent
Render a hierarchical sitemap as a collapsible navigation tree with branch folders and page leaves.

## Interaction contract
- Keyboard: Tab through branch toggles and leaf links; Enter / Space on summary toggles branches.
- Pointer: Click summary to expand/collapse branches; click leaves to navigate.
- Screen readers: Wrapped in a `nav` landmark with `aria-label`; branches use native `details`/`summary`.

## Do / don't
- Do: Use for documentation sitemaps, internal IA previews, or agent discovery trees.
- Do: Pass pre-translated labels from the caller.
- Don't: Use as the primary site header navigation — use `NavMenuList` / `SiteHeader` instead.
- Don't: Nest more than three levels without testing keyboard focus order.

## Design notes
- Colors: `--color-text`, `--color-muted`, `--color-primary`
- Spacing: `--space-internal-8`, `--space-layout-16`
- Catalog status: **alpha**
