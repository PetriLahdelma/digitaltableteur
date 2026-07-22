# Avatar

## Intent
Represent a person on the site with three resilient surfaces: image,
initials fallback, and an optional menu or link. Avatar's contract is
"never break, always render *something* identifying" — initials when the
image is missing, name-alt when present, and a graceful link or menu
trigger when interactive.

## Sizing
Token sizes are canonical and follow the platinum sizing convention:
`sm` = 2rem, `md` = 2.5rem (default), `lg` = 3rem, `xl` = 4rem — aligned
with AvatarGroup's scale. Any CSS length is still accepted as an escape
hatch (the raw-rem union is published package API and stays valid). Tokens
resolve to real lengths before reaching the DOM; both `--avatar-size` and
the img `sizes` attribute always receive a CSS length. Consumers that
compose Avatar (Author, AuthorBio) expose this same `AvatarSize` type
rather than inventing their own scale.

## Interaction contract
- Keyboard: in menu mode, Enter / Space toggles the menu; arrow keys
  move between items; Escape closes and returns focus to the trigger.
- Pointer: click opens / closes the menu; outside click closes; the
  menu repositions automatically on viewport change.
- Screen readers: in static mode, the visible name or image alt is the
  accessible name. In menu mode, the trigger announces `menuLabel` and
  the expanded state; items are announced as a `menu` with `menuitem`
  children.

## Do / don't
- Do: pass `name` even when an image is set — the initials fallback and
  alt text both flow from it.
- Do: pass `menuLabel` whenever you set `menuItems`. The trigger has no
  visible text in menu mode.
- Don't: render two interactive children inside Avatar (link plus menu);
  the contract is exactly one interaction mode per instance.
- Don't: nest an Avatar inside a Button. Pick one — Avatar already owns
  the click affordance when clickable, and Button owns it when not.

## Design notes
- Tokens: initials use the body text family at the size-derived weight;
  the surface is `--color-surface-2` with `--color-border` border.
- Figma: https://www.figma.com/design/digitaltableteur/avatar — keep the
  menu placement and size ramp aligned with the Figma component variants.
- Menu repositioning uses a `placementRefreshKey` prop so consumers
  triggering layout changes (sidebar collapse, modal open) can request a
  fresh measurement without remounting.
