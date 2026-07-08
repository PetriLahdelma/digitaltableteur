# @digitaltableteur/tokens-css

Token CSS package generated from Digitaltableteur's production `variables.css`.

The generated `dist/tokens.css` is a token/theme projection: it preserves every CSS custom-property declaration and `color-scheme` declaration from the current token system, including dark, high-contrast, forced-colors, and prefers-contrast scopes, while dropping component utilities and keyframes.

This package is published as a restricted private npm package for the Digitaltableteur team. Run `npm run build:tokens` before packing or publishing from the monorepo.

## Exports

- `@digitaltableteur/tokens-css`
- `@digitaltableteur/tokens-css/tokens.css`
- `@digitaltableteur/tokens-css/themes/<brand>.css`

The live app still imports `nextjs-app/shared/styles/variables.css` directly until the npm dogfood step is complete.
