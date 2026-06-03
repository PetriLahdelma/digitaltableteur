# Agent instruction index

> **Discovery index** for AI coding agents. Root `CLAUDE.md` / `AGENTS.md` stay short; load area docs and skills on demand.

## How to use this repo with agents

1. Read root [`AGENTS.md`](AGENTS.md) (quick router) or [`CLAUDE.md`](CLAUDE.md) (Claude Code router).
2. Match your task to an **area** below → open that area's `AGENTS.md`.
3. For workflows (scaffold component, add project, ship PR), load the matching **skill** from [`.claude/skills/`](.claude/skills/).

Principles (Apple-style + [Agent Skills](https://agentskills.io)):

- Keep root context under ~200 lines; defer detail to area files.
- One narrow skill per workflow, not one mega-prompt.
- Reference long docs (`docs/LLM_*.md`) by path — do not paste them into chat.
- Never commit secrets; ask before editing `.env` or running destructive ops.

---

## Areas → instructions

| Area | Path | AGENTS.md | Skill |
|------|------|-----------|-------|
| Next.js App Router | `app/` | [`app/AGENTS.md`](app/AGENTS.md) | [`dt-nextjs-app`](.claude/skills/dt-nextjs-app/SKILL.md) |
| API routes | `app/api/` | [`app/api/AGENTS.md`](app/api/AGENTS.md) | [`dt-api-routes`](.claude/skills/dt-api-routes/SKILL.md) |
| Design system & components | `nextjs-app/shared/components/` | [`nextjs-app/shared/components/AGENTS.md`](nextjs-app/shared/components/AGENTS.md) | [`dt-design-system`](.claude/skills/dt-design-system/SKILL.md) |
| Layout patterns | `nextjs-app/shared/patterns/` | [`nextjs-app/shared/patterns/AGENTS.md`](nextjs-app/shared/patterns/AGENTS.md) | [`dt-design-system`](.claude/skills/dt-design-system/SKILL.md) |
| React providers | `providers/` | [`providers/AGENTS.md`](providers/AGENTS.md) | [`dt-nextjs-app`](.claude/skills/dt-nextjs-app/SKILL.md) |
| Automation scripts | `scripts/` | [`scripts/AGENTS.md`](scripts/AGENTS.md) | [`dt-scripts`](.claude/skills/dt-scripts/SKILL.md) |
| Documentation | `docs/` | [`docs/AGENTS.md`](docs/AGENTS.md) | — |
| Legacy serverless | `api-legacy-vercel-functions/` | [`api-legacy-vercel-functions/AGENTS.md`](api-legacy-vercel-functions/AGENTS.md) | [`dt-api-routes`](.claude/skills/dt-api-routes/SKILL.md) |
| Sanity CMS / blog | `digitaltableteur-blog/` | [`digitaltableteur-blog/AGENTS.md`](digitaltableteur-blog/AGENTS.md) | [`dt-sanity-cms`](.claude/skills/dt-sanity-cms/SKILL.md) |
| Akaunting | `akaunting/` | [`akaunting/AGENTS.md`](akaunting/AGENTS.md) | — |

---

## Workflow skills (`.claude/skills/`)

| Skill | Trigger |
|-------|---------|
| [`dt-design-system`](.claude/skills/dt-design-system/SKILL.md) | Create or modify UI components, Storybook, contracts, tokens |
| [`dt-use-existing-component`](.claude/skills/dt-use-existing-component/SKILL.md) | Find/reuse @dt components before creating new UI |
| [`dt-nextjs-app`](.claude/skills/dt-nextjs-app/SKILL.md) | Pages, layouts, metadata, OG images, App Router |
| [`dt-api-routes`](.claude/skills/dt-api-routes/SKILL.md) | `app/api/*`, chat, contact, GDPR endpoints |
| [`dt-scripts`](.claude/skills/dt-scripts/SKILL.md) | Linear, Sentry, visual regression, deploy scripts |
| [`dt-sanity-cms`](.claude/skills/dt-sanity-cms/SKILL.md) | Blog posts, Sanity studio, manifest publish |
| [`dt-ship-pr`](.claude/skills/dt-ship-pr/SKILL.md) | Commit, push, create PR (user-only) |
| [`dt-workflow`](.claude/skills/dt-workflow/SKILL.md) | Dynamic workflows / ultracode bulk sweeps with test gates |
| [`add-project`](.claude/skills/add-project/SKILL.md) | New portfolio / work case study |
| [`brainstorming`](.claude/skills/brainstorming/SKILL.md) | Creative features before implementation |
| [`claude-automation-recommender`](claude-code-setup plugin) | Audit hooks/skills/MCP gaps — say "recommend automations" |

**Plugin:** [`claude-code-setup@claude-plugins-official`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-code-setup) (project scope). Install: `claude plugin install claude-code-setup@claude-plugins-official --scope project`

Full workflow guide: [`docs/AGENT_WORKFLOW.md`](docs/AGENT_WORKFLOW.md)  
Skill authoring: [`docs/SKILL_AUTHORING.md`](docs/SKILL_AUTHORING.md)  
Latest automation audit: [`docs/CLAUDE_AUTOMATION_RECOMMENDATIONS.md`](docs/CLAUDE_AUTOMATION_RECOMMENDATIONS.md)

---

## Deep reference (load when needed)

| Document | When |
|----------|------|
| [`docs/LLM_COMPONENT_GENERATION_RULES.md`](docs/LLM_COMPONENT_GENERATION_RULES.md) | Before creating any component |
| [`docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`](docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md) | Non-trivial planning |
| [`docs/NEXTJS_MIGRATION_PLAN.md`](docs/NEXTJS_MIGRATION_PLAN.md) | Vite vs Next.js boundaries |
| [`docs/AGENT_BROWSER_GUIDE.md`](docs/AGENT_BROWSER_GUIDE.md) | Visual verification during dev |
| [`nextjs-app/shared/foundations/dist/agent-manifest.json`](nextjs-app/shared/foundations/dist/agent-manifest.json) | Component contracts (generated) |

External context for this site: `https://www.digitaltableteur.com/llms.txt`

---

## Quality gate (before PR)

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run validate:agent-docs   # link + skill + root size checks
```
