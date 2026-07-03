# EmptyState

## Intent
The standard placeholder for "there is nothing here yet / nothing matched":
empty lists, zero search results, first-run screens, and cleared filters.
Composes @dt Title, Text, and Icon so the typography stays on the ladder.

## Interaction contract
- The block itself is static; interactivity lives in the action slot
  (children), which should hold @dt Buttons.
- Screen readers: the title is a real heading (h2 default; set
  `headingLevel` to fit the page outline). The icon is decorative.

## Do / don't
- Do: say what is empty and give a way forward (description or action).
- Do: fit `headingLevel` into the surrounding document outline.
- Don't: stack more than two actions; one primary path, one escape hatch.
- Don't: use it for error states — AlertBanner owns failures.

## Design notes
- Sizes: sm (panels/cards), md (content areas), lg (full pages); vertical
  padding and type scale step together.
- Description is capped at 40ch for readable centered lines.
- Icon renders in `--color-muted` to stay behind the headline.
