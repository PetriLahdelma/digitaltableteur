# Title

## Intent
Render the typographic heading for a page, section, card, or modal with a
visual scale that is independent of the semantic heading level. Title's
contract is "this is a heading; here is how it should look" — consumers
choose the level for document outline reasons, not visual ones.

## Interaction contract
- Keyboard: none. Title is non-interactive.
- Pointer: none.
- Screen readers: announced as a heading at the chosen level (`h1`–`h6`)
  when `level` or `as` resolves to a heading tag. When `as` is set to
  `span`, no heading semantics are emitted — useful for decorative
  display text inside cards.

## Do / don't
- Do: choose `level` for the document outline first; choose `size` for the
  layout second. Independent props, independent decisions.
- Do: keep one `level={1}` per route. The page composition owns the outline
  rule, not the Title component.
- Don't: visually size a heading by passing custom inline styles — use the
  size variants so the typography stays in the system.
- Don't: nest a Title inside a Button. Use the Button's text slot directly.

## Design notes
- Tokens: drives from `--font-family-serif`, `--font-family-sans`, and the
  `--font-size-title-*` ladder in `variables.css`. Line-height variants
  cover `tight` through `loose`; default falls out of the size token.
- Figma: https://www.figma.com/design/digitaltableteur/typography — keep
  size labels (XXS through XXL) aligned with the Figma type ramp so
  designer-to-dev handoff is mechanical.
- The serif/sans terminal split mirrors the editorial vs product tone
  distinction on this site. Serif at XL/XXL is the hero signature; sans at
  S/M is product chrome.
