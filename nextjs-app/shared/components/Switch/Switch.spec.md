# Switch

## Intent
Render a two-state setting toggle with the right semantic role for
"on/off" controls. Switch is distinct from Checkbox: it implies
"applied immediately" and is announced by screen readers as a switch,
not a checkbox.

## Interaction contract
- Keyboard: Space and Enter toggle. Tab follows DOM order.
- Pointer: click toggles. Loading state suppresses click.
- Screen readers: `<button role="switch">` with `aria-checked` reflecting
  the value. Loading sets `aria-busy`; disabled sets `aria-disabled`.

## Do / don't
- Do: use Switch for "apply-on-toggle" settings.
- Do: set `isLoading` during async commits to prevent double-flips.
- Don't: use Switch inside a form whose values are submitted in a batch.
  Use Checkbox there so the choose-then-Submit affordance is honest.
- Don't: rely on colour alone to convey state — the position of the
  thumb is the primary visual cue, and forced-colors fallbacks preserve
  that position semantic.

## Design notes
- Tokens: on-state surface is `--color-primary`; off-state is
  `--color-surface-2`. Thumb is `--color-on-primary` against the surface.
  Loading spinner uses the focus ring colour for clarity.
- Figma: https://www.figma.com/design/digitaltableteur/switch — variants
  for placement (right / left / top label) and loading state aligned with
  the Figma component set.
- Label and HelperText composition is internal — the consumer passes
  strings, the component owns the layout. Different from Checkbox, where
  the consumer composes the surrounding atoms manually.
- Axe exemption (documented): while `loading` the control is inert
  (interaction blocked, `aria-busy`) and its label takes the muted
  disabled colour, intentionally sub-AA (3.19:1). WCAG 1.4.3 exempts
  text that is part of an inactive control; axe cannot infer the label's
  association, so the Loading story disables the color-contrast rule with
  a pointer to this note. Do not reuse the muted colour for active text.
