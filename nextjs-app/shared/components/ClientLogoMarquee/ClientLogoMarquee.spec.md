# ClientLogoMarquee

## Intent

Documents how **ClientLogoMarquee** is used in production layouts and Storybook examples.

## Interaction contract

- Keyboard: The pause/resume button is reachable and activates with Enter or Space.
- Pointer: Pause/resume is available without relying on hover.
- Screen readers: One hidden list names each client once; visual logo images are decorative.
- Reduced motion: Render a static, centred, wrapping logo row and omit the animation control.

## Do / don't

- Do: Match the **Example** story composition on ClientLogoMarquee pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes

- Tokens: Uses semantic colors/spacing from `variables.css`.
- Optical sizing: logos are listed in `clientLogos.json`. `npm run build:logo-sizes` measures each SVG (ink box, aspect, ink density, centre of mass, Logo Soup method) and writes `ClientLogoMarquee.sizes.module.css`; `optical` in the JSON corrects a mark the formula misjudges. `ClientLogoMarquee.sizes.test.ts` fails while the generated file is stale.
- Adding a logo: single-colour black SVG in `public/logos/clients/`, an entry in `clientLogos.json`, then `npm run build:logo-sizes`.
- Figma: Linked from the component contract `figma` URL.
