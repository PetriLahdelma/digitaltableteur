# Checkbox

## Intent
Provide the single binary toggle that forms reach for, with the
indeterminate tri-state for grouped-selection parents. The contract
honours native checkbox semantics; the wrapper adds the labelled
composition, the controlled/uncontrolled split, and the size ladder.

## Interaction contract
- Keyboard: Space toggles checked / unchecked. Tab moves focus between
  controls (DOM order). No custom keys.
- Pointer: click on the input or the associated label toggles state.
  Click outside has no effect.
- Screen readers: native `<input type="checkbox">` semantics. Announces
  the label, the role (checkbox), and the state (checked / unchecked /
  mixed when indeterminate).

## Do / don't
- Do: own state in the parent via `checked` + `onCheckedChange` for
  any field that ships to a form submit. Uncontrolled (`defaultChecked`)
  is for ad-hoc UI.
- Do: set `indeterminate` for "some children selected, not all"
  parents. The visual and SR state match the semantic.
- Do: use the `error` prop for validation such as required consent; it
  wires aria-invalid + aria-describedby and announces via role=alert.
- Don't: rely on the native `indeterminate` HTML attribute — there is
  no such serialised attribute. Use the prop (set as a DOM property).

## Design notes
- Tokens: `--color-primary` drives the checked surface; `--color-surface-2`
  the unchecked. Check glyph uses `--color-on-primary` for contrast.
  Focus ring follows the global `--focus-ring-*` set.
- Figma: https://www.figma.com/design/digitaltableteur/checkbox — keep
  the indeterminate visual aligned with the Figma component states.
- Size normalisation goes through `normalizeSizeProp` so legacy `s|m|l`
  consumers continue to compile alongside the modern `sm|md|lg`.
