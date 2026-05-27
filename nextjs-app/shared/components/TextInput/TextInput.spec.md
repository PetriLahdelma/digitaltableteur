# TextInput

## Intent
Single-line input atom used inside `FormField`. Owns the focus ring, error border, and icon slots so consumers do not restyle the native `<input>` per form.

## Interaction contract
- Keyboard: Standard text input. Clear button (when enabled) is reachable by Tab from the input.
- Pointer: Click to focus; click the clear button to empty the value.
- Screen readers: Announces as the surrounding `FormField` instructs (label + input role + current value). The clear button announces as 'Clear input, button'.

## Do / don't
- Do: Always wrap in `FormField` so the label + helper are wired correctly.
- Do: Use `startIcon` for affordance hints (search glyph, currency symbol).
- Don't: Use without a label — the input has no accessible name on its own.
- Don't: Use for multi-line input — use `TextArea`.

## Design notes
- Colors: --color-text, --color-border-default, --color-accent
- Spacing: --space-internal-8, --space-internal-12
- Radii: --radius-md
- Typography: --font-size-sm, --font-size-md, --font-size-lg
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
