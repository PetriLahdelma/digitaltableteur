# Design System MCP

Agents can discover `@dt/*` components, tokens, and import policy through MCP — without hand-reading 130 contracts.

## Surfaces

| Surface | URL / command | Tools |
|---------|----------------|-------|
| **Production HTTP** | `https://www.digitaltableteur.com/mcp` | Consulting + design system (14 tools) + 3 resources |
| **Local stdio** | `npm run ds:mcp` | Design system only (5 tools + 3 resources) |

Discovery card: `/.well-known/mcp/server-card.json`

## Prerequisites

```bash
npm run build:tokens   # agent-manifest.json, relationship graph, token catalog
```

If manifest is missing, tools return an error with this hint.

## Tools

| Tool | Purpose |
|------|---------|
| `list_components` | Catalog with status, import path, usage, `composesWith` |
| `find_component_for_intent` | Rank components for a free-text UI task |
| `get_component_contract` | Full contract + agent block + usage for one name |
| `get_tokens` | Token catalog summary + manifest token metadata |
| `validate_component_usage` | Scan file path or snippet for raw button/heading/shadcn |

CLI equivalents: `npm run find-component`, `npm run lint:dt-usage`, `npm run validate:components`.

## Resources

| URI | Content |
|-----|---------|
| `digitaltableteur://design-system/manifest/summary` | Manifest summary + usage coverage |
| `digitaltableteur://design-system/tokens/summary` | Token catalog rollup |
| `digitaltableteur://design-system/import-policy` | `docs/PUBLIC_API.md` |

## Cursor / Claude Desktop (stdio)

Add to MCP config (adjust path):

```json
{
  "mcpServers": {
    "digitaltableteur-design-system": {
      "command": "npm",
      "args": ["run", "ds:mcp"],
      "cwd": "/absolute/path/to/digitaltableteur"
    }
  }
}
```

Optional: `DT_REPO_ROOT` if the process cwd is not the repo root.

## Implementation

- Executors: `nextjs-app/shared/lib/design-system-mcp/`
- HTTP registration: `create-consulting-mcp-handler.ts` (same `/mcp` route as consulting)
- Stdio entry: `scripts/design-system/ds-mcp-stdio.ts`

## Related

- [PUBLIC_API.md](./PUBLIC_API.md) — import policy
- `.claude/skills/dt-use-existing-component/SKILL.md` — reuse workflow
- `.planning/milestones/ai-native-design-system/` — milestone roadmap
