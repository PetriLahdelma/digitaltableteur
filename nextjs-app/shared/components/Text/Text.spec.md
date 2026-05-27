# Text

## Intent
Render body and inline typography on the canonical size, terminal, and
line-height ladder. Text is the default container for prose; Title owns
headings, HelperText owns input help, Code* owns monospace. Anything else
in the typographic system flows through Text.

## Interaction contract
- Keyboard: none. Text is non-interactive.
- Pointer: none. Selection follows native behaviour for the resolved tag.
- Screen readers: announced according to the resolved tag. `p` reads as
  a paragraph in rotor lists, `strong` and `em` carry semantic emphasis,
  `span` is silent. Passing a heading tag emits heading semantics, but
  Title is the right component for that case.

## Do / don't
- Do: pick `as` based on the semantic role of the text (`p`, `strong`,
  `em`, `span`). Visual size is `size`, independent.
- Do: use `lineHeight` to bring lede paragraphs and inline copy back into
  the typographic rhythm — `snug` for ledes, `relaxed` for body.
- Don't: nest a `<Text as="p">` inside another `<p>`. HTML rejects nested
  paragraphs; use `as="span"` for inline positions.
- Don't: override font-size via inline `style`. The ladder is the contract;
  drift in consumer code is invisible until someone audits typography.

## Design notes
- Tokens: drives from `--font-family-serif`, `--font-family-sans`, and the
  `--font-size-text-*` ladder in `variables.css`. Line-height variants
  cover `tight` through `loose`; default inherits from the size token.
- Figma: https://www.figma.com/design/digitaltableteur/typography — same
  ramp as Title, body weights.
- The default terminal is `sans`. Editorial surfaces (home hero lede,
  about page narrative) opt into `serif` explicitly.
