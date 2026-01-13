# Digitaltableteur Security Hardening

## What This Is

Security hardening initiative for the digitaltableteur portfolio site. This project addresses vulnerabilities in legacy API routes, consolidates duplicate implementations, and strengthens the overall security posture while maintaining Vercel serverless deployment.

## Core Value

**Eliminate vulnerabilities** — No timing attacks, brute force protection, and security correctness across all API endpoints. Users must trust their data is handled securely.

## Requirements

### Validated

- ✓ Rate limiting on production routes — existing (`app/api/contact/`, `app/api/download-cv/`)
- ✓ Constant-time password comparison — existing (`app/api/download-cv/route.ts`)
- ✓ SecurityLogger audit trails — existing (`app/lib/security-logger.ts`)
- ✓ Input sanitization — existing (mongo-sanitize, isomorphic-dompurify)
- ✓ Zod validation at API boundaries — existing (`app/api/chat-shared.ts`)
- ✓ Sentry error tracking — existing (`@sentry/nextjs`)
- ✓ Content Security Policy headers — existing (`next.config.ts`)

### Active

- [ ] Remove or secure legacy `nextjs-app/app/api/` routes with timing attack vulnerabilities
- [ ] Add constant-time comparison to any remaining vulnerable password checks
- [ ] Add rate limiting to all authentication endpoints
- [ ] Restrict CORS from wildcard (*) to specific trusted domains
- [ ] Add SecurityLogger to routes missing audit trails
- [ ] Consolidate duplicate API implementations (single source of truth)
- [ ] Add security tests for rate limiting and timing-safe operations

### Out of Scope

- Component refactoring (ChatWidget, ContactForm) — not security-related, separate initiative
- Distributed rate limiting (Redis/Vercel KV) — in-memory sufficient for current traffic
- User authentication system — password-based CV download is adequate for current needs
- OAuth/session management — not needed for static portfolio site

## Context

**Current State (from codebase mapping):**
- Hybrid monorepo mid-migration from Vite → Next.js 15
- Production routes in `app/api/` have proper security
- Legacy routes in `nextjs-app/app/api/` lack security features
- Both `app/` and `nextjs-app/app/` contain parallel implementations with different security postures

**Specific Vulnerabilities Identified:**
1. `nextjs-app/app/api/download-cv/route.ts` — Direct string equality for password (timing attack)
2. `nextjs-app/app/api/download-cv/route.ts` — No rate limiting (brute force)
3. `nextjs-app/app/api/save-contact/route.ts` — No SecurityLogger
4. Multiple routes — CORS set to `*` allowing any origin

**Why This Matters:**
- Timing attacks can leak password information through response time analysis
- Missing rate limiting allows unlimited brute force attempts
- Wildcard CORS exposes APIs to cross-origin abuse
- Missing logging prevents security incident investigation

## Constraints

- **Deployment**: Must remain on Vercel serverless — no custom infrastructure
- **API Contracts**: External clients may depend on existing endpoints — maintain backward compatibility
- **No Breaking Changes**: Existing functionality must continue working

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove legacy routes | Production uses `app/api/`, legacy routes are unused but vulnerable | — Pending |
| Restrict CORS to known domains | Wildcard CORS is unnecessary security risk | — Pending |
| Keep in-memory rate limiting | Traffic doesn't justify Redis complexity | — Pending |

---
*Last updated: 2026-01-13 after initialization*
