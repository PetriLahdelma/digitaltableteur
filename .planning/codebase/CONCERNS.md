# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**In-Memory Rate Limiting (Serverless Risk):**
- Issue: Rate limiters stored in `Map<>` reset on serverless cold start
- Files:
  - `app/api/contact/route.ts:11`
  - `app/api/gdpr/delete-data/route.ts:27`
  - `app/api/save-contact/route.ts:15`
  - `app/api/download-cv/route.ts:16`
- Why: Quick implementation during MVP
- Impact: Attackers can bypass rate limits by triggering cold starts
- Fix approach: Use Redis or persistent store for rate limiting

**GradientDots Component Unimplemented:**
- Issue: Component only renders placeholder text
- File: `nextjs-app/shared/components/GradientDots/GradientDots.tsx`
- Why: TODO left during rapid development
- Impact: Feature incomplete if referenced in production
- Fix approach: Implement actual gradient dots visualization or remove component

## Known Bugs

**No Critical Bugs Detected**
- Codebase appears stable based on analysis
- No TODO/FIXME comments found in app/ directory

## Security Considerations

**Untyped Error Handling:**
- Risk: Type safety bypassed in catch blocks
- File: `app/api/contact/route.ts:177` - `catch (err: any)`
- Current mitigation: Generic error messages returned
- Recommendations: Use proper error typing, create custom error classes

**Missing Environment Variable Validation:**
- Risk: Silent failures if env vars not set
- Files:
  - `app/api/download-cv/route.ts:96` - `CV_PASSWORD || ""`
  - `app/api/test-health/runs/route.ts:31` - `HEALTH_DASHBOARD_TOKEN` unchecked
  - `app/api/test-health/db.ts:3` - `TEST_HEALTH_DATABASE_URL` unchecked
- Current mitigation: None
- Recommendations: Add startup validation for required env vars

**Database Error Message Leakage:**
- Risk: Internal error details exposed to client
- File: `app/api/save-contact/route.ts:110` - Returns `err.message` directly
- Current mitigation: Partial generic wrapping
- Recommendations: Always return generic messages, log details server-side

## Performance Bottlenecks

**No Significant Bottlenecks Detected**
- Server components used by default (good)
- ISR caching configured (revalidate: 3600)
- CSS Modules for efficient styling

## Fragile Areas

**Provider Chain Order:**
- Why fragile: Providers must wrap in specific order for context to work
- File: `app/layout.tsx`
- Common failures: Wrong order breaks theme/i18n/animation
- Safe modification: Document order, add integration tests
- Test coverage: Limited

**Components with DOM Access:**
- Why fragile: Direct window/document access can cause hydration issues
- Files:
  - `nextjs-app/shared/components/Tabs/Tabs.tsx`
  - `nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx`
  - `nextjs-app/shared/components/WorkNav/WorkNav.tsx`
  - `nextjs-app/shared/components/EnhancedContactForm/EnhancedContactForm.tsx`
- Safe modification: Use `typeof window !== 'undefined'` checks
- Test coverage: Has tests but verify SSR compatibility

## Scaling Limits

**Vercel Serverless:**
- Current capacity: Standard tier limits
- Limit: 10s function timeout (Hobby), 60s (Pro)
- Symptoms at limit: 504 gateway timeouts
- Scaling path: Upgrade to Pro, add edge caching

**MongoDB Connection Pooling:**
- Current capacity: 10 max, 2 min connections
- File: `app/lib/mongodb.ts`
- Limit: Connection exhaustion under high load
- Scaling path: Increase pool size, add read replicas

## Dependencies at Risk

**No Critical Dependency Risks Detected**
- All major dependencies are actively maintained
- Next.js 15.5.9 (latest)
- React 19.2.3 (latest)
- TypeScript 5.9.3 (latest)

## Missing Critical Features

**No TLS Enforcement in MongoDB:**
- Problem: TLS warning logged but connection proceeds
- File: `app/lib/mongodb.ts:75-79`
- Current workaround: Warning logged
- Blocks: Security compliance
- Implementation complexity: Low (add validation)

## Test Coverage Gaps

**Large Components Without Full Coverage:**
- What's not tested: Full test verification needed for large components
- Files:
  - `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx` (836 lines)
  - `nextjs-app/shared/components/EnhancedContactForm/EnhancedContactForm.tsx` (602 lines)
- Risk: Complex logic may break unnoticed
- Priority: Medium
- Difficulty to test: Medium (mock AI responses, form submissions)

**Component-to-Test Ratio:**
- Total components: 349 .tsx files
- Test files: 143 .test.tsx files
- Barrel exports: 148 index.ts files
- Gap: ~200 components may lack dedicated tests

## Summary by Severity

### Critical
1. In-memory rate limiting in serverless (bypass risk)
2. GradientDots component unimplemented

### High
1. Missing env var validation (silent failures)
2. Untyped error catch blocks
3. Database error messages to client

### Medium
1. Console logging in production code
2. Large components need test verification
3. Provider chain order undocumented

### Low
1. Some components missing barrel exports
2. Generic Tool types in donny-tools.ts

---

*Concerns audit: 2026-01-16*
*Update as issues are fixed or new ones discovered*
