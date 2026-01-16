# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
digitaltableteur/
├── app/                    # Next.js 15 App Router (production)
├── nextjs-app/             # Shared design system & components
│   ├── shared/
│   │   ├── components/     # 80+ UI components
│   │   ├── patterns/       # Layout patterns
│   │   ├── hooks/          # Custom React hooks
│   │   ├── data/           # Static data
│   │   ├── locales/        # i18n translations
│   │   └── styles/         # Design tokens
│   └── digitaltableteur-blog/  # Sanity CMS studio
├── providers/              # React context providers
├── lib/                    # Root-level utilities
├── content/                # MDX blog posts
├── public/                 # Static assets
├── scripts/                # Build & automation (40+ files)
├── docs/                   # Documentation (70+ files)
├── .storybook/             # Storybook configuration
├── .claude/                # Claude Code configuration
├── .planning/              # GSD project planning
├── akaunting/              # Self-hosted accounting (Docker)
└── e2e/                    # Playwright E2E tests
```

## Directory Purposes

**app/**
- Purpose: Next.js 15 App Router pages and API routes
- Contains: Server components, route handlers, layouts
- Key files: `layout.tsx`, `page.tsx`, `api/*/route.ts`
- Subdirectories: `about/`, `blog/`, `contact/`, `work/`, `pseo/`, `api/`, `lib/`

**nextjs-app/shared/components/**
- Purpose: Shared UI component library (design system)
- Contains: 80+ components with CSS Modules
- Structure: `ComponentName/ComponentName.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`
- Key files: `Button/`, `Card/`, `Title/`, `Text/`, `Modal/`, `Icon/`

**nextjs-app/shared/patterns/**
- Purpose: Complex layout compositions
- Contains: Headers, footers, heroes, sections
- Key files: `SiteHeader/`, `SiteFooter/`, `Hero/`, `ContentSection/`, `ProjectDetailLayout/`

**nextjs-app/shared/hooks/**
- Purpose: Custom React hooks
- Contains: State management, DOM interactions
- Key files: `useBlogFilter.ts`, `usePersistentTheme.ts`, `useNavigation.ts`, `useTableOfContents.ts`

**nextjs-app/shared/data/**
- Purpose: Static data structures
- Contains: Projects, authors, translations, testimonials
- Key files: `projects.ts`, `blogManifest.ts`, `authors.ts`, `testimonials.ts`

**nextjs-app/shared/locales/**
- Purpose: Internationalization translations
- Contains: JSON translation files for EN/FI/SV
- Key files: `en/translation.json`, `fi/translation.json`, `sv/translation.json`

**nextjs-app/shared/styles/**
- Purpose: Design tokens and CSS variables
- Contains: CSS custom properties for spacing, colors, typography
- Key files: `variables.css`

**providers/**
- Purpose: React context providers for global state
- Contains: Theme, i18n, animations, toast
- Key files: `ThemeProvider.tsx`, `I18nProvider.tsx`, `ToastProvider.tsx`, `AnimationProvider.tsx`

**app/api/**
- Purpose: Next.js API route handlers
- Contains: POST/GET handlers with validation
- Key files: `chat/route.ts`, `contact/route.ts`, `gdpr/delete-data/route.ts`, `download-cv/route.ts`

**app/lib/**
- Purpose: Server-side utilities
- Contains: Database connection, sanitization, security
- Key files: `mongodb.ts`, `sanitize.ts`, `promptGuardrails.ts`, `security-logger.ts`

**scripts/**
- Purpose: Build automation and utilities
- Contains: 40+ Node.js scripts
- Key files: `generate-blog-manifest.mjs`, `validate-translations.mjs`, `run-visual-tests.mjs`

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root layout with providers
- `app/page.tsx` - Home page
- `.storybook/main.ts` - Storybook entry

**Configuration:**
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `vitest.config.mts` - Test configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `mcp.json` - MCP server configuration

**Core Logic:**
- `app/api/chat/route.ts` - AI chat endpoint
- `app/api/contact/route.ts` - Contact form
- `app/lib/mongodb.ts` - Database connection

**Testing:**
- `vitest.setup.ts` - Test environment setup
- `__visual__/snapshots/` - Visual regression baselines
- `e2e/` - Playwright E2E tests

**Documentation:**
- `docs/LLM_COMPONENT_GENERATION_RULES.md` - Component creation guide
- `docs/NEXTJS_MIGRATION_PLAN.md` - Migration status
- `CLAUDE.md` - Development instructions

## Naming Conventions

**Files:**
- PascalCase for components: `Button.tsx`, `Card.tsx`
- kebab-case for routes: `download-cv/route.ts`
- camelCase for utilities: `sanitize.ts`, `mongodb.ts`
- `.module.css` for CSS Modules
- `.test.tsx` for unit tests
- `.stories.tsx` for Storybook

**Directories:**
- PascalCase for component folders: `Button/`, `Card/`
- kebab-case for routes: `download-cv/`, `delete-data/`
- lowercase for utilities: `lib/`, `hooks/`, `locales/`

**Special Patterns:**
- `index.ts` for barrel exports
- `route.ts` for API handlers
- `page.tsx` for Next.js pages
- `layout.tsx` for Next.js layouts

## Where to Add New Code

**New Page:**
- Location: `app/[route]/page.tsx`
- Import component from: `nextjs-app/shared/components/pages/`

**New Component:**
- Location: `nextjs-app/shared/components/[ComponentName]/`
- Required files: `.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`

**New API Endpoint:**
- Location: `app/api/[feature]/route.ts`
- Pattern: Rate limiting → validation → sanitization → logic

**New Translation:**
- Location: `nextjs-app/shared/locales/{en,fi,sv}/translation.json`
- Requirement: Add to ALL three languages

**New Hook:**
- Location: `nextjs-app/shared/hooks/[hookName].ts`

**New Utility:**
- Location: `app/lib/` (server) or `lib/` (shared)

## Special Directories

**.planning/**
- Purpose: GSD project planning documents
- Contains: PROJECT.md, config.json, phase plans
- Committed: Yes

**.storybook/**
- Purpose: Storybook configuration
- Contains: main.ts, preview.tsx, addon configs
- Committed: Yes

**__visual__/**
- Purpose: Visual regression test snapshots
- Contains: Baseline images for comparison
- Committed: Yes

**node_modules/**
- Purpose: npm dependencies
- Committed: No (gitignored)

---

*Structure analysis: 2026-01-16*
*Update when directory structure changes*
