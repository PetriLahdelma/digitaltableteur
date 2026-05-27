# Select

## Intent
Provide a labelled, validated, native `<select>` so consumers don't
hand-author the label / id / `aria-invalid` / helper-text wiring every
time. The native control is chosen on purpose — accessibility and
mobile UX exceed any custom combobox in scope for this system.

## Interaction contract
- Keyboard: native browser behaviour. ArrowUp / ArrowDown moves the
  highlighted option; Enter / Space opens or commits depending on
  platform; type-ahead jumps to the first matching option. Tab moves
  focus to the next field.
- Pointer: click opens the native picker. Click outside closes.
  Touch on iOS / Android invokes the platform sheet.
- Screen readers: the label is announced first, then the current
  value, then "list, N items". Each option is announced with its
  position ("3 of 7"). Error state announces via `aria-invalid` +
  the helper text live region.

## Do / don't
- Do: use `onValueChange` (the new contract). The legacy `onChange`
  still works but emits a deprecation warning in development.
- Do: label every Select. Visually-hidden labels are fine — use the
  `<Label>` primitive with `visuallyHidden` if the design has no
  visible label.
- Don't: ship a Select with `value` and `defaultValue` both set —
  `value` wins and a dev-mode warning fires.
- Don't: use Select for a freeform value with suggestions. Use an
  Input plus a custom autosuggest pattern.
- Don't: wrap the native chevron with a button overlay. The native
  click target is the entire control already; an overlay breaks
  forced-colors and mobile sheets.

## Design notes
- Tokens: control surface uses `--color-surface`; border uses
  `--color-border` (default) or `--color-error-border` (error state).
  Height is `--input-height-md` by default, scaling to `--input-height-sm`
  and `--input-height-lg` via the `size` prop. Padding uses
  `--space-internal-12` inline.
- Figma: https://www.figma.com/design/digitaltableteur/select — three
  sizes (sm / md / lg), four states (default / focus / error /
  disabled).
- The custom chevron is rendered via `<Icon name="caret-down" />` so
  it inherits theme tokens. In forced-colors mode the system draws
  its own chevron and ours becomes invisible — acceptable since the
  native affordance carries.
- The deprecated `onChange` is still called *after* `onValueChange`
  to keep backwards compatibility predictable. Code paths that
  legitimately need both fire in a stable order.
