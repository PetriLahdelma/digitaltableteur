# GroupLabel

## Intent
Provide a single, theme-aware label component for grouped form controls so groups have a real group-level name rather than a heading floating in the same column.

## Interaction contract
- Keyboard: None.
- Pointer: Clicking does not focus a specific input — the label belongs to the whole group.
- Screen readers: Announced as the group's accessible name when the surrounding container uses `role='group'` + `aria-labelledby` or a real fieldset.

## Do / don't
- Do: Pair with a `<fieldset>` or `role='group'` container.
- Do: Keep the text short and noun-shaped — it is read once for the whole group.
- Don't: Use as a label for a single input — that is `Label`.
- Don't: Style as a heading — screen readers will navigate to it as a heading and miss the group it labels.

## Design notes
- Colors: --color-text
- Spacing: --space-internal-4
- Typography: --font-size-sm
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
