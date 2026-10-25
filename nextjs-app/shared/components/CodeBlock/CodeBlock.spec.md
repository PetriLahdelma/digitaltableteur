# CodeBlock

## Intent
Multi-line source the reader will scan or paste: optional filename header,
line numbers, highlighted, added and removed rows, copy and a caption.
Replaces CodeBlockWindow.

## Interaction contract
- Keyboard: Tab reaches the copy button, then the code body when it
  overflows; arrow keys scroll the focused body.
- The body is a named region with a tab stop only while it scrolls.
- Screen readers: line numbers have empty alternative text; added and
  removed rows announce "Added line" / "Removed line" via the sign column.
- Copy leaves removed lines and the sign column out, so a copied diff
  pastes as the code after the change.

## Inputs
- `code` string: highlighted at runtime (Prism, mapped to the code-shiki
  tokens). `language="diff"` turns leading +/- into added and removed rows.
- `children`: a Shiki tree from rehype-pretty-code. In the MDX meta string
  a line range highlights, a range with the id `added` or `removed` marks a
  diff, and `showLineNumbers` turns numbers on.

## Do / don't
- Do: always set `language`.
- Do: give a `filename` when the code has a paste destination.
- Do: mark changes as added and removed rows, never with comments.
- Don't: highlight most of the block.
- Don't: number blocks under five lines.
- Don't: nest it in another scroll container; use `maxHeight`.

## Design notes
- Flat card: radius-lg, `--color-border-light` hairline, no window chrome.
- Rows: 14/22 mono; 2px state bar; 30px number column and 22px sign column.
- Terminal applies the global `themeDark` class; high-contrast themes keep
  their own tokens.
- Figma: CodeBlock (1976:7307) and CodeLine (1976:7282).
