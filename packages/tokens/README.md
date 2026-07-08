# @digitaltableteur/tokens

CSS-sourced token package generated from Digitaltableteur's production `variables.css` pipeline.

This package is published as a restricted private npm package for the Digitaltableteur team. Run `npm run build:tokens` before packing or publishing from the monorepo.

## Exports

- `@digitaltableteur/tokens` - ESM token names, values, categories, and count.
- `@digitaltableteur/tokens/dtcg` - merged, complete DTCG-shaped JSON with original CSS variable names in `$extensions.digitaltableteur.cssVar`. In Node ESM, import with JSON attributes: `await import("@digitaltableteur/tokens/dtcg", { with: { type: "json" } })`.
- `@digitaltableteur/tokens/tailwind` - Tailwind reference map for `var(--token)` usage.
- `@digitaltableteur/tokens/manifest` - generated token manifest. In Node ESM, import with JSON attributes.

The live app still imports `nextjs-app/shared/styles/variables.css` directly until the npm dogfood step is complete.

## DTCG portability note

The `./dtcg` export is complete and collision-free, but it deliberately preserves CSS-native values such as `var()`, `clamp()`, `color-mix()`, gradients, and timing functions so the package remains 1:1 with the current runtime system. Treat it as a CSS-sourced exchange format for this extraction step, not yet as a fully normalized cross-platform primitive token file.
