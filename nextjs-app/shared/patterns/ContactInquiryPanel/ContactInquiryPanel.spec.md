# ContactInquiryPanel

## Intent
Contact page inquiry panel wrapping editorial form and copy.

## Interaction contract
- Keyboard: Tab between tabs; ArrowLeft/ArrowRight switch tabs; Enter activates
- Pointer: tab buttons and composed form controls
- Screen readers: tablist with aria-selected; tabpanels linked via aria-controls

## Do / don't
- Do: pass ContactFormEditorial (or success state) as `messagePanel`
- Do: use on contact page via ContactPageContentEditorial
- Don't: mount without messagePanel slot
- Don't: duplicate tablist landmarks on the same page

## Design notes
- Tokens: inherit from child components
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-contact-inquiry-panel
