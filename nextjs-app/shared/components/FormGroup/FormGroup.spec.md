# FormGroup

## Intent
Provide a real, semantic group container so grouped form controls (checkbox sets, radio sets, address blocks) are announced as one logical group.

## Interaction contract
- Keyboard: Focus enters the first child control; subsequent Tab presses move through siblings.
- Pointer: Clicking the legend does not focus a child — legends are not interactive.
- Screen readers: Announced as 'group, {legend text}, {n} items' followed by each control's own announcement.

## Do / don't
- Do: Wrap every multi-control grouping in `FormGroup`.
- Do: Use `disabled` on the fieldset to disable a whole step of a multi-step form.
- Don't: Wrap a single input — use `FormField`.
- Don't: Nest fieldsets more than 2 deep — screen-reader announcements collapse.

## Design notes
- Colors: --color-text, --color-border-light
- Spacing: --space-internal-8, --space-internal-12
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
