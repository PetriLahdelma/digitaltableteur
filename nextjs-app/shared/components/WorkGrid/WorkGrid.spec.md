# WorkGrid

## Intent
Responsive portfolio work-index grid: one EnhancedProjectCard per project, with a friendly empty state.

## Interaction contract
- Keyboard: focus flows through each card link in order
- Pointer: each card is an EnhancedProjectCard linking to its project
- Screen readers: grid is `role="list"` labelled via workGalleryLabel; each project is a listitem; the empty state is a labelled heading + description
- Reduced motion: the GSAP scroll-stagger is skipped when the AnimationProvider reports a reduced motion preference

## Do / don't
- Do: pass a `projects` array; tune `columns`, `aspectRatio`, `showCategory`
- Do: rely on the built-in empty state when a filter yields no results
- Don't: invent parallel primitives inside this folder
- Don't: hand-roll the card — WorkGrid owns the EnhancedProjectCard composition

## Design notes
- Tokens: Tailwind grid utilities mapped to theme spacing
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1033-110
