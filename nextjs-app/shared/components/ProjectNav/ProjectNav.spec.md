# ProjectNav

## Intent
Previous/next navigation between case studies, with a back-to-work action, for the foot of work detail pages.

## Interaction contract
- Keyboard: native link focus/activation on the back, previous and next links
- Pointer: standard link targets; the control at each sequence edge is a disabled span
- Screen readers: rendered inside a `nav` landmark labelled via `aria-label` (projectNavLabel); the disabled edge uses `aria-disabled`

## Do / don't
- Do: pass the current project `currentSlug`; prev/next targets derive from the project ordering
- Do: keep the Tailwind className styling (intentional per-surface owner call, as with NavLink/Pagination)
- Don't: invent parallel primitives inside this folder
- Don't: use this for site-wide navigation (that is SiteHeader)

## Design notes
- Tokens: Tailwind utility classes mapped to the theme tokens (muted-foreground/foreground/primary)
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1028-89
