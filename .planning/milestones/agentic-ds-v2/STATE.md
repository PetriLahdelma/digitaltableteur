# Agentic DS v2 — state

**Updated:** 2026-06-03

## Shipped

- [x] Phase 7: Intent golden eval (20 cases, 85% gate)
- [x] Phase 8: Operating model + audit playbook
- [x] Phase 10 (partial): Pattern recipes + `suggest_pattern_for_layout` MCP + golden patterns eval
- [x] Phase 11 (partial): `/design-system/agent` proof page
- [x] Phase 12 (partial): `npm run agentic-ds-audit` + audit playbook doc
- [x] CI quota rule in `AGENTS.md` — verify locally, admin merge

## Figma (phase 9 — manual MCP)

Local payloads ready:

```bash
npm run build:figma-variables
# Apply nextjs-app/shared/foundations/figma/phases/*.js via Figma MCP (DT-Site-stuff)
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
