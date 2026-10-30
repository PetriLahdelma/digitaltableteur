# Select

## Intent
A labelled single-choice field that opens the DS option list, so every
dropdown on the site looks and behaves the same. Select is a thin wrapper
over Combobox (a WAI-ARIA select-only combobox): it keeps the `options` /
`<option>` children API, turns an empty-value option into the placeholder
and adds uncontrolled use, `size` and form submission through `name`.
Decided 2026-10-30 (owner): DS fields use the DS menu, never the operating
system's native popup; this replaces the earlier native `<select>`.

## Interaction contract
- Keyboard: Tab focuses the field. ArrowDown, ArrowUp, Enter or Space open
  the list; arrows move the highlight; Home / End jump to the ends; typing
  jumps to the first option whose label (or any word in it) starts with
  the typed text; Enter or Space picks; Escape closes and keeps the value.
- Pointer: click the field or the chevron to open the list; click an option
  to pick it; click outside closes.
- Screen readers: a combobox named by the label, announcing the selected
  option; the list is a listbox with `aria-selected` on the picked option
  and `aria-activedescendant` tracking the highlight. The status message
  and helper line are linked with `aria-describedby`; an error sets
  `aria-invalid` and is announced as an alert.

## Do / don't
- Do: use `onValueChange` (the new contract). The legacy `onChange`
  still works but emits a deprecation warning in development.
- Do: pass `name` when the field submits with a native form; a hidden
  input carries the value.
- Don't: ship a Select with `value` and `defaultValue` both set —
  `value` wins and a dev-mode warning fires.
- Don't: use Select for a freeform value with suggestions, or for several
  values; use TextInput, or MultiCombobox for several.

## Design notes
- Built on FieldShell and the shared field chrome: label row with
  optional actions, 40 / 48 / 56px heights for sm / md / lg, 16px inset,
  status border colours from `styles/field.module.css`.
- The option list is Combobox's portaled list (`useComboboxDropdown`),
  shared with MultiCombobox and PhoneInput's country picker.
- The deprecated `onChange` is still called *after* `onValueChange`
  to keep backwards compatibility predictable.
