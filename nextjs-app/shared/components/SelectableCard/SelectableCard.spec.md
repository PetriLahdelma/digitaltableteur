# SelectableCard

## Intent
Turn a Card into a selectable option so a set of rich choices (plan pickers,
onboarding options, add-ons, settings tiles) reads as cards rather than bare
radios or checkboxes. `SelectableCardGroup` owns the selection; `SelectableCard`
is one option in it.

## Interaction contract
- Keyboard: Tab moves focus into the group; Arrow keys move within a single-select
  set (native radio behavior); Space toggles the focused option.
- Pointer: the whole card is the hit area — clicking anywhere toggles the option.
- Screen readers: the group is a fieldset announced by its legend; each option is
  a native radio (single) or checkbox (multiple) whose accessible name is the
  card content; errors announce via role=alert and set aria-invalid on the group.

## Do / don't
- Do: write the legend as the question; keep each card's title short and scannable.
- Do: use `type="single"` for an exclusive choice, `type="multiple"` for add-ons.
- Don't: nest interactive controls (buttons, links) inside a SelectableCard; the whole card is a label wrapping the input, so nested controls steal the click. Use a plain Card for action cards.
- Don't: use it for navigation; selecting must not commit or route on click.

## Design notes
- Tokens: `--color-primary` (selected ring + indicator), `--color-focus-ring`
  (focus), `--color-border` / `--color-border-light` (rest/hover), `--color-surface`;
  spacing from `--space-internal-*`. No hardcoded colors.
- The selected state is shown by a ring on the surface plus an indicator (radio
  dot / checkbox check) drawn in `--color-primary`, with a forced-colors mapping
  to `Highlight`.
- Figma: TODO (parity build; no Figma node yet).

## Promotion notes
Parity build (Astryx `SelectableCard`). Ships at alpha with the WIP badge. Do not
promote past alpha/beta without a documented production consumer, AT snapshots,
and forced-colors + light/dark verification.
