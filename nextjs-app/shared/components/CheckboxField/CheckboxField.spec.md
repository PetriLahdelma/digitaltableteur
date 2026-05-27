# CheckboxField

## Intent
Wrap the `Checkbox` primitive in the label + helper-text layout used across the catalog so consumers do not reimplement the same row 7 times.

## Interaction contract
- Keyboard: Tab to focus, Space to toggle. Same as a native checkbox.
- Pointer: Click the checkbox or the label to toggle.
- Screen readers: Announced as '{label}, checkbox, {checked|not checked|mixed}'. Helper text is appended via `aria-describedby`.

## Do / don't
- Do: Use for single boolean fields ('I agree to the terms', 'Subscribe to updates').
- Do: Pair with `helper` text to clarify edge cases.
- Don't: Use for a checkbox group — use `CheckboxGroup`.
- Don't: Use as a toggle for a setting that takes effect immediately — use `Switch`.

## Design notes
- Colors: --color-text, --color-border-default, --color-accent
- Spacing: --space-internal-4, --space-internal-8
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
