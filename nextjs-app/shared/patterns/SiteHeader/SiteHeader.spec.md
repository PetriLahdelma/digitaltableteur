# SiteHeader

## Intent
Carry the brand identity, primary navigation, and the visitor-facing
preference controls (theme, language) for every page. SiteHeader is
intentionally a *pattern* — it composes atoms (IconButton, NavLink,
Container) and external hooks (i18n, theme, toast) into one shipping
unit so consumers don't reinvent the global header per route.

## Interaction contract
- Keyboard: Tab walks logo → each desktop nav link → each language
  button (skipping the currently active one) → theme toggle →
  hamburger (mobile only). Enter / Space activates buttons; Enter
  on the logo / nav links navigates.
- Pointer: hovering the logo triggers the pulse animation; clicking
  navigates. Clicking the hamburger opens MobileDrawer (which has
  its own focus trap). Click on a disabled language button does
  nothing.
- Screen readers: the banner landmark announces; the nav inside
  announces its translated label. Theme / language changes announce
  via the global Toast live region.

## Do / don't
- Do: mount once globally. The scroll listener and sticky behaviour
  assume a single instance.
- Do: pass `navItems` with translated labels' *keys*, not the
  resolved strings. The component runs the labels through `t()` so
  language switching works without a remount.
- Don't: tamper with the IconButton variants. The header's theme
  cycle uses `variant="ghost"` to stay transparent at scroll-top;
  a filled variant would defeat the layered surface treatment.
- Don't: nest a `<header>` inside SiteHeader. Multiple banner
  landmarks confuse AT users.
- Don't: hard-code the language list. The `languages` array is the
  single source of truth — adding Finnish swedish (lol) means
  editing the array and adding the `langXX` / `langXX_ariaLabel`
  i18n keys.

## Design notes
- Tokens: scrolled state uses `--color-background-90` (background
  with 90% opacity) plus `backdrop-blur(...)`. Border is
  `--color-border` on scroll, transparent otherwise. Height is
  20rem (h-20). Container is `size="lg"`.
- Figma: https://www.figma.com/design/digitaltableteur/site-header —
  default and scrolled states; mobile drawer is a separate file.
- Theme cycle order is `light → dark → hcb → hcw → light` (defined
  in `usePersistentTheme`). The IconButton's icon swaps based on
  active theme via the `themeIcons` map; HCB and HCW both use the
  `CircleHalf` icon since they're paired high-contrast modes.
- Toast announcements use the *target* language for language changes
  so the user immediately confirms the switch worked. Theme toasts
  use the current i18n language (which is unchanged by a theme
  change).
- The MobileDrawer is rendered outside the `<header>` element
  intentionally — otherwise the drawer would inherit the header's
  transparent backdrop and look broken.
