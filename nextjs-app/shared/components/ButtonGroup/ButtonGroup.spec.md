# ButtonGroup

## Intent
Row of related actions presented as one control surface. Attached mode
fuses Buttons/IconButtons into segments (view switchers, toolbars);
spaced mode keeps group semantics with the token gap (form action rows).

## Interaction contract
- Keyboard: each child button keeps its own Tab stop (no roving tabindex;
  the group is not a radio-style segmented control).
- Screen readers: `role="group"` with `ariaLabel` names the cluster before
  the individual buttons are announced.

## Do / don't
- Do: use one variant and one size across the group.
- Do: pass `ariaLabel` whenever the buttons' purpose isn't obvious alone.
- Don't: mix primary and secondary segments in attached mode.
- Don't: use ButtonGroup for exclusive selection state — that is a future
  ToggleButtonGroup; this is an action cluster.

## Design notes
- Attached seams: inner radii collapse and borders overlap by 1px; the
  doubled-class selector outranks the child button's radius rules without
  `!important`.
- Focus ring of the focused segment lifts above neighbors via z-index.
- SplitButton remains the primary-action + menu pattern; ButtonGroup is
  for peer actions.
