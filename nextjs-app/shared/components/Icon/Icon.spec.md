# Icon

## Intent
Wrap the Phosphor icon set with the project's size ramp, motion
affordances (`spin`, `pulse`), and the accessibility plumbing that raw
SVG embedding tends to miss. Icon's contract is "render this glyph at the
right size with the right ARIA — and warn me if I'm doing it wrong."

## Interaction contract
- Keyboard: none. Icon is non-interactive. Pair with Button for activation.
- Pointer: none. Hover affordances belong to the parent control, not Icon.
- Screen readers: silent by default (`aria-hidden="true"`). When
  `ariaLabel` is passed, `role="img"` is added and the label becomes the
  accessible name; the inner SVG remains hidden so the name resolves
  reliably across the Phosphor weights.

## Do / don't
- Do: leave Icon decorative when it sits inside a labelled control
  (Button text owns the name). The default `aria-hidden` is correct.
- Do: pass `ariaLabel` on standalone icon-only controls — the icon
  carries the name when no text is present.
- Don't: pass both `ariaLabel` and `decorative`. The component prefers
  `ariaLabel`; the prop pair is documented as mutually exclusive.
- Don't: import a Phosphor component directly from `@phosphor-icons/react`
  to get the same shape — you lose the alias map, the SR semantics, and
  the size ladder. Use Icon.

## Design notes
- Tokens: size resolves to a numeric pixel value via the `NAMED_SIZES`
  map (`2xs` = 12px through `2xl` = 64px). The transform/animation
  classes live in `Icon.module.css`; tokens are colour-only.
- Figma: https://www.figma.com/design/digitaltableteur/icons — Phosphor
  is the canonical library; the alias map gives a soft landing for the
  old FontAwesome catalog while consumers migrate.
- Spin and pulse animations use CSS `@media (prefers-reduced-motion)` to
  suppress motion. The reduced-motion path is tested in the **Motion**
  foundations story.
