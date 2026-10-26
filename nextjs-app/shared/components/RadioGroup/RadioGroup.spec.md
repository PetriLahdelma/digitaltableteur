# RadioGroup

## Intent
Documents how **RadioGroup** is used in production layouts and Storybook examples.

## Interaction contract
- Keyboard: See **Playground** / **Example** stories and component tests.
- Pointer: Standard click/tap on interactive affordances.
- Screen readers: Verify labels, roles, and live regions in stories.

## Rating scale
- `startLabel` and `endLabel` place anchors either side of the options (Serious 1 to 5 Playful). They stack on narrow screens.
- Screen readers hear the group name, then one description that pairs each anchor with its option ("1: Serious; 5: Playful"). The visible anchors are `aria-hidden` so they are not read twice.
- `hideLegend` keeps the legend as the accessible name while hiding it, for rows where the anchors already say what is being rated.

## Do / don't
- Do: Match the **Example** story composition on RadioGroup pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
