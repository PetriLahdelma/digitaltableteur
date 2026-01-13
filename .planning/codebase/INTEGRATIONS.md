# External Integrations

**Analysis Date:** 2026-01-13

## APIs & External Services

**OpenAI / AI Gateway:**
- Purpose: LLM chat functionality ("Donny" AI assistant)
- SDK/Client: `@ai-sdk/openai` 2.0.64, `@ai-sdk/gateway` 2.0.7
- Auth: `OPENAI_API_KEY`, `AI_GATEWAY_API_KEY` env vars
- Implementation: `app/api/chat/route.ts` - Streaming chat endpoint
- Tools: `app/api/donny-tools.ts` - Custom AI tools
- Security: Prompt injection detection in `app/lib/promptGuardrails.ts`

**Sanity CMS:**
- Purpose: Blog content management
- SDK/Client: `sanity` 4.22.0, `@sanity/client` 7.13.2, `next-sanity` 11.6.12
- Auth: `SANITY_TOKEN` env var
- Project: ai4cwr0g, Dataset: digitaltableteur-blog
- Config: `sanity.config.ts`
- Studio: `app/studio/[[...tool]]/page.tsx` at `/studio`
- Migration scripts: `scripts/sanity-migration/`

**Resend Email:**
- Purpose: Contact form email delivery
- SDK/Client: REST API via fetch
- Auth: `RESEND_API_KEY` env var
- Implementation: `app/api/contact/route.ts`
- Config: `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM` env vars

**EmailJS (Legacy):**
- Purpose: Client-side email (Vite app fallback)
- SDK/Client: `@emailjs/browser` 4.4.1
- Auth: `VITE_EMAIL_PUBLIC_KEY` / `NEXT_PUBLIC_EMAIL_PUBLIC_KEY` env vars
- Config: Service ID, Template ID via env vars

## Data Storage

**MongoDB:**
- Purpose: Contact submissions, GDPR records
- SDK/Client: `mongodb` 7.0.0
- Auth: `MONGODB_URI`, `MONGODB_DB` env vars
- Implementation: `app/lib/mongodb.ts`
- Collections: `contacts` (form submissions)
- Features: Connection pooling (min 2, max 10), TLS, graceful shutdown

**PostgreSQL:**
- Purpose: Test health metrics persistence
- SDK/Client: `pg` 8.16.3
- Auth: `TEST_HEALTH_DATABASE_URL` env var
- Implementation: `app/api/test-health/db.ts`
- Tables: `test_health_runs`

**Caching:**
- None (stateless API routes, Sanity handles content caching)

## Authentication & Identity

**Auth Provider:**
- No user authentication system (static site with API endpoints)
- CV download uses password protection (`CV_PASSWORD` env var)

**OAuth Integrations:**
- None

## Monitoring & Observability

**Error Tracking:**
- Sentry - Server and client errors
- DSN: `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` env vars
- Config: `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`
- Features: 10% trace sample rate, 10% profiles sample rate

**Analytics:**
- Google Analytics (GA4) - `NEXT_PUBLIC_GA_ID` env var
- Google Tag Manager - GTM-NJ654G92
- Ahrefs Analytics - SEO tracking (`analytics.ahrefs.com`)

**Logs:**
- Vercel logs - stdout/stderr
- `SecurityLogger` class in `app/lib/security-logger.ts`
- Logs: auth attempts, data access, rate limit violations

## CI/CD & Deployment

**Hosting:**
- Vercel - Next.js optimized deployment
- Deployment: Automatic on main branch push
- Environment vars: Configured in Vercel dashboard

**CI Pipeline:**
- GitHub Actions - Tests and type checking
- Workflows: `.github/workflows/`
- Checks: TypeScript, ESLint, tests before deploy

**GitHub Pages (Legacy):**
- Vite app deployment via `gh-pages`
- Script: `npm run deploy`

## Environment Configuration

**Development:**
- Required: `MONGODB_URI`, `MONGODB_DB`, `SANITY_PROJECT_ID`
- Optional: `OPENAI_API_KEY` (chat feature), `SENTRY_DSN` (error tracking)
- Secrets: `.env.local` (gitignored)
- Mock services: Local MongoDB, Sanity development dataset

**Staging:**
- Not explicitly configured (use Vercel preview deployments)

**Production:**
- Secrets: Vercel environment variables
- Databases: MongoDB Atlas, Neon PostgreSQL
- Monitoring: Sentry production DSN

## Webhooks & Callbacks

**Incoming:**
- None actively configured

**Outgoing:**
- None actively configured

## Third-Party Tools

**Linear (Issue Tracking):**
- Purpose: Project management, issue tracking
- Auth: `LINEAR_API_KEY`, `LINEAR_TEAM_ID`, `LINEAR_PROJECT_ID` env vars
- Scripts: `scripts/linear/` (create, update, search issues)

**Figma (Design):**
- Purpose: Design file access for component specs
- MCP Server: `figma-developer-mcp` 0.6.4
- Auth: `FIGMA_TOKEN` env var
- Scripts: `scripts/test-figma-mcp.mjs`, `scripts/fetch-figma.js`

**Context7 (Search):**
- Purpose: Web search and documentation queries
- MCP Server: `@upstash/context7-mcp` 1.0.26
- Auth: `CONTEXT7_API_KEY` env var (optional, higher rate limits)

**Akaunting (Accounting):**
- Purpose: Self-hosted accounting/invoicing
- Deployment: Docker (`akaunting/docker-compose.yml`)
- Tools: `lib/akaunting-tools.mjs`
- Scripts: `npm run akaunting:*` commands

## Security Patterns

**Rate Limiting:**
- Contact form: 3 submissions per 15 minutes per IP
- CV download: 5 auth attempts per 15 minutes per IP
- Implementation: In-memory Maps in route handlers

**Input Validation:**
- Zod schemas for API validation (`app/api/chat-shared.ts`)
- `mongo-sanitize` for NoSQL injection prevention
- `isomorphic-dompurify` for HTML sanitization
- `libphonenumber-js` for phone validation

**CORS:**
- Configured per-route in OPTIONS handlers
- Origin allowlist in `app/api/chat-shared.ts`

**Content Security Policy:**
- Production headers in `next.config.ts`
- Script whitelisting for Google, Vercel, analytics

---

*Integration audit: 2026-01-13*
*Update when adding/removing external services*
