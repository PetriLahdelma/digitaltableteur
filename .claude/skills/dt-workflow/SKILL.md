---
name: dt-workflow
description: >-
  Runs Claude Code dynamic workflows (ultracode) on partitionable Digitaltableteur
  tasks with objective verification bars. Use when the user says "workflow",
  "ultracode", "bulk sweep", "parallel migration", "promote all components", or
  wants autonomous multi-agent work with tests as the done gate. Do NOT use for
  single-file edits, subjective design decisions, or shipping PRs (use dt-ship-pr).
metadata:
  version: 1.1.0
  category: orchestration
  documentation: https://www.digitaltableteur.com/.well-known/agent-skills/dt-workflow
---

# Dynamic workflow orchestration

Use **Claude Code dynamic workflows** for large, partitionable, verifiable sweeps. The runtime plans fan-out, runs subagents, and verifies results — your job is to specify the task, partition key, area skill, and done bar.

**Requires:** Claude Code Team/Enterprise/Max with dynamic workflows (research preview).

**Copy-paste templates:** [references/templates.md](references/templates.md)

---

## Instructions

### Step 1: Decide if this is a workflow task

Use a workflow when ALL are true:

| Criterion | Question |
|-----------|----------|
| **Partitionable** | Can work be split into independent slices (files, components, routes, locales)? |
| **Verifiable** | Is "done" objective — tests, lint, or a validator script pass? |
| **Tedious at scale** | Would a human avoid doing 20+ similar edits by hand? |

Do **not** use workflows for: homepage visual redesign, copy tone, architecture debates, or single-file fixes.

### Step 2: Choose partition + area skill

| Domain | Partition by | Load skill + area doc |
|--------|--------------|----------------------|
| Design system | `nextjs-app/shared/components/*/` | `dt-design-system` + `nextjs-app/shared/components/AGENTS.md` |
| Next.js pages | `app/**/page.tsx` | `dt-nextjs-app` + `app/AGENTS.md` |
| i18n | Missing keys in `nextjs-app/shared/locales/{en,fi,sv}/` | area AGENTS + `npm run validate-translations` |
| CSS tokens | `**/*.module.css` with hardcoded colors | `dt-design-system` + `npm run lint:css` |
| Agent docs | `.claude/skills/dt-*/`, area `AGENTS.md` | `npm run validate:agent-docs` |

### Step 3: Pick invocation mode

| Mode | When |
|------|------|
| **Keyword (default)** | Include `workflow` or `ultracode` in the prompt |
| **`/effort ultracode`** | Session of large tasks; runtime decides eligibility |
| **`/deep-research`** | Multi-source research with built-in verification |

Prefer the **keyword** trigger until you trust cost and behavior on this repo.

Before the first real run, configure **permissions** so subagent edits are not interrupted (`/permissions` → auto mode for the session). Monitor cost with `/cost` after the pilot.

### Step 4: Write the prompt (required shape)

Every workflow prompt MUST include:

1. **`workflow:`** prefix (or `ultracode:`)
2. **Partition scope** — explicit paths or list source (manifest, grep, migration plan)
3. **Per-slice rules** — which area skill and conventions apply
4. **Done bar** — exact npm commands that must pass
5. **Pilot size** — start with 3–5 slices unless user says full run
6. **Confirmation gate** — plan-only first; wait for user `"go"` before edits; `/cost` after pilot

Example skeleton:

```text
workflow: [task summary]

Partition: [how to split work]
Per slice: follow [skill] and [AGENTS.md path]
Done when: [npm commands — must all pass]
Pilot: first [N] items only

Confirmation:
- Plan only first — show partitions; wait for my "go".
- /cost after pilot before full fan-out.

Do not: commit secrets, edit .env*, force-push main
```

**Staged migrations** (large Vite → Next.js work): run **T3a → T3b → T3c** from [references/templates.md](references/templates.md) as separate sessions — map, port, fix loop. Do not combine stages in one prompt.

### Step 5: Set verification gates

Run these after the workflow returns (or include in done bar):

```bash
# Default PR gate
npm run typecheck && npm run lint && npm test && npm run build

# Domain-specific (add as needed)
npm run validate:components      # design system changes
npm run validate:agent-docs      # skill / AGENTS.md changes
npm run validate-translations    # i18n changes
node scripts/design-system/agent-eval/run.mjs   # agent-manifest
```

Invoke subagents when touching sensitive areas:

- `security-reviewer` — `app/api/chat/`, guardrails, auth
- `accessibility-expert` — component a11y / axe changes
- `translation-language-checker` — FI/SV copy

### Step 6: Ship results

When the consolidated answer looks good:

1. Review diff (workflow hides intermediate steps)
2. Run verification gates locally
3. Use **`dt-ship-pr`** only when user asks to commit / open PR

---

## Examples

### Example 1: "Workflow to fill missing Finnish translations"

Actions:

1. Load template **T2** from [references/templates.md](references/templates.md)
2. Review plan-only key list; reply `"go"` for pilot (10 keys)
3. Paste prompt into Claude Code with `workflow:` prefix
4. After result: `npm run validate-translations && npm test`

### Example 2: "Ultracode promote WIP components to beta"

Actions:

1. Load template **T1** (component beta promotion)
2. User reviews plan-only output; replies `"go"` for 5-component pilot
3. Check `/cost`; expand only if budget OK
4. Done bar includes `npm run validate:components`
5. Review consolidated diff before PR

### Example 3: "Migrate next batch of Vite pages"

Actions:

1. Run **T3a** (map only) — review migration table
2. Reply `"proceed to T3b"` with approved routes
3. Run **T3b** pilot (3 routes); `/cost`; then remaining routes
4. Run **T3c** fix loop if gates fail after port
5. Manual browser check before deleting `src/` legacy

### Example 4: User asks for one Button fix

Actions:

1. **Do not** invoke this skill — single-file scope
2. Use `dt-design-system` in normal paired session instead

---

## Troubleshooting

### Workflow still at Level 1 / checks fail after deploy

Cause: done bar omitted or production not deployed yet.

Solution: wait for Vercel, re-run objective verifier (`curl` scan API, `npm run validate:*`). See [`docs/AGENT_READINESS.md`](../../../docs/AGENT_READINESS.md).

### Cost higher than expected

Cause: full-repo partition without pilot or skipped confirmation gate.

Solution: re-run with explicit `Confirmation: plan only first; wait for my "go"` and `Pilot: first 5 items`. Check `/cost` after pilot.

### Results disagree with repo conventions

Cause: area skill not named in prompt.

Solution: always cite `dt-*` skill + `AGENTS.md` path in the workflow prompt.

### Workflow vs GSD confusion

Cause: both orchestrate multi-step work.

Solution: **GSD** for phased planning with `.planning/` artifacts and human checkpoints; **dynamic workflows** for bulk execution with tests as gate.

---

## Boundaries

- MUST include objective done bar (npm scripts) in every workflow prompt
- MUST start with a pilot unless user explicitly requests full sweep
- MUST NOT use for commit/PR without user request (`dt-ship-pr`)
- MUST NOT edit `.env*`, credentials, or bypass hooks
- Ask before destructive git operations

---

## Discovery for external LLMs

Machine-readable skill index (all `dt-*` skills including this one):

`https://www.digitaltableteur.com/.well-known/agent-skills/index.json`

This skill markdown:

`https://www.digitaltableteur.com/.well-known/agent-skills/dt-workflow`

Copy-paste workflow prompts (HTTP):

`https://www.digitaltableteur.com/.well-known/agent-skills/dt-workflow/references/templates.md`

Human index: [`AGENT_INDEX.md`](../../../AGENT_INDEX.md)
