# NewsBulletin

## Intent
Homepage news bulletin strip with three topical slots.

## Interaction contract
- Keyboard: inherit from composed @dt/* primitives
- Pointer: standard link/button targets where interactive
- Screen readers: use landmarks and labels from child components

## Do / don't
- Do: compose from cataloged @dt/* atoms and molecules for new UI in this surface
- Do: treat this as a page assembly reference when matching production routes
- Don't: invent parallel primitives inside this folder
- Don't: promote to stable without production consumer evidence

## Design notes
- Tokens: inherit from child components
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=503-20
