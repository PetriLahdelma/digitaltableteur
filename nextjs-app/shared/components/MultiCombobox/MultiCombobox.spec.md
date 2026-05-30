# MultiCombobox

## Intent
Multi-select combobox with inline Badge chips, type-to-filter dropdown, and editorial field styling for contact and similar forms.

## Interaction contract
- Keyboard: Tab focuses input; typing filters; Arrow keys move highlight; Enter toggles option; Backspace removes last chip when input empty; Escape closes list.
- Pointer: click chevron toggles list; click option toggles selection; click chip remove clears one value.
- Screen readers: combobox with `aria-multiselectable` listbox; selected options announced.

## Do / don't
- Do: pass `string[]` value and `onValueChange` for controlled multi-select state.
- Do: localise option labels via i18n before passing `options`.
- Don't: use for single-select — use `Combobox` instead.

## Design notes
- Selected values render as `@dt/Badge` chips (secondary, neutral, size `s`, removable).
- Dropdown portals to `document.body` with Lenis wheel prevention on the list.
