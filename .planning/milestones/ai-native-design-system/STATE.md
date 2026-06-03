# AI-native design system — state

**Updated:** 2026-06-02

## Milestone status

**Complete** — Phases 1–6 shipped.

## Phase 5 (tightened)

- [x] ESLint `no-restricted-syntax` + `no-restricted-imports` mirror
- [x] Shared `dt-usage-rules.mjs`
- [x] Baseline 0 violations (`lint:dt-usage --strict` in CI)
- [x] Exempt: `app/global-error.tsx` only

## Commands

```bash
npm run build:tokens
npm run lint:dt-usage
npm run lint
npm run find-component -- "your intent"
npm run ds:mcp
```

## Docs

- [docs/DESIGN_SYSTEM_MCP.md](../../../docs/DESIGN_SYSTEM_MCP.md)
- [docs/PUBLIC_API.md](../../../docs/PUBLIC_API.md)
