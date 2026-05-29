# Accordion

## Intent
Hide secondary content behind a labelled toggle so primary content stays
scannable. Accordion is the canonical disclosure pattern for FAQ,
"learn more" expansions, and configurable detail panels where the user
should be able to scan headings before committing to a section.

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
  text. Closing a panel removes it from the AT tree via `hidden`.

## Do / don't
- Do: keep `item.id` stable across renders. Re-using ids between
  different accordions on the same page collides on the
  `aria-controls` / `aria-labelledby` reference.
- Do: phrase the `title` as the question or the topic, not the action.
  "Pricing" reads better than "Click to see pricing".
- Don't: put primary navigation inside an accordion. AT users land on
  a closed panel and assume the link is gone.
- Don't: nest accordions more than one level deep. Two-level
  disclosure becomes unreadable in screen reader linear mode.
- Don't: ship long, scrollable panels. If the content scrolls inside
  a single section, promote it to a sibling page instead.

## Design notes
- Tokens: trigger row uses `--space-internal-12` block padding and
  `--space-internal-16` inline padding. Border between items uses
  `--color-border`. The open-state caret rotates `transform: rotate(90deg)`
  via CSS — no JS animation.
- Figma: https://www.figma.com/design/digitaltableteur/accordion — single
  variant; states are open / closed only.
- Single-expansion is enforced in component state (`useState<string | null>`),
  not via DOM. Two siblings cannot both be open at once.
- The `Icon name="caret-right"` is `aria-hidden` because the
  `aria-expanded` attribute already communicates state to assistive tech.
