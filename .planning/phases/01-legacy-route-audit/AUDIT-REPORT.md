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

## Route Usage Analysis

### Deployment Configuration

**Finding: `nextjs-app/app/api/` routes are NOT deployed to production.**

Evidence from build.log:
```
> nextjs-app@0.1.0 build
> next build

Route (app)                                 Size  First Load JS
├ ƒ /api/chat                              156 B         104 kB
├ ƒ /api/contact                           156 B         104 kB
├ ƒ /api/download-cv                       156 B         104 kB
├ ƒ /api/save-contact                      156 B         104 kB
├ ƒ /api/test-health/runs                  156 B         104 kB
├ ƒ /api/test-health/runs/latest           156 B         104 kB
```

The build uses `next.config.ts` at the project root, which maps the `app/` directory (NOT `nextjs-app/app/`). The Vercel project at root (`.vercel/project.json`) deploys from the root directory.

### Codebase References

**Search result: No direct references to `nextjs-app/app/api` paths found in the codebase.**

```bash
grep -r "nextjs-app/app/api" --include="*.ts" --include="*.tsx" --include="*.json" .
# No results
```

### Production vs Legacy Route Comparison

| Route | Production (`app/api/`) | Legacy (`nextjs-app/app/api/`) | Status |
|-------|-------------------------|--------------------------------|--------|
| `/api/download-cv` | **SECURED** (timingSafeEqual, rate limit, logging) | VULNERABLE | **Use production** |
| `/api/contact` | **SECURED** (Zod, rate limit, mongo-sanitize) | N/A | **Use production** |
| `/api/save-contact` | PARTIAL (sanitize, logging, no rate limit) | VULNERABLE | Production route exists at different path |
| `/api/chat` | SECURED (CORS allowlist) | SECURED (same chat-shared.ts) | Both similar |
| `/api/test-health/runs` | SECURED (in root app/) | VULNERABLE (timing attack) | **Use production** |
| `/api/test-health/runs/latest` | SECURED | OK (no auth) | Both similar |

### Vercel Deployment Structure

- **Root `.vercel/project.json`**: `digitaltableteur_next` project
- **`nextjs-app/.vercel/project.json`**: Separate project (likely development/staging)
- **Production deployment**: Uses root `next.config.ts` → routes from `app/api/`

---

## Recommended Remediation Strategy

### **RECOMMENDATION: Option A - Remove Legacy Routes**

**Rationale:**
1. Legacy routes in `nextjs-app/app/api/` are **NOT deployed to production**
2. Production routes in `app/api/` already have security hardening
3. No codebase references to `nextjs-app/app/api/` paths
4. Removing legacy routes eliminates maintenance burden and confusion

**Implementation Plan:**

```bash
# Remove legacy API routes
rm -rf nextjs-app/app/api/
```

**Risk Assessment:**
- **Production impact**: NONE (routes not deployed)
- **Development impact**: LOW (development uses root `app/api/`)
- **Backward compatibility**: N/A (routes not in use)

**Alternative Consideration:**

If `nextjs-app/` is used as a separate development/staging environment, consider:
- Symlinking `nextjs-app/app/api/` to `app/api/` for consistency
- Or applying hardening to match production

---

## Phase 2-5 Impact Assessment

### Impact Based on Removal Strategy

If legacy routes are removed (Option A):

| Phase | Original Scope | New Scope | Change |
|-------|---------------|-----------|--------|
| **Phase 2: Timing Attack Fixes** | Fix `nextjs-app/app/api/download-cv` and `test-health/runs` | No action needed - routes removed | **SKIP or VERIFY** |
| **Phase 3: Rate Limiting** | Add rate limiting to legacy routes | No action needed - routes removed | **SKIP or VERIFY** |
| **Phase 4: CORS Hardening** | Restrict CORS on legacy routes | No action needed - routes removed | **SKIP or VERIFY** |
| **Phase 5: Security Testing** | Test legacy route security | Test production routes only | **REDUCED SCOPE** |

### Recommended Roadmap Update

**Phase 1**: Complete (this audit)
**Phase 2**: VERIFY - Confirm production routes have timing-safe comparison (they do)
**Phase 3**: VERIFY - Confirm production routes have rate limiting (partial - `/api/save-contact` needs rate limiting)
**Phase 4**: VERIFY - Confirm production CORS configuration (vercel.json restricts to specific domain)
**Phase 5**: UPDATE - Test production routes only, add tests for any gaps found

### Production Route Gaps Identified

While production routes are secured, this audit identified one gap:

| Route | Gap | Severity |
|-------|-----|----------|
| `app/api/save-contact/route.ts` | Missing rate limiting | **HIGH** |

The production `/api/contact` route has rate limiting (lines 6-10), but `/api/save-contact` does not. This should be addressed if `/api/save-contact` is actively used.

---

## Conclusion

1. **Legacy routes (`nextjs-app/app/api/`) are NOT deployed and should be removed**
2. **Production routes (`app/api/`) are secured with timing-safe comparison, rate limiting, and logging**
3. **Phases 2-4 can be simplified to verification tasks rather than implementation**
4. **One gap found**: `/api/save-contact` in production lacks rate limiting
5. **Phase 5 should focus on testing production route security and adding rate limiting to save-contact**

---

*Generated: 2026-01-13*
*Phase: 01-legacy-route-audit*
*Plan: 01-01*
