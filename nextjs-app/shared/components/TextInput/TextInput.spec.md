# TextInput

## Intent
Provide the canonical labelled text input with built-in validation for
the two types that always validate (email, tel) so consumers don't
re-implement format checks per form. TextInput absorbs the label / helper /
error wiring so the consumer's form code is a sequence of
`{ label, value, onValueChange, error }` quadruples — nothing else.

## Interaction contract
- Keyboard: native single-line input. Tab moves focus; characters
  type into the field; Enter submits the containing form (no custom
  submit handler). ArrowUp / ArrowDown bumps `type="number"`
  values.
- Pointer: click focuses; selection works as native.
- Clearable: with `clearable`, a ×-button renders inside the field
  chrome while the field has a value (never while disabled). It is
  the next Tab stop after the input; activating it empties the
  field, clears any built-in validation error, fires
  `onValueChange("")` then `onClear()`, and returns focus to the
  input. Its accessible name interpolates the field label
  (`inputClearField`: "Clear {{field}}", EN/FI/SV).
- Screen readers: the label is announced first via the native
  `<label htmlFor>` binding. With `hideLabel` the label is
  visually hidden but stays in the accessibility tree. On invalid
  state the description (linked via `aria-describedby` to the error
  helper) is announced on focus.

## Do / don't
- Do: use `onValueChange` (the new contract). The legacy `onChange`
  still works but emits a deprecation warning in dev.
- Do: pair `type="email"` and `type="tel"` with the built-in
  validators. The component will surface format issues without
  consumer wiring.
- Don't: ship a form that relies on the email validator as the only
  verification step. The validator is for UX; the server must verify
  too.
- Don't: pass a `value` plus a `defaultValue`. The component treats
  `value` as controlled; mixing them produces drift.
- Don't: use TextInput for multi-line text. Use **TextArea**, which
  shares the label + helper contract but carries multi-line UX.
- Do: use `clearable` on fields users iterate on (search, filters,
  generators) instead of hand-rolling an adjacent ×-button.
- Don't: treat `hideLabel` as permission to skip the label. The label
  is still required and still read by assistive tech; `hideLabel`
  only removes it visually for dense compositions.

## Design notes
- Tokens: control surface uses `--color-surface`; border uses
  `--color-border` (default) or `--color-error-border` (error).
  Height is `--input-height-md` by default; `--input-height-sm` and
  `--input-height-lg` via the `size` prop. Padding is
  `--space-internal-12` inline.
- Figma: https://www.figma.com/design/digitaltableteur/input — three
  sizes, four states (default / focus / error / disabled), six
  types via the `type` prop.
- The `name` attribute is derived from the label so form submission
  always has a stable key. Consumers can override by passing `name`
  via the rest-spread.
- Phone formatter is `formatIncompletePhoneNumber` from
  `libphonenumber-js`; validator is `parsePhoneNumber(...).isValid()`.
  Empty values pass validation so optional phone fields don't trigger
  errors on mount.
- Email suggestion uses `suggestEmailCorrection` which checks against
  a known set of common domain typos; suggestions surface via the
  same `error` channel as a friendly message.
