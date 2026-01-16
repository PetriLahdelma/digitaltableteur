# Concerns

> Technical debt, risks, and known issues for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## Executive Summary

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| TypeScript Errors | 537 | HIGH | Open |
| NPM Vulnerabilities | 10 | HIGH | Open |
| Console Statements | 27 | MEDIUM | Open |
| Incomplete Components | 1 | MEDIUM | Open |
| Deprecated Props | 6+ | MEDIUM | Planned |
| dangerouslySetInnerHTML | 5 | LOW | Mitigated |
| @ts-expect-error | 8+ | LOW | Intentional |

**Overall Health**: 9.2/10 (Excellent security, concerning type safety)

---

## Critical Issues

### 1. TypeScript Compilation Errors (537 Total)

**Severity**: HIGH
**Impact**: Build risk, type safety compromised
**Effort**: 20-30 hours

#### Key Problem Areas

| File | Errors | Issue |
|------|--------|-------|
| `app/blog/[slug]/page.tsx` | 3 | Missing BlogPostMeta properties |
| `translation-coverage.test.tsx` | 4 | Type guards missing |
| `emailWorkflow/reducer.test.ts` | 4-6 | State type mismatch |
| `NextMobileMenu.tsx` | 2 | Label props missing |
| `app/layout.tsx` | 2 | Invalid metadata |

#### Priority Fix

```typescript
// app/blog/[slug]/page.tsx - Add missing properties
interface BlogPostMeta {
  slug: string;
  title: string;
  modifiedAt?: string;  // Add this
  tags?: string[];      // Add this
}
```

---

### 2. NPM Vulnerabilities (10 Total)

**Severity**: HIGH (8 high, 2 moderate)

| Package | Advisory | Risk | Fix |
|---------|----------|------|-----|
| esbuild ≤0.24.2 | GHSA-67mh-4wv8-2f99 | Dev server exposure | `npm audit fix` |
| glob 10.2.0-10.4.5 | GHSA-5j98-mcp5-4vw2 | Command injection | Breaking change |
| undici ≤5.28.5 | GHSA-c76h-2ccp-4975 | Random values | `npm audit fix` |

**Recommended Action**:
```bash
npm audit fix              # Safe fixes
npm audit fix --force --dry-run  # Review breaking
npm run build && npm test  # Verify
```

---

## High Priority Issues

### 3. Console Statements in Production (27)

**Severity**: MEDIUM
**Impact**: Information leakage

**Worst Offender**: `app/api/chat/route.ts` (9 logs)

```typescript
// Problem: Leaks AI internals
console.log("[chat] Model ID:", modelId);
console.log("[chat] System prompt length:", system.length);

// Fix: Conditional logging
const DEBUG = process.env.NODE_ENV === "development";
if (DEBUG) console.log("[chat] ...");
```

**Other Locations**:
- `providers/I18nProvider.tsx`: 2 error logs
- `providers/ToastProvider.tsx`: 3 logs
- `api-legacy-vercel-functions/`: Multiple logs

---

### 4. Incomplete Component

**File**: `GradientDots/GradientDots.tsx`

```typescript
// TODO: Implement GradientDots component
const GradientDots: React.FC<GradientDotsProps> = ({ className }) => {
  return <div className={className} />;  // Stub only
};
```

**Status**: Non-functional stub
**Effort**: 2-4 hours

---

## Medium Priority Issues

### 5. Deprecated Props (Planned v2.0.0 Removal)

**Components Affected**: Button, Select, Inputs

| Deprecated | Replacement |
|------------|-------------|
| `disabled` | `isDisabled` |
| `isSubmitting` | `isLoading` |
| `inverse` | `isInverse` |
| `rounded` | `isRounded` |
| `onChange` | `onValueChange` |

**Status**: Working but marked for removal

---

### 6. TypeScript Suppressions (8+)

**Intentional** (OK):
- Test error boundary testing
- Governance annotations

**Needs Review**:
```typescript
// Checkbox.tsx:68
// @ts-ignore - assign to forwarded ref object
```

Should be `@ts-expect-error` with documentation.

---

## Low Priority Issues

### 7. dangerouslySetInnerHTML (5 Occurrences)

**Status**: MITIGATED with DOMPurify

| Location | Content |
|----------|---------|
| `app/about/page.tsx` | Sanity content |
| `app/blog/[slug]/page.tsx` | Blog markdown |
| `app/layout.tsx` (3x) | JSON-LD data |

**Protection**: `sanitizeHTML()`, `sanitizeJsonLd()`, `sanitizeRichText()`
**Test Coverage**: 17/17 passing

---

### 8. Storybook Type Errors (~20)

**Impact**: Development experience only

- Avatar story image types
- Button governance metadata
- Chat widget story props

**Effort**: 3-5 hours

---

## Migration Status

### Vite → Next.js

**Status**: PLANNING phase

| Current | Target |
|---------|--------|
| Vite (root) | Next.js 15 |
| 100% production | Incremental migration |

**Risks**:
- CSS Module path differences
- Environment variable naming (`VITE_*` → `NEXT_PUBLIC_*`)
- Router API incompatibility
- Hydration mismatches

**Documentation**: `docs/NEXTJS_MIGRATION_PLAN.md`

---

## Security Assessment

### Recent Hardening (December 2025)

| Feature | Status |
|---------|--------|
| DOMPurify | Implemented |
| OpenAI cost limits | Implemented |
| Prompt injection guards | Implemented |
| Rate limiting | Implemented |
| CORS hardening | Implemented |
| CSP headers | Implemented |
| MongoDB sanitization | Implemented |
| GDPR automation | Implemented |
| Sentry alerts | Implemented |

**Security Score**: 9.2/10

---

## Recommended Action Plan

### Week 1: Critical (8-16h)

1. **TypeScript errors** (Blog, Email, Label)
   - Fix BlogPostMeta interface
   - Fix email workflow state
   - Fix Label props
   - **Effort**: 6-8h

2. **npm audit fixes**
   - Safe fixes first
   - Test breaking changes
   - **Effort**: 2-3h

3. **Remove console.log**
   - Conditional debug logging
   - **Effort**: 1-2h

### Week 2: High (6-12h)

1. Translation coverage types (2h)
2. Email workflow reducer (2-3h)
3. Layout metadata (1h)

### Future: Planned

1. GradientDots implementation
2. Next.js migration (80-120h)
3. Deprecation cleanup (v2.0.0)

---

## Monitoring Commands

```bash
# Check status
npm run typecheck          # TS errors
npm audit                  # Vulnerabilities
npm run lint               # Linting issues
npm test                   # Failing tests

# Pre-commit guard
npm run precommit:guard
```

---

## Reference Documents

- `docs/COMPREHENSIVE_SECURITY_AUDIT_2025-12-03.md`
- `docs/ACCESSIBILITY_AND_ISSUES_REPORT.md`
- `docs/ISSUES_FIXED_2025-11-29.md`
- `docs/NEXTJS_MIGRATION_PLAN.md`
