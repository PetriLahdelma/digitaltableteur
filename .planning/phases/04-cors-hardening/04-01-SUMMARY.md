---
phase: 04-cors-hardening
plan: 01
subsystem: api
tags: [cors, security, next-js, api]

# Dependency graph
requires:
  - phase: 03-rate-limiting
    provides: Rate limiting on authentication endpoints
provides:
  - Origin-validated CORS across entire API surface
  - Centralized CORS configuration via chat-shared.ts
affects: [security-testing, api-endpoints]

# Tech tracking
tech-stack:
  added: []
  patterns: [centralized-cors-headers, origin-validation]

key-files:
  created: []
  modified:
    - app/api/contact/route.ts
    - app/api/download-cv/route.ts
    - app/api/save-contact/route.ts
    - app/api/gdpr/delete-data/route.ts
    - app/api/test-health/runs/route.ts
    - app/api/test-health/runs/latest/route.ts

key-decisions:
  - "Use existing createCorsHeaders pattern from chat-shared.ts"
  - "Override Access-Control-Allow-Headers for test-health routes (need X-Health-Token)"

patterns-established:
  - "All API routes use createCorsHeaders() for CORS"
  - "Request origin is validated against allowedOrigins list"

issues-created: []

# Metrics
duration: 3 min
completed: 2026-01-13
---

# Phase 4 Plan 01: CORS Hardening Summary

**Replaced wildcard CORS (`*`) with origin-validated CORS across all 6 API routes using centralized `createCorsHeaders()` pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-13T19:09:54Z
- **Completed:** 2026-01-13T19:12:28Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Removed all wildcard `"*"` CORS headers from API routes
- Centralized CORS logic using `createCorsHeaders()` from `chat-shared.ts`
- All routes now validate origin against `allowedOrigins` list
- Added `Vary: Origin` header for proper CDN/proxy caching

## Task Commits

Each task was committed atomically:

1. **Task 1: Update contact and download-cv routes** - `ca3724b04` (feat)
2. **Task 2: Update save-contact and gdpr routes** - `230b0d333` (feat)
3. **Task 3: Update test-health routes** - `9509886dc` (feat)

**Plan metadata:** `b34f4e280` (docs: complete plan)

## Files Created/Modified

- `app/api/contact/route.ts` - Import createCorsHeaders, update OPTIONS handler
- `app/api/download-cv/route.ts` - Import createCorsHeaders, update OPTIONS handler
- `app/api/save-contact/route.ts` - Import createCorsHeaders, update OPTIONS handler
- `app/api/gdpr/delete-data/route.ts` - Import createCorsHeaders, update OPTIONS handler
- `app/api/test-health/runs/route.ts` - Import createCorsHeaders, update OPTIONS and POST handlers
- `app/api/test-health/runs/latest/route.ts` - Import createCorsHeaders, update OPTIONS and GET handlers

## Decisions Made

- Used existing `createCorsHeaders()` pattern from `chat-shared.ts` for consistency
- For test-health routes, merged custom `Access-Control-Allow-Headers` (needs `X-Health-Token`) with base CORS headers
- Applied CORS headers to all responses in test-health routes (not just OPTIONS) since they're called from browsers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Step

Phase complete, ready for Phase 5: Security Testing

---
*Phase: 04-cors-hardening*
*Completed: 2026-01-13*
