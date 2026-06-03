# Phase 6 — Design System MCP

**Completed:** 2026-06-02

## Delivered

### HTTP (`/mcp`)

Extended existing streamable HTTP MCP with 5 design-system tools + 3 static resources (consulting tools unchanged).

### Tools

- `list_components`
- `find_component_for_intent`
- `get_component_contract`
- `get_tokens`
- `validate_component_usage`

### Resources

- `digitaltableteur://design-system/manifest/summary`
- `digitaltableteur://design-system/tokens/summary`
- `digitaltableteur://design-system/import-policy`

### Local stdio

- `npm run ds:mcp` → `scripts/design-system/ds-mcp-stdio.ts`
- Design-system-only server for Cursor / Claude Desktop

### Code

- `nextjs-app/shared/lib/design-system-mcp/` — loaders, executors, rank-intent, registration
- `docs/DESIGN_SYSTEM_MCP.md`
- Server card + `agent:eval` export check

## Example agent flow

1. Read resource `manifest/summary` or call `find_component_for_intent` with *"dismissible warning banner"*
2. `get_component_contract` for `AlertBanner`
3. `validate_component_usage` on edited file before PR
