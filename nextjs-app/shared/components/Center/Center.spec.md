# Center

## Intent
Provide a single, named primitive for centering content so reviewers do not have to read a Tailwind class string to know what the component is doing.

## Interaction contract
- Keyboard: None — non-interactive.
- Pointer: Click events pass through.
- Screen readers: Wrapper is silent; announcements come from the child content.

## Do / don't
- Do: Use as the outer wrapper of a small empty-state, loading slot, or hero-band.
- Do: Pair with a height constraint on the parent so vertical centering has something to center inside.
- Don't: Center large layout sections — use `Section` + `Container` instead.
- Don't: Rely on this to vertically center text inside a button or input — those already center via their own padding.

## Design notes
- No own tokens (inherits from container).
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
