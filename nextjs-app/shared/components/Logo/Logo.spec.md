# Logo — spec

Reusable logo atom. Atom, display group, Content taxonomy.

## Intent

Provide one canonical, theme-safe logo slot for use across the site and in
consumer products (header, footer, loading states, favicons-as-component).
By default it renders the Digitaltableteur mark so no surface hand-rolls an
inline SVG or hardcodes brand color: the mark inherits `currentColor` and
scales cleanly inside a square box. With `src`, the same atom renders any
custom logo image (PNG, JPEG, or SVG) inside the same square footprint.

## Purpose

Single source of truth for logo rendering. Without `src` it renders the
canonical DT vector inline so it inherits `currentColor` and scales cleanly,
replacing ad-hoc inline SVGs (e.g. the placeholder square previously used in
`SiteHeader` / `SiteFooter`). With `src` it is the reusable content atom for
any brand's logo — the image letterboxes inside the square `size` box.

## API

| Prop         | Type      | Default              | Notes                                                  |
| ------------ | --------- | -------------------- | ------------------------------------------------------ |
| `src`        | `string`  | —                    | Custom logo URL (PNG/JPEG/SVG); renders an `<img>`     |
| `size`       | `number`  | `24`                 | Square render box in px; logo fits inside (no distort) |
| `animated`   | `boolean` | `false`              | Three-bar pulse (built-in mark only); reduced-motion safe |
| `background` | `boolean` | `false`              | Brand lime circle behind the mark (built-in mark only) |
| `title`      | `string`  | `"Digitaltableteur"` | Accessible name / alt text; ignored when `decorative`  |
| `decorative` | `boolean` | `false`              | `aria-hidden`, no title — for redundant placements     |
| `className`  | `string`  | —                    | Utility/spacing classes                                |

## Behavior

- Built-in mark: monochrome via `currentColor`; color comes from the consumer's
  text color, so it is theme- and forced-colors-safe (no hardcoded values).
- `animated` adds the `pulse-1/2/3` keyframes on hover only.
- `background` renders a filled lime circle (`--logo-background`) behind a
  contrast mark (`--logo-color`).
- `src`: renders a native `<img>` in the same square `size` box with
  `object-fit: contain`, so any aspect ratio letterboxes without distortion.
  `animated` and `background` are built-in-mark-only and are ignored; a custom image
  renders with its own colors (no `currentColor` inheritance, no forced-colors
  remap).
- An empty `src` (`""`) falls back to the built-in mark — a cleared Controls
  text field must never render a broken image.

## Interaction contract

- **Not interactive.** The mark renders a non-focusable `<svg>`
  (`focusable="false"`) with no pointer or keyboard handlers. When it needs to
  act as a link (e.g. header home link), the consumer wraps it in an `<a>` /
  `Button` and owns focus and the accessible name.
- `animated` is hover-only decoration and is fully suppressed under
  `prefers-reduced-motion: reduce`.

## Do / don't

- Do: let the mark inherit text color; set `color` on the parent to recolor.
- Do: pass `decorative` when an adjacent wordmark already names the brand.
- Do: pass `src` + `title` for third-party or client logos; `title` is the alt
  text and should name that brand.
- Don't: hardcode a fill or wrap the mark in a fixed-color box; that breaks
  dark theme and forced-colors.
- Don't: translate `title`; brand names are proper nouns.
- Don't: add click handlers to `Logo` itself; wrap it in a real link or button.
- Don't: combine `src` with `animated`/`background`; those are built-in-mark-only
  and are ignored.

## Accessibility

- Default: `role="img"` + `<title>`/`aria-label` from `title`.
- `src`: a native `<img>` whose alt text comes from `title`; `decorative` maps
  to `alt=""` + `aria-hidden`.
- `decorative`: removed from the a11y tree (`aria-hidden`), for cases where an
  adjacent wordmark already names the brand.
- The accessible name is a brand proper noun and is not translated.
- Reduced motion: the hover pulse is disabled via `@media (prefers-reduced-motion: reduce)`.

## Design notes

- The mark is the three-bar "DI–" device; the `background` variant is the lime
  brand lockup. Both share one viewBox so sizing stays consistent.
- Forced-colors safety comes from `fill="currentColor"` on every path, which
  maps to the system `CanvasText` keyword automatically.

## Out of scope

- Wordmark lockup beyond the background circle remains composition.
