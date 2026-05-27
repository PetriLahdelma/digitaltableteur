# Design System Changelog

## 2026-05-26

**Governance:** [ADR 0005](adr/0005-dsharp-parity-baseline.md) — production components + `variables.css` are the baseline; DSharp supplies methodology and breadth only.

- **FIX:** Removed runtime `@import` of DTCG `dist/tokens.css` — production `variables.css` is the only color source; quarantined invented JSON (e.g. `--color-accent` #e85d04) to `tokens/_wip-scaffold/`
 — Maturity uplift (DSharp parity)

- Contract schema + `validate:components` (AJV + ts-morph)
- DTCG token pipeline (`npm run build:tokens`)
- WIP badge decorator in Storybook
- 27 in-scope components: contract.json + spec.md + MDX
- Foundations stories + narrative MDX
- CI: full DoD on PRs
- Icon/Title: initial CVA integration
- Beta promotion wave 1: Button, Text, Badge, Link, Label (+ prior Icon, Title, Card, Modal) — 9/27 in-scope
- Carbon-style MDX pages for promoted atoms
- Foundations/Color: live token swatches from DTCG output
- Agent manifest for MCP (`npm run generate:agent-manifest`)
