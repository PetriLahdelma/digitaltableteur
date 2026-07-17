# Label

## Intent
Provide the visible, accessible-name-bearing label for a single form
control. Label is intentionally narrow — it owns text + required indicator
+ disabled muted style, and explicitly does not own grouping (use a
fieldset) or help text (use HelperText).

## Interaction contract
- Keyboard: clicking the label moves focus to the associated input via
  native `htmlFor` resolution. No custom handler.
- Pointer: click activates / focuses the associated input. The
  `title`/`tooltipText` attribute fires a native tooltip on hover.
- Screen readers: the label text becomes the accessible name of the
  associated input. The required asterisk is hidden from SR; the
  `<span className="srOnly">(required)</span>` is announced instead.

## Do / don't
- Do: pass `htmlFor` for every Label. Implicit association by wrapping
  works in browsers but is fragile under DOM reordering.
- Do: pair `Label required` with `Input required` — visible state and
  ARIA state must agree.
- Don't: place validation errors inside Label. Errors belong to the
  input's described-by region, not the label.
- Don't: use a Label as a section heading. Headings carry navigation
  semantics that Label does not.

## Design notes
- Tokens: drives from `--color-text` (default), `--color-text-muted`
  (disabled), and `--color-required` (asterisk). Forced-colors mode
  overrides the disabled muted colour with the system `GrayText` keyword.
- Axe exemption (documented): the disabled label colour is intentionally
  sub-AA (3.19:1 on white). WCAG 1.4.3 exempts text that is part of an
  inactive user interface component, and a label of a disabled control is
  part of that component — axe cannot infer the association, so the
  Disabled stories (React and dt-label) disable the color-contrast rule
  with a pointer to this note. Do not reuse the muted colour for active
  text.
- Figma: https://www.figma.com/design/digitaltableteur/forms — keep
  required-marker styling aligned with the Figma form-field component.
- The translation surface is implicit: consumers pass already-translated
  strings via `children`. The "(required)" SR text is hardcoded in EN
  because the asterisk semantics are universally understood; if a locale
  needs a different SR convention, override via the consumer.
