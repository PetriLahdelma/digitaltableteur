# PricingCalculator — design spec (2026-07-18)

Approved by owner 2026-07-18 (rate model, placement, badges, SelectableCard fix, overall design).

## Goal

A dynamically updating pricing calculator section for `/pricing`, modeled on the
goodside.fi reference screenshot, composed exclusively from design-system
components. Existing pricing sections stay untouched.

## Placement

New pattern `nextjs-app/shared/patterns/PricingCalculator/`, rendered inside
`PricingPageContent` after the AaaS section and before the existing CTA row.

## Composition (DS components only)

Left column:

- `Title` — "Adjust duration and workload to see your total investment."
- Duration `SelectableCardGroup` (single-select): 2 weeks, 1, 2, 3, 6, 12 months
  in a two-column grid. `Badge` "Partnership" on 6 and 12 months.
- Workload `SelectableCardGroup` (single-select): 2, 3, 4, 5 days/week.
- Allocation `Card` — percentage (days / 5), "Based on N days/week × 7 hours/day".
- Totals `Card` — total hours and the standard rate.

Right column:

- "What's included in your investment:" `List`; first two items react to the
  selection (duration phrase, days-per-week phrase), two static items.
- "Your price" `Card` — effective (discounted) hourly rate.
- "Total Investment" `Card` — locale-formatted total.
- `Button` "Get in touch" → `/contact?mode=book`. No icon (owner deviation).

## Pricing model (owner decision)

- Standard rate: **€120/h**, 7 hours/day.
- Weeks per duration: 2 weeks = 2; otherwise months × 52 / 12.
- Total hours = round(weeks × daysPerWeek × 7).
- Tier discounts on the hourly rate: 3 mo −5%, 6 mo −10%, 12 mo −15%.
- Total investment = round(totalHours × effectiveRate).
- Defaults: 2 months, 5 days/week.

## i18n

All copy keyed in EN / FI / SV `translation.json` (FI workload label "Työmäärä").
Number formatting via `Intl.NumberFormat` on the active language.

## Design-system change (owner-approved)

`SelectableCard` declares `className` but drops it; fix by merging it onto the
card label element. Additive, benefits all consumers.

**Implementation note:** the app consumes `@digitaltableteur/react` 0.1.16 from
the registry, which predates this fix, so the pattern must not rely on per-card
`className`. The two-column option layout therefore lives on the group's
options wrapper (`.optionGroup > div`), which works with the published package
today; the SelectableCard fix ships with the next react publish.

## Quality gates

Contract (`status: beta`) + spec + stories (Default, Playground, Example,
ForcedColors, plus an interaction play) + unit tests for the math and
selection-driven updates + axe assertion. Local gate: typecheck, lint, test,
build, `build:tokens`, `check:contract-props`, `check:consumers`,
`validate:components`.
