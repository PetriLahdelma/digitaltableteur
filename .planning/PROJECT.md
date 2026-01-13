# Digitaltableteur Security Hardening

## What This Is

Security hardening initiative for the digitaltableteur portfolio site. This project addresses vulnerabilities in legacy API routes, consolidates duplicate implementations, and strengthens the overall security posture while maintaining Vercel serverless deployment.

## Core Value

**Eliminate vulnerabilities** — No timing attacks, brute force protection, and security correctness across all API endpoints. Users must trust their data is handled securely.

## Current State (v1.0 Shipped)

All security hardening work complete:
- Legacy vulnerable routes removed (10 files, 1218 lines)
- Timing-safe comparison implemented across all secret/token checks
- Rate limiting on all authentication endpoints
- Origin-validated CORS on all API routes
- 52 security tests for regression prevention

## Requirements

### Validated

- ✓ Rate limiting on production routes — v1.0
- ✓ Constant-time password comparison — v1.0
- ✓ SecurityLogger audit trails — existing
- ✓ Input sanitization — existing
- ✓ Zod validation at API boundaries — existing
- ✓ Sentry error tracking — existing
- ✓ Content Security Policy headers — existing
- ✓ Remove vulnerable legacy routes — v1.0
- ✓ Restrict CORS to known domains — v1.0
- ✓ Security tests for rate limiting and timing-safe operations — v1.0

### Active

None — all security requirements validated in v1.0

### Out of Scope

- Component refactoring (ChatWidget, ContactForm) — not security-related, separate initiative
- Distributed rate limiting (Redis/Vercel KV) — in-memory sufficient for current traffic
- User authentication system — password-based CV download is adequate for current needs
- OAuth/session management — not needed for static portfolio site

## Context

**Shipped v1.0 Security Hardening:**
- 5 phases, 5 plans, ~13 tasks completed
- 52 security tests added
- All timing attack vectors eliminated
- All authentication endpoints rate-limited
- All CORS configurations hardened

**Codebase:**
- Hybrid monorepo (Vite legacy + Next.js 15 production)
- Production routes in `app/api/` - fully secured
- Legacy routes in `nextjs-app/app/api/` - removed

## Constraints

- **Deployment**: Must remain on Vercel serverless — no custom infrastructure
- **API Contracts**: External clients may depend on existing endpoints — maintain backward compatibility
- **No Breaking Changes**: Existing functionality must continue working

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove legacy routes | Not deployed to production, eliminates vulnerabilities | ✓ Good |
| Restrict CORS to known domains | Wildcard CORS is unnecessary security risk | ✓ Good |
| Keep in-memory rate limiting | Traffic doesn't justify Redis complexity | ✓ Good |
| Centralized CORS via chat-shared.ts | Single source of truth | ✓ Good |
| Test functions directly | Faster, more focused security tests | ✓ Good |

---
*Last updated: 2026-01-13 after v1.0 milestone*
