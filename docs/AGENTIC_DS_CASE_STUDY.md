# Case study: AI-native design system on Digitaltableteur

**Published:** 2026-06-03  
**Scope:** In-repo agent infrastructure (manifest, MCP, evals, Figma loop) — not speculative “mutable UI” features.

---

## Problem

Coding agents building UI on a large component library routinely:

- Invent duplicate primitives (`<button>` instead of `@dt/Button`)
- Miss the right molecule for an intent (“warning banner” → wrong component)
- Drift from tokens and contracts with no CI signal

Manual Storybook docs alone do not give agents **ranked retrieval**, **prop unions**, or **production usage evidence**.

---

## Approach

Treat the design system as a **versioned agent API**:

1. **Contracts** (`*.contract.json`) — lifecycle, a11y gates, Figma URLs
2. **Generated manifest** (`agent-manifest.json`) — `agent` blocks from TypeScript + spec hints + usage scan
3. **MCP** — `find_component_for_intent`, `get_component_contract`, `validate_component_usage`
4. **Golden evals** — intent retrieval + pattern composition in `npm run agent:eval`
5. **Figma** — code → variables/components in DT-Site-stuff; real `node-id` on promoted atoms

---

## Measured outcomes (2026-06-03)

| Metric | Before (v0 docs-only) | After (v1 + v2) |
|--------|------------------------|-----------------|
| Intent retrieval (20 golden queries) | Unmeasured | **20/20 (100%)** — CI threshold **≥90%** |
| Pattern composition (7 recipes) | N/A | **7/7 (100%)** |
| Cataloged components with `agent` block | 0 | **130** |
| Usage evidence on catalog | N/A | **119/130 (91.5%)** |
| Stable + production `consumers[]` + AT snapshots | 5 atoms | **7 atoms** (added Button, Card) |
| Stable with verified Figma `node-id` | 4 | **6** (Icon uses `dt-icon` — Phosphor library; documented) |
| Out-of-catalog surfaces documented | No | **59** buckets in `non-agent-surfaces.json` |
| Catalog gap (should catalog, don’t) | Unknown | **0** |

Regenerate metrics:

```bash
npm run build:tokens
npm run agent:eval
npm run audit:catalog -- --emit
```

---

## Representative agent flow

Query: *“dismissible warning banner”*

1. `npm run find-component -- "dismissible warning banner"` → **AlertBanner** (ranked)
2. MCP `get_component_contract` → props, `composesWith: ["Button"]`, a11y
3. Implement with `@dt/AlertBanner` + `@dt/Button`
4. `npm run agent:eval` — golden case `alert-dismissible` stays green

---

## What we did not claim

- Runtime-mutating components ([AI-POWERED-DS.md](./AI-POWERED-DS.md) remains **roadmap vision**)
- Full Figma variable apply in CI (human/MCP step: `npm run figma:apply-variables`)
- 100% catalog completeness (page assemblies stay outside the agent catalog by policy)

---

## Operating model

Agents should load:

- [AGENTIC_DS_OPERATING_MODEL.md](./AGENTIC_DS_OPERATING_MODEL.md)
- `nextjs-app/shared/foundations/dist/agent-manifest.json`
- [CATALOG-POLICY.md](./CATALOG-POLICY.md)

Demo route: `/design-system/agent` (golden intents → Storybook deep links).

Discovery: `/.well-known/agent-card.json` includes `design_system` metadata.
