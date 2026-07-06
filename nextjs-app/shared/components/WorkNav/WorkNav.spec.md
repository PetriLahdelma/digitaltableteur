# WorkNav

## Intent
Work section sub-navigation: a back-to-index action plus previous/next controls for stepping through the portfolio case studies.

## Interaction contract
- Keyboard: inherit from composed @dt/Button primitives (native button focus/activation)
- Pointer: standard button targets; disabled at the sequence edges
- Screen readers: rendered inside a `nav` landmark labelled via `aria-label` (workNavLabel)

## Do / don't
- Do: compose from cataloged @dt/* atoms and molecules for new UI in this surface
- Do: pass `currentPath` in stories/tests to drive the prev/next disabled state
- Don't: invent parallel primitives inside this folder
- Don't: use this for site-wide navigation (that is SiteHeader)

## Design notes
- Tokens: inherit from child components (Button, Icon)
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1027-2672
