# Milestone: Agentic design system v2 — proof & composition

**Goal:** Make Digitaltableteur demonstrably among the best agentic design systems — measured retrieval, closed Figma loop, pattern-level composition, public operating model.

**Prerequisite:** Milestone v1 complete (phases 1–6, MCP live). See [../ai-native-design-system/ROADMAP.md](../ai-native-design-system/ROADMAP.md).

**Baseline (2026-06-03):** Intent golden set 20/20 @ 85% threshold in CI; Figma variable pipeline scaffolded; portfolio patterns intentionally not mass-migrated to default `@dt/Title`/`@dt/Button`.

---

## Phases

| Phase | Focus | Status |
|-------|--------|--------|
| **7** | Intent retrieval benchmark in `agent:eval` | **Done** |
| **8** | Public operating model + agent workflow docs | **In progress** |
| **9** | Figma closed loop (variables → nodes → `sync:figma`) | Planned |
| **10** | Pattern composition in manifest + MCP | Planned |
| **11** | Portfolio proof route (read-only DS agent demo) | Planned |
| **12** | Client-facing “agentic DS audit” playbook | Planned |

---

## Phase 7 — Intent benchmark (done)

- `scripts/design-system/agent-eval/golden-intents.json` — 20 curated intents
- `intent-retrieval-eval.mjs` — same ranker as `find-component` / MCP
- Wired into `npm run agent:eval` — **≥85%** pass rate required

**Commands:** `npm run agent:eval`, `node scripts/design-system/agent-eval/intent-retrieval-eval.mjs`

---

## Phase 8 — Operating model (in progress)

- [docs/AGENTIC_DS_OPERATING_MODEL.md](../../../docs/AGENTIC_DS_OPERATING_MODEL.md) — human + agent workflow
- Link from `docs/AGENTS.md`, `DESIGN_SYSTEM_MCP.md`
- No new visual enforcement without explicit design sign-off

---

## Phase 9 — Figma closed loop

Per [docs/FIGMA_DESIGN_SYSTEM_SYNC.md](../../../docs/FIGMA_DESIGN_SYSTEM_SYNC.md):

1. Apply variable phases to DT-Site-stuff (`PC2UPdYwm8qGt6ZTg0AakF`)
2. Stable atoms in Figma with Code Connect
3. `npm run sync:figma` → real `node-id` on contracts
4. CI: `check:storybook-figma` on promoted components

---

## Phase 10 — Composition intelligence

Extend manifest + MCP beyond single-component retrieval:

- Pattern entries: `CTASection`, `Header`, `ArticlePageTemplate`, … with `useWhen` / `avoidWhen` / `variantMatrix` (e.g. inverse backgrounds)
- MCP tool: `suggest_pattern_for_layout` (or extend `find_component_for_intent` with `kind: pattern`)
- Rank constraints: surface `avoidWhen` when query implies dark/inverse context

---

## Phase 11 — Portfolio proof

Read-only demo (no chrome regressions):

- Route or doc page listing golden intent → top match → Storybook deep link
- Weekly CI publishes pass rate in PR summary / artifact

---

## Phase 12 — Commercial playbook

Package for consulting:

- Audit checklist: manifest coverage, intent eval %, Figma drift, MCP probe
- Deliverable template aligned with `agent:eval` + `parity:verify`

---

## Success criteria (v2 complete)

1. Intent eval ≥90% on golden set; failures block CI.
2. ≥5 stable atoms with Figma `node-id` + Code Connect.
3. ≥3 documented pattern recipes with composition in manifest.
4. Public operating model linked from site agent discovery (`/.well-known/`).
5. One published case study with before/after agent metrics.

---

## References

- [docs/PUBLIC_API.md](../../../docs/PUBLIC_API.md)
- [docs/DESIGN_SYSTEM_MCP.md](../../../docs/DESIGN_SYSTEM_MCP.md)
- [PHASE-05-SUMMARY.md](../ai-native-design-system/PHASE-05-SUMMARY.md) — enforcement guardrails
