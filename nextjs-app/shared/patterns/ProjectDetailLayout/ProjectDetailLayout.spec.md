# ProjectDetailLayout

## Intent
Case study detail layout shell.

## Interaction contract
- Keyboard: inherit from composed @dt/* primitives
- Pointer: standard link/button targets where interactive
- Screen readers: the shell contributes the page's sole `main`; the project
  hero and authored body are English by default, while localized navigation,
  CTA, and related-project chrome keep the selected UI language

## Do / don't
- Do: compose from cataloged @dt/* atoms and molecules for new UI in this surface
- Do: treat this as a page assembly reference when matching production routes
- Don't: invent parallel primitives inside this folder
- Don't: promote to stable without production consumer evidence

## Design notes
- Tokens: inherit from child components
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-project-detail-layout
