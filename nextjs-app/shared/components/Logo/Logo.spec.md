# Logo — spec

Brand mark for Digitaltableteur. Atom, display group.

## Intent

Provide one canonical, theme-safe Digitaltableteur mark for use across the
site (header, footer, loading states, favicons-as-component). It exists so no
surface hand-rolls an inline SVG or hardcodes brand color: the mark inherits
`currentColor` and scales cleanly inside a square box.

## Purpose

Single source of truth for the DT mark. Renders the canonical vector inline so
it inherits `currentColor` and scales cleanly. Replaces ad-hoc inline SVGs
(e.g. the placeholder square previously used in `SiteHeader` / `SiteFooter`).

## API

| Prop         | Type      | Default              | Notes                                                  |
| ------------ | --------- | -------------------- | ------------------------------------------------------ |
| `size`       | `number`  | `24`                 | Square render box in px; mark fits inside (no distort) |
| `animated`   | `boolean` | `false`              | Three-bar hover pulse; disabled under reduced motion   |
| `badge`      | `boolean` | `false`              | Wrap the mark in the brand lime circle (contrast mark) |
| `title`      | `string`  | `"Digitaltableteur"` | Accessible name; ignored when `decorative`             |
| `decorative` | `boolean` | `false`              | `aria-hidden`, no title — for redundant placements     |
| `className`  | `string`  | —                    | Utility/spacing classes                                |

## Behavior

- Monochrome via `currentColor`; color comes from the consumer's text color, so
  it is theme- and forced-colors-safe (no hardcoded values).
- `animated` adds the `pulse-1/2/3` keyframes on hover only.
- `badge` swaps to a filled lime circle (`--logo-background`) behind a contrast
  mark (`--logo-color`).

## Interaction contract

- **Not interactive.** The mark renders a non-focusable `<svg>`
  (`focusable="false"`) with no pointer or keyboard handlers. When it needs to
  act as a link (e.g. header home link), the consumer wraps it in an `<a>` /
  `Button` and owns focus and the accessible name.
- `animated` is hover-only decoration and is fully suppressed under
  `prefers-reduced-motion: reduce`.

## Do / don't

- **Do** let the mark inherit text color; set `color` on the parent to recolor.
- **Do** pass `decorative` when an adjacent wordmark already names the brand.
- **Don't** hardcode a fill or wrap the mark in a fixed-color box — that breaks
  dark theme and forced-colors.
- **Don't** translate `title`; the brand name is a proper noun.
- **Don't** add click handlers to `Logo` itself; wrap it in a real link/button.

## Accessibility

- Default: `role="img"` + `<title>`/`aria-label` from `title`.
- `decorative`: removed from the a11y tree (`aria-hidden`), for cases where an
  adjacent wordmark already names the brand.
- The accessible name is a brand proper noun and is not translated.
- Reduced motion: the hover pulse is disabled via `@media (prefers-reduced-motion: reduce)`.

## Design notes

- The mark is the three-bar "DI–" device; the `badge` variant is the lime
  brand lockup. Both share one viewBox so sizing stays consistent.
- Forced-colors safety comes from `fill="currentColor"` on every path, which
  maps to the system `CanvasText` keyword automatically.

## Out of scope

- Wordmark lockup beyond the badge circle remains composition.
