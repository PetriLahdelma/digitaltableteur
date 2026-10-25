# Snippet

## Intent
A copyable shell command. The `$` prompt is chrome: aria-hidden and left out
of the copy, so the clipboard holds exactly what runs.

## Interaction contract
- Keyboard: Tab reaches the copy button; Enter or Space copies.
- Screen readers: hear each command as code, never the prompt.
- Several commands render one per line and copy joined by newlines.

## Do / don't
- Do: pass the bare command; the prompt is drawn for you.
- Do: use `theme="inverted"` for terminal emphasis on light pages.
- Don't: type `$` into `command`.
- Don't: use it for source files or output; that is CodeBlock.

## Design notes
- Hairline card, radius-lg, 14px start and 6px end padding around the 28px copy button.
- Inverted applies the global `themeDark` class to its subtree; the
  high-contrast themes take their own tokens back so contrast never drops.
- Figma: Snippet (1976:7371). Replaces CodeSnippet `variant="single"`.
