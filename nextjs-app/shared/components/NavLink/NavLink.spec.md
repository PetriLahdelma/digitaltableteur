# NavLink

## Intent
Single primitive for site-level navigation links. Owns active-route detection so consumers do not reimplement the `aria-current` plumbing.

## Interaction contract
- Keyboard: Tab in document order; Enter follows.
- Pointer: Click to follow.
- Screen readers: Announced as 'link, {text}'. The active item adds 'current page' when `aria-current='page'` resolves.

- `onClick` fires only when the navigable `<a>` is activated; the current-page `<span>` never calls it. Containers use it to close themselves (mobile drawer) before the route change lands.

## Do / don't
- Do: Use in `SiteHeader`, `Footer`, and breadcrumb-style in-page nav.
- Do: Pass the route's canonical href — the active-route match is exact-path.
- Don't: Use inside body prose — that is `Link`.
- Don't: Use as a button — primary actions belong on `Button`.

## Design notes
- Colors: --color-text, --color-link, --color-link-hover
- Typography: --font-size-md
- Figma: [NavLink](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=516-3146) (node 516:3146)
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
