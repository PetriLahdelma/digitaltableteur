# SummaryList

## Intent
Shows questions and their answers so a person can check them before submitting, or read back a submitted record. After the GOV.UK summary list.

## Interaction contract
- Keyboard: the list itself is not interactive; row actions follow in reading order.
- Pointer: row actions are ordinary buttons or links.
- Screen readers: a description list; each label is a term and each answer its definition.

## Do / don't
- Do: keep line breaks in long answers (string values render with `white-space: pre-line`).
- Do: name what a row action changes ("Change" plus a visually hidden label).
- Don't: squeeze answers into columns side by side; one row per question.
- Don't: use it for tables of several values per row.

## Design notes
- Narrow: label above value. From about 40rem (container query) label, value and action sit side by side in a 1 : 2 : auto grid, baseline aligned.
- Tokens: `--color-muted` label, `--color-text` value, `--color-border-light` row rule; 16px row padding.
- Figma: not yet drawn.
