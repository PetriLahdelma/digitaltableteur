# ArticleContent

## Intent
Article body prose wrapper: constrains blog article markup to a reading measure and applies the MDX typography treatment.

## Interaction contract
- Keyboard: none (layout wrapper); interactive elements come from the wrapped content
- Pointer: none of its own
- Screen readers: heading order and landmarks come from the MDX content it wraps

## Do / don't
- Do: wrap MDX/article body markup; choose `size` for the reading measure (sm/md/lg)
- Do: use `ArticleProse` (and `not-prose`) to scope the prose typography
- Don't: invent parallel primitives inside this folder
- Don't: put page chrome inside — this is the reading column only

## Design notes
- Tokens: Container width presets + the article prose typography scale
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1037-110
