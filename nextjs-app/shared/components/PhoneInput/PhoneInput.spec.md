# PhoneInput

## Intent
International phone entry without making users think about calling codes:
wraps `react-phone-number-input` (country code select + formatting input)
in the design-system field chrome (Label, HelperText, error wiring). Emits
E.164 (`+358401234567`) — the interchange format — via `onChange`.

## Interaction contract
- Keyboard: Tab reaches the country select, then the number input. Arrow
  keys or typing a country name ("swe") change country in the select;
  digits format live in the input, in the national format ("040 123 4567").
- Pointer: click the code ("FI +358") to open the native country list,
  which reads "Finland +358" with the default country first.
- Screen readers: label associated via `htmlFor`/generated id; error and
  helper text linked with `aria-describedby`; `aria-invalid` set while
  `error` is present. The country select is named "<label> country"
  (localized in EN/FI/SV from the library's locale files).

## Do / don't
- Do: validate with `isValidPhoneNumber` from `react-phone-number-input`
  on blur or submit; the field formats but never blocks input.
- Do: treat `onChange(undefined)` as "incomplete", not as an error.
- Do: set `defaultCountry` for the audience (defaults to `FI`).
- Don't: read the DOM input value — it is the national display format,
  not the E.164 value.
- Don't: split country code and number into two fields.

## Design notes
- No flag images: the library loads them from a third-party host, which a
  strict CSP (the client intake area) blocks and which leaks the visit.
- `size="lg"` gives the 3rem height every lg field shares (TextInput,
  Select, Combobox).
- Library chrome is restyled via `:global(.PhoneInput*)` overrides in
  `PhoneInput.module.css` using design tokens (`--color-primary`,
  `--color-error`, `--font-text`).
- Error state colors the control with `--color-error` / `--color-error-bg`
  and renders the message through `HelperText state="error"`.
- The required marker on the Label reflects the `required` prop.
