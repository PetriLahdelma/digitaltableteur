# PricingCalculator

## Intent
Interactive duration × workload pricing calculator for the pricing page: two
selectable option groups drive a live summary of total hours, allocation,
effective hourly rate, and total investment, closing with a booking CTA.

## Pricing model
- Standard rate 120 €/h, 7 hours/day (owner-approved 2026-07-18).
- Weeks per duration: 2 weeks = 2; months × 52/12 otherwise.
- Hourly-rate tier discounts: 3 mo −5%, 6 mo −10%, 12 mo −15%; 6 and 12 months
  carry the Partnership badge.
- Total investment = round(weeks × days × 7) × discounted rate.
- Model lives in `pricingMath.ts`; the component only renders its output.

## Interaction contract
- Keyboard: Tab into each group; Arrow keys/Space change the native radio
  selection (SelectableCardGroup); Enter activates the CTA link
- Pointer: whole option cards are labels for their radios
- Screen readers: fieldset/legend names each group; the summary re-renders as
  static text (no live region — values update on user action within the group)

## Do / don't
- Do: keep all price maths in `pricingMath.ts`
- Do: format totals via `Intl.NumberFormat` on the active language
- Don't: use for fixed-scope package pricing (packages section owns that)
- Don't: duplicate the pricing model in other components

## Design notes
- Tokens: `--color-surface`, `--color-border-light`, `--color-muted`,
  `--color-primary`, layout/internal space tokens, text/title size tokens
- Figma: none yet (code-first pattern, 2026-07-18)
