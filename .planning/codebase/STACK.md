# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (strict mode enabled)

**Secondary:**
- JavaScript - Build scripts, config files (`scripts/`, `next.config.ts`)
- CSS - Styling via CSS Modules and design tokens

## Runtime

**Environment:**
- Node.js 20.19.0 - `.nvmrc`
- React 19.2.3 - Browser runtime
- Next.js 15.5.9 App Router - Server components and API routes

**Package Manager:**
- npm - `package.json` (monorepo root)
- Lockfile: `package-lock.json` present

**Workspaces:**
- Main app: `/package.json`
- NextJS shared: `nextjs-app/` (components, blog CMS)
- Sanity CMS: `digitaltableteur-blog/` (Sanity studio)
- Akaunting: `akaunting/` (Docker-based accounting)

## Frameworks

**Core:**
- Next.js 15.5.9 - Web framework with App Router (`app/`, `next.config.ts`)
- React 19.2.3 - UI framework with React Server Components

**Testing:**
- Vitest 4.0.16 - Unit & component testing (`vitest.config.mts`)
- Playwright 1.57.0 - Visual regression & E2E (`@vitest/browser-playwright`)
- React Testing Library 16.3.1 - Component testing
- jest-axe 10.0.0 - Accessibility testing

**Build/Dev:**
- Storybook 10.1.10 - Component development (`.storybook/main.ts`)
- PostCSS 8.5.6 - CSS processing
- Tailwind CSS 4.1.18 - Utility CSS (`tailwind.config.ts`)

## Key Dependencies

**Critical:**
- ai 5.0.115 - Vercel AI SDK for LLM integration (`app/api/chat/route.ts`)
- mongodb 7.0.0 - Database client (`app/lib/mongodb.ts`)
- sanity 5.3.1 - CMS client (`digitaltableteur-blog/`, `@sanity/client@7.13.2`)
- i18next 25.7.3 - Internationalization (EN/FI/SV)
- framer-motion 12.23.26 - Animation library

**Infrastructure:**
- @sentry/nextjs 10.31.0 - Error tracking
- next-sanity 11.6.12 - Sanity integration for Next.js
- zod - Schema validation (API routes)
- mongo-sanitize 1.1.0 - NoSQL injection prevention
- isomorphic-dompurify 2.35.0 - XSS prevention

**UI Components:**
- Radix UI - Headless components (6 packages: accordion, dialog, dropdown, tabs, checkbox, select)
- @phosphor-icons/react 2.1.10 - Icon library
- lucide-react 0.562.0 - Icon library

## Configuration

**Environment:**
- `.env.local` - Local secrets (gitignored)
- `.env.example` - Template for required variables
- Required: `MONGODB_URI`, `AI_GATEWAY_URL`, `SANITY_TOKEN`, `RESEND_API_KEY`

**Build:**
- `tsconfig.json` - TypeScript compiler options (strict mode)
- `next.config.ts` - Next.js configuration (image optimization, security headers)
- `vitest.config.mts` - Test runner configuration
- `.storybook/main.ts` - Storybook configuration
- `mcp.json` - Model Context Protocol servers

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js 20+)
- No Docker required for development

**Production:**
- Vercel serverless deployment
- MongoDB Atlas (or compatible) for database
- Sanity.io for CMS
- Sentry for error monitoring

---

*Stack analysis: 2026-01-16*
*Update after major dependency changes*
