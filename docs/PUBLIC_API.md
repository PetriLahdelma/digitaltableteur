# Public API — `@dt/*` workspace alias

Digitaltableteur does **not** publish the design system as a standalone npm package yet. Production and Storybook import components via the TypeScript path alias:

```ts
import { Button } from "@dt/Button";
import { Title } from "@dt/Title";
```

---

## Import surface

| Rule | Detail |
|------|--------|
| **Path** | `@dt/<ComponentName>` → `nextjs-app/shared/components/<ComponentName>/` or `patterns/<ComponentName>/` |
| **Barrel** | Avoid `nextjs-app/shared/components/index.ts` in new code — prefer direct `@dt/*` imports |
| **Tokens** | Runtime: `nextjs-app/shared/styles/variables.css`; machine export: `npm run build:tokens` |
| **Agent manifest** | `nextjs-app/shared/foundations/dist/agent-manifest.json` (regenerated with tokens) |
| **Non-catalog surfaces** | `non-agent-surfaces.json` — page assemblies and exempt infra; see [CATALOG-POLICY.md](./CATALOG-POLICY.md) |

---

## Stability tiers (semver policy)

Contract `status` in `<Component>.contract.json` is the **public API semver boundary** until a standalone npm export ships.

| Status | Semver | Breaking changes | Promotion gate |
|--------|--------|------------------|----------------|
| **alpha** | `0.x` | Allowed | Contract + spec only; not in agent manifest |
| **beta** | `0.x` | Additive only; deprecate with `deprecated` prop flags | Stories, MDX, axe gate, ForcedColors story |
| **stable** | `1.x` per component family | Breaking props/layout require ADR + consumer update | AT snapshots, production `consumers[]`, Figma node-id |
| **deprecated** | frozen | Remove only after migration window | Listed in manifest with `replacementFor` |

### What counts as breaking (stable)

- Removing or renaming exported props
- Changing default variant semantics visible in production
- Removing sub-components or slots documented in the contract
- Changing required child composition (`composesWith` / `forbiddenUse`)

### Non-breaking (beta+)

- New optional props
- New variant enum values with safe defaults
- Token binding fixes that preserve computed appearance
- Additional stories and agent-block metadata

### Future npm export

When `@digitaltableteur/ds` ships:

- Component names match `@dt/<Name>` one-to-one
- Package semver follows **stable fleet** cadence (minor = new stable components; patch = fixes)
- Alpha/beta components remain workspace-only until promoted
- `agent-manifest.json` → `exportPolicy.version` will track the package semver

---

## Stable fleet (promoted)

**Atoms / molecules:** `Title`, `Text`, `Icon`, `Badge`, `Button`, `Card`, `Link`, `Label`, `Container`

**Patterns:** `SiteHeader`, `SiteFooter`

Promote with:

```bash
node scripts/design-system/promote-stable-atoms.mjs   # first atoms
node scripts/design-system/promote-stable-fleet.mjs     # production fleet
npm run audit:consumers                               # refresh consumers[]
```

All stable components require committed `__a11y-snapshots__/` and verified Figma `node-id` (except `Icon` — Phosphor library exception).

---

## Release gate

Single command before DS-facing releases:

```bash
npm run release:gate           # fast: tokens, agent:eval, bundle, catalog ≥85%
npm run release:gate -- --full # + test:ci, visual baselines, Playwright a11y pages
```

See [AGENTIC_DS_AUDIT_PLAYBOOK.md](./AGENTIC_DS_AUDIT_PLAYBOOK.md).

---

## Verification commands

```bash
npm run validate:components   # contract + story gates
npm run build:tokens          # tokens + agent manifest (includes usage evidence)
npm run build:zod-catalog     # Zod catalog for agents
npm run agent:eval            # manifest schema + MCP + golden intent/pattern evals
npm run audit:usage           # import evidence for cataloged components
npm run audit:catalog         # catalog completeness (target ≥85%)
npm run build:agent-blocks    # TS + spec → component-agent-blocks.json
npm run find-component -- "your intent"
npm run lint:dt-usage         # shadcn imports in app/ only
npm run check:contract-drift -- --strict
npm run check:bundle-budgets  # stable atom source-size budgets
npm run ds:mcp                # local stdio MCP
```

HTTP MCP: `https://www.digitaltableteur.com/mcp` — see [DESIGN_SYSTEM_MCP.md](./DESIGN_SYSTEM_MCP.md).
