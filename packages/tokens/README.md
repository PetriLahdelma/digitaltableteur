# @digitaltableteur/tokens

CSS-sourced token package generated from Digitaltableteur's production `variables.css` pipeline.

This package is published as a restricted private npm package for the Digitaltableteur team. Run `npm run build:tokens` before packing or publishing from the monorepo.

## Exports

- `@digitaltableteur/tokens` - ESM token names, values, categories, and count.
- `@digitaltableteur/tokens/dtcg` - one DTCG 2025.10 document with every base (light) token, merged at the root so `{a.b}` aliases resolve inside it. Each token keeps its CSS variable name and original CSS in `$extensions["com.digitaltableteur"]` (`cssVar`, `css`). In Node ESM, import with JSON attributes: `await import("@digitaltableteur/tokens/dtcg", { with: { type: "json" } })`.
- `@digitaltableteur/tokens/tailwind` - Tailwind reference map for `var(--token)` usage.
- `@digitaltableteur/tokens/manifest` - generated token manifest. In Node ESM, import with JSON attributes.

The live app still imports `nextjs-app/shared/styles/variables.css` for runtime
CSS continuity, but the root install resolves this package from npm rather than
from a local workspace symlink. `npm run check:package-registry-resolution`
guards that boundary.

## DTCG portability note

The `./dtcg` export follows the DTCG 2025.10 format and validates against the official schema: structured colors, `{ value, unit }` dimensions and durations, cubic-bezier arrays, shadow objects, gradient stops, and font-family arrays. Static `color-mix(in srgb, …)` values are computed. Values DTCG 2025.10 cannot express (fluid `clamp()` sizes, `em` tracking, percentages, a data-URI mask, font stacks whose family `next/font` sets at runtime) are not forced into an invalid token; they are listed with a reason under the root `$extensions["com.digitaltableteur"].nonDtcg`, so exported plus listed always equals the full catalog. Theme overrides and a DTCG Resolver document live in the repository under `nextjs-app/shared/foundations/tokens/production/`.
