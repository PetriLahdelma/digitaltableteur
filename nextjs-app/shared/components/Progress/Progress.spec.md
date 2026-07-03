# Progress

## Intent
Linear bar for work with visible movement: determinate when completion
is measurable (`value` / `max`), indeterminate sweep when duration is
unknown but a bar-shaped affordance fits (page or panel loads). Family
rule: Spinner for sub-second unknown waits, Progress for known or long
work, Skeleton for layouts.

## Interaction contract
- Keyboard: not focusable; status chrome only.
- Pointer: no pointer interactions.
- Screen readers: `role="progressbar"` with `aria-valuemin/max`;
  `aria-valuenow` tracks `value` and is omitted in indeterminate mode.
  `label` becomes the accessible name — name the work being done.

## Do / don't
- Do: switch `state` to `success` / `error` at completion so the outcome
  is visible without reading numbers.
- Do: compose a visible Text value when precision matters (WithLabel
  story).
- Don't: animate value backwards or reset mid-task; regressing progress
  reads as an error.
- Don't: bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: track `--color-neutral-bg`, fill `--color-primary` or the
  semantic state color; heights `--space-internal-4/8` and
  `--space-layout-16`.
- Indeterminate sweep: 40%-wide bar, `--duration-slower` loop; reduced
  motion slows the sweep instead of freezing it.
- Figma: linked from the component contract `figma` URL.
