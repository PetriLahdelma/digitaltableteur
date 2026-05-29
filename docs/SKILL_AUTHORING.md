# Skill authoring guide

How to write and maintain Claude/Cursor agent skills for Digitaltableteur. Combines [agentskills.io](https://agentskills.io), our [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md), and Claude skill best practices.

---

## Folder structure

```
.claude/skills/my-skill-name/
├── SKILL.md              # Required — frontmatter + instructions
├── references/           # Optional — docs loaded only when needed
│   └── area-guide.md
├── scripts/              # Optional — deterministic bash/node helpers
└── assets/               # Optional — templates
```

- Folder name: **kebab-case** (`dt-design-system`, not `dt_design_system`)
- File name: exactly **`SKILL.md`** (case-sensitive)

---

## Frontmatter (discovery layer)

Only the frontmatter loads during skill discovery. Keep descriptions trigger-rich.

```yaml
---
name: dt-example
description: >-
  What it does in one sentence. Use when the user says "phrase one",
  "phrase two", or edits path/to/files. Do NOT use for [other skill scope].
metadata:
  version: 1.0.0
  category: design-system
---
```

### Description rules

| Rule | Example |
|------|---------|
| WHAT + WHEN + user phrases | "Use when user says 'scaffold component'..." |
| Negative triggers | "Do NOT use for Next.js pages (use dt-nextjs-app)" |
| Under 1024 characters | Keep concise |
| No angle brackets | Security restriction — no `<` or `>` in description |

### Optional metadata

```yaml
metadata:
  version: 1.1.0
  category: nextjs
  documentation: https://www.digitaltableteur.com/llms.txt
```

---

## SKILL.md body (activation layer)

Recommended sections:

1. **## Instructions** — numbered steps, CRITICAL callouts, expected command output
2. **## Examples** — user phrase → actions → result
3. **## Troubleshooting** — common errors with cause + fix
4. **## Boundaries** — MUST NOT / ask-first rules

### Patterns that work

**Sequential workflow** — steps must run in order; halt on failure.

**Iterative refinement** — run validator script, fix issues, re-run until green.

**Progressive disclosure** — link heavy docs in `references/` instead of inlining.

**Deterministic validation** — prefer `npm run validate:*` scripts over prose-only checks.

---

## Progressive disclosure stack

```
Frontmatter (always indexed)
    ↓ task match
SKILL.md body (loaded on activation)
    ↓ need more context
references/*.md (loaded on demand)
    ↓ deep facts
docs/LLM_*.md, llms.txt (by path, never pasted wholesale)
```

---

## Validation checklist

Before merging a new or updated skill:

```bash
npm run validate:agent-docs
```

Manual checks:

- [ ] Folder is kebab-case; file is `SKILL.md`
- [ ] `name` matches folder name
- [ ] Description includes trigger phrases and negative triggers
- [ ] Body has Instructions, Examples, Troubleshooting
- [ ] Registered in `AGENT_INDEX.md`
- [ ] Test: ask agent "When would you use [skill name]?" — description should match
- [ ] Test: unrelated task should NOT trigger skill

### Trigger testing prompts

**Should trigger `dt-design-system`:**

- "Scaffold a new Modal component"
- "Fix the Button Storybook story"

**Should NOT trigger:**

- "Add a /about page"
- "Fix chat API rate limiting"

---

## When to create a skill vs area AGENTS.md

| Use | When |
|-----|------|
| **Area AGENTS.md** | Stable conventions, file locations, JIT commands |
| **Skill** | Multi-step workflow, validation gates, trigger phrases |

One skill = one narrow workflow. Do not create a "super developer" skill.

---

## Maintenance

1. Bump `metadata.version` on behavior changes
2. Update area `AGENTS.md` if conventions change
3. Update skill if workflow steps change
4. Run `npm run validate:agent-docs`
5. Add skill to `scripts/validate-agent-docs.mjs` `dtSkills` array if new

---

## References

- [docs/AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md) — three-layer architecture
- [AGENT_INDEX.md](../AGENT_INDEX.md) — skill inventory
- [agentskills.io specification](https://agentskills.io)
