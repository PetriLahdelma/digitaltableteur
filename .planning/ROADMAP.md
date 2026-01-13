# Roadmap: Security Hardening

## Overview

Systematic security hardening of the digitaltableteur portfolio site. Starting with auditing legacy routes to understand the full scope of vulnerabilities, then fixing timing attacks and adding rate limiting to authentication endpoints, hardening CORS configuration, and finally adding security tests to prevent regressions.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Legacy Route Audit** - Identify all vulnerable legacy routes and document findings ✓
- [x] **Phase 2: Timing Attack Fixes** - Add constant-time password comparison to vulnerable endpoints ✓
- [x] **Phase 3: Rate Limiting** - Add brute force protection to authentication endpoints ✓
- [x] **Phase 4: CORS Hardening** - Restrict wildcard CORS to specific trusted domains ✓
- [ ] **Phase 5: Security Testing** - Add tests for rate limiting and timing-safe operations

## Phase Details

### Phase 1: Legacy Route Audit
**Goal**: Map all API routes in `nextjs-app/app/api/` and document which lack security features
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal codebase analysis)
**Plans**: TBD

Plans:
- [x] 01-01: Audit legacy routes and document vulnerabilities ✓

### Phase 2: Timing Attack Fixes
**Goal**: Replace direct string equality with `crypto.timingSafeEqual` in password checks
**Depends on**: Phase 1 (need to know which routes are vulnerable)
**Research**: Unlikely (established pattern using Node.js crypto)
**Plans**: TBD

Plans:
- [x] 02-01: Implement constant-time comparison in vulnerable routes ✓

### Phase 3: Rate Limiting
**Goal**: Add rate limiting to all authentication endpoints to prevent brute force attacks
**Depends on**: Phase 2
**Research**: Unlikely (existing rate limiting patterns in `app/api/`)
**Plans**: 1

Plans:
- [x] 03-01: Add rate limiting to save-contact endpoint ✓

### Phase 4: CORS Hardening
**Goal**: Replace wildcard CORS (`*`) with specific trusted domain origins
**Depends on**: Phase 3
**Research**: Unlikely (standard Next.js CORS configuration)
**Plans**: 1

Plans:
- [x] 04-01: Configure CORS for specific allowed origins ✓

### Phase 5: Security Testing
**Goal**: Add automated tests for rate limiting behavior and timing-safe password comparison
**Depends on**: Phase 4 (all security features implemented)
**Research**: Unlikely (existing Vitest patterns in codebase)
**Plans**: TBD

Plans:
- [ ] 05-01: Create security test suite

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Legacy Route Audit | 1/1 | Complete | 2026-01-13 |
| 2. Timing Attack Fixes | 1/1 | Complete | 2026-01-13 |
| 3. Rate Limiting | 1/1 | Complete | 2026-01-13 |
| 4. CORS Hardening | 1/1 | Complete | 2026-01-13 |
| 5. Security Testing | 0/1 | Not started | - |
