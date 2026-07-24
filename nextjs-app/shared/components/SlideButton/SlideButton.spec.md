# SlideButton

## Intent

A prominent pill call-to-action for a single, high-value destination. On hover the icon
disc slides across the pill while the label shifts to make room and the disc rolls a full
turn -- a playful affordance that draws the eye without changing meaning. It renders a real
`<a href>`, so it is keyboard-reachable and activates like any link. Extracted from the
home page's "Start your sprint" button so any surface can reuse the same treatment.

## Interaction contract

| Input | Result |
|-------|--------|
| Click / Enter | Follows the link to `href` |
| Tab | Receives focus in DOM order; the focus ring must stay visible on the pill |
| Hover | Disc slides to the far edge, label padding flips, disc rolls 360 degrees |
| `prefers-reduced-motion: reduce` | Disc, label, and roll stay put on hover; layout, label, and activation are unchanged |

## Do / don't

- Do (must): give a `label` that names the destination -- it is the control's accessible
  name. The disc is `aria-hidden` and carries no meaning.
- Do: pass a real `href`. This is a link, not a button; use it to navigate, not to submit.
- Do: forward `data-*` hooks (e.g. `data-donny-interest`) via the spread anchor props when a
  surface needs them.
- Do: keep the label short (<= 24 chars) so the pill stays compact and the slide reads.
- Don't (must): rely on the slide or roll to communicate anything -- both are suppressed
  under reduced motion, so the label must stand alone.
- Don't: use it for form submission or in-page actions; reach for `Button` there.
- Don't: place more than one per view. It is a focal CTA, not a repeated control.

## Design notes

The pill is a 44px anchor holding a 32px disc; at rest the disc sits 6px inside the leading
edge and travels to `calc(100% - 38px)` on hover while the label's inline padding flips.
`iconSide="right"` mirrors the resting and hover positions. The roll is a CSS keyframe on the
disc; all motion is gated behind `@media (prefers-reduced-motion: reduce)`.

Colours come from tokens only: `--color-primary` / `--color-primary-foreground` for the
pill, `--logo-background` for the disc, `--color-foreground` for the icon, `--color-ring`
for focus. A `forced-colors` block keeps the pill border, disc, and icon legible against the
system palette.

## Status

Alpha. Beta needs `forcedColorsVerified` (the ForcedColors story verified in a real browser)
and `lightDarkVerified`. Neither has been run; the contract records both as false.
