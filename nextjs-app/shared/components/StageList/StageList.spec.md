# StageList

## Intent

Answer "what applies at this stage?" for a body of guidance that is spread
over a lifecycle. Each entry names the stages it belongs to; the list places it
under the first one and writes out the rest.

## Layouts

- **sheet** (default): phases as headings, the stage pinned in the margin while
  its entries scroll past, each entry leading with its answer.
- **rail**: a vertical timeline of stages; use when the order is the point.
- **index**: a linked overview by stage, then every entry in full.
- **checklist**: a tick box per entry, a running count per group, optional
  persistence in the reader's browser.
- **cards**: a card per entry with its stages as a badge.

## Interaction contract

- Keyboard: Tab reaches index links and checklist tick boxes in reading order;
  Space toggles a tick box; Enter follows an index link.
- Screen readers: headings start at `headingLevel`; checklist stages are
  fieldsets with legends; the count is a polite live region.
- Layout responds to the list's own width, not the viewport.

## Do / don't

- Do: lead entries with the answer; keep titles short.
- Do: group more than about five stages into phases.
- Don't: use it for step-by-step task flows.
- Don't: rely on colour or position for stage or recurrence.

## Design notes

- Tokens only; forced colours use CanvasText for rail markers and rules.
- `--stage-list-sticky-offset` sets where the pinned stage label stops under a
  sticky header; `--stage-list-label-width` sets the margin column.
- Figma: placeholder link until the Figma component is built at stable.
