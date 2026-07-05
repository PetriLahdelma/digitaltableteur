# Stack

## Intent
Documents how **Stack** is used in production layouts and Storybook examples.

## Interaction contract
- Keyboard: See **Playground** / **Example** stories and component tests.
- Pointer: Standard click/tap on interactive affordances.
- Screen readers: Verify labels, roles, and live regions in stories.

## Do / don't
- Do: Match the **Example** story composition on Stack pages; pick one `gap` token per Stack.
- Don't: Nest Stacks to sum gaps, or add margins to Stack children — the `gap` owns the spacing.

## Design notes
- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
