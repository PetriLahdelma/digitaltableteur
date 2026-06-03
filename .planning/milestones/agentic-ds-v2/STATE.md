# Agentic DS v2 — state

**Updated:** 2026-06-03

## Shipped

- [x] Phase 7: Intent golden eval (20 cases, 90% gate — currently 100%)
- [x] Phase 8: Operating model + audit playbook
- [x] Phase 9: Figma variables verified in DT-Site-stuff (78 vars: Color 45, Dimension 29, String 4)
- [x] Phase 2–3: Page skeleton + 277 components verified; `dsb-state.json` + `npm run verify:figma-in-scope`
- [x] Code Connect: **skipped** (Figma Pro — use contract URLs + Storybook Design panel)
- [x] Phase 10 (expanded): SiteHeader, SiteFooter, ArticleHero recipes + golden patterns
- [x] Phase 11: `/design-system/agent` proof page + sitemap + Colophon link
- [x] Phase 12 (partial): `npm run agentic-ds-audit` + audit playbook doc
- [x] CI quota rule in `AGENTS.md` — verify locally, admin merge

## Figma (phase 9 — verified)

Variables synced to [DT-Site-stuff](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff) (`runId: dt-dsb-2026-06-03`). Re-apply after token changes:

```bash
npm run build:figma-variables
npm run figma:apply-variables   # Desktop MCP; sequential phase scripts
```

See [docs/FIGMA_DESIGN_SYSTEM_SYNC.md](../../../docs/FIGMA_DESIGN_SYSTEM_SYNC.md).

## Commands

```bash
npm run agent:eval
npm run agent:eval:intents
npm run agent:eval:patterns
npm run agentic-ds-audit
npm run ds:mcp
```

## Public surfaces

- `/design-system/agent` — proof page
- `/mcp` — HTTP MCP
- `/.well-known/agent.json` — agent discovery
