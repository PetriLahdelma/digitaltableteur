# BlogNav

## Intent
Blog article sub-navigation: a back-to-articles action plus previous/next controls for stepping through the article sequence.

## Interaction contract
- Keyboard: inherit from composed @dt/Button primitives (native button focus/activation)
- Pointer: standard button targets; disabled at the sequence edges and off article routes
- Screen readers: rendered inside a `nav` landmark labelled via `aria-label` (blogNavLabel); labels collapse below 768px but each button keeps its Icon aria-label

## Do / don't
- Do: compose from cataloged @dt/* atoms and molecules for new UI in this surface
- Do: pass `currentPath` in stories/tests to drive the prev/next disabled state
- Don't: invent parallel primitives inside this folder
- Don't: use this for site-wide navigation (that is SiteHeader/NavLink)

## Design notes
- Tokens: inherit from child components (Button, Icon)
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1029-101
