# Roadmap: Accessibility Audit

## Overview

Comprehensive WCAG 2.1 AA audit and remediation for the entire public-facing Digitaltableteur website. Eight phases: establish baseline, fix by WCAG principle, remediate components, verify pages, final validation.

## Milestones

- 🚧 **v1.0 Full Audit + Fixes** - Phases 1-8 (in progress)

## Phases

### Phase 1: Audit Infrastructure
**Goal**: Establish automated testing baseline and document all violations
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria**:
  1. axe-core audit runs on all public pages without errors
  2. Baseline violations documented with severity (P0/P1/P2)
  3. Manual testing checklist created from research
  4. @axe-core/playwright configured for page-level tests
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Set up @axe-core/playwright for page-level tests
- [x] 01-02-PLAN.md — Run automated audit and capture violations
- [x] 01-03-PLAN.md — Create manual testing checklist from research
- [x] 01-04-PLAN.md — Document baseline report with remediation plan

### Phase 2: Perceivable Fixes
**Goal**: Fix all WCAG Principle 1 (Perceivable) violations
**Depends on**: Phase 1 (need baseline to know what to fix)
**Requirements**: PERC-01, PERC-02, PERC-03, PERC-04, PERC-05, PERC-06
**Success Criteria**:
  1. All images have appropriate alt text
  2. Color contrast passes 4.5:1 / 3:1 requirements
  3. All 4 themes pass contrast verification
  4. Content reflows correctly at 320px
  5. Text resizes to 200% without breaking
**Plans**: TBD

### Phase 3: Operable Fixes
**Goal**: Fix all WCAG Principle 2 (Operable) violations
**Depends on**: Phase 1
**Requirements**: OPER-01, OPER-02, OPER-03, OPER-04, OPER-05, OPER-06, OPER-07
**Success Criteria**:
  1. All functionality works via keyboard only
  2. Skip links implemented and functional
  3. Focus visible on all interactive elements
  4. Focus order is logical
  5. No keyboard traps exist
  6. Touch targets meet 44x44px minimum
**Plans**: TBD

### Phase 4: Understandable Fixes
**Goal**: Fix all WCAG Principle 3 (Understandable) violations
**Depends on**: Phase 1
**Requirements**: UNDR-01, UNDR-02, UNDR-03, UNDR-04, UNDR-05, UNDR-06
**Success Criteria**:
  1. HTML lang attribute set correctly
  2. All form inputs have visible labels
  3. Error messages are descriptive and linked to fields
  4. Required fields clearly marked
  5. Navigation is consistent across pages
**Plans**: TBD

### Phase 5: Robust Fixes
**Goal**: Fix all WCAG Principle 4 (Robust) violations - eliminate all automated violations
**Depends on**: Phase 1
**Requirements**: RBST-01, RBST-02, RBST-03, RBST-04, RBST-05
**Success Criteria**:
  1. HTML validates without parsing errors
  2. All interactive elements have accessible names
  3. ARIA attributes are valid and correct
  4. Status messages announced to AT
  5. Dynamic content updates announced
**Plans**: 1 plan

Plans:
- [ ] 05-01-PLAN.md — Fix Toaster aria-prohibited-attr violation (single fix resolves all 11 violations)

### Phase 6: Component Remediation
**Goal**: Fix accessibility issues in specific components identified by research
**Depends on**: Phases 2-5 (general fixes inform component work)
**Requirements**: COMP-01 through COMP-09
**Success Criteria**:
  1. Modal focus management and ARIA fixed
  2. Navigation has skip links and proper ARIA
  3. Forms have proper error state ARIA
  4. ChatWidget has aria-expanded and role="log"
  5. Tabs have proper panel associations
  6. Accordion uses hidden attribute
  7. Toast live region persists
  8. All icon-only buttons have names
  9. Links distinguishable from buttons
**Plans**: TBD

### Phase 7: Page-Level Verification
**Goal**: Verify each public page passes complete audit
**Depends on**: Phase 6
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05
**Success Criteria**:
  1. Home page passes automated + manual audit
  2. About page passes audit
  3. Work/Portfolio pages pass audit
  4. Blog pages pass audit
  5. Contact page passes audit
**Plans**: TBD

### Phase 8: Final Verification
**Goal**: Complete screen reader, keyboard, and theme testing
**Depends on**: Phase 7
**Requirements**: VERF-01, VERF-02, VERF-03, VERF-04, VERF-05
**Success Criteria**:
  1. VoiceOver testing complete on all pages
  2. Keyboard-only navigation verified
  3. High contrast modes verified
  4. 200% zoom verified
  5. Final audit report documented
**Plans**: TBD

## Progress

**Execution Order:**
Phase 1 → Phases 2-5 (can run in parallel) → Phase 6 → Phase 7 → Phase 8

| Phase | Name | Requirements | Plans | Status |
|-------|------|--------------|-------|--------|
| 1 | Audit Infrastructure | 4 | 4/4 | ✓ Complete |
| 2 | Perceivable Fixes | 6 | TBD | Not started |
| 3 | Operable Fixes | 7 | TBD | Not started |
| 4 | Understandable Fixes | 6 | TBD | Not started |
| 5 | Robust Fixes | 5 | 1/1 | Ready |
| 6 | Component Remediation | 9 | TBD | Not started |
| 7 | Page-Level Verification | 5 | TBD | Not started |
| 8 | Final Verification | 5 | TBD | Not started |

---
*Roadmap created: 2026-01-27*
*Phase 1 planned: 2026-01-27*
*Phase 1 complete: 2026-01-27*
*Phase 5 planned: 2026-01-27*
