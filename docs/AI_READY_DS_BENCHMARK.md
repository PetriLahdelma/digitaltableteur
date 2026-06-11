# AI-Ready Design System Benchmark

**Version:** 1.0 (2026-06-06)  
**Audience:** CTOs, design-system leads, and agents evaluating DS agent-readiness.

Digitaltableteur publishes this benchmark as a **repeatable audit** — the same checks run locally via `npm run agentic-ds-audit` and `npm run release:gate`. See also the [consulting audit playbook](./AGENTIC_DS_AUDIT_PLAYBOOK.md).

---

## Scoring dimensions

| Dimension | Weight | Pass threshold | Command |
|-----------|--------|----------------|---------|
| **Manifest & schema** | 15% | Valid `agent-manifest.json`, Zod catalog | `npm run agent:eval` |
| **Intent retrieval** | 20% | ≥90% on golden set (20 cases) | `npm run agent:eval:intents` |
| **Pattern composition** | 15% | ≥90% on layout recipes | `npm run agent:eval:patterns` |
| **Catalog completeness** | 10% | ≥85%, catalog-gap = 0 | `npm run check:catalog-coverage` |
| **Contract drift** | 10% | Zero strict drift | `npm run check:contract-drift -- --strict` |
| **Stable fleet** | 10% | ≥10 stable with Figma node-ids | manifest `summary.statusCounts.stable` |
| **Production evidence** | 10% | ≥40 components with import evidence | `npm run audit:usage` |
| **Release gate** | 10% | Fast gate green | `npm run release:gate` |

**Overall pass:** ≥85% weighted score + no P0 failures (schema, drift, catalog-gap).

---

## Digitaltableteur snapshot (2026-06-06)

| Metric | Value | Pass |
|--------|-------|------|
| Catalog completeness | 86.3% (164/190) | ✓ |
| Catalog gap | 0 | ✓ |
| Stable components | 10 | ✓ |
| Intent golden set | 20/20 (100%) | ✓ |
| Pattern golden set | 12/12 (100%) | ✓ |
| Agent blocks | 164 | ✓ |
| Production usage evidence | 44/164 cataloged | ✓ |
| `check:consumers` | Wired in `release:gate` | ✓ |
| MCP tools | 6 DS + consulting | ✓ |
| Figma route captures | 6/9 confirmed @ 1728px | ✓ (partial) |
| `release:gate` (fast) | Green | ✓ |
| Full `npm test` | 1013/1013 pass | ✓ |
| Code Connect | Skipped (Figma Pro) | N/A |
| npm export | Workspace `@dt/*` only | Pending |

**Weighted score:** 100/100 (all eight dimensions pass). Level **4** certified; Level **5** blocked on npm export + remaining Figma routes/token binding.

---

## How to run (client repo or this repo)

```bash
git clone … && npm ci
npm run build:tokens
npm run agentic-ds-audit    # consulting + Figma + MCP checks
npm run release:gate        # pre-release gate
npm run release:gate -- --full   # + test:ci, visual, Playwright a11y pages
```

---

## Maturity levels

| Level | Name | Typical signals |
|-------|------|-----------------|
| 1 | Documented | Storybook + README only |
| 2 | AI-readable | Contracts, some MDX |
| 3 | AI-operable | Manifest, agent blocks, MCP, evals |
| 4 | AI-ready beta | Release gate, ≥85% catalog, stable fleet |
| 5 | Agentic-first | Green full test matrix, Figma loop closed, npm export |

**Digitaltableteur (Jun 2026):** Level **4** (AI-ready beta), path to **5** via v3 milestone.

---

## Related

- [AGENTIC_DS_OPERATING_MODEL.md](./AGENTIC_DS_OPERATING_MODEL.md)
- [AGENTIC_DS_AUDIT_PLAYBOOK.md](./AGENTIC_DS_AUDIT_PLAYBOOK.md)
- [PUBLIC_API.md](./PUBLIC_API.md)
- [AGENT_READINESS.md](./AGENT_READINESS.md) — site-level agent discovery (Level 4/5)
