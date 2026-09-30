# ClientLogoMarquee

## Intent

Documents how **ClientLogoMarquee** is used in production layouts and Storybook examples.

## Interaction contract

- Keyboard: The pause/resume button is reachable and activates with Enter or Space.
- Pointer: Pause/resume is available without relying on hover.
- Screen readers: One hidden list names each client once; visual logo images are decorative.
- Reduced motion: Render a static logo grid and omit the animation control.

## Do / don't

- Do: Match the **Example** story composition on ClientLogoMarquee pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes

- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
