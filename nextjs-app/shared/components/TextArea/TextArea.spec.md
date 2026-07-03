# TextArea

## Intent
Provide the canonical multi-line text field, matching **TextInput**'s
label / helper / error contract but for free-form multi-line entry.
Consumers pass `{ label, value, onChange, error }` the same way they
do for TextInput; the extra surface is `animateResize` / `minRows` /
`maxRows` for auto-growing fields.

## Interaction contract
- Keyboard: native multi-line textarea. Tab moves focus in/out; Enter
  inserts a newline (never submits the containing form on its own).
- Pointer: click focuses; native drag-resize is disabled while
  `animateResize` is on (the component manages height itself).
- Screen readers: the label is announced via the native
  `<label htmlFor>` binding (label is a required prop; there is no
  bare/`aria-label`-only mode on this component).

## Do / don't
- Do: use `onChange` (this component predates TextInput's
  `onValueChange` migration; it still takes the string value
  directly rather than an event).
- Do: use `animateResize` + `minRows` / `maxRows` for chat-like or
  message fields that should grow with content.
- Don't: pass `resize` or `showCount`: those belonged to a previous,
  unused parallel implementation and are not supported by the current
  component.
- Don't: use TextArea for single-line text. Use **TextInput**.

## Design notes
- Tokens: shares TextInput's visual language; border uses
  `--color-primary` (default) or `--color-error` (error state);
  surface uses `--color-white`.
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=374-17
- The animated-resize implementation measures `scrollHeight` against
  computed `lineHeight` to clamp between `minRows` and `maxRows`,
  toggling `overflow-y: auto` once content exceeds `maxRows`.
- `ChatTextArea` (an unlabeled, always-animated sibling used only by
  the chat composer) was extracted out of this file into
  `ChatWidget/ChatTextArea.tsx`; it is not part of this component's
  public surface.
