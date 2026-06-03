# Milestone: AI-native design system

**Goal:** Move Digitaltableteur from AI-readable to AI-native — agents can select, compose, and validate `@dt/*` components without human correction.

**Baseline (2026-06-02):** 191 codebase components, 130 cataloged (68.1%), `validate:components` passes, `HONEST_BETA_DOC_DEBT=0`. Contracts score ~7/10 governance, ~4/10 agentic reuse.

---

## Phases

| Phase | Focus | Status |
|-------|--------|--------|
| **1** | Usage evidence + intent retrieval | **Done** |
| **2** | Generated agent blocks (props, variants, spec hints) | **Done** |
| **3** | Contract API sync + drift gate | In progress |
| **4** | Relationship graph (`prefersOver`, `composesWith`) | Planned |
| **5** | `@dt` usage ESLint gate | Planned |
| **6** | Design System MCP server | Planned |

---

## Phase 1 — Usage evidence (done)

- `usage-scan-lib.mjs`, `audit-usage.mjs`, `find-component.mjs`
- `agent-manifest.json` v1.4 with per-component `usage` + fleet `usageCoverage`
- Skill: `dt-use-existing-component`
- `contract.consumers[]` remains stable-promotion only

**Commands:** `npm run audit:usage`, `npm run find-component -- "intent"`

---

## Phase 2 — Agent blocks in manifest

Generate structured `agent` block per component at manifest build time (not hand-written in 130 contracts):

```json
{
  "preferredImport": "@dt/Button",
  "props": { "variant": { "type": "union", "values": ["primary", "secondary"] } },
  "variants": {},
  "useWhen": [],
  "avoidWhen": [],
  "requiredA11y": [],
  "replacementFor": [],
  "canonicalExamples": []
}
```

Sources: TypeScript (`extractComponent`), CVA, spec.md Do/Don't, static replacement policy.

---

## Phase 3 — Contract API sync

- `sync-contract-api` merges TS-derived `variants` + `props` into `.contract.json`
- CI fails when TS exposes a public prop missing from contract
- Retire `argTypesProxyExempt` as props become generated

---

## Phase 4 — Relationship graph

- `prefersOver`: Title → raw `<h1>`
- `composesWith`: AlertBanner + Button
- Ranked retrieval uses graph + usage evidence

---

## Phase 5 — Enforcement

- ESLint: no raw headings/buttons where `@dt/*` exists
- `validate:component-usage` for PR files

---

## Phase 6 — Design System MCP

Tools: `list_components`, `find_component_for_intent`, `get_component_contract`, `get_tokens`, `validate_component_usage`

Static MCP resources first; tools second. Align with Figma MCP + Code Connect.

---

## Success criteria (milestone complete)

1. Agent query *"dismissible warning banner with action"* → ranked component + import + props + a11y + consumers + validation command.
2. Button (and peers) have generated variants/props; CI fails on drift.
3. ≥80% cataloged components have `usageEvidence`.
4. `agent-manifest.json` regenerated + schema-validated in CI.
5. ESLint catches raw `<button>` in PRs.

---

## References

- `scripts/design-system/contract.schema.json` — governance schema (v2 planned)
- `docs/PUBLIC_API.md` — import policy
- `.claude/skills/dt-use-existing-component/SKILL.md` — reuse workflow
- External: Figma MCP guide, MCP tools spec, shadcn registry, DTCG, Storybook MCP
