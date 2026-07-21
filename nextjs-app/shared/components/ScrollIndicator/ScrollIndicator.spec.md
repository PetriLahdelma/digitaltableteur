# ScrollIndicator

## Intent

A hero-footer affordance that tells the reader there is more page below and takes them
there when activated. It renders a real `<button>` that scrolls a named target into view,
with a looping motion hint that stops under `prefers-reduced-motion`. Used by
`ProjectHero`, `BlogHero`, and `AboutHero`; it exists so those three do not each grow
their own scroll cue.

## Interaction contract

| Input | Result |
|-------|--------|
| Click | Scrolls `targetId` into view with `behavior: "smooth"`, aligned to `block: "start"` |
| Enter | Same as click (native `<button>` activation) |
| Space | Same as click (native `<button>` activation) |
| Tab | Receives focus in DOM order; the focus ring must remain visible over the hero |
| No `targetId` | Renders and focuses normally, but activation is a no-op |
| `prefers-reduced-motion: reduce` | The looping hint stops; hit area, label, and scroll behaviour are unchanged |

The scroll itself is delegated to `Element.scrollIntoView`, so it inherits the platform's
smooth-scroll behaviour and any `scroll-behavior` set by the page.

## Do / don't

- Do (must): give the control an accessible name that names the destination -- an
  unlabelled icon-only button is announced as "button" with no purpose, failing WCAG 4.1.2.
- Do: pass `targetId` matching a real element id on the page. Without it the control
  renders but does nothing on activation.
- Do: place it once per hero, at the bottom of the first viewport, where the reader
  looks for the fold.
- Do: prefer `position="center"` unless the hero's copy already occupies the centre.
- Don't (must): render it as a `<div>` with a click handler -- it must stay a real button
  so it is reachable by Tab and activates on both Enter and Space.
- Don't: use it as general in-page navigation. It communicates "there is more below",
  not "jump to section". Use a link or `Breadcrumb` for navigation.
- Don't: stack more than one on a page. Two scroll cues in one viewport contradict each
  other about where the reader should go next.
- Don't: rely on the animation to carry meaning. It is suppressed under reduced motion,
  so the label and accessible name must stand alone.

## Design notes

The motion is a short vertical loop driven by GSAP and gated on the animation context's
`motionPreference`. When motion is suppressed the control keeps its full hit area and
label, losing only the loop.

Position is applied with utility classes rather than a CSS module because the component
is absolutely positioned against whatever hero contains it, and the hero owns the
stacking context.

## Status

Alpha. Beta needs `forcedColorsVerified` (the ForcedColors story verified in a real
browser) and `lightDarkVerified`. Neither has been run; the contract records both as
false rather than asserting them.
