# ProjectCard

## Intent
Basic portfolio project card for the work grid: a clickable thumbnail with title, optional category eyebrow and up to three tags.

## Interaction contract
- Keyboard: the whole card is a single focusable link to the project detail page
- Pointer: click anywhere on the card to open the project; hover scales the thumbnail
- Screen readers: one link; the thumbnail carries the project title as alt text
- Reduced motion: hover scale/translate/opacity transitions are gated behind `motion-reduce:` utilities
- Coming soon: with `comingSoon` the root is a non-interactive `div` (nothing focusable, no hover affordances) and a badge with `comingSoonLabel` overlays the media; matches EnhancedProjectCard's teaser mode

## Do / don't
- Do: pass `title`, `slug` and `thumbnail`; add `category`/`tags` for richer cards
- Do: choose `titlePosition` (overlay | below) and `aspectRatio` per surface
- Do: set `comingSoon` for projects without a case-study route, passing a translated `comingSoonLabel` (`t("workComingSoon")`)
- Don't: invent parallel primitives inside this folder
- Don't: reach for this when EnhancedProjectCard's richer surface is needed — pick one per surface

## Design notes
- Tokens: Tailwind utility classes mapped to theme tokens; thumbnail radius uses rounded-lg
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1031-109
