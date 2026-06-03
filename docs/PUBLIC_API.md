# Public API — `@dt/*` workspace alias

Digitaltableteur does **not** publish the design system as a standalone npm package yet. Production and Storybook import components via the TypeScript path alias:

```ts
import { Button } from "@dt/Button";
import { Title } from "@dt/Title";
```

## Policy

| Rule | Detail |
|------|--------|
| **Import surface** | `@dt/<ComponentName>` only — maps to `nextjs-app/shared/components/<ComponentName>/` or `patterns/` |
| **Stability** | Governed by `<Component>.contract.json` → `status`: `alpha` \| `beta` \| `stable` \| `deprecated` |
| **Breaking changes** | Allowed on `alpha`; `beta` requires validator + Storybook gates; `stable` requires consumers + AT snapshots |
| **Tokens** | Runtime source: `nextjs-app/shared/styles/variables.css`; DTCG export: `npm run build:tokens` |
| **Agent manifest** | `nextjs-app/shared/foundations/dist/agent-manifest.json` (regenerated with tokens) |

## Verification

```bash
npm run validate:components   # contract + story gates
npm run build:tokens          # tokens + agent manifest (includes usage evidence)
npm run build:zod-catalog     # Zod catalog for agents
npm run agent:eval            # manifest schema + golden checks
npm run audit:usage           # import evidence for all cataloged components
npm run build:agent-blocks    # TS + spec → component-agent-blocks.json
npm run find-component -- "your intent"  # rank @dt components for a task
npm run build:relationship-graph  # composesWith graph (also in build:tokens)
npm run lint:dt-usage         # strict: shadcn @/components/ui/* imports in app/ only (do not mass-swap headings/buttons in patterns)
npm run ds:mcp                # local stdio MCP (design-system tools + resources)
npm run sync:contract-api     # dry-run eligible variant sync (CVA + propSourced allowlist)
npm run check:contract-drift -- --strict  # CI: contracts match agent blocks
npm run audit:consumers       # refresh contract.consumers[] (stable tier only)
```

HTTP MCP (consulting + design system): `https://www.digitaltableteur.com/mcp` — see [DESIGN_SYSTEM_MCP.md](./DESIGN_SYSTEM_MCP.md).

## Stable-tier atoms (promoted)

`Title`, `Text`, `Icon`, `Badge`, `Avatar` — first stable atoms with committed AT-tree snapshots under `__a11y-snapshots__/`.
