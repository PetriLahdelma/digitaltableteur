# Logo → reusable content atom — design

Owner directive (2026-07-22): elevate the Logo component (React and web
component) to a reusable atom under Content. A consumer supplies a PNG, JPEG,
or SVG and that image renders as the logo; the built-in Digitaltableteur mark
stays the default.

## API

Additive `src?: string` on both surfaces:

- **React `Logo`**: when `src` is set, render a native `<img>` inside the same
  square `size` box (`object-fit: contain`, so any aspect ratio letterboxes
  without distortion). `title` becomes the alt text; `decorative` maps to
  `alt=""` + `aria-hidden`. Empty string falls back to the built-in mark, so a
  cleared Controls field never renders a broken image. The `ref` type widens to
  `SVGSVGElement | HTMLImageElement`.
- **Native `dt-logo`**: `src` attribute/property with the same semantics
  (`accessible-title` → alt), img render path in the shadow root sized by the
  same `--dt-logo-size` custom property.
- `animated` and `badge` remain built-in-mark-only and are ignored with `src`
  (the pulse animates the mark's bars; the lime badge is a DT-brand lockup).
  Documented in JSDoc, spec, and the story description.
- A custom image renders with its own colors: no `currentColor` inheritance
  and no forced-colors remap. That is inherent to raster/branded artwork and
  is documented rather than fought.

## Taxonomy

- Storybook: `Site/Logo` → `Content/Logo`; `Web Components/Site/Logo` →
  `Web Components/Content/Logo` (use-based grouping, same shelf as Avatar,
  Icon, Badge).
- All 35 AT-snapshot yamls renamed to the new story-id prefixes in the same
  commit; verified with `DT_REQUIRE_A11Y_SNAPSHOTS=1` scoped runs in all four
  modes (plain/light/dark/forced-colors).
- New `CustomImage` story on both sides (client logos from
  `/logos/clients/`), plain-mode AT snapshot captured
  (`- img "DSharp"` / `"Finnair"` / `"Aalto University"`).
- Contract `group` stays `display` — consistent with Avatar/Icon, which also
  live under Content in the story taxonomy.

## Package

- `Logo` + `LogoProps` exported from `@digitaltableteur/react` via the
  `content` entry (export-only precedent; the npm publish is batched with the
  next publish round per the standing convention).
- `@digitaltableteur/web-components` already ships `dt-logo`; the tarball
  ceiling got the documented +1 kB bump for the new render path.

## Out of scope

- `srcSet`/responsive sources, image loading states, and error fallbacks —
  logos are small static assets; YAGNI until a consumer needs them.
- Recoloring custom images (filters/masks) — consumers own their artwork.
