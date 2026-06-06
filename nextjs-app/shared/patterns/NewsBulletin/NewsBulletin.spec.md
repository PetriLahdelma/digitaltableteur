# NewsBulletin

## Intent
Homepage news bulletin strip with three topical slots above the footer.

## Interaction contract
- Keyboard: Tab through linked cards; Enter activates internal and external links
- Pointer: Cards with links are fully clickable targets
- Screen readers: Each card has an aria-label combining badge context and body text

## Do / don't
- Do: use for homepage footer-adjacent topical snippets from `NEWS_BULLETIN_ITEMS`
- Do: keep badge + body copy synchronized with the data module for all locales
- Don't: use for full blog indexes or article lists
- Don't: replace with generic Card stacks without region semantics

## Design notes
- Tokens: bulletin surface uses pattern CSS module tokens
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=503-20
