# Logo — spec

Brand mark for Digitaltableteur. Atom, display group.

## Purpose

Single source of truth for the DT mark. Renders the canonical vector from
`public/dt-logo.svg` inline so it inherits `currentColor` and scales cleanly.
Replaces ad-hoc inline SVGs (e.g. the placeholder square previously used in
`SiteHeader` / `SiteFooter`).

## API

| Prop         | Type      | Default            | Notes                                                  |
| ------------ | --------- | ------------------ | ------------------------------------------------------ |
| `size`       | `number`  | `24`               | Square render box in px; mark fits inside (no distort) |
| `animated`   | `boolean` | `false`            | Three-bar hover pulse; disabled under reduced motion   |
| `title`      | `string`  | `"Digitaltableteur"` | Accessible name; ignored when `decorative`           |
| `decorative` | `boolean` | `false`            | `aria-hidden`, no title — for redundant placements      |
| `className`  | `string`  | —                  | Utility/spacing classes                                |

## Behavior

- Monochrome via `currentColor`; color comes from the consumer's text color, so
  it is theme- and forced-colors-safe (no hardcoded values).
- `animated` adds the source SVG's `pulse-1/2/3` keyframes on hover only.

## Accessibility

- Default: `role="img"` + `<title>`/`aria-label` from `title`.
- `decorative`: removed from the a11y tree (`aria-hidden`), for cases where an
  adjacent wordmark already names the brand.
- The accessible name is a brand proper noun and is not translated.

## Out of scope

- Wordmark lockup and the colored badge circle remain composition.
