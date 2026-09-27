# CaseStudySummary

## Intent
Leads a case study with the decision-maker's questions answered first: what changed, who did what, what made it hard, which decisions shaped it, and how each claim can be checked. The process narrative follows below it.

## Interaction contract
- Keyboard: no interactive parts except evidence links, which are standard `@dt/Link` targets
- Pointer: evidence links only
- Screen readers: the section is a region labelled by its h2; groups use h3; key decisions are an ordered list

## Do / don't
- Do: give every evidence item a source label; self-reported figures say so ("Self-reported, from project records")
- Do: take figures from records already published on the page
- Do: link an evidence item only when a public source exists
- Don't: present an unsourced metric
- Don't: write "what we'd do differently" unless it is on record

## Design notes
- Tokens: `--space-layout-*`, `--color-foreground`, `--color-muted-foreground`, `--color-border`, `--container-md`
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-case-study-summary
