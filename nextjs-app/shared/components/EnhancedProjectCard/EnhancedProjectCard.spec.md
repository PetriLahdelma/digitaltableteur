# EnhancedProjectCard

## Intent
Documents how **EnhancedProjectCard** is used in production layouts and Storybook examples.

## Interaction contract
- Keyboard: See **Playground** / **Example** stories and component tests.
- Pointer: Standard click/tap on interactive affordances.
- Screen readers: the link is named by its visible project title and described
  once by the same description that sighted users read; decorative media stays
  out of the accessibility tree.

## Do / don't
- Do: Match the **Example** story composition on EnhancedProjectCard pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
