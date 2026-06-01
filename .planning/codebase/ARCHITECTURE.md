# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Hybrid Monorepo with Next.js 16 Full-Stack Architecture

**Key Characteristics:**
- Server-first architecture (React Server Components by default)
- Component-driven design system with CSS Modules
- Serverless API routes with validation and rate limiting
- Multi-language support (EN/FI/SV) via i18next

## Layers

**Entry Points & Routing (App Router):**
- Purpose: Handle HTTP requests and render pages
- Contains: Server components, dynamic routes, metadata
- Location: `app/` directory
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/[route]/page.tsx`

**API Layer (Route Handlers):**
- Purpose: Handle backend operations
- Contains: POST/GET handlers with validation, rate limiting, security
- Location: `app/api/[feature]/route.ts`
- Key files: `app/api/chat/route.ts`, `app/api/contact/route.ts`, `app/api/gdpr/delete-data/route.ts`

**Shared Component System (Design System):**
- Purpose: Reusable UI components
- Contains: 80+ components with CSS Modules, tests, stories
- Location: `nextjs-app/shared/components/`
- Key files: `Button/`, `Card/`, `Title/`, `Text/`, `Modal/`

**Patterns (Layout Compositions):**
- Purpose: Complex layouts combining components
- Contains: Headers, footers, heroes, content sections
- Location: `nextjs-app/shared/patterns/`
- Key files: `SiteHeader/`, `SiteFooter/`, `Hero/`, `ContentSection/`

**Provider Layer (Global State):**
- Purpose: React context for global state
- Contains: Theme, i18n, animations, toast notifications
- Location: `providers/`
- Key files: `ThemeProvider.tsx`, `I18nProvider.tsx`, `ToastProvider.tsx`

**Data Layer (Storage):**
- Purpose: Persistent data storage
- Contains: MongoDB connection, Sanity CMS client
- Location: `app/lib/mongodb.ts`, `nextjs-app/sanity.config.ts`

**Utilities:**
- Purpose: Shared helpers and hooks
- Contains: Sanitization, validation, custom hooks
- Location: `app/lib/`, `nextjs-app/shared/hooks/`, `lib/`

## Data Flow

**Server-Side Rendering (SSR/ISR):**

1. Browser request to Next.js route
2. App Router matches `app/[route]/page.tsx`
3. Server Component renders (RSC)
4. Fetches data from Sanity/MongoDB if needed
5. Generates metadata and structured data
6. Returns HTML with ISR caching (revalidate: 3600)

**API Route Handler:**

1. Client sends POST/GET to `/api/[feature]/route.ts`
2. CORS headers validation (`createCorsHeaders`)
3. Rate limiting check (in-memory buckets)
4. Zod schema validation
5. Input sanitization (mongo-sanitize, DOMPurify)
6. Business logic execution
7. NextResponse.json() return

**Static Content (Blog/Portfolio):**

1. MDX files in `content/posts/`
2. Prebuild: `scripts/generate-blog-manifest.mjs`
3. Updates `nextjs-app/shared/data/blogManifest.ts`
4. `app/blog/page.tsx` reads manifest
5. Dynamic routes load MDX content

**State Management:**
- Server: Stateless API routes
- Client: React Context (Theme, i18n) + useState/useEffect
- Persistent: MongoDB for form submissions, Sanity for content

## Key Abstractions

**Page Template Pattern:**
- Purpose: Separate Next.js route from component composition
- Examples: `app/about/page.tsx` imports `AboutPageContent` from shared components
- Pattern: Route handles metadata, component handles rendering

**Component Structure:**
- Purpose: Consistent file organization
- Pattern: `ComponentName/ComponentName.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`
- Examples: `Button/`, `Card/`, `Modal/`

**API Route Pattern:**
- Purpose: Secure, validated endpoints
- Pattern: Rate limiting → CORS → Validation → Sanitization → Logic → Response
- Examples: `app/api/contact/route.ts`, `app/api/chat/route.ts`

**Provider Chain:**
- Purpose: Global state composition
- Pattern: Nested providers in `app/layout.tsx`
- Order: Theme → i18n → Animation → Toast → Layout

## Entry Points

**Web Application:**
- Location: `app/layout.tsx` (root layout)
- Triggers: HTTP requests to any route
- Responsibilities: Initialize providers, set metadata, wrap children

**API Routes:**
- Location: `app/api/[feature]/route.ts`
- Triggers: fetch() calls from client or external services
- Responsibilities: Validate, process, respond

**Storybook:**
- Location: `.storybook/main.ts`
- Triggers: `npm run storybook`
- Responsibilities: Component development environment

## Error Handling

**Strategy:** Throw at source, catch at boundaries, log to Sentry

**Patterns:**
- API routes: try/catch with generic error responses
- Components: Error boundaries for graceful degradation
- Validation: Zod schemas with detailed error messages
- Logging: Sentry integration for production errors

## Cross-Cutting Concerns

**Logging:**
- Sentry for error tracking (`@sentry/nextjs`)
- Console logging in development
- Security logger for audit events (`app/lib/security-logger.ts`)

**Validation:**
- Zod schemas at API boundaries
- mongo-sanitize for NoSQL injection prevention
- DOMPurify for XSS prevention
- Prompt injection guards for AI chat

**Authentication:**
- Password protection for CV download
- Rate limiting per IP address
- CORS origin validation

**Internationalization:**
- i18next + react-i18next
- Languages: EN, FI, SV
- Translation files: `nextjs-app/shared/locales/{lang}/translation.json`

---

*Architecture analysis: 2026-01-16*
*Update when major patterns change*
