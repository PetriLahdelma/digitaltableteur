# Accordion

## Intent
Hide secondary content behind labelled toggles so primary content stays
scannable. Accordion coordinates a set of disclosure sections: the default
`type="single"` keeps one section open at a time (FAQ / settings), while
`type="multiple"` lets several stay open for side-by-side comparison (feature
lists, pricing tiers). Users can scan headings before committing to a section.

## Interaction contract
- Keyboard: Enter and Space activate the focused trigger. Tab moves to
  the next trigger; Shift+Tab moves to the previous one. There is no
  custom arrow-key handling — disclosure triggers are not a roving
  group.
- Pointer: clicking the trigger toggles its panel. Clicking the panel
  itself does nothing — clicks inside the panel propagate normally so
  links and buttons inside remain operable.
- Screen readers: state is announced via `aria-expanded` on the
  trigger; the panel is announced as a region labelled by the trigger
  text. A closed panel stays in the DOM (so `aria-controls` always
  resolves) but is removed from the AT tree and the tab order via
  `inert` + `aria-hidden`, and collapsed to zero height.

## State model
- Uncontrolled: `defaultOpenId` (single) or `defaultOpenIds` (one or more)
  seed the initial open set; the component owns state thereafter.
- Controlled: pass `openIds` and `onOpenChange`; the parent owns the open
  set. Use this to sync with a URL param, form, or external control.

## Do / don't
- Do: keep `item.id` stable across renders. Re-using ids between
  different accordions on the same page collides on the
  `aria-controls` / `aria-labelledby` reference.
- Do: phrase the `title` as the question or the topic, not the action.
  "Pricing" reads better than "Click to see pricing".
- Do: use `type="multiple"` when readers compare sections; keep the
  default `type="single"` for FAQs and settings.
- Don't: put primary navigation inside an accordion. AT users land on
  a closed panel and assume the link is gone.
- Don't: nest accordions more than one level deep. Two-level
  disclosure becomes unreadable in screen reader linear mode.
- Don't: put a single short paragraph behind a section — the click
  costs more than it saves; show the text directly.

## Design notes
- Variants: `contained` (default) is a bordered, rounded card group with
  hairline dividers between rows; `enclosed` keeps that outer border but is
  seamless inside (no dividers); `divided` is flush with hairline separators
  only, for inline disclosure in sidebars or detail panels.
- Reveal: panel height animates via `grid-template-rows: 0fr → 1fr` with
  `overflow: hidden` on the inner wrapper; the caret rotates 90°. Both
  transitions are dropped under `prefers-reduced-motion`.
- Tokens: trigger row uses `--space-internal-12` block padding and
  `--space-internal-16` inline padding; item separators and the contained
  border use `--color-border`; title is `--primary-text-color`, content
  `--secondary-text-color`.
- The `Icon name="caret-right"` is `aria-hidden` because the
  `aria-expanded` attribute already communicates state to assistive tech.
- Sibling: for a single independent "show more", use `ExpandableSection`;
  Accordion is for a coordinated group.
