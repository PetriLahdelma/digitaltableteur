# Skeleton

## Intent
Hold the shape of loading content so the layout never jumps: pick the
variant mirroring what will appear (text/avatar/card, or free-form
rect/circle) and compose several to sketch the incoming module. Family
rule: Skeleton for layouts, Spinner for sub-second unknown waits,
Progress for measurable work.

## Interaction contract
- Keyboard: not focusable; placeholder chrome only.
- Pointer: no pointer interactions.
- Screen readers: each skeleton is `role="status"` with `aria-label`
  from the `label` prop. For composed regions, put one labelled status
  wrapper around an `aria-hidden` composition (ComposedPage story) so
  the page does not chatter.

## Do / don't
- Do: mirror real widths, heights, and rhythm so the content swap is
  seamless.
- Do: name what is loading ("Loading article"), not the mechanism.
- Don't: leave skeletons up after a load fails — resolve to an error
  state.
- Don't: bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Shimmer is decorative and disabled under `prefers-reduced-motion`
  (equivalent to `animate={false}`).
- Group: feedback (moved from structure in Astryx batch 4 to match the
  loading family and the Feedback sidebar category).
- Figma: linked from the component contract `figma` URL.
