# ADR 0004: Token pipeline (DTCG export — not runtime source)

## Status
Amended 2026-05-26

## Context
An initial DTCG JSON scaffold was added during DSharp parity work. It was **not** extracted from production and introduced alien tokens (e.g. `--color-accent: #e85d04`) via `@import` of `foundations/dist/tokens.css`.

## Decision
- **Canonical source:** `nextjs-app/shared/styles/variables.css` (production themes: default, `.themeDark`, `.themeHCB`, `.themeHCW`).
- **DTCG JSON** under `foundations/tokens/` is **export target only**, quarantined in `_wip-scaffold/` until generated from production.
- **`foundations/dist/tokens.css` must not be `@import`ed** by `variables.css`, `tailwind.css`, or Storybook preview.
- `npm run build:tokens` may run in CI for tooling; output is non-authoritative until sync exists.

## Consequences
- New colors/spacing go in `variables.css` first.
- Foundations/Color Storybook documents production custom properties only.
- Future: `sync-tokens-from-production` script exports JSON from CSS, human review, then optional DTCG round-trip.

## Related

- [ADR 0005: DSharp parity baseline](./0005-dsharp-parity-baseline.md)
