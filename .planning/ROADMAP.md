# Roadmap: Security Hardening

## Completed Milestones

- ✅ [v1.0 Security Hardening](milestones/v1.0-security-ROADMAP.md) (Phases 1-5) — SHIPPED 2026-01-13

## Overview

Systematic security hardening of the digitaltableteur portfolio site. Starting with auditing legacy routes to understand the full scope of vulnerabilities, then fixing timing attacks and adding rate limiting to authentication endpoints, hardening CORS configuration, and finally adding security tests to prevent regressions.

## Milestones

- ✅ **v1.0 Security Hardening** — Phases 1-5 (shipped 2026-01-13)

## Phases

<details>
<summary>✅ v1.0 Security Hardening (Phases 1-5) — SHIPPED 2026-01-13</summary>

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Legacy Route Audit** - Identify all vulnerable legacy routes and document findings ✓
- [x] **Phase 2: Timing Attack Fixes** - Add constant-time password comparison to vulnerable endpoints ✓
- [x] **Phase 3: Rate Limiting** - Add brute force protection to authentication endpoints ✓
- [x] **Phase 4: CORS Hardening** - Restrict wildcard CORS to specific trusted domains ✓
- [x] **Phase 5: Security Testing** - Add tests for rate limiting and timing-safe operations ✓

### Phase 1: Legacy Route Audit
**Goal**: Map all API routes in `nextjs-app/app/api/` and document which lack security features
**Plans**: 1/1 complete

### Phase 2: Timing Attack Fixes
**Goal**: Replace direct string equality with `crypto.timingSafeEqual` in password checks
**Plans**: 1/1 complete

### Phase 3: Rate Limiting
**Goal**: Add rate limiting to all authentication endpoints to prevent brute force attacks
**Plans**: 1/1 complete

### Phase 4: CORS Hardening
**Goal**: Replace wildcard CORS (`*`) with specific trusted domain origins
**Plans**: 1/1 complete

### Phase 5: Security Testing
**Goal**: Add automated tests for rate limiting behavior and timing-safe password comparison
**Plans**: 1/1 complete

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Legacy Route Audit | v1.0 | 1/1 | Complete | 2026-01-13 |
| 2. Timing Attack Fixes | v1.0 | 1/1 | Complete | 2026-01-13 |
| 3. Rate Limiting | v1.0 | 1/1 | Complete | 2026-01-13 |
| 4. CORS Hardening | v1.0 | 1/1 | Complete | 2026-01-13 |
| 5. Security Testing | v1.0 | 1/1 | Complete | 2026-01-13 |

**Total: 5/5 phases complete (100%)**
