# Dynamic workflow area guide

- **Skill templates:** [templates.md](./templates.md) — copy-paste `workflow:` prompts
- **Architecture:** [`docs/AGENT_WORKFLOW.md`](../../../docs/AGENT_WORKFLOW.md)
- **Skill authoring:** [`docs/SKILL_AUTHORING.md`](../../../docs/SKILL_AUTHORING.md)
- **Migration partition source:** [`docs/NEXTJS_MIGRATION_PLAN.md`](../../../docs/NEXTJS_MIGRATION_PLAN.md)
- **Component contracts:** `nextjs-app/shared/foundations/dist/agent-manifest.json` (run `npm run build:tokens`)
- **Agent readiness re-scan:** [`docs/AGENT_READINESS.md`](../../../docs/AGENT_READINESS.md)

## Verification scripts (done bars)

| Script | Command |
|--------|---------|
| PR gate | `npm run typecheck && npm run lint && npm test && npm run build` |
| Components | `npm run validate:components` |
| Agent docs | `npm run validate:agent-docs` |
| Translations | `npm run validate-translations` |
| Agent manifest | `node scripts/design-system/agent-eval/run.mjs` |
| CSS tokens | `npm run lint:css` |

## Subagents (invoke after sensitive slices)

| Agent | Path | When |
|-------|------|------|
| security-reviewer | `.claude/agents/security-reviewer.md` | Chat API, guardrails |
| accessibility-expert | `.claude/agents/accessibility-expert.md` | Component a11y |
| translation-language-checker | `.claude/agents/translation-language-checker.md` | FI/SV copy |

## Session setup (before first ultracode run)

- `/permissions` — auto mode or scoped allow for file edits (avoids interrupting fan-out)
- `/cost` — check after pilot before full fan-out
- Confirmation gate — templates in [templates.md](./templates.md); reply `"go"` only after reviewing plan

## Staged Next.js migration

| Stage | Template | Edits files? |
|-------|----------|--------------|
| Map | T3a | No (read-only) |
| Port | T3b | Yes (app/ routes) |
| Fix loop | T3c | Yes (until gates green) |

Run T3a → T3b → T3c as separate workflow sessions.

## External LLM discovery URLs

- Skills index: `https://www.digitaltableteur.com/.well-known/agent-skills/index.json`
- This skill: `https://www.digitaltableteur.com/.well-known/agent-skills/dt-workflow`
- Site context: `https://www.digitaltableteur.com/llms.txt`
