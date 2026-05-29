# Agent workflow architecture

How Digitaltableteur structures AI agent context — inspired by Apple's leaked CLAUDE.md discipline and the [Agent Skills open standard](https://agentskills.io).

---

## Problem

General-purpose models do not know:

- Our component contract system and WIP lifecycle
- Next.js 15 async params and OG image conventions
- Which npm scripts gate merges
- That `react-icons` must stay at 5.5.0

Pasting all of that into every chat wastes tokens and causes missed rules.

---

## Solution: three layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Router (always loaded)                        │
│  CLAUDE.md · AGENTS.md · AGENT_INDEX.md  (~150 lines)   │
└───────────────────────────┬─────────────────────────────┘
                            │ match task
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Area instructions (load on demand)            │
│  app/AGENTS.md · shared/components/AGENTS.md · …        │
└───────────────────────────┬─────────────────────────────┘
                            │ workflow match
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Skills (procedural workflows)                 │
│  .claude/skills/dt-*/SKILL.md                           │
└───────────────────────────┬─────────────────────────────┘
                            │ factual reference
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Deep docs (by path, never pasted wholesale)            │
│  docs/LLM_COMPONENT_GENERATION_RULES.md · llms.txt      │
└─────────────────────────────────────────────────────────┘
```

### Discovery → activation → execution

1. **Discovery:** Agent reads root router + skill frontmatter descriptions (~few hundred tokens).
2. **Activation:** Task matches an area → open that `AGENTS.md`. Workflow match → load full `SKILL.md`.
3. **Execution:** Skill steps reference scripts and deep docs by path.

---

## File roles

| File | Audience | Max size | Contents |
|------|----------|----------|----------|
| `AGENT_INDEX.md` | All agents | — | Master map: areas, skills, deep refs |
| `CLAUDE.md` | Claude Code | ~200 lines | Router + non-obvious gotchas |
| `AGENTS.md` | Generic agents | ~100 lines | JIT index to area files |
| `<area>/AGENTS.md` | Area work | ~150 lines | Patterns, commands, boundaries |
| `.claude/skills/dt-*/SKILL.md` | Workflows | ~100 lines | Step-by-step procedures |

**Not duplicated in root:** component styling tables, API handler examples, script inventories — those live in area files.

---

## Skills inventory

| Skill | Triggers on |
|-------|-------------|
| `dt-design-system` | Components, patterns, Storybook, tokens |
| `dt-nextjs-app` | Pages, layouts, metadata, OG images |
| `dt-api-routes` | `app/api/*`, chat, contact, GDPR |
| `dt-scripts` | `scripts/`, automation, design-system CLI |
| `dt-sanity-cms` | Blog, Sanity, manifest publish |
| `dt-ship-pr` | Commit, push, PR (user-only) |
| `add-project` | New portfolio case study |
| `brainstorming` | Creative work before implementation |

Skills live in [`.claude/skills/`](../.claude/skills/). Subagents in [`.claude/agents/`](../.claude/agents/) (e.g. `security-reviewer` for chat API). Cursor and Claude Code both discover project skills from this folder.

---

## Writing guidelines

### Root router (Apple-style)

- Direct language: "MUST", "MUST NOT", not essays
- Document only what the model cannot infer from code
- Link, do not copy, long references
- Version-control with code; review in PRs

### Area AGENTS.md

- One area per file — narrow scope
- Commands agents can run verbatim
- "Boundaries" section for destructive limits
- JIT search commands (`rg`, `find`)

### Skills

- YAML frontmatter: `name` (kebab-case, matches folder) + `description` (WHAT + WHEN + trigger phrases + **Do NOT use** negative triggers)
- Body sections: **Instructions**, **Examples**, **Troubleshooting**, **Boundaries**
- Heavy context in `references/` — progressive disclosure (frontmatter → body → references → deep docs)
- Bundle scripts for deterministic logic; use LLM for intent + parsing
- Authoring guide: [`docs/SKILL_AUTHORING.md`](./SKILL_AUTHORING.md)

---

## External context

- **Site index:** `https://www.digitaltableteur.com/llms.txt`
- **Component manifest:** `nextjs-app/shared/foundations/dist/agent-manifest.json` (generated)
- **Cross-project wiki:** `/Users/petrilahdelma/SAPDevelop/llm-wiki`

---

## CI validation

```bash
npm run validate:agent-docs
```

Checks:

- Root `CLAUDE.md` line budget
- All `AGENT_INDEX.md` links resolve
- Every `dt-*` skill: kebab-case name, description limits, required sections, `references/area-guide.md`
- See full checklist in [`SKILL_AUTHORING.md`](./SKILL_AUTHORING.md)

Run in `.github/workflows/pr-validation.yml`.

---

## Maintenance checklist

When changing conventions:

1. Update the **area** `AGENTS.md` (not root, unless repo-wide)
2. Update matching **skill** if workflow steps change
3. Update **`AGENT_INDEX.md`** if new area or skill
4. Trim **root** if content duplicated — root should shrink over time
5. Run `npm run validate:agent-docs`
6. Update `.github/copilot-instructions.md` hierarchy blurb if paths change

---

## Production safety

Agent instruction files (`CLAUDE.md`, `AGENTS.md`, `.claude/skills/`) are **not imported by Next.js** — they do not ship in the client bundle. They remain in the repo for developers and agents only.

If adding MDX routes, never import agent docs into `app/`.
