# Agentic DS v2 — state

**Updated:** 2026-06-03

## Shipped this session

- [x] Phase 7: `golden-intents.json` + `intent-retrieval-eval.mjs` (20 cases, 85% CI gate)
- [x] Phase 8 (partial): `docs/AGENTIC_DS_OPERATING_MODEL.md`
- [x] Milestone roadmap: `.planning/milestones/agentic-ds-v2/ROADMAP.md`

## Next up

1. Merge `fix/button-isdisabled-migration` (#675) if still open
2. Figma phase 1a/1b variable chunks → DT-Site-stuff via MCP
3. Pattern `agent` blocks for `CTASection`, `Header` (composition, not replacement)
4. Optional: `/design-system/agent` doc route (links only, no layout churn)

## Commands

```bash
npm run build:tokens
npm run agent:eval
node scripts/design-system/agent-eval/intent-retrieval-eval.mjs
npm run find-component -- "your intent"
npm run ds:mcp
```
