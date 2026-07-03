# FormField

## Intent
Eliminate the per-form boilerplate of wiring label + helper + error around an input. Owners pass children (the control), label text, and optional helper/error props. In group mode (`legend` instead of `label`), FormField renders a `<fieldset>` + `<legend>` around multiple children: the single canonical wrapper for both single-control and grouped-control forms.

## Interaction contract
- Keyboard: Focus reaches the wrapped control(s). The wrapper is non-focusable.
- Pointer: Clicking the label focuses the wrapped control (single-control mode only).
- Screen readers: Label is announced first, then the control's own announcement (input type + value), then the helper text via `aria-describedby`. Errors announce via `role='alert'` on submit. In group mode, the `<legend>` becomes the fieldset's accessible name.

## Do / don't
- Do: Wrap every field in `FormField` so the label-control-helper triplet is consistent.
- Do: Use `error` for submit-time validation feedback; use `helper` for hints.
- Do: Use group mode (`legend` + `groupDescription`) for checkbox sets, radio sets, or any multi-control grouping; pass `Checkbox`/`Radio` children directly.
- Don't: Render a bare `<label>` + `<input>` next to a `FormField` in the same form; the visual rhythm desyncs.
- Don't: Put two controls inside one `FormField` in single-control mode; wrap each in its own, or switch to group mode.
- Don't: Provide both `label` and `legend`; pick one mode.

## Design notes
- Colors: --color-text, --color-text-muted
- Spacing: --space-internal-4, --space-internal-8
- Typography: --font-size-sm, --font-size-md
- Figma: TODO: to be linked during the alpha to beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
