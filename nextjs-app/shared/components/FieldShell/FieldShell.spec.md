# FieldShell

## Intent
One frame for every DS text and choice field, so TextInput, TextArea, Select,
Combobox, MultiCombobox and PhoneInput share the same label row, status
colours, message lines and spacing instead of each rolling its own.

## Interaction contract
- Keyboard: the shell itself takes no focus. Label-row actions are icon
  buttons in DOM order before the control. An action with `items` is a menu
  button: Enter, Space or ArrowDown opens it, arrows move, Escape closes.
- Pointer: clicking the label focuses the control. A direct action runs its
  `onClick`; a menu action opens its menu at the end of the row.
- Screen readers: the label names the control (`for`, plus the
  `${controlId}-label` id for aria-labelledby). `fieldDescribedBy` gives the
  control the status message id, then the helper id. An error message is an
  alert; warning and success are plain text with their icon.

## Do / don't
- Do: use the fields' `status`, `statusMessage` and `actions` props; reach
  for FieldShell directly only for a new kind of control.
- Do: name each action with a verb ("Paste", "Generate password").
- Do: keep `error` for validation; it is shorthand for status error.
- Don't: wrap a DS field (TextInput, TextArea, Select, Combobox, MultiCombobox, PhoneInput) in another FieldShell; they render their own.
- Don't: put text buttons or links in actions; actions are icon buttons that run an operation or open a menu of operations.
- Don't: use it for a group of controls; FormField's fieldset owns the group case.

## Design notes
- Tokens: --space-internal-8 between label row, control and messages,
  --space-internal-4 between the status message and the helper line.
  Status borders: --color-error, --color-warning-contrast, --color-success
  (styles/field.module.css, applied with fieldStatusClass).
- The label row is one label line tall (24px) with or without actions;
  the 40px icon buttons centre on it, so fields side by side keep their
  controls level.
- No outer margin: the form or stack owns the space between fields.
- A status border holds through hover and focus and gives way to disabled.
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=2065-7823 (Status variants; the label-row action is the private `_FieldShell/Action` part).
