# External Integrations

**Analysis Date:** 2026-01-16

## APIs & External Services

**AI & Language Models:**
- AI Gateway - `app/api/chat/route.ts`
  - SDK/Client: Vercel AI SDK (`ai` v5.0.115)
  - Auth: `AI_GATEWAY_URL`, `AI_GATEWAY_API_KEY` env vars
  - Features: Streaming responses, rate limiting, prompt injection guards
  - Max: 4000 tokens/request, 1500 tokens output

**Email:**
- Resend API - `app/api/contact/route.ts`
  - Endpoint: `https://api.resend.com/emails`
  - Auth: `RESEND_API_KEY` env var
  - Purpose: Contact form submissions

## Data Storage

**Databases:**
- MongoDB - `app/lib/mongodb.ts`
  - Connection: `MONGODB_URI` env var
  - Database: `MONGODB_DB` env var
  - Client: `mongodb` v7.0.0
  - Features: Connection pooling (10 max, 2 min), TLS, timeout handling
  - Collections: `contacts` (form submissions)

**Content Management:**
- Sanity CMS - `digitaltableteur-blog/`, `nextjs-app/sanity.config.ts`
  - Project ID: `ai4cwr0g`
  - Dataset: `digitaltableteur-blog`
  - Client: `@sanity/client` v7.13.2, `next-sanity` v11.6.12
  - Auth: `SANITY_TOKEN` env var
  - Purpose: Blog posts, portfolio content

**Caching:**
- None currently (all database queries direct)

## Authentication & Identity

**Auth Provider:**
- Custom password protection - `app/api/download-cv/route.ts`
  - Implementation: Constant-time password comparison
  - Token storage: In-memory rate limiting
  - Purpose: Secure CV download

**OAuth Integrations:**
- None currently

## Monitoring & Observability

**Error Tracking:**
- Sentry - `@sentry/nextjs` v10.31.0
  - DSN: `NEXT_PUBLIC_SENTRY_DSN` env var
  - Org: `digitaltableteur`
  - Project: `frontend`
  - Features: Error tracking, session replay, performance

**Analytics:**
- Google Analytics 4 - `app/layout.tsx`
  - Measurement ID: `G-09HMKEXGPX`
  - Tracking ID: `NEXT_PUBLIC_GA_ID` env var

- Ahrefs Analytics - `next.config.ts` CSP
  - Endpoint: `https://analytics.ahrefs.com`
  - Purpose: SEO insights

**Logs:**
- Vercel logs - stdout/stderr
- Sentry for production errors

## CI/CD & Deployment

**Hosting:**
- Vercel - `next.config.ts`, `package.json`
  - Deployment: Automatic on main branch push
  - Environment vars: Configured in Vercel dashboard
  - Serverless: Next.js API routes

**CI Pipeline:**
- GitHub Actions (implied by `.github/` directory)
  - Tests: `npm test`
  - Type checking: `npm run typecheck`
  - Linting: `npm run lint`

## Environment Configuration

**Development:**
- Required env vars:
  - `MONGODB_URI` - Database connection
  - `AI_GATEWAY_URL` - AI chat endpoint
  - `SANITY_TOKEN` - CMS access
  - `RESEND_API_KEY` - Email service
- Secrets location: `.env.local` (gitignored)
- Template: `.env.example`

**Production:**
- Secrets management: Vercel environment variables
- Database: MongoDB Atlas
- CMS: Sanity.io cloud

## Webhooks & Callbacks

**Incoming:**
- None currently

**Outgoing:**
- None currently

## MCP Server Integrations

Configured in `mcp.json`:

**Figma:**
- Remote: `https://mcp.figma.com/mcp` (OAuth)
- Desktop: `http://127.0.0.1:3845/mcp` (local)
- Auth: `FIGMA_TOKEN` env var
- Purpose: Design file access, component extraction

**GitHub:**
- Purpose: Repository operations, issues, PRs
- Auth: `GITHUB_MCP_PAT` env var

**TypeScript:**
- Purpose: Language server for LSP features

**Sentry:**
- Purpose: Error tracking, releases
- Auth: `SENTRY_AUTH_TOKEN` env var

**Context7:**
- Purpose: Documentation search
- Auth: `CONTEXT7_API_KEY` env var

**Sanity:**
- Purpose: CMS operations, GROQ queries

**Akaunting:**
- Purpose: Accounting API (self-hosted Docker)
- Location: `akaunting/docker-compose.yml`

## Project Management

**Linear API:**
- Endpoint: `https://api.linear.app/graphql`
- Client: `nextjs-app/lib/linear/createIssue.ts`
- Auth: `LINEAR_API_KEY` env var
- Team: `LINEAR_TEAM_ID` env var
- Purpose: Issue creation, component documentation

## Third-Party UI Libraries

**Radix UI:**
- `@radix-ui/react-accordion`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tabs`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-select`

**Icon Libraries:**
- `@phosphor-icons/react`
- `lucide-react`
- `react-icons`
- `simple-icons`

**Animation:**
- `framer-motion`
- `gsap` + `@gsap/react`
- `lenis` (smooth scroll)

## Security Configuration

**Content Security Policy:** `next.config.ts`
- Allowed: Google Analytics, Ahrefs, Vercel, OpenAI, Resend
- Media: YouTube, Vimeo embeds
- Dev: Permissive for HMR
- Prod: Strict blocking

**Security Headers:**
- HSTS (2 years, preload)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Permissions-Policy: Camera/mic/geo disabled

---

*Integration audit: 2026-01-16*
*Update when adding/removing external services*
