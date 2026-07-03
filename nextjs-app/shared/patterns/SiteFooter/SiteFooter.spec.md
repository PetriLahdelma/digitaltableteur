# SiteFooter

## Intent
Provide the canonical, deliberately-rigid global footer. SiteFooter
exists at pattern tier so company-wide additions (a new legal link,
a new social channel) happen in exactly one file and ship to every
page in the same release. Per-page footer variation is intentionally
not supported.

## Interaction contract
- Keyboard: Tab walks through the legal links (Privacy → Imprint →
  AI Use → Accessibility), then the social icon links left to right.
  Enter follows each link.
- Pointer: clicking any link navigates. Social links open in new
  tabs (target="_blank") with the `rel="noopener noreferrer"` safety
  wiring.
- Screen readers: the contentinfo landmark announces. The address
  blocks announce as "contact information"; each social link
  announces its translated label rather than the icon glyph.

## Do / don't
- Do: keep the social link list as a single source-of-truth const.
  Adding a channel = edit the const + the i18n keys.
- Do: pass the `aria-label` translation key for each social link.
  Skipping it makes AT users hear the SVG fallback (which is empty)
  instead of the channel name.
- Don't: mount more than one SiteFooter. AT users encounter two
  contentinfo landmarks and the page's IA breaks.
- Don't: hand-author a `<footer>` instead of using SiteFooter on a
  new route. Any new route inherits the SiteFooter from
  `app/layout.tsx`; rolling your own bypasses the i18n, theme,
  and legal-link maintenance work.
- Don't: change the Divider's margin via `className="my-X"` without
  checking the cascade-layer fix in Divider.module.css. The
  `@layer components` wrapper is what lets `my-8` win; pre-fix this
  was a regression source.

## Design notes
- Tokens: surface uses `bg-muted/30` → `var(--color-surface-muted)`
  with alpha. Border-top uses `--color-border`. Vertical padding is
  `py-16` → `var(--space-layout-64)`. Container is the default `lg`
  size. Column gap is `gap-8 lg:gap-12`.
- Figma: https://www.figma.com/design/digitaltableteur/site-footer —
  single composition; responsive behaviour is grid-column collapse
  from 4 → 2 → 1.
- Social link icons use `@phosphor-icons/react` directly (not via
  `<Icon />`) because the footer's icon set is small and stable;
  importing them by name keeps the bundle minimal. Each icon is
  `className="size-5"` → 20px square.
- Legal and explore links use `<Link size="sm">` (`@dt/Link`) so
  the affordance is quiet but findable; Link's wavy underline and
  focus ring are the global treatment for inline links.
- Copyright year is computed at render. SSR + client both run in
  the same year (modulo midnight UTC edge cases, which we tolerate).
