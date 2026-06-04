# Digitaltableteur — AI agent router

> Lightweight index. Full map: [`AGENT_INDEX.md`](AGENT_INDEX.md). Detailed rules live in area `AGENTS.md` files and `.claude/skills/`.

## Snapshot

**Type:** Hybrid monorepo (Next.js 16 production + Vite legacy)  
**Stack:** React 19, TypeScript 6.x, Next.js 16.2, Storybook 10  
**Production app:** `app/` · **Design system:** `nextjs-app/shared/components/`

---

## JIT index — open the right file

| Area | AGENTS.md |
|------|-----------|
| Next.js pages & layouts | [`app/AGENTS.md`](app/AGENTS.md) |
| API routes | [`app/api/AGENTS.md`](app/api/AGENTS.md) |
| Components & Storybook | [`nextjs-app/shared/components/AGENTS.md`](nextjs-app/shared/components/AGENTS.md) |
| Layout patterns | [`nextjs-app/shared/patterns/AGENTS.md`](nextjs-app/shared/patterns/AGENTS.md) |
| Providers | [`providers/AGENTS.md`](providers/AGENTS.md) |
| Scripts | [`scripts/AGENTS.md`](scripts/AGENTS.md) |
| Docs | [`docs/AGENTS.md`](docs/AGENTS.md) |
| Legacy serverless | [`api-legacy-vercel-functions/AGENTS.md`](api-legacy-vercel-functions/AGENTS.md) |
| Sanity / blog | [`digitaltableteur-blog/AGENTS.md`](digitaltableteur-blog/AGENTS.md) |

**Skills:** [`.claude/skills/`](.claude/skills/) — load `dt-*` skills for workflows (see AGENT_INDEX).

**Components:** read [`docs/LLM_COMPONENT_GENERATION_RULES.md`](docs/LLM_COMPONENT_GENERATION_RULES.md) before creating UI.

---

## Commands

```bash
npm run dev                # Next.js (localhost:3000)
npm run storybook          # localhost:6010
npm run typecheck && npm run lint && npm test && npm run build
npm run validate:agent-docs
```

---

## Universal rules

- **CI / GitHub Actions quota is exhausted and not a viable gate.** Do not wait on, cite, or block merges on CI status. Verify locally (`typecheck`, `lint`, `test`, `build`, `agent:eval` as relevant) and merge with admin bypass when the user asks. Do not suggest “check CI” or assume PR checks will run.

- CSS Modules only; design tokens from `variables.css`
- Components: folder under `nextjs-app/shared/components/<Name>/`
- i18n: EN / FI / SV
- Never commit secrets
- Conventional Commits; branch prefix `DT-XXX-`

---

## Quick find

```bash
find app -name "page.tsx" -o -name "route.ts"
rg -n "export (function|const|default)" nextjs-app/shared/components/
rg -n "t\(\"" nextjs-app/ app/ | grep -v ".test.tsx"
```

---

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
