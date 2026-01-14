# Integrations

> APIs, databases, and external services for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## AI/LLM Services

### Vercel AI SDK (Primary)

**Package**: `ai` 5.0.115

| Feature | Implementation |
|---------|----------------|
| Streaming | `@ai-sdk/react` useChat hook |
| Models | OpenAI (gpt-4o-mini) |
| Gateway | AI Gateway support |
| Tools | Custom tool calling |
| Safety | Prompt injection guards |

**Environment Variables**:
```bash
OPENAI_API_KEY=           # Direct OpenAI
OPENAI_MODEL=             # Model selection
AI_GATEWAY_URL=           # Gateway base URL
AI_GATEWAY_API_KEY=       # Gateway auth
AI_GATEWAY_MODEL=         # Gateway model
```

---

## Database

### MongoDB (Primary)

**Package**: `mongodb` 7.0.0

| Setting | Value |
|---------|-------|
| Connection | TLS enforced |
| Pool Size | 10 max, 2 min |
| Timeouts | 5s selection, 45s socket |
| Sanitization | mongo-sanitize |

**Environment Variables**:
```bash
MONGODB_URI=              # Connection string (TLS)
MONGODB_DB=               # Database name
```

**Collections**:
- `contacts` - Contact form submissions
- `gdpr_requests` - Data deletion requests
- `chat_history` - AI chat logs

### PostgreSQL (Secondary)

**Package**: `pg` 8.16.3

Used for health checks and specific test scenarios.

```bash
TEST_HEALTH_DATABASE_URL= # Test connection
```

---

## Email Services

### Resend (Primary)

**Endpoint**: https://api.resend.com/emails

| Feature | Value |
|---------|-------|
| Attachments | Supported |
| Rate Limit | API-based |
| Templates | None (custom HTML) |

**Environment Variables**:
```bash
RESEND_API_KEY=           # API authentication
CONTACT_EMAIL_FROM=       # Sender address
CONTACT_EMAIL_TO=         # Recipient address
```

### EmailJS (Legacy)

**Package**: `@emailjs/browser` 4.4.1

Client-side email (being phased out).

```bash
NEXT_PUBLIC_EMAIL_SERVICE_ID=
NEXT_PUBLIC_EMAIL_TEMPLATE_ID=
NEXT_PUBLIC_EMAIL_PUBLIC_KEY=
```

---

## CMS

### Sanity

**Package**: `sanity` 4.22.0

| Setting | Value |
|---------|-------|
| Project ID | ai4cwr0g |
| Dataset | digitaltableteur-blog |
| Studio | `/studio` route |

**Packages**:
- `next-sanity` - Next.js integration
- `@sanity/client` - API client
- `@sanity/image-url` - Image CDN

**Environment Variables**:
```bash
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_TOKEN=             # Optional (OAuth fallback)
```

**Content Types**:
- Blog posts
- Portfolio projects
- Author profiles

---

## Error Tracking

### Sentry

**Package**: `@sentry/nextjs` 10.31.0

| Config File | Purpose |
|-------------|---------|
| `sentry.client.config.ts` | Browser SDK |
| `sentry.server.config.ts` | Server SDK |
| `sentry.edge.config.ts` | Edge SDK |

**Settings**:
- Traces: 10% sample rate
- Replays: 100% on error
- Environment-aware logging

**Environment Variables**:
```bash
SENTRY_DSN=
SENTRY_ENVIRONMENT=
```

---

## Analytics

### Google Analytics

**Environment Variable**:
```bash
NEXT_PUBLIC_GA_ID=        # GA4 measurement ID
```

### Vercel Analytics

Built-in with Vercel hosting.

---

## Hosting

### Vercel

| Feature | Status |
|---------|--------|
| Serverless | Enabled |
| Edge | Supported |
| Analytics | Enabled |
| ISR | Configured |

**Configuration**: `vercel.json`

- CORS headers
- Build command
- Output settings

---

## Project Management

### Linear

**Environment Variables**:
```bash
LINEAR_API_KEY=           # API auth (lin_api_xxx)
LINEAR_TEAM_ID=           # Team identifier
LINEAR_PROJECT_ID=        # Default project
```

**Usage**: Issue creation via `lib/linear/createIssue.ts`

---

## Design Tools

### Figma

**MCP Servers** (3 variants):
1. `figma` - OAuth remote
2. `figma-desktop` - Local HTTP
3. `figma-developer-mcp` - SSE (token-based)

```bash
FIGMA_TOKEN=              # API access
```

---

## Accounting

### Akaunting (Self-hosted)

**Deployment**: Docker Compose in `/akaunting`

| Setting | Value |
|---------|-------|
| URL | http://localhost:8080/api |
| Auth | Basic auth |
| Company | X-Company: 1 |

**Endpoints**:
- invoices, contacts, items
- transactions, reports
- categories, expenses

```bash
AKAUNTING_API_USERNAME=
AKAUNTING_API_PASSWORD=
```

---

## MCP Servers

Configured in `mcp.json`:

| Server | Purpose |
|--------|---------|
| figma (3 variants) | Design access |
| ts-language-server | TypeScript LSP |
| sentry | Error tracking |
| vercel | Deployments |
| context7 | Documentation |
| github | Repository ops |
| next-devtools | Next.js diagnostics |
| akaunting | Accounting API |
| sanity | CMS operations |
| docker | Container management |

---

## Authentication

### CV Download

Password-protected endpoint.

```bash
CV_PASSWORD=              # Access password
```

### API Keys

| Service | Variable |
|---------|----------|
| OpenAI | `OPENAI_API_KEY` |
| Sentry | `SENTRY_DSN` |
| Sanity | `SANITY_TOKEN` |
| Linear | `LINEAR_API_KEY` |
| Figma | `FIGMA_TOKEN` |
| GitHub | `GITHUB_MCP_PAT` |

---

## Security Practices

### Input Validation

- `mongo-sanitize` for MongoDB
- `isomorphic-dompurify` for HTML
- `libphonenumber-js` for phones
- Zod for form validation

### Rate Limiting

- `/api/chat`: 3 req/15min per IP
- `/api/contact`: 3 req/15min per IP
- `/api/gdpr/delete-data`: 3 req/hour per email

### CORS

**Production**: Strict whitelist
- digitaltableteur.com
- *.digitaltableteur.com

**Development**: Permissive (localhost)

---

## Environment Files

| File | Purpose |
|------|---------|
| `.env.local` | Local development (gitignored) |
| `.env.example` | Template with placeholders |
| Vercel Dashboard | Production secrets |
