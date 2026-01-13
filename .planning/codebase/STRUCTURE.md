# Codebase Structure

**Analysis Date:** 2026-01-13

## Directory Layout

```
digitaltableteur/
├── app/                          # Next.js 15 App Router (PRODUCTION)
├── nextjs-app/                   # Next.js workspace + shared design system
│   ├── app/                      # Workspace app (symlinks to ../app)
│   └── shared/                   # Design system (components, patterns, utils)
├── providers/                    # App providers (I18n, Theme, Toast)
├── api-legacy-vercel-functions/  # DEPRECATED: Legacy Vercel functions
├── vite-app/                     # DEPRECATED: Legacy Vite app
├── src/                          # DEPRECATED: Legacy source files
├── digitaltableteur-blog/        # Sanity CMS workspace
├── content/                      # Static content (blog posts, authors)
├── scripts/                      # Automation & build scripts (48+)
├── docs/                         # Documentation (79+ files)
├── .storybook/                   # Storybook configuration
├── public/                       # Static assets
├── lib/                          # Root utilities (akaunting, pseo)
├── .planning/                    # Project planning documents
└── .claude/                      # Claude Code context files
```

## Directory Purposes

**app/**
- Purpose: Production Next.js 15 App Router application
- Contains: Routes, API endpoints, lib utilities
- Key files: `layout.tsx` (root), `page.tsx` (home), `api/*/route.ts`
- Subdirectories: `blog/`, `contact/`, `about/`, `work/`, `pseo/`, `api/`, `lib/`

**nextjs-app/shared/components/**
- Purpose: Design system component library (74+ components)
- Contains: Reusable UI components with CSS Modules
- Key files: Each component in `ComponentName/ComponentName.tsx`
- Subdirectories: `Button/`, `Card/`, `Accordion/`, `ContactForm/`, `pages/`

**nextjs-app/shared/patterns/**
- Purpose: Composite layout patterns
- Contains: `Hero/`, `Footer/`, `Header/`, `PageLayout/`, `GridBlock/`, `StoryBlock/`
- Key files: Pattern main files and related sub-components

**providers/**
- Purpose: React context providers for cross-cutting concerns
- Contains: `I18nProvider.tsx`, `ThemeProvider.tsx`, `ToastProvider.tsx`
- Key files: Each provider wraps application for global state

**app/api/**
- Purpose: Server-side API route handlers
- Contains: `chat/`, `contact/`, `download-cv/`, `gdpr/`, `save-contact/`, `test-health/`
- Key files: `route.ts` in each directory

**app/lib/**
- Purpose: API-specific utilities and services
- Contains: `mongodb.ts`, `promptGuardrails.ts`, `sanitize.ts`, `security-logger.ts`, `structuredData.ts`, `metadata.ts`
- Key files: Each utility module

**scripts/**
- Purpose: Automation, build, and deployment scripts
- Contains: `linear/`, `sanity-migration/`, `pseo/`, plus standalone scripts
- Key files: `generate-blog-manifest.mjs`, `run-visual-tests.mjs`, `generate-sitemap-next.mjs`

**docs/**
- Purpose: Development documentation and guidelines
- Contains: Architecture docs, API docs, LLM instructions, migration plans
- Key files: `LLM_COMPONENT_GENERATION_RULES.md`, `NEXTJS_MIGRATION_PLAN.md`, `LINEAR_AUTOMATION.md`

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root layout with providers, metadata, analytics
- `app/page.tsx` - Home page (imports from `@dt-pages/Home/HomePage`)
- `app/api/chat/route.ts` - AI chat endpoint

**Configuration:**
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript with path aliases
- `sanity.config.ts` - Sanity CMS configuration
- `vitest.config.mts` - Test runner configuration
- `.storybook/main.ts` - Storybook configuration

**Core Logic:**
- `app/api/chat/route.ts` - AI chat streaming endpoint
- `app/api/donny-tools.ts` - AI tool definitions
- `app/lib/promptGuardrails.ts` - Security checks for AI
- `app/lib/mongodb.ts` - Database connection

**Testing:**
- `nextjs-app/shared/components/*/ComponentName.test.tsx` - Component unit tests
- `app/__tests__/accessibility-pages.test.tsx` - Page accessibility tests
- `vitest.setup.ts` - Global test setup

**Documentation:**
- `CLAUDE.md` - Root development guidelines
- `docs/LLM_COMPONENT_GENERATION_RULES.md` - Component creation rules
- `docs/NEXTJS_MIGRATION_PLAN.md` - Migration documentation

## Naming Conventions

**Files:**
- `ComponentName.tsx` - React components (PascalCase)
- `ComponentName.module.css` - CSS Modules
- `ComponentName.test.tsx` - Test files
- `ComponentName.stories.tsx` - Storybook stories
- `utility-name.ts` - Utility modules (kebab-case)
- `page.tsx` / `layout.tsx` / `route.ts` - Next.js conventions

**Directories:**
- `ComponentName/` - Component folders (PascalCase)
- `feature-name/` - Feature directories (kebab-case)
- `[slug]/` - Dynamic routes (Next.js bracket syntax)

**Special Patterns:**
- `index.ts` - Barrel exports for component folders
- `ClientComponent.tsx` - Client components in server component pages
- `*.schema.json` - Figma design integration files

## Where to Add New Code

**New Component:**
- Primary: `nextjs-app/shared/components/ComponentName/`
- Files: `ComponentName.tsx`, `.module.css`, `.test.tsx`, `.stories.tsx`, `index.ts`
- Tests: Colocated in same folder

**New Page:**
- Primary: `app/route-name/page.tsx`
- Client parts: `app/route-name/ClientContent.tsx`
- Shared component: `nextjs-app/shared/components/pages/PageName/`

**New API Endpoint:**
- Primary: `app/api/endpoint-name/route.ts`
- Shared utilities: `app/lib/`
- Tests: Colocated or `app/__tests__/`

**New Pattern:**
- Primary: `nextjs-app/shared/patterns/PatternName/`
- Structure: Same as components

**New Script:**
- Primary: `scripts/script-name.mjs` or `scripts/category/script-name.ts`
- Types: Linear (`scripts/linear/`), Sanity (`scripts/sanity-migration/`)

**Utilities:**
- App-specific: `app/lib/`
- Shared helpers: `nextjs-app/shared/utils/`
- Root utilities: `lib/`

## Special Directories

**.planning/**
- Purpose: Project planning and codebase documentation
- Source: Generated by GSD workflows
- Committed: Yes

**__visual__/**
- Purpose: Visual regression test snapshots
- Source: Generated by Storybook test runner
- Committed: Yes (baselines)

**coverage/**
- Purpose: Test coverage reports
- Source: Generated by Vitest
- Committed: No (gitignored)

**dist/**
- Purpose: Vite build output (legacy)
- Source: `npm run build` in vite-app
- Committed: No (gitignored in production)

**storybook-static/**
- Purpose: Built Storybook documentation
- Source: `npm run build-storybook`
- Committed: No (deployed separately)

---

*Structure analysis: 2026-01-13*
*Update when directory structure changes*
