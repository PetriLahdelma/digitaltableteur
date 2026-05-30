# Combobox

## Intent
Single-select combobox for editorial forms. Replaces native `<select>` with a portaled dropdown, shared field styling, and Lenis-safe list scrolling.

## Interaction contract
- Keyboard: Tab focuses trigger; Enter/Space opens; Arrow keys move highlight; Enter selects; Escape closes.
- Pointer: click trigger toggles list; click option selects and closes; click outside closes.
- Screen readers: combobox + listbox + option `aria-selected` semantics.

## Do / don't
- Do: use via `FormFieldEditorial` `type="select"` on editorial contact forms.
- Do: pass stable `value` / `onValueChange` pairs for controlled usage.
- Don't: nest inside containers with `overflow: hidden` without portaling (dropdown renders on `document.body`).

## Design notes
- Shares `ComboboxField.module.css` with MultiCombobox for label, control, trigger, and option styling.
- Chevron uses `@dt/Icon` `caret-down` aligned with other editorial fields.
