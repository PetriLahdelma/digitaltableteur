# FormField

## Intent
Eliminate the per-form boilerplate of wiring label + helper + error around an input. Owners pass children (the control), label text, and optional helper/error props.

## Interaction contract
- Keyboard: Focus reaches the wrapped control. The wrapper is non-focusable.
- Pointer: Clicking the label focuses the wrapped control.
- Screen readers: Label is announced first, then the control's own announcement (input type + value), then the helper text via `aria-describedby`. Errors announce via `role='alert'` on submit.

## Do / don't
- Do: Wrap every field in `FormField` so the label-control-helper triplet is consistent.
- Do: Use `error` for submit-time validation feedback; use `helper` for hints.
- Don't: Render a bare `<label>` + `<input>` next to a `FormField` in the same form — the visual rhythm desyncs.
- Don't: Put two controls inside one `FormField` — wrap each in its own.

## Design notes
- Colors: --color-text, --color-text-muted
- Spacing: --space-internal-4, --space-internal-8
- Typography: --font-size-sm, --font-size-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
