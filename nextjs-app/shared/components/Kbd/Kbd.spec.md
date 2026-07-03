# Kbd

## Intent
Inline keyboard-key indicator for docs, tooltips, and command hints. Renders
a semantic `<kbd>` styled as a keycap with the mono font token.

## Interaction contract
- Static, non-interactive; no keyboard or pointer behavior of its own.
- Screen readers: announced as regular text; `<kbd>` conveys the semantic.

## Do / don't
- Do: compose combos as sibling Kbds with a literal separator (`⌘ + K`).
- Do: match `size` to the surrounding text scale.
- Don't: use Kbd as a button; it never receives focus or handles clicks.
- Don't: put whole phrases inside one Kbd; one key (or chord symbol) per cap.

## Design notes
- Tokens: `--font-mono`, `--color-border`, `--color-surface`, `--color-text`,
  `--radius-sm`, `--space-internal-2/6`.
- The thicker bottom border gives the keycap depth without shadows.
- Forced colors: border maps to `ButtonText`.
