# ADR 0001: Tailwind + CVA + DTCG tokens

## Status
Accepted

## Context
Digitaltableteur had dual styling: CSS Modules (`@dt/*`) and shadcn/Tailwind (`@/components/ui/*`).

## Decision
- **Canonical stack**: Tailwind v4 + CVA + CSS custom properties from **`variables.css`** (production). DTCG JSON is a future export format, not the runtime source (see ADR 0004).
- **Storybook = production**: same providers, tokens, and components.
- shadcn `components/ui/*` is deprecated; migrate callers to `@dt/*`.

## Consequences
- New in-scope components use CVA, not `.module.css`.
- Legacy components remain until migrated; contracts at `alpha` until beta promotion.
