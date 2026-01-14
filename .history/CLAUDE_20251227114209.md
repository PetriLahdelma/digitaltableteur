# Digitaltableteur - Claude Code System Instructions

## Project Identity

**Type**: Hybrid monorepo with parallel Vite (legacy) + Next.js 15 App Router (production)  
**Stack**: React 18, TypeScript 5.8, Next.js 15.5.6, Vite 6.3, Storybook 10.0.8  
**Architecture**: Component-driven design system with CSS Modules, i18next (EN/FI/SV), Vercel serverless  
**Migration Status**: Mid-transition from Vite → Next.js (see `docs/NEXTJS_MIGRATION_PLAN.md`)

This CLAUDE.md is the **authoritative source** for development guidelines. Subdirectories contain specialized CLAUDE.md files that extend these rules.

---

## ⚠️ CRITICAL: Component Creation Rules

**BEFORE creating ANY new component, ALWAYS refer to:**

- **`docs/LLM_COMPONENT_GENERATION_RULES.md`** (12,000+ words, 10 sections)
- **`docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`**

These documents are the **constitution** for component development. They cover:

1. Core architecture & design system philosophy
2. CSS Modules & styling (logical properties, design tokens, theme support)
3. Component API design & props patterns
4. Internationalization (i18n) - 3-language support (EN/FI/SV)
5. React best practices & performance
6. Accessibility (a11y) requirements & testing
7. Testing strategy (Vitest, axe-core, >80% coverage)
8. Code quality & linting (ESLint, Stylelint, Prettier)
9. Storybook & documentation (WIP badge system, visual regression)
10. Final checklist & template

**Following these rules ensures consistency, accessibility, and production-readiness.**

---

## Universal Development Rules

### Code Quality (MUST)

- **MUST** write TypeScript in strict mode (no `any` without justification)
- **MUST** include tests for all new components (unit + accessibility)
- **MUST** run pre-commit validation: `npm run typecheck && npm test && npm run lint`
- **MUST NOT** commit secrets, API keys, or tokens (use `.env.local`)
- **MUST** use CSS Modules (never inline styles except dynamic `backgroundImage`)
- **MUST** ensure 100% translation coverage (EN/FI/SV)
- **MUST** update Storybook stories for component changes

### Best Practices (SHOULD)

- **SHOULD** use functional components with hooks (no class components)
- **SHOULD** prefer CSS logical properties (`margin-inline`, `padding-block`)
- **SHOULD** keep functions under 50 lines (extract complex logic)
- **SHOULD** use design tokens from `src/styles/variables.css`
- **SHOULD** lazy-load routes with `React.lazy()` (Vite) or `dynamic()` (Next.js)
- **SHOULD** update visual regression baselines when UI changes: `npm run test:visual -- --updateSnapshot`

### Anti-Patterns (MUST NOT)

- **MUST NOT** use `@ts-ignore` (fix types properly)
- **MUST NOT** bypass ESLint errors (fix or add justification comment)
- **MUST NOT** hardcode colors (use CSS custom properties)
- **MUST NOT** create standalone component files (always use folder structure: `ComponentName/ComponentName.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`)
- **MUST NOT** generate new color variables unless explicitly requested
- **MUST NOT** remove WIP badge from Storybook stories without a11y + visual + translation verification

---

## Core Commands

### Development

```bash
npm run dev                # Start Vite dev server (legacy)
npm run storybook          # Component development at http://localhost:6012
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:visual        # Visual regression (Playwright + Storybook)
npm run test:a11y          # Accessibility tests (axe-core)
npm run typecheck          # TypeScript validation
npm run lint               # ESLint + Stylelint
npm run lint:fix           # Auto-fix linting issues
```

### Build & Deployment

```bash
npm run build              # Vite production build
npm run deploy             # Deploy to GitHub Pages
npm run deploy-with-storybook  # Deploy + Storybook visual diffs
npm run cache-bust         # Manual cache busting for deployment
```

### Automation & MCP

```bash
npm run github:mcp:test    # Test GitHub MCP server connectivity
npm run figma:mcp:test     # Test Figma MCP server connectivity
npm run ts:mcp:status      # Validate TypeScript LSP availability
npm run context7:mcp       # Launch Context7 MCP server (respects CONTEXT7_API_KEY)
npx tsx scripts/linear/create-issue.ts  # Interactive Linear issue creation
npx tsx scripts/sentry-mcp.js issues    # Query Sentry issues via MCP
npm run generate-sentry-summary         # Generate Sentry summary JSON
```

### Quality Gates (run before PR)

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

## Project Structure

### Applications

- **`app/`** → Next.js 15 App Router (production) ([see app/CLAUDE.md](app/CLAUDE.md))
  - Routes: App Router with server components
  - Layouts: `layout.tsx`, `page.tsx`
  - API routes: `app/api/*/route.ts`
  - Metadata: `generateMetadata()` for SEO

- **`src/`** → Vite app (legacy, being phased out)
  - Routes: React Router 7 in `src/App.tsx`
  - Pages: `src/pages/**/*.tsx` (to be migrated)
  - Entry: `src/main.tsx`

### Shared Components

- **`shared/components/`** → Design system ([see shared/components/CLAUDE.md](shared/components/CLAUDE.md))
  - Structure: `ComponentName/ComponentName.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`
  - Patterns: Functional components, CSS Modules, design tokens
  - Testing: Vitest + Testing Library, axe-core
  - Storybook: WIP badge system, visual regression

### Infrastructure

- **`api-legacy-vercel-functions/`** → Serverless functions ([see api-legacy-vercel-functions/AGENTS.md](api-legacy-vercel-functions/AGENTS.md))
  - Pattern: `functionName.js` with `cors.js` middleware
  - Env vars: OpenAI, EmailJS, CV password
  - Security: CORS, rate limiting, input validation

- **`scripts/`** → Automation ([see scripts/AGENTS.md](scripts/AGENTS.md))
  - Linear: Issue creation/update, label management
  - Sentry: MCP queries, summary generation
  - Visual regression: Storybook test runner
  - Deployment: Cache busting, sitemap generation

- **`.storybook/`** → Component development
  - Config: `main.ts`, `preview.tsx`
  - Addons: Docs, a11y
  - Visual regression: `__visual__/snapshots/`, `__visual__/diffs/`

### Documentation

- **`docs/`** → Critical reference ([see docs/AGENTS.md](docs/AGENTS.md))
  - Component rules: `LLM_COMPONENT_GENERATION_RULES.md`
  - Planning: `LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`
  - Migration: `NEXTJS_MIGRATION_PLAN.md`
  - MCP: `GITHUB_MCP_SETUP.md`, `FIGMA_MCP_SETUP.md`
  - Linear: `LINEAR_AUTOMATION.md`, `LINEAR_LABELS.md`

### Testing

- Unit tests: Colocated with source (`ComponentName.test.tsx`)
- Integration: `src/__tests__/`
- E2E: Playwright via Storybook test runner
- Accessibility: `src/__tests__/accessibility-pages.test.tsx`

---

## Quick Find Commands

### Code Navigation

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
```

### Dependency Analysis

```bash
# Check package dependencies
npm why <package-name>

# Find unused dependencies
npx depcheck

# Analyze bundle size
npm run build && du -sh dist/assets/*.js
```

### Testing & Quality

```bash
# Run specific test
npm test -- ComponentName.test.tsx

# Check coverage
npm run test:coverage

# Find missing tests
./check_missing_tests.sh

# Run accessibility tests
npm run test:a11y
```

---

## Security & Secrets

### Secrets Management

- **NEVER** commit tokens, API keys, or credentials
- Use `.env.local` for local secrets (already in `.gitignore`)
- Use Vercel environment variables for production
- PII must be redacted in logs

### Required Environment Variables

**Development:**

- `VITE_GA_ID` → Google Analytics tracking
- `FIGMA_TOKEN` → Figma MCP server (design file access)
- `EMAILJS_*` → Contact form integration
- `GITHUB_MCP_PAT` → GitHub MCP server (repo access)
- `CONTEXT7_API_KEY` → Optional (higher rate limits for Context7 MCP)

**Production Only:**

- `CV_PASSWORD` → Secure resume download
- `OPENAI_API_KEY` → AI chat functionality
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` → Error tracking

### Safe Operations

- Review generated bash commands before execution
- Confirm before: `git push --force`, `rm -rf`, database drops
- Use staging environment for risky operations

---

## Git Workflow

- Branch from `main` for features: `DT-XXX-feat-description` (see `docs/BRANCH_NAMING.md`)
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- PRs require: passing tests, type checks, lint, and 1 approval
- Squash commits on merge
- Delete branches after merge

---

## Testing Strategy

### Unit Tests

- **All business logic** (aim for >80% coverage)
- Colocated with source (`ComponentName.test.tsx`)
- Framework: Vitest + Testing Library
- Run: `npm test`

### Integration Tests

- API endpoints and database operations
- Location: `src/__tests__/`
- Run: `npm test`

### E2E Tests

- Critical user paths
- Framework: Playwright via Storybook test runner
- Run: `npm run test:visual`

### Accessibility Tests

- All components and pages
- Framework: axe-core
- Location: `src/__tests__/accessibility-pages.test.tsx`
- Run: `npm run test:a11y`

### Visual Regression

- Storybook story screenshots
- Baseline: `__visual__/snapshots/`
- Diffs: `__visual__/diffs/__diff_output__`
- Report: `public/visual-diff/report.json`
- Update: `npm run test:visual -- --updateSnapshot`

---

## Available Tools

You have access to:

- Standard bash tools (`rg`, `git`, `node`, `npm`, etc.)
- GitHub CLI (`gh`) for issues, PRs, releases
- TypeScript LSP (`typescript-language-server`) via MCP
- Context7 MCP for web search and documentation
- GitHub MCP for repository operations
- Figma MCP for design file access

### Tool Permissions

- ✅ Read any file
- ✅ Write code files
- ✅ Run tests, linters, type checkers
- ✅ Create/update Linear issues
- ✅ Query Sentry errors
- ❌ Edit `.env` files (ask first)
- ❌ Force push (ask first)
- ❌ Delete databases (ask first)
- ❌ Run migrations in production (ask first)

---

## Specialized Context

When working in specific directories, refer to their CLAUDE.md:

- **Next.js development**: [app/CLAUDE.md](app/CLAUDE.md)
- **Component library**: [shared/components/CLAUDE.md](shared/components/CLAUDE.md)
- **Serverless functions**: [api-legacy-vercel-functions/AGENTS.md](api-legacy-vercel-functions/AGENTS.md)
- **Documentation**: [docs/AGENTS.md](docs/AGENTS.md)
- **Automation**: [scripts/AGENTS.md](scripts/AGENTS.md)

These files provide detailed, context-specific guidance that extends this root document.

---

## Maintenance Instructions

When you make changes affecting development practices:

1. Update this `CLAUDE.md`
2. Update subdirectory `CLAUDE.md` if specific to that area
3. Update `.github/copilot-instructions.md` for GitHub Copilot
4. Update `README.md` for public documentation
5. Run `npm test` to verify nothing breaks
6. Commit all changes together

**Keep documentation synchronized across files.**

---

**End of Root CLAUDE.md** — For detailed context, see subdirectory CLAUDE.md files linked above.
