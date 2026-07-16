# Design System MCP

Agents can discover `@dt/*` components, tokens, and import policy through MCP — without hand-reading 130 contracts.

## Surfaces

| Surface | URL / command | Tools |
|---------|----------------|-------|
| **Production HTTP** | `https://www.digitaltableteur.com/mcp` | Consulting + docs registry (`search`/`get`) + 4 resources |
| **Local stdio** | `npm run ds:mcp` | Design system: 6 discovery tools + `search`/`get` + 4 resources |

Discovery card: `/.well-known/mcp/server-card.json`

## Prerequisites

```bash
npm run build:tokens   # agent-manifest.json, relationship graph, token catalog, docs-registry.json
```

If manifest is missing, tools return an error with this hint.

## Docs-registry tools (public surface, Astryx roadmap 3.3)

The public route serves exactly two docs tools fed from the git-tracked build
artifact `nextjs-app/shared/foundations/dist/docs-registry.json` (contracts +
example story source, extracted at build time — same data as the Storybook
docs pages, so the AI surface cannot drift):

| Tool | Purpose |
|------|---------|
| `search(query, limit=8)` | Budgeted briefs: name, group, dense description, import line, up to 6 key props, related, follow-up hint. Scoring: name exact 100 / prefix 90 / keyword 90 / substring 85 / all-words 75; sub-components demoted. |
| `get(name, section?)` | Full entry: usage guidance, props, example story source, theming tokens. Sections: `all` (default), `usage`, `props`, `examples`, `theming`. |

Drift guard: `nextjs-app/shared/lib/design-system-mcp/docs-registry.test.ts`
(Tier 1 completeness, search ranking, per-stable-component get shape snapshot).

## Discovery tools (repo-internal stdio only)

| Tool | Purpose |
|------|---------|
| `list_components` | Catalog with status, import path, usage, `composesWith` |
| `find_component_for_intent` | Rank components for a free-text UI task |
| `suggest_pattern_for_layout` | Rank layout patterns (CTA, header, hero) with useWhen/avoidWhen |
| `get_component_contract` | Full contract + agent block + usage for one name |
| `get_tokens` | Token catalog summary + manifest token metadata |
| `validate_component_usage` | Scan file/snippet for raw UI, or validate `{ component, props }` against machine-readable prop relationships |

CLI equivalents: `npm run find-component`, `npm run lint:dt-usage`, `npm run validate:components`.

## Resources

| URI | Content |
|-----|---------|
| `digitaltableteur://design-system/manifest/summary` | Manifest summary + usage coverage |
| `digitaltableteur://design-system/tokens/summary` | Token catalog rollup |
| `digitaltableteur://design-system/import-policy` | `docs/PUBLIC_API.md` |
| `digitaltableteur://design-system/pattern-recipes` | Pattern composition recipes JSON |

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

## Evaluation

`npm run agent:eval` validates manifest, MCP tool registration, **intent retrieval** against `scripts/design-system/agent-eval/golden-intents.json` (≥85% pass rate), and the Agent Experience complexity/coverage ratchet.

```bash
node scripts/design-system/agent-eval/intent-retrieval-eval.mjs
```

See [AGENTIC_DS_OPERATING_MODEL.md](./AGENTIC_DS_OPERATING_MODEL.md).

## Related

- [PUBLIC_API.md](./PUBLIC_API.md) — import policy
- [AGENTIC_DS_OPERATING_MODEL.md](./AGENTIC_DS_OPERATING_MODEL.md) — human + agent workflow
- `.claude/skills/dt-use-existing-component/SKILL.md` — reuse workflow
- `.planning/milestones/ai-native-design-system/` — milestone v1 (complete)
- `.planning/milestones/agentic-ds-v2/` — milestone v2 roadmap
