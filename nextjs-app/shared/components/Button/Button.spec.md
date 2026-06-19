# Button

## Intent
Provide the canonical "act" or "navigate-as-action" affordance for the site.
Button is the primary control consumers reach for when they want a user to do
something: submit a form, open a flow, head somewhere intentional. Two
orthogonal axes encode meaning without parallel components: `variant` sets
visual weight (primary / secondary / tertiary) and `tone` sets semantic colour
(neutral / error / warning / success / info).

## Interaction contract
- Keyboard: Enter and Space activate; tab order follows DOM order. The
  component never traps or rebinds keys.
- Pointer: hover feedback is gated to fine pointers; `:active` gives a
  `scale(0.97)` press confirmation; loading suppresses interaction.
- Screen readers: accessible name resolves from `accessibleName`,
  `accessibleNameRef`, or visible `children`; `aria-busy` is announced while
  loading; `aria-disabled` is announced in link mode (anchor) when disabled.
  `surface` is purely visual and adds no screen-reader semantics.

## Do / don't
- Do: use `submits` (not raw `type="submit"`) so form submission is grep-able.
- Do: pass `href` to render the same visual as an anchor when the destination
  is a URL, not a handler.
- Do: compose destructive actions as `variant` + `tone="error"` rather than a
  bespoke variant.
- Do: provide `accessibleName` on icon-only buttons. The dev-mode warning
  catches missing names locally; production must not ship without one.
- Don't: pair an icon-only button with a tooltip as the *only* accessible name
  on mobile; tooltips don't fire on touch. Use `accessibleName` too.
- Don't: nest a Button inside another interactive control. Buttons are terminal.
- Don't: use a Button for inline navigation in body copy. Use **Link**.

## Design notes
- Colour: a single `--btn-accent` (with `--btn-on-accent`) drives every
  variant/tone pairing; `tone` only recolours the accent, so the variant x tone
  matrix stays consistent. Filled `primary` darkens on hover via
  `filter: brightness`; `secondary` / `tertiary` tint via `color-mix`.
- Motion: easing and duration come from `--ease-*` / `--duration-*` tokens;
  transitions name explicit properties (no `transition: all`); the `:active`
  press and movement are suppressed under `prefers-reduced-motion`.
- Surface: `surface="onDark" | "onBrand"` swaps to contrast-safe colours via
  static CSS, with no ancestor background sampling.
- Spacing: `--space-internal-*`; radius `--radius-lg` (pill in rounded mode).
- Size: `sm | md | lg`; touch targets grow to at least 44px under
  `(width <= 768px)`.
- Figma: keep variant/tone naming aligned with the Figma component set so
  designer handoff is mechanical.
