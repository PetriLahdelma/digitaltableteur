# Digitaltableteur — Claude Code router

> **Short root file.** Area-specific rules live in subdirectory `AGENTS.md` files and `.claude/skills/`. Start at [`AGENT_INDEX.md`](AGENT_INDEX.md).

## Project identity

| Attribute | Value |
|-----------|-------|
| **Type** | Hybrid monorepo (Next.js 16 production + Vite legacy) |
| **Stack** | React 19, TypeScript 6.x, Next.js 16.2, Storybook 10 |
| **Architecture** | Component-driven design system, CSS Modules, i18next (EN/FI/SV) |
| **Hosting** | Vercel serverless |

---

## Where to look (by task)

| Task | Open first |
|------|------------|
| Page, layout, metadata, OG | [`app/AGENTS.md`](app/AGENTS.md) + skill [`dt-nextjs-app`](.claude/skills/dt-nextjs-app/SKILL.md) |
| New UI component | [`nextjs-app/shared/components/AGENTS.md`](nextjs-app/shared/components/AGENTS.md) + skill [`dt-design-system`](.claude/skills/dt-design-system/SKILL.md) |
| API route | [`app/api/AGENTS.md`](app/api/AGENTS.md) + skill [`dt-api-routes`](.claude/skills/dt-api-routes/SKILL.md) |
| Script / CI / deploy | [`scripts/AGENTS.md`](scripts/AGENTS.md) + skill [`dt-scripts`](.claude/skills/dt-scripts/SKILL.md) |
| Bulk autonomous sweep (ultracode) | skill [`dt-workflow`](.claude/skills/dt-workflow/SKILL.md) + templates in `references/templates.md` |
| Blog / Sanity | [`digitaltableteur-blog/AGENTS.md`](digitaltableteur-blog/AGENTS.md) + skill [`dt-sanity-cms`](.claude/skills/dt-sanity-cms/SKILL.md) |
| Blog prose, drafts, articles | [`docs/WRITING_STYLE.md`](docs/WRITING_STYLE.md) (**this repo only**) |
| Docs navigation | [`docs/AGENTS.md`](docs/AGENTS.md) |

**Before creating any component**, read [`docs/LLM_COMPONENT_GENERATION_RULES.md`](docs/LLM_COMPONENT_GENERATION_RULES.md) (do not paste into context — open by section).

---

## Commands

```bash
npm run dev              # Next.js dev (localhost:3000)
npm run storybook        # Components (localhost:6010)
npm test                 # Vitest
npm run typecheck && npm run lint && npm test && npm run build   # Pre-PR
npm run build:tokens && npm run check:contract-props && npm run check:consumers   # Pre-PR add-on when contracts/components changed (farm CI parity; also enforced by pre-push)
npm run validate:agent-docs   # Agent doc integrity
npm run sanity:publish   # Publish blog → refreshes manifest
```

---

## Non-negotiables (repo-wide)

### MUST

- TypeScript strict; CSS Modules only (no inline styles except dynamic `backgroundImage`)
- Components under `nextjs-app/shared/components/<Name>/` with `.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`
- i18n: EN + FI + SV for user-facing copy
- Design tokens from `nextjs-app/shared/styles/variables.css`
- Reuse `Title`, `Text`, `Button`, `Card`, `Icon`, `Grid`, `FlexBox`

### MUST NOT

- `@ts-ignore`, hardcoded colors, standalone component files, committed secrets
- Remove Storybook WIP badge without a11y + visual + translation verification

### Ask first

- Edit `.env*` files, force push, delete databases, production migrations

---

## Gotchas (agents miss these)

**Next.js 16 async params**

```tsx
export default async function Page({ params }: Props) {
  const slug = (await params).slug;
}
```

**Hydration:** `suppressHydrationWarning` on `<html>` for theme/language.

**Framer Motion + Strict Mode:** wrap in `<AnimatePresence mode="wait">` with unique `key`.

**react-icons:** pinned **exact** at `5.5.0` (no caret in package.json). 5.6 drops Simple Icons (`react-icons/si`) used on Work pages; do not bump without re-verifying those imports.

**OG images:** use colocated `opengraph-image.tsx`; do not set `logo512.png` in page metadata.

**Paths:** `@/` → app root; `@dt/` → `nextjs-app/shared/components`.

---

## Git & PR

- Branches: `DT-XXX-feat-description`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`)
- PR: tests + typecheck + lint pass; squash merge

---

## Maintenance

When changing agent workflows: update the relevant area `AGENTS.md`, skill in `.claude/skills/`, and [`AGENT_INDEX.md`](AGENT_INDEX.md). Run `npm run validate:agent-docs`.

<!-- LLM-WIKI:START -->
## Cross-project LLM-wiki

This repo participates in the shared LLM-wiki at `/Users/petrilahdelma/SAPDevelop/llm-wiki`.

Read before non-trivial work:
- Start with a compact project memory packet: `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki/tools/llm-wiki-context.mjs --project "digitaltableteur" --query "<task or topic>"`.
- For broader retrieval, search adjacent concepts with `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki/tools/qmd-query.sh "digitaltableteur <task or topic>"`.
- Open relevant pages under `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki` before deciding.

Write after durable discoveries:
- Capture decisions, reusable gotchas, cross-project patterns, source summaries, and project-state changes with `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki/tools/llm-wiki-capture.mjs --project "digitaltableteur" --kind decision --title "<title>" --summary "<what changed and why>"`.
- Do not capture secrets, raw logs, transient TODOs, or live coordination state.
- Do not edit compiled wiki pages from this repo. Capture first; the LLM-wiki ingest pass will file it into entities, concepts, patterns, or synthesis.
<!-- LLM-WIKI:END -->
