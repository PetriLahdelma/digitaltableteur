# TextLink

## Intent
Provide an inline link primitive optimised for body copy. The visual is a colour change + underline-on-hover; the focus ring is the design system's focus token.

## Interaction contract
- Keyboard: Tab to focus; Enter to activate. Same as a native `<a>`.
- Pointer: Hover applies the hover colour token; click follows the link in the current tab unless `target` overrides.
- Screen readers: Announced as 'link, {text}'. Surrounding paragraph context is preserved.

## Do / don't
- Do: Use inside prose where the link sits in a sentence.
- Do: Let the visible text describe the destination — 'see the contact page' beats 'click here'.
- Don't: Use as a button — opening a dialog or running a side-effect is a `Button` job.
- Don't: Style as an icon — wrap an icon link in `IconButton` (with `aria-label`) instead.

## Design notes
- Colors: --color-text, --color-link, --color-link-hover
- Typography: --font-size-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
