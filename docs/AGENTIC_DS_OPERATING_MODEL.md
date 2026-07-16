# Agentic design system — operating model

How humans and agents build UI on Digitaltableteur without drift, visual regressions, or duplicate primitives.

**Audience:** You, client teams, and coding agents (Claude, Cursor, MCP clients).

---

## Principles

1. **Reuse before create** — `find-component` / MCP `find_component_for_intent` before inventing markup.
2. **Contracts are law** — `.contract.json` + generated `agent` blocks; CI fails on drift (`check:contract-drift --strict`).
3. **Enforcement is narrow** — `lint:dt-usage` targets shadcn imports in `app/` only; patterns keep native headings/chrome unless explicitly redesigned.
4. **Prove retrieval** — `npm run agent:eval` includes a golden intent set (≥85% pass rate).
5. **Figma follows code** — tokens from `variables.css`; Figma sync is generated, not hand-drawn truth.

---

## Agent workflow (one feature)

```text
1. npm run build:tokens          # manifest + graph + usage
2. MCP find_component_for_intent OR npm run find-component -- "…"
3. MCP get_component_contract    # props, useWhen, avoidWhen, composesWith
4. Implement with @dt/* imports
5. MCP validate_component_usage  # source scan or structured { component, props }
6. npm run validate:components && npm run agent:eval
```

**MCP:** production `https://www.digitaltableteur.com/mcp` · local `npm run ds:mcp`  
**Policy:** [PUBLIC_API.md](./PUBLIC_API.md) · **Tools:** [DESIGN_SYSTEM_MCP.md](./DESIGN_SYSTEM_MCP.md)  
**Catalog boundaries:** [CATALOG-POLICY.md](./CATALOG-POLICY.md) · **Proof:** [AGENTIC_DS_CASE_STUDY.md](./AGENTIC_DS_CASE_STUDY.md)

---

## Human workflow (design + review)

| Step | Owner | Action |
|------|--------|--------|
| Token change | Design/dev | Edit `variables.css` → `npm run build:tokens` → Figma variable phases |
| New component | Dev | Scaffold + contract + Storybook + agent block (generated at build) |
| Promote stable | Design + dev | AT snapshots, production consumer, Figma node, no default-style surprises |
| Pattern change | Design lead | Explicit sign-off — do not auto-swap section headings/CTAs to default `@dt/Title`/`@dt/Button` |
| PR | Agent or human | `agent:eval`, `lint`, `typecheck`, visual spot-check for UI |

---

## What agents must not do

- Replace pattern `<h2 className="font-display…">` with default `@dt/Title` (changes typography).
- Put `@dt/Button` `tertiary` on dark/inverse backgrounds without checking contrast.
- Import `@/components/ui/*` in new `app/` routes (use `@dt/*`).
- Skip `Title` **`unstyled`** when wiring semantic level only (blog meta labels, work pages).

See [PHASE-05-SUMMARY.md](../.planning/milestones/ai-native-design-system/PHASE-05-SUMMARY.md).

---

## Measurement (v2)

| Metric | Command / artifact |
|--------|-------------------|
| Intent retrieval | `npm run agent:eval` → golden-intents (20 cases, ≥85%) |
| Pattern composition | `npm run agent:eval:patterns` — 10 layout recipes |
| Agent Experience | `npm run audit:agent-experience` — evidence scorecard + API complexity ratchet |
| Local audit bundle | `npm run agentic-ds-audit` |
| Manifest health | Schema, usage coverage, agent blocks, graph |
| Contract drift | `npm run check:contract-drift --strict` |
| Import policy | `npm run lint:dt-usage` |

AX method and limitations: [design-system/agent-experience.md](./design-system/agent-experience.md).

Run intent eval alone:

```bash
node scripts/design-system/agent-eval/intent-retrieval-eval.mjs
```

---

## Roadmap

Milestone v3: [`.planning/milestones/agentic-ds-v3/ROADMAP.md`](../.planning/milestones/agentic-ds-v3/ROADMAP.md) — proof under change, Figma captures, benchmark product.

Milestone v2: [`.planning/milestones/agentic-ds-v2/ROADMAP.md`](../.planning/milestones/agentic-ds-v2/ROADMAP.md) — Figma loop, pattern composition MCP, portfolio proof, client audit playbook.

Milestone v1 (complete): [`.planning/milestones/ai-native-design-system/`](../.planning/milestones/ai-native-design-system/)

---

## Client “agentic DS audit” (outline)

1. Manifest coverage vs codebase
2. Intent eval pass rate on client golden set (custom JSON)
3. Figma ↔ contract node-id parity
4. MCP smoke (`list_components`, `find_component_for_intent`)
5. Report + prioritized backlog

Contact via site `/contact` for engagements.
