# Architecture

**Analysis Date:** 2026-01-13

## Pattern Overview

**Overall:** Hybrid Monorepo with Mid-Migration from Vite → Next.js 15 App Router

**Key Characteristics:**
- Component-driven design system with 74+ shared components
- Full-stack Next.js with API routes and server components
- Multi-application structure (production Next.js + legacy Vite)
- i18n-first design (EN/FI/SV support throughout)

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Contains: Pages, components, patterns, client components with `"use client"`
- Location: `app/`, `nextjs-app/shared/components/`, `nextjs-app/shared/patterns/`
- Depends on: Shared components, providers, styles
- Used by: End users via browser

**API/Integration Layer:**
- Purpose: Server-side request handling and external service communication
- Contains: Route handlers, validation, security middleware
- Location: `app/api/*/route.ts`
- Depends on: Data layer, external APIs (OpenAI, Sanity, MongoDB)
- Used by: Presentation layer, external clients

**Business Logic Layer:**
- Purpose: Core domain logic and security
- Contains: Prompt guardrails, sanitization, metadata generation, AI tools
- Location: `app/lib/`, `app/api/donny-tools.ts`, `app/api/chat-shared.ts`
- Depends on: Data layer
- Used by: API layer

**Data Layer:**
- Purpose: Data persistence and content management
- Contains: MongoDB connection, PostgreSQL queries, Sanity CMS client
- Location: `app/lib/mongodb.ts`, `app/api/test-health/db.ts`, `sanity.config.ts`
- Depends on: External databases
- Used by: Business logic and API layers

**Infrastructure Layer:**
- Purpose: Cross-cutting concerns and app configuration
- Contains: Providers, styles, localization, scripts
- Location: `providers/`, `nextjs-app/shared/styles/`, `nextjs-app/shared/locales/`
- Depends on: External services (Sentry, GA)
- Used by: All layers

## Data Flow

**Blog Post Request:**

1. User requests `/blog/[slug]` → `app/blog/[slug]/page.tsx` (Server Component)
2. Fetch post from Sanity CMS (cached)
3. Generate dynamic metadata (SEO/OG tags)
4. Render with shared components (Header, Footer, ArticleLayout)
5. Return HTML with structured data (JSON-LD)

**AI Chat Request:**

1. Client sends message via `useChat` hook → POST `/api/chat`
2. Validate messages with Zod schema (`app/api/chat-shared.ts`)
3. Check for prompt injection (`app/lib/promptGuardrails.ts`)
4. Initialize AI Gateway and load tools (`app/api/donny-tools.ts`)
5. Stream response via `StreamText`
6. Monitor token usage, log to Sentry if threshold exceeded
7. Return UI stream to client

**Contact Form Submission:**

1. User submits form → POST `/api/contact`
2. Rate limit check (3 requests/15min per IP)
3. Validate with Zod schema
4. Sanitize inputs (`mongo-sanitize`)
5. Store in MongoDB
6. Send email via Resend API
7. Return JSON response

**State Management:**
- Server Components: Default (no client state)
- Client State: React hooks + `@ai-sdk/react` (useChat hook)
- Theme: `providers/ThemeProvider.tsx` (dark/light mode)
- Language: `providers/I18nProvider.tsx` (EN/FI/SV via i18next)

## Key Abstractions

**Component:**
- Purpose: Reusable UI element following folder structure pattern
- Examples: `nextjs-app/shared/components/Button/`, `Card/`, `Accordion/`
- Pattern: Folder with `.tsx`, `.module.css`, `.test.tsx`, `.stories.tsx`, `index.ts`

**Pattern:**
- Purpose: Composite layout element combining multiple components
- Examples: `nextjs-app/shared/patterns/Hero/`, `Footer/`, `Header/`, `PageLayout/`
- Pattern: Similar to components but larger in scope

**API Route:**
- Purpose: Server-side request handler
- Examples: `app/api/chat/route.ts`, `app/api/contact/route.ts`
- Pattern: Export GET/POST/OPTIONS functions, use Zod validation

**Service/Utility:**
- Purpose: Standalone business logic or helper functions
- Examples: `app/lib/promptGuardrails.ts`, `app/lib/sanitize.ts`, `app/lib/structuredData.ts`
- Pattern: Pure functions with single responsibility

## Entry Points

**Page Entry:**
- Location: `app/layout.tsx` (root layout with all providers)
- Triggers: User navigation, direct URL access
- Responsibilities: Initialize providers, metadata, analytics

**API Entry:**
- Location: `app/api/*/route.ts`
- Triggers: HTTP requests (POST/GET/OPTIONS)
- Responsibilities: Validate, process, respond

**Build Entry:**
- Location: `package.json` scripts, `scripts/`
- Triggers: npm commands, CI/CD
- Responsibilities: Build, test, deploy

## Error Handling

**Strategy:** Try/catch at route boundaries, security logging, user-friendly messages

**Patterns:**
- API routes catch errors, log via `SecurityLogger`, return JSON error
- Client components use error boundaries
- Validation errors returned with 400 status
- Server errors logged to Sentry, return 500 with generic message

## Cross-Cutting Concerns

**Logging:**
- `SecurityLogger` class in `app/lib/security-logger.ts`
- Logs: auth attempts, data access, rate limit violations
- Integration: Sentry for error tracking and alerts

**Validation:**
- Zod schemas at API boundary (`app/api/chat-shared.ts`)
- Input sanitization via `mongo-sanitize`, `isomorphic-dompurify`
- Phone validation via `libphonenumber-js`

**Authentication:**
- CV download: Password-protected with rate limiting (`app/api/download-cv/route.ts`)
- No user auth system (static site with API endpoints)

**Internationalization:**
- i18next with EN/FI/SV translations
- Translation files: `nextjs-app/shared/locales/{lang}/`
- All user-facing text through `t()` function

---

*Architecture analysis: 2026-01-13*
*Update when major patterns change*
