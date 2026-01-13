# Codebase Concerns

**Analysis Date:** 2026-01-13

## Tech Debt

**Duplicate API implementations:**
- Issue: `app/` and `nextjs-app/app/` contain parallel implementations with different features
- Files: `app/api/download-cv/route.ts` vs `nextjs-app/app/api/download-cv/route.ts`, `app/api/save-contact/route.ts` vs `nextjs-app/app/api/save-contact/route.ts`
- Why: Mid-migration from Vite → Next.js, both codebases evolved independently
- Impact: Security features in `app/` not present in `nextjs-app/`, inconsistent security posture
- Fix approach: Consolidate to single implementation, remove duplicate routes from `nextjs-app/`

**Large components exceeding 50-line guideline:**
- Issue: ChatWidget and ContactForm components are 800+ lines
- Files: `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx` (836 lines), `nextjs-app/src/components/ContactForm/ContactForm.tsx` (610 lines)
- Why: Incremental feature additions without refactoring
- Impact: Difficult to test, understand, and maintain
- Fix approach: Extract hooks, split into smaller composable components

**Incomplete component implementation:**
- Issue: GradientDots component is a stub placeholder
- File: `nextjs-app/shared/components/GradientDots/GradientDots.tsx` (line 1: `// TODO: Implement GradientDots component`)
- Why: Started but never completed
- Impact: Component exports but doesn't render anything useful
- Fix approach: Complete implementation or remove component

## Known Bugs

**No critical bugs identified during analysis.**

## Security Considerations

**Timing attack vulnerability in legacy implementation:**
- Risk: Password comparison using direct string equality allows timing attacks
- File: `nextjs-app/app/api/download-cv/route.ts` (line 9: `password !== process.env.CV_PASSWORD`)
- Current mitigation: Production uses `app/api/download-cv/route.ts` with constant-time comparison
- Recommendations: Remove or update `nextjs-app/` version to use `timingSafeEqual()`

**Missing rate limiting in legacy implementation:**
- Risk: Unlimited brute force attempts on CV download password
- File: `nextjs-app/app/api/download-cv/route.ts` - No rate limiting code
- Current mitigation: Production uses `app/api/download-cv/route.ts` with rate limiting
- Recommendations: Remove `nextjs-app/` route or add rate limiting

**CORS set to wildcard:**
- Risk: Overly permissive cross-origin access
- Files: `app/api/save-contact/route.ts` (line 100), `nextjs-app/app/api/save-contact/route.ts` (line 57), `app/api/download-cv/route.ts` (line 150)
- Current mitigation: None - all endpoints allow any origin
- Recommendations: Restrict to specific trusted domains in production

**Missing security logging in legacy routes:**
- Risk: Cannot audit authentication failures or data access
- Files: `nextjs-app/app/api/download-cv/route.ts`, `nextjs-app/app/api/save-contact/route.ts`
- Current mitigation: Production routes in `app/api/` have SecurityLogger
- Recommendations: Remove legacy routes or add logging

## Performance Bottlenecks

**Message storage on every message:**
- Problem: ChatWidget stores entire conversation to localStorage on each message
- File: `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx` (lines 530-532)
- Measurement: Not quantified, but potential jank on large conversations
- Cause: No debouncing or batching of localStorage writes
- Improvement path: Debounce saves, batch multiple message updates

## Fragile Areas

**ChatWidget complexity:**
- File: `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx`
- Why fragile: 836 lines with multiple useEffect hooks, email workflow, localStorage sync
- Common failures: State desync between localStorage and component state
- Safe modification: Extract hooks to separate files, add comprehensive tests
- Test coverage: Some test files exist but gaps in coverage for complex flows

**Migration boundary between app/ and nextjs-app/:**
- Why fragile: Two codebases with similar but different implementations
- Common failures: Fix applied to one but not other, feature parity drift
- Safe modification: Plan to consolidate before making changes
- Test coverage: Tests exist for both but may test different behaviors

## Scaling Limits

**In-memory rate limiting:**
- Current capacity: Single serverless instance
- Files: `app/api/contact/route.ts`, `app/api/download-cv/route.ts`
- Limit: Rate limits reset on instance restart, not shared across instances
- Symptoms at limit: Attacker could bypass by hitting different instances
- Scaling path: Move to Redis or Vercel KV for distributed rate limiting

## Dependencies at Risk

**None identified as critical risk during analysis.**

## Missing Critical Features

**No identified missing critical features.**

## Test Coverage Gaps

**API route security features:**
- ✅ **Now tested:** Rate limiting and constant-time comparison tests added in `app/__tests__/security-rate-limiting.test.ts` (15 test cases) and `app/__tests__/security-timing-safe.test.ts` (9 test cases)
- Covers: Window expiry, independent buckets, IPv6, rapid requests, special characters, whitespace handling
- Uses fake timers for deterministic time-based testing

**Complex hook interactions:**
- What's not tested: Multiple useEffect hooks in ChatWidget (localStorage, greeting, focus)
- Risk: State management bugs in edge cases
- Priority: Medium
- Difficulty to test: Complex setup with mocked localStorage and timers

**Type safety gaps:**
- What's not tested: Code using `as any` casts bypasses TypeScript safety
- Files: `nextjs-app/src/components/ChatWidget/ChatWidget.tsx` (multiple locations), `nextjs-app/src/components/ChatWidget/ChatMessages.tsx`
- Risk: Runtime type errors
- Priority: Medium
- Difficulty to test: Need to add proper types first

---

*Concerns audit: 2026-01-13*
*Update as issues are fixed or new ones discovered*
