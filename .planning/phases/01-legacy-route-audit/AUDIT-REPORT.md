# Legacy Route Security Audit Report

## Executive Summary

The legacy API routes in `nextjs-app/app/api/` exhibit **critical security vulnerabilities** that expose the application to timing attacks, brute force attacks, and cross-origin exploits. The most severe issues are in the `/api/download-cv` endpoint which uses direct string comparison for password verification (timing attack vulnerable) and lacks rate limiting. In contrast, the production routes in `app/api/` implement comprehensive security controls including constant-time password comparison, rate limiting, and security logging.

## Route Inventory

| Route | Location | Methods | Purpose | Production Equivalent |
|-------|----------|---------|---------|----------------------|
| `/api/download-cv` | `nextjs-app/app/api/download-cv/route.ts` | POST, OPTIONS | Password-protected CV download | `app/api/download-cv/route.ts` |
| `/api/save-contact` | `nextjs-app/app/api/save-contact/route.ts` | POST, OPTIONS | Contact form submission to MongoDB | `app/api/contact/route.ts` |
| `/api/chat` | `nextjs-app/app/api/chat/route.ts` | POST, OPTIONS | AI chat via Gateway API | None (duplicate) |
| `/api/test-health/runs` | `nextjs-app/app/api/test-health/runs/route.ts` | POST, OPTIONS | Submit test run metrics | None |
| `/api/test-health/runs/latest` | `nextjs-app/app/api/test-health/runs/latest/route.ts` | GET, OPTIONS | Fetch latest test run | None |

## Vulnerability Assessment

### 1. `/api/download-cv` (nextjs-app)

**File**: `nextjs-app/app/api/download-cv/route.ts`

| Category | Status | Severity | Line | Details |
|----------|--------|----------|------|---------|
| **Timing Attack** | VULNERABLE | **CRITICAL** | 9 | Direct `!==` comparison: `password !== process.env.CV_PASSWORD` |
| **Rate Limiting** | ABSENT | **HIGH** | - | No rate limiting implementation |
| **CORS** | WILDCARD | **MEDIUM** | 33 | `Access-Control-Allow-Origin: "*"` |
| **Security Logging** | ABSENT | **MEDIUM** | - | No logging for auth attempts |
| **Input Validation** | BASIC | LOW | 7-8 | Only JSON parsing, no type validation |

**Timing Attack Details**:
```typescript
// Line 9 - VULNERABLE
if (password !== process.env.CV_PASSWORD) {
```
The `!==` operator performs character-by-character comparison that returns as soon as a mismatch is found. Attackers can measure response times to progressively guess the password character by character.

**Remediation Required**:
- Replace with `crypto.timingSafeEqual()` for constant-time comparison
- Add rate limiting (5 attempts per 15 min window)
- Implement SecurityLogger for audit trail
- Restrict CORS to specific domains

---

### 2. `/api/save-contact` (nextjs-app)

**File**: `nextjs-app/app/api/save-contact/route.ts`

| Category | Status | Severity | Line | Details |
|----------|--------|----------|------|---------|
| **Timing Attack** | N/A | - | - | No password/token comparison |
| **Rate Limiting** | ABSENT | **HIGH** | - | No spam protection, unlimited submissions |
| **CORS** | WILDCARD | **MEDIUM** | 57 | `Access-Control-Allow-Origin: "*"` |
| **Security Logging** | ABSENT | **LOW** | - | No logging for submissions |
| **Input Validation** | BASIC | LOW | 9-11 | Regex email validation, no Zod schema |
| **NoSQL Injection** | POTENTIAL | **MEDIUM** | 30-36 | Direct object insertion without mongo-sanitize |

**Comparison with Production** (`app/api/contact/route.ts`):
- Production uses Zod schema validation (lines 12-25)
- Production uses `mongo-sanitize` (line 2, 135-146)
- Production has rate limiting (3 submissions per 15 min, lines 6-10)

---

### 3. `/api/chat` (nextjs-app)

**File**: `nextjs-app/app/api/chat/route.ts`

| Category | Status | Severity | Line | Details |
|----------|--------|----------|------|---------|
| **Timing Attack** | N/A | - | - | No password/token comparison |
| **Rate Limiting** | ABSENT | **MEDIUM** | - | No rate limiting (relies on AI Gateway limits) |
| **CORS** | DYNAMIC | LOW | 63 | Uses `createCorsHeaders()` with allowed origins list |
| **Security Logging** | ABSENT | LOW | - | Error logging only |
| **Input Validation** | PRESENT | - | 68 | Uses `validateMessages()` |

**Note**: This route has better CORS handling than other legacy routes, using `chat-shared.ts` which implements an allowlist pattern (lines 4-14, 42-49).

---

### 4. `/api/test-health/runs` (nextjs-app)

**File**: `nextjs-app/app/api/test-health/runs/route.ts`

| Category | Status | Severity | Line | Details |
|----------|--------|----------|------|---------|
| **Timing Attack** | VULNERABLE | **CRITICAL** | 134 | Direct `!==` comparison: `providedToken !== HEALTH_TOKEN` |
| **Rate Limiting** | ABSENT | **MEDIUM** | - | No rate limiting on token endpoint |
| **CORS** | WILDCARD | **MEDIUM** | 122 | `Access-Control-Allow-Origin: "*"` |
| **Security Logging** | ABSENT | LOW | - | No security logging |
| **Input Validation** | PRESENT | - | 139-153 | JSON validation present |

**Timing Attack Details**:
```typescript
// Line 134 - VULNERABLE
if (!HEALTH_TOKEN || providedToken !== HEALTH_TOKEN) {
```
Same timing attack vulnerability as `/api/download-cv`.

---

### 5. `/api/test-health/runs/latest` (nextjs-app)

**File**: `nextjs-app/app/api/test-health/runs/latest/route.ts`

| Category | Status | Severity | Line | Details |
|----------|--------|----------|------|---------|
| **Timing Attack** | N/A | - | - | No authentication |
| **Rate Limiting** | ABSENT | LOW | - | Public endpoint, lower risk |
| **CORS** | WILDCARD | **MEDIUM** | 11, 34 | `Access-Control-Allow-Origin: "*"` |
| **Security Logging** | ABSENT | LOW | - | No logging |
| **Input Validation** | N/A | - | - | Read-only endpoint |
| **Data Exposure** | LOW | LOW | - | Only exposes test metrics, not sensitive data |

---

## Severity Classification

### Critical (Immediate Action Required)

| Issue | Routes Affected | Impact |
|-------|-----------------|--------|
| Timing attack on password comparison | `/api/download-cv` | Password can be guessed via timing analysis |
| Timing attack on token comparison | `/api/test-health/runs` | Auth token can be guessed via timing analysis |

### High

| Issue | Routes Affected | Impact |
|-------|-----------------|--------|
| Missing rate limiting on auth endpoint | `/api/download-cv` | Unlimited brute force attempts |
| Missing rate limiting on form submission | `/api/save-contact` | Spam amplification, database flooding |

### Medium

| Issue | Routes Affected | Impact |
|-------|-----------------|--------|
| Wildcard CORS | All 5 routes | Cross-origin requests from any domain |
| Missing input sanitization | `/api/save-contact` | Potential NoSQL injection |
| Missing security logging | All 5 routes | No audit trail for security events |

### Low

| Issue | Routes Affected | Impact |
|-------|-----------------|--------|
| Basic input validation | `/api/download-cv`, `/api/save-contact` | Edge cases not handled |
| Missing error logging | All routes | Debugging difficulty |

---

## Comparison with Production Routes

### `/api/download-cv` Comparison

| Security Feature | Legacy (`nextjs-app/`) | Production (`app/`) |
|-----------------|------------------------|---------------------|
| Password comparison | `!==` (line 9) | `timingSafeEqual()` (lines 22-29) |
| Rate limiting | None | 5 attempts / 15 min (lines 15-63) |
| Security logging | None | SecurityLogger (lines 100-120) |
| CORS | Wildcard `*` (line 33) | Wildcard `*` (line 150) |
| Input validation | JSON only | JSON only |
| IP extraction | None | `getClientIp()` (line 67) |

### `/api/save-contact` vs `/api/contact` Comparison

| Security Feature | Legacy (`nextjs-app/`) | Production (`app/`) |
|-----------------|------------------------|---------------------|
| Input validation | Regex (line 9) | Zod schema (lines 12-25) |
| Rate limiting | None | 3 / 15 min (lines 27-37) |
| NoSQL protection | None | `mongo-sanitize` (lines 135-146) |
| Security logging | None | IP/UA tracking (line 159) |
| CORS | Wildcard `*` (line 57) | Wildcard `*` (line 176) |

---

## Remediation Options

### Option A: Remove Legacy Routes (Recommended if Unused)

**Pros:**
- Eliminates all vulnerabilities immediately
- No maintenance burden
- Simplest solution

**Cons:**
- May break existing integrations if routes are in use
- Requires verification that routes are not deployed

**Implementation:**
```bash
rm -rf nextjs-app/app/api/
```

### Option B: Apply Security Hardening

**Pros:**
- Maintains compatibility with existing integrations
- Brings legacy routes to production security level

**Cons:**
- More development work
- Code duplication between `nextjs-app/` and `app/`
- Ongoing maintenance of two implementations

**Implementation:**
1. Add `crypto.timingSafeEqual()` to password/token comparisons
2. Implement rate limiting per production patterns
3. Add SecurityLogger integration
4. Integrate Zod validation
5. Add `mongo-sanitize` to database operations

### Option C: Redirect Legacy Routes to Production

**Pros:**
- Single source of truth for security
- Maintains backward compatibility for URL paths
- Lower maintenance burden than Option B

**Cons:**
- Requires Next.js route rewriting configuration
- May introduce latency from redirects
- Complex routing setup

**Implementation:**
Add to `next.config.ts`:
```typescript
async redirects() {
  return [
    { source: '/api/save-contact', destination: '/api/contact', permanent: true },
    // Note: /api/download-cv exists in both, may need consolidation
  ];
}
```

---

## Next Steps

1. **Determine if legacy routes are deployed** (Task 2)
2. Based on deployment status, select remediation option
3. Execute selected remediation in Phases 2-5 or update roadmap scope

---

*Generated: 2026-01-13*
*Phase: 01-legacy-route-audit*
*Plan: 01-01*
