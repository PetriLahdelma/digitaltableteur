# Agentic design system audit playbook

Client-facing checklist for assessing how **agent-ready** a design system is. All steps run **locally** — no dependency on GitHub Actions quota.

---

## When to use

- Pre-engagement discovery
- Mid-project health check
- Before promoting components to `stable`
- Quarterly DS governance review

---

## Automated bundle (Digitaltableteur repo)

```bash
npm run agentic-ds-audit
```

Runs, in order:

| Step | What it proves |
|------|----------------|
| `build:tokens` | Manifest, agent blocks, relationship graph regenerate |
| `agent:eval` | Schema, MCP tools, intent (≥90%) + pattern golden sets |
| `check:storybook-figma` | Contract `figma` URLs use DT file + real node ids |
| `verify:figma-in-scope` | In-scope components mapped in `FIGMA_NODE_IDS` |
| `sync:figma` | Contracts aligned with `figma-config.mjs` |
| `lint:dt-usage` | Import policy in `app/` |
| `check:contract-drift --strict` | TS ↔ contract parity |

---

## Manual probes (30–60 min)

### 1. Intent retrieval

```bash
npm run find-component -- "dismissible warning banner"
npm run agent:eval:intents
```

**Pass:** Top match matches human expectation on 5 spot-check queries.

### 2. Pattern composition

```bash
node scripts/design-system/agent-eval/pattern-composition-eval.mjs
```

**Pass:** Layout intents map to correct `@dt` patterns (CTA, header, hero).

### 3. MCP smoke

Production: `https://www.digitaltableteur.com/mcp`  
Local: `npm run ds:mcp`

Call:

- `find_component_for_intent`
- `suggest_pattern_for_layout`
- `get_component_contract` (Button, AlertBanner)
- `validate_component_usage` on a sample `app/` file

### 4. Figma parity

```bash
npm run build:figma-variables
npm run verify:figma-in-scope
npm run sync:figma
npm run check:figma
```

**Pass:** Variable payloads generated; 33/34 in-scope components deep-link to Figma (Icon = Phosphor library exception).

**Code Connect:** not used on Figma Pro — Storybook Design panel + contract URLs instead.

### 5. Agent discovery

- `/.well-known/agent.json` — lists design system surfaces
- `/design-system/agent` — public proof page
- `docs/AGENTIC_DS_OPERATING_MODEL.md`

---

## Scoring rubric (suggested)

| Dimension | Weak | Strong |
|-----------|------|--------|
| Manifest + contracts | Hand-written README only | Generated agent blocks + drift CI |
| Retrieval | Generic component list | Intent + pattern golden evals ≥90% |
| Enforcement | Ad hoc review | `lint:dt-usage` + validate commands |
| Figma loop | Drift accepted | Variables + node-id sync (no Code Connect on Pro) |
| Operating model | Undocumented | Public workflow + guardrails |

---

## Deliverable template

1. **Executive summary** — maturity score + top 3 risks  
2. **Evidence** — `agent:eval` output, sample MCP transcripts  
3. **Backlog** — prioritized fixes (contracts, Figma, patterns)  
4. **90-day plan** — stable promotions, eval expansion, composition recipes  

Contact: [digitaltableteur.com/contact](https://www.digitaltableteur.com/contact)
