# BlogGrid

## Intent
Responsive blog-index grid: one EnhancedArticleCard per article, with a featured-first layout option and a friendly empty state.

## Interaction contract
- Keyboard: focus flows through each article card link in order
- Pointer: each card is an EnhancedArticleCard linking to its article
- Screen readers: articles render as self-labelled cards; the empty state is a labelled message
- Reduced motion: the FadeIn entrance is skipped when the AnimationProvider reports a reduced motion preference

## Do / don't
- Do: pass an `articles` array; choose `layout`, `columns`, `featuredSlug`
- Do: rely on the built-in empty state when a filter yields no articles
- Don't: invent parallel primitives inside this folder
- Don't: hand-roll cards — BlogGrid owns the EnhancedArticleCard composition

## Design notes
- Tokens: Tailwind grid utilities mapped to theme spacing
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1034-110
