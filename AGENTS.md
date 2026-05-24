# Digitaltableteur - AI Agent Quick Reference

## Project Snapshot

**Type**: Hybrid monorepo (Vite legacy + Next.js 15 production)  
**Stack**: React 18, TypeScript 5.8, Next.js 15.5.6, Vite 6.3, Storybook 10.0.8  
**Note**: Subdirectories have their own AGENTS.md files with detailed patterns

---

## Root Setup Commands

```bash
npm install                # Install dependencies
npm run dev                # Start Vite dev server (legacy)
npm run build              # Ensures blog manifest is generated pre-build
npm test                   # Run all tests
npm run typecheck          # TypeScript validation across project
npm run lint               # ESLint + Stylelint
npm run build              # Vite production build
npm run deploy             # Deploy to GitHub Pages
```

---

## Universal Conventions

### Code Style

- TypeScript strict mode (no `any` without justification)
- CSS Modules only (never inline styles except dynamic `backgroundImage`)
- Functional components with hooks (no classes)
- Prettier formatting (auto on save)
- ESLint + Stylelint enforcement

### Component Location

- Always create files under `nextjs-app/shared/components/<ComponentName>/` and export via `index.ts` for `@dt/<ComponentName>`.

### Commit Format

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Branch naming: `DT-XXX-feat-description` (see `docs/BRANCH_NAMING.md`)

### PR Requirements

- Passing tests + type checks + lint
- 1 approval required
- Squash commits on merge
- Delete branch after merge

---

## Security & Secrets

- **Never** commit tokens, API keys, or credentials
- Use `.env.local` for local secrets (in `.gitignore`)
- Production secrets in Vercel environment variables
- PII redacted in logs

---

## JIT Index (what to open, not what to paste)

### Package Structure

- **Next.js App**: `app/` → [see app/AGENTS.md](app/AGENTS.md)
  - Routes: `app/*/page.tsx`, API: `app/api/*/route.ts`
- **Vite App (Legacy)**: `src/` → Being phased out
  - Routes: `src/App.tsx`, Pages: `src/pages/**/*.tsx`
- **Shared Components**: `shared/components/` → [see shared/components/AGENTS.md](shared/components/AGENTS.md)
  - Design system, reusable components
- **Serverless Functions**: `api-legacy-vercel-functions/` → [see api-legacy-vercel-functions/AGENTS.md](api-legacy-vercel-functions/AGENTS.md)
  - Vercel functions with CORS middleware
- **Akaunting Integration**: `akaunting/` → [see akaunting/AGENTS.md](akaunting/AGENTS.md)
  - Self-hosted accounting with Docker + MCP tools
- **Documentation**: `docs/` → [see docs/AGENTS.md](docs/AGENTS.md)
  - Critical reference docs (component rules, migration plans, MCP setup)
- **Automation Scripts**: `scripts/` → [see scripts/AGENTS.md](scripts/AGENTS.md)
  - Linear, Sentry MCP, visual regression, deployment
- **Tool Libraries**: `lib/` → Reusable utilities
  - `akaunting-tools.mjs` - Accounting API wrapper

### Quick Find Commands

```bash
# Find a component
rg -n "export (function|const|default) .*" shared/components/

# Find component usage
rg -n "<ComponentName" app/ shared/ src/

# Find Next.js route
find app -name "page.tsx" -o -name "route.ts"

# Find API endpoint
rg -n "export async function (GET|POST)" app/api/ api-legacy-vercel-functions/

# Find hook usage
rg -n "use[A-Z]" shared/ src/

# Find translation keys
rg -n "t\(\"" shared/ app/ src/ | grep -v ".test.tsx"

# Find tests
find . -name "*.test.tsx" | grep ComponentName

# Check missing tests
./check_missing_tests.sh
```

---

## Definition of Done

Before creating a PR, ensure:

```bash
npm run typecheck && npm run lint && npm test && npm run build
# Note: build triggers blog manifest generation for article routing
```

## Sanity + Blog Manifest

- After publishing articles via `npm run sanity:publish` (or the `scripts/publish-from-sanity.sh`), the blog manifest is refreshed automatically.
- If needed, regenerate manually with `node scripts/generate-blog-manifest.mjs`.

All checks must pass + manual testing complete.

---

## Critical Documents

**Before creating components**, read:

- `docs/LLM_COMPONENT_GENERATION_RULES.md` (12,000+ words, authoritative)
- `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`

**For architecture**:

- `docs/NEXTJS_MIGRATION_PLAN.md` (Vite → Next.js migration strategy)
- `README.md` (project overview, features, deployment)

**For automation**:

- `docs/LINEAR_AUTOMATION.md` (issue management)
- `docs/GITHUB_MCP_SETUP.md` (GitHub MCP server)
- `docs/FIGMA_MCP_SETUP.md` (Figma MCP server)

---

**End of Root AGENTS.md** — For detailed patterns, see subdirectory AGENTS.md files linked above.

<!-- LLM-WIKI:START -->
## Cross-project LLM-wiki

This repo participates in the shared LLM-wiki at `/Users/petrilahdelma/SAPDevelop/llm-wiki`.

Read before non-trivial work:
- Search for this project and adjacent concepts with `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki/tools/qmd-query.sh "digitaltableteur <task or topic>"`.
- Open relevant pages under `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki` before deciding.

Write after durable discoveries:
- Capture decisions, reusable gotchas, cross-project patterns, source summaries, and project-state changes with `/Users/petrilahdelma/SAPDevelop/llm-wiki/wiki/tools/llm-wiki-capture.mjs --project "digitaltableteur" --kind decision --title "<title>" --summary "<what changed and why>"`.
- Do not capture secrets, raw logs, transient TODOs, or live coordination state.
- Do not edit compiled wiki pages from this repo. Capture first; the LLM-wiki ingest pass will file it into entities, concepts, patterns, or synthesis.
<!-- LLM-WIKI:END -->
