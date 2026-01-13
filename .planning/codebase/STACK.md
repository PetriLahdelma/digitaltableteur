# Technology Stack

**Analysis Date:** 2026-01-13

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`, `tsconfig.json`)
- JavaScript ES2017+ - Build scripts, Node.js runtime

**Secondary:**
- CSS Modules - Component styling (`*.module.css`)
- Markdown/MDX - Blog content (`digitaltableteur-blog/`, via `@next/mdx`)
- Shell - Deployment and utility scripts (`scripts/`)

## Runtime

**Environment:**
- Node.js 20.19.0 (≥20.19.0 <21) - `.nvmrc`, `package.json` engines
- Edge Runtime - Vercel serverless, Next.js server components
- Browser - React 19 client runtime

**Package Manager:**
- npm with workspaces
- Workspaces: root (`.`) and `nextjs-app`
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.5.9 - Primary web framework (`next.config.ts`)
- React 19.2.3 - UI framework
- Vite 6.4.1 - Legacy app build (`vite-app/vite.config.ts`)

**Testing:**
- Vitest 4.0.16 - Unit testing with `@vitest/coverage-v8`
- Testing Library - React component testing (`@testing-library/react`, `@testing-library/jest-dom`)
- Playwright 1.57.0 - E2E via Storybook test runner
- jest-axe 10.0.0 - Accessibility testing

**Build/Dev:**
- TypeScript - `tsc` for type checking
- ESLint 9.39.2 - Code linting
- Stylelint 16.26.1 - CSS linting
- Prettier - Code formatting
- Storybook 10.1.10 - Component development (port 6010)

## Key Dependencies

**Critical:**
- `ai` 5.0.115 + `@ai-sdk/react` 2.0.117 - Vercel AI SDK for chat functionality
- `@ai-sdk/openai` 2.0.64 + `@ai-sdk/gateway` 2.0.7 - OpenAI/multi-model integration
- `sanity` 4.22.0 + `next-sanity` 11.6.12 - CMS integration
- `mongodb` 7.0.0 - NoSQL database client (`app/lib/mongodb.ts`)
- `pg` 8.16.3 - PostgreSQL database (`app/api/test-health/db.ts`)

**Infrastructure:**
- `i18next` 25.7.3 + `react-i18next` 15.7.4 - Internationalization (EN/FI/SV)
- `@sentry/nextjs` 10.31.0 - Error tracking and monitoring
- `zod` - Schema validation
- `mongo-sanitize` 1.1.0 - NoSQL injection prevention
- `isomorphic-dompurify` 2.35.0 - HTML sanitization

**UI:**
- `@phosphor-icons/react` 2.1.10 - Icon library
- `framer-motion` 12.23.26 - Animations
- `styled-components` 6.1.19 - CSS-in-JS (legacy)
- `leaflet` 1.9.4 + `react-leaflet` 5.0.0 - Maps
- `chart.js` 4.5.1 + `react-chartjs-2` 5.3.1 - Charts

## Configuration

**Environment:**
- `.env.local` - Local development secrets (gitignored)
- `.env.example` - Template for required variables
- Key vars: `MONGODB_URI`, `OPENAI_API_KEY`, `SANITY_PROJECT_ID`, `SENTRY_DSN`

**Build:**
- `next.config.ts` - Next.js configuration with MDX, security headers
- `tsconfig.json` - TypeScript with path aliases (`@/*`, `@dt/*`, `@dt-pages/*`)
- `sanity.config.ts` - Sanity CMS (Project: ai4cwr0g)
- `vitest.config.mts` - Test runner configuration
- `.storybook/main.ts` - Storybook configuration

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js 20+)
- Optional: Docker for Akaunting accounting system

**Production:**
- Vercel - Next.js optimized deployment
- MongoDB Atlas - Database
- Sanity.io - CMS hosting
- Sentry.io - Error tracking

---

*Stack analysis: 2026-01-13*
*Update after major dependency changes*
