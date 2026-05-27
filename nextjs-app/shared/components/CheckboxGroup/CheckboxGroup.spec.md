# CheckboxGroup

## Intent
Bundle related checkboxes into a single labelled group with a working
indeterminate master. Consumers stop hand-managing the array of
booleans, the master-state derivation, and the indeterminate visual
— all of which are easy to get wrong.

## Interaction contract
- Keyboard: Tab moves through master, then each option. Space toggles
  the focused checkbox. Shift+Tab walks back. No arrow-key contract —
  each checkbox is independently focusable.
- Pointer: click anywhere on a row toggles the option. The master
  selects or deselects every option in one action.
- Screen readers: the group label announces first, then the master
  ("All, checked / mixed / not checked"), then each option in order.
  The master's `aria-checked="mixed"` is announced when a subset is
  selected.

## Do / don't
- Do: derive `defaultSelected` from server-known state; the component
  resets its internal array when `defaultSelected` changes by
  composition (deep value comparison via `.join(',')`).
- Do: keep option `value`s stable across renders. The internal state
  uses `value` as identity; switching mid-flight loses the user's
  selection.
- Don't: render a CheckboxGroup with one option. It's an awkward
  master + one row — collapse to a single Checkbox.
- Don't: nest a CheckboxGroup inside another CheckboxGroup. AT
  navigation becomes ambiguous; flatten the option list.
- Don't: rely on the master label translation key without testing the
  i18n fallback. The component falls back to the literal "All" if the
  key isn't resolved — tests must verify the resolved label they
  expect.

## Design notes
- Tokens: group spacing uses `--space-internal-8` between options.
  The group label uses `<GroupLabel>` which inherits its own
  typography from `--font-size-text-m` + bold weight. Master row
  shares the same row height as options.
- Figma: https://www.figma.com/design/digitaltableteur/checkbox-group
  — variants: with-master and without-master.
- The component maintains its own array of booleans rather than a
  Set of values because the order needs to mirror the `options` order
  for consistent re-renders.
- `prevOptionValuesRef` and `prevDefaultRef` guard against resetting
  state when only labels change (e.g. language switch). That's the
  edge case the implementation pays for; without it, switching
  languages on a page would clear the user's selection.
