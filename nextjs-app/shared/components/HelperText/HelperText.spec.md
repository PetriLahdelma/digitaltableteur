# HelperText

## Intent
Give form fields a consistent place for hints, validation errors,
warnings, success confirmations, and informational notes. HelperText
owns the paragraph and the right ARIA wiring; consumers own the input
association via `aria-describedby`.

## Interaction contract
- Keyboard: none. HelperText is non-interactive.
- Pointer: none.
- Screen readers: in `error` state the paragraph becomes a polite live
  region (`role="alert"`) and announces on mount. Other states are
  silent; they rely on the field's own SR announcement.

## Do / don't
- Do: wire `aria-describedby` from the input to HelperText's `id`. Without
  it the help text is visible but not announced.
- Do: use `state="error"` only for validation failures. Decorative
  warnings should be the `warning` state without the live-region churn.
- Don't: render multiple `state="error"` HelperTexts under one field —
  multiple live regions create overlapping announcements. Consolidate.
- Don't: use HelperText for page-level messages. AlertBanner and Toast
  exist for that scope.

## Design notes
- Tokens: semantic state colours match Badge / Toast / AlertBanner so the
  form atoms read as one family. Defaults to the muted text token when
  no state is set.
- Figma: https://www.figma.com/design/digitaltableteur/forms — keep the
  state-icon set aligned with the Figma form components.
- The `role="alert"` decision was deliberate: validation errors are the
  one place where field-scoped announcements need to interrupt; the
  AlertBanner / Toast layer owns page-scoped interruption.
