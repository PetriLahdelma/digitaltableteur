# AlertBanner

## Intent
Carry persistent, page-level status messages that the user must read
before they can confidently continue. AlertBanner is the only component
in the system that sits "in the flow" of content as a status — Toast is
transient, HelperText is field-scoped, Modal interrupts. Banner is the
quiet middle option.

## Interaction contract
- Keyboard: the banner itself is not focusable. The dismiss button (when
  present) is in the tab sequence and activates on Enter / Space.
- Pointer: only the dismiss button responds to clicks. Clicking the
  body is a no-op.
- Screen readers: announced via `role="status"` with `aria-live="polite"`
  by default. Errors should pass `aria-live="assertive"` so the
  announcement interrupts. The leading icon adds an accessible word for
  the tone (`info` / `success` / `warning` / `error`) so colour is not
  the only signal.

## Do / don't
- Do: pass `aria-live="assertive"` for `tone="error"` so the AT user is
  interrupted. The default `polite` is correct for `info` and
  `success`.
- Do: keep the description short — banners that scroll vertically lose
  the user's attention. If the message needs paragraphs, link out to
  a docs page from the description.
- Don't: make errors dismissable. Letting the user hide a blocking
  problem leads to confused support tickets.
- Don't: stack more than one banner on the same page. Two competing
  announcements collide in the AT queue.
- Don't: animate the banner in on every render. AlertBanner is for
  persistent state, not transient feedback.

## Design notes
- Tokens: tone-mapped surfaces use `--color-info-surface` /
  `--color-success-surface` / `--color-warning-surface` /
  `--color-error-surface`; text uses the matching `*-text` token.
  Spacing is `--space-internal-12` (block) / `--space-internal-16`
  (inline). Radius is `--radius-md`.
- Figma: https://www.figma.com/design/digitaltableteur/alert-banner —
  variants map 1:1 to the `tone` prop.
- The icon is intentionally `aria-label`led, not `aria-hidden`, because
  AlertBanner is the canonical place to validate WCAG 1.4.1 (colour is
  not the only signal). If a downstream design ever hides the icon, the
  AT contract still has the tone word.
- Dismiss is a `Button variant="tertiary" size="s"` so it doesn't
  compete with primary actions on the page. The button is positioned
  trailing so the message reads "tone, title, description, dismiss".
  Its strings are localized (`alertBanner.dismissLabel` / `alertBanner.close`).
- The `action` slot renders one follow-up under the description (Astryx
  Banner parity); the `icon` prop overrides the tone glyph without
  changing the announced tone word.
