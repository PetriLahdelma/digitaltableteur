# FormField

## Intent
Name a GROUP of controls with a fieldset legend: radio sets, checkbox clusters, composite fields (a date range, opening hours). Per the field-wrapper convention (decided 2026-07-03), individual controls own their own label / error / helperText chrome; FormField exists only for the group case, adding a legend, an optional group description, and a group-level error.

## Interaction contract
- Keyboard: focus reaches the contained controls; the fieldset itself is non-focusable. `disabled` disables every contained control natively.
- Screen readers: the `<legend>` is the group's accessible name and is announced on every control inside. `groupDescription` renders under the legend; the group `error` renders after the controls with `role="alert"`.

## Do / don't
- Do: use it whenever two or more controls answer one question; write the legend as the question.
- Do: put cross-control validation in the group `error`; per-control failures belong on each control's own `error` prop.
- Don't: wrap a single labeled control; TextInput, Select, Checkbox and friends carry their own label/error/helperText.
- Don't: use it as a layout box; it renders a real fieldset with announcement semantics.

## API notes
- 2026-07-03 (Astryx Phase 3 batch 2): single-control mode removed (`label`, `helperText`, `id`, and the cloneElement aria wiring). `legend` is now required. There were no production consumers of single-control mode.

## Design notes
- Colors: --color-error, --color-muted, --color-text
- Spacing: --space-internal-8, --space-internal-16
- Typography: --font-body, --font-size-text-s, --font-size-text-l
- Figma: pending — link at beta → stable promotion.
- Catalog status: **beta**; group-mode re-scope and doc data authored in the Astryx Phase 3 batch 2 sweep on 2026-07-03.
