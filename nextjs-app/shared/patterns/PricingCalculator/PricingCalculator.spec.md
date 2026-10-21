# PricingCalculator

## Intent
Interactive duration × workload pricing calculator for the pricing page: two
selectable option groups drive a live summary of total hours, allocation,
effective hourly rate, and total investment, closing with a booking CTA.

## Pricing model
- Standard rate 120 €/h, 7.5 hours/day (owner-approved 2026-07-18).
- Weeks per duration: 2 weeks = 2; months × 52/12 otherwise.
- Only the 6/12-month partnership tiers discount, at a flat 90 €/h (−25%),
  and only at a partnership workload of 75%+ of a week (4+ days, or 75% /
  100% allocation; owner-approved 2026-10-22); every other combination is
  standard rate. The partnership tiers carry the Partnership badge
  (straddling the card's top edge, pointer-events none so it never blocks
  selections).
- Total investment = round(weeks × days × 7.5) × effective rate; partnership
  selections show "Partnership pricing: 1 day per week is free." under the total
  (the −25% rate exactly cancels the 3→4 day step, so a savings-amount claim
  would not survive comparison against the 3-day configuration).
- Workload has two views over one value (days per week). Days: 2, 3, 4, 5.
  Percentages ("Show as percentages" switch on the workload legend line, above
  it on narrow columns): 25, 50, 75, 100% of a 5-day week, so 1.25–5 days.
  Switching views moves the selection to the nearest option (ties go up). In
  the percentage view the partnership note reads "25% off the standard rate",
  since at 75% the discount is less than a whole day.
- Short engagements (2 weeks / 1 month) only offer the partnership-level
  workloads (4–5 days, 75–100%); switching to them clamps a lighter selection
  up to the lightest of those.
- Defaults: 2 weeks × 5 days/week (≈ €9,000 — first figure stays credible
  against the page's "from €7k" floor).
- Model lives in `pricingMath.ts`; the component only renders its output.

## Interaction contract
- Keyboard: Tab into each group; Arrow keys/Space change the native radio
  selection (SelectableCardGroup); Enter activates the CTA link
- Pointer: whole option cards are labels for their radios
- Screen readers: fieldset/legend names each group; a visually hidden
  `role="status"` region announces the recomputed hours/rate/total (and
  savings) politely on every selection change, including the workload clamp
- Focus: if the focused workload radio unmounts with the short-duration clamp,
  focus is restored to the newly checked workload radio
- The partnership pricing rule is stated in visible copy under the price card;
  the CTA carries the configured duration/days as query params, and a
  percentage-only workload in the URL (days=3.75) opens the percentage view

## Do / don't
- Do: keep all price maths in `pricingMath.ts`
- Do: format totals via `Intl.NumberFormat` on the active language
- Don't: use for fixed-scope package pricing (packages section owns that)
- Don't: duplicate the pricing model in other components

## Design notes
- Tokens: `--color-surface`, `--color-border-light`, `--color-muted`,
  `--color-primary`, layout/internal space tokens, text/title size tokens
- Figma: none yet (code-first pattern, 2026-07-18)
