# Toast

## Intent
Acknowledge a user-initiated action without blocking the flow. Toast is
deliberately transient — the user is not expected to read it twice.
For anything that demands a response, the right primitive is Modal; for
anything that should stay until dismissed, AlertBanner.

## Interaction contract
- Keyboard: Toast does not capture focus. There is no dismiss button
  by default — the toast disappears on its own timer.
- Pointer: the surface does not respond to clicks. (Click-to-dismiss is
  a future affordance; tabling until a consumer needs it.)
- Screen readers: announced via `aria-live`. `polite` for info and
  success; `assertive` for warning and error so the announcement
  interrupts. `aria-atomic="true"` makes the full message announce on
  every update, not just the changed words.

## Do / don't
- Do: keep the message ≤ 60 characters so it fits on a single line.
  Two-line toasts get cropped at the bottom of mobile viewports.
- Do: pair `tone="error"` with an actionable next step ("Retry" in
  the message text) so the user knows what to do. Use AlertBanner for
  persistent errors that can't be auto-resolved.
- Don't: stack toasts. The provider queues them — calling `showToast`
  three times in a frame shows the last one only, which is intentional.
- Don't: rely on Toast for compliance acknowledgements (cookie consent,
  GDPR). Those need persistent acknowledgement; use Modal +
  CookieConsent.
- Don't: use Toast for validation errors on a field. The visual is far
  from the error source; use HelperText.

## Design notes
- Tokens: tone surfaces use the same `--color-<tone>-surface`
  tokens as AlertBanner so the visual language is consistent. Radius is
  `--radius-md`; elevation is `--shadow-lg` since Toast floats above
  content.
- Figma: https://www.figma.com/design/digitaltableteur/toast — six
  positions × four severities; size prop maps `sm` / `md` / `lg`.
- Icons are direct Phosphor `weight="fill"` imports (not via the
  `<Icon />` component) to keep visual alignment tight with the
  `ToastProvider` library used in the chat widget. The shared icon set is the
  one nailed-down constraint between the two.
- The `<ToastProvider>` at the app root owns the live region; this
  component is the visual + ARIA implementation rendered on demand.
  Direct `<Toast />` mounting is supported but discouraged.
