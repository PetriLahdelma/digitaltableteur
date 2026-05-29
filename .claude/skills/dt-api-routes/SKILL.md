---
name: dt-api-routes
description: >-
  Implements and debugs Digitaltableteur server endpoints under app/api/ including
  chat streaming, contact form, and GDPR deletion. Use when the user says "API route",
  "route.ts", "chat endpoint", "contact form API", "rate limit", "MongoDB",
  "streaming response", or "test:security". Do NOT use for legacy Vite serverless
  unless migrating (see api-legacy-vercel-functions). Do NOT use for page UI.
metadata:
  version: 1.1.0
  category: backend
---

# API routes workflow

## Instructions

### Step 1: Load context

Read [`references/area-guide.md`](references/area-guide.md) and [`app/api/AGENTS.md`](../../app/api/AGENTS.md).

Prefer `app/api/` over `api-legacy-vercel-functions/` for new endpoints.

### Step 2: Implement handler (strict order)

1. Validate HTTP method — return 405 if wrong
2. Parse and validate body — return 400 with clear message
3. Apply rate limiting on public POST routes
4. Sanitize inputs (`mongo-sanitize`, `isomorphic-dompurify`)
5. Execute business logic
6. Return JSON — never expose stack traces or secrets

### Step 3: Route-specific gates

**Chat** (`app/api/chat/route.ts`):

- Vercel AI SDK streaming + `ToolSet` types
- Prompt injection guards
- After changes: `npm run test:security`

**Contact / GDPR:**

- `MONGODB_URI` required
- Minimal PII in logs and responses

### Step 4: Verify

```bash
npm run typecheck
npm run test:security          # required after chat changes
npm run test -- app/api        # if route tests exist
```

Ask user before editing `.env.local` or production env vars.

---

## Examples

### Example 1: Contact form validation error

User says: "Contact API returns 500 on empty message"

Actions:

1. Read `app/api/contact/route.ts`
2. Add explicit 400 for missing fields before MongoDB call
3. Add/adjust test if present
4. Verify locally with curl POST

### Example 2: Chat tool typing error

User says: "ToolSet type error in chat route"

Actions:

1. Align imports with current Vercel AI SDK types
2. Run `npm run typecheck`
3. Run `npm run test:security`

---

## Troubleshooting

### Rate limit exceeded in dev

Cause: repeated test requests hitting limiter.

Solution: use distinct test IPs or temporarily adjust limiter config in dev only — never disable in production without review.

### MongoDB connection refused

Cause: `MONGODB_URI` missing locally.

Solution: ask user to set `.env.local`; do not commit credentials.

### test:security failures after chat change

Cause: prompt injection guard or tool schema regression.

Solution: read `tests/security/donny-security-tests.yaml` category output; fix guard before merging.

---

## Boundaries

- MUST NOT skip rate limiting on anonymous POST endpoints
- MUST NOT add new endpoints to `pages/api/`
- Ask before production migrations or database deletes
