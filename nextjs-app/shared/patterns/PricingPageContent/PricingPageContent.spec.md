# PricingPageContent

## Intent
Pricing page content assembly with tiers and FAQ.

## Interaction contract
- Keyboard: Tab through package CTAs and comparison table links
- Pointer: package cards and contact CTAs with package prefill
- Screen readers: heading hierarchy for tiers; table semantics for comparison

## Do / don't
- Do: use as full pricing page assembly via PricingPage
- Do: keep copy in i18n keys — component reads translation defaults
- Don't: embed single package card without page context
- Don't: promote to stable without visual baseline on stable fleet

## Design notes
- Tokens: inherit from child components
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-pricing-page-content
