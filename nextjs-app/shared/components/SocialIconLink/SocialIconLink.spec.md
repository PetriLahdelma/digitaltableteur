# SocialIconLink

## Intent
Give icon-only social/profile links one accessible, external-safe implementation. Every hand-rolled `<a aria-label><Icon/></a>` in SiteFooter, ArticleShareSection, and SocialShare repeats the same four obligations (accessible name, aria-hidden icon, target=_blank, rel=noopener); this atom makes them impossible to forget.

## Interaction contract
- Keyboard: Tab focuses the link (token focus ring), Enter activates it.
- Pointer: whole padded hit target is clickable; hover shifts color muted → text.
- Screen readers: announced as a link named by `label`; the icon child is aria-hidden so the glyph never leaks into the name.

## Do / don't
- Do: pass a human label ("Digitaltableteur on LinkedIn"), not the platform name alone when context needs it.
- Do: size the hit target with `size` (sm/md/lg paddings), not custom CSS.
- Don't: put text children inside — this is icon-only; use Link for labeled links.
- Don't: disable `external` for social profiles; same-tab is for internal routes only.

## Design notes
- Tokens: --color-muted (rest), --color-text (hover), --focus-ring-color, --space-internal-{4,8,12} hit paddings.
- Forced colors: LinkText color, Highlight focus outline.
- Figma: pending (alpha); create in DT-Site-stuff Atoms before beta.
