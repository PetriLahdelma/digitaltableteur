# Design tokens (DTCG)

## Source of truth

**Production only:** [`../styles/variables.css`](../styles/variables.css)

Digitaltableteur live site and Storybook use tokens defined there (including `.themeDark`, `.themeHCB`, `.themeHCW`). Extend that file when adding or changing design decisions.

## DSharp parity (methodology, not values)

The DSharp Design System defines **how** we mature this repo (contracts, validation, Storybook tiers, optional DTCG export). It does **not** supply token values or components to copy.

- **Take from DSharp:** process, breadth of artifacts, quality gates.
- **Do not take from DSharp:** hex colors, spacing literals, alien token names, or component APIs as shipped in their package.

See [`docs/adr/0005-dsharp-parity-baseline.md`](../../../../docs/adr/0005-dsharp-parity-baseline.md).

## `_wip-scaffold/` (quarantined)

Draft JSON from early parity work was **not** extracted from production (e.g. invented `--color-accent: #e85d04`). It must not be imported at runtime.

Current package-boundary work exports *from* `variables.css` into DTCG JSON and private workspace packages for review. Publishing stays behind the roadmap publish checkpoint.

## Build

`npm run build:tokens` writes `foundations/dist/` for tooling only. **`dist/tokens.css` is not loaded by the app.**

## Production export

`npm run build:tokens` writes reviewed DTCG JSON to `production/` from `variables.css`.

## Outputs (`npm run build:tokens`)

| Artifact | Purpose |
|----------|---------|
| `foundations/token-catalog.json` | Storybook foundations + search |
| `tokens/production/*.json` | DTCG export for review / tooling |
| `foundations/dist/tokens.css` | Reference snapshot (not imported at runtime) |
| `foundations/dist/tailwind.tokens.ts` | TS token names + Tailwind ref map |
| `foundations/dist/tokens-manifest.json` | Compact manifest for agents |
| `foundations/dist/agent-manifest.json` | Components + token summary |
| `app/tailwind.css` (DT-THEME block) | Tailwind `dt-*` utilities |
| `packages/tokens/dist/` | Private `@digitaltableteur/tokens` workspace package output |
| `packages/tokens-css/dist/` | Private `@digitaltableteur/tokens-css` token/theme CSS projection |
