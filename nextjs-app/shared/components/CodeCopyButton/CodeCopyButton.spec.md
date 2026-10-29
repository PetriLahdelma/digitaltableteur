# CodeCopyButton

## Intent
Icon-only copy control for code surfaces. The copy glyph swaps to a check
after a successful copy; a polite live region announces Copied or Copy failed.

## Interaction contract
- Keyboard: Tab focuses; Enter or Space copies.
- Pointer: click copies; hover shows the neutral surface.
- Screen readers: named by `label` (default "Copy code", translated); the
  result is announced through the live region, not the glyph swap.

## Do / don't
- Do: pass `value` as a getter when the text is built late.
- Do: keep the default label for code; rename it for other content.
- Don't: use it as a general action button.
- Don't: report success with the check mark alone.

## Design notes
- `size="sm"` (default): 28px square with a 16px glyph, for code surfaces.
  `size="md"`: 40px square with a 20px glyph, the Button md icon size, for a
  copy control beside body text (the contact page email). Radius-md; glyph
  `--color-muted`, hover `--color-neutral-bg`, copied `--color-success`. HC
  themes outline the hover state.
- A refused clipboard (insecure origin, denied permission) falls back to
  execCommand, then reports failure instead of a false success.
- Figma: CodeCopyButton (1976:7275), State Idle / Hover / Copied.
