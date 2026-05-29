# Spacer

## Intent
Provide a named gap element so reviewers reading JSX see 'a 16-pixel spacer' instead of an empty `<div className='h-4'/>` cargo culted across components.

## Interaction contract
- Keyboard: None.
- Pointer: None.
- Screen readers: Silent.

## Do / don't
- Do: Use inside a `Stack` or vertical layout where the gap is conceptually a deliberate break, not the container's rhythm.
- Do: Prefer the layout container's `gap` token over `Spacer` when every sibling is spaced uniformly.
- Don't: Stack two Spacers — collapse them into the larger size.
- Don't: Use as a 'push' element to right-align content — use flex `margin-inline-start: auto` instead.

## Design notes
- Spacing: --space-layout-4, --space-layout-8, --space-layout-12, --space-layout-16, --space-layout-24, --space-layout-32
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
