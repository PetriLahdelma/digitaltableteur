# Requirements: Accessibility Audit v1.0

**Defined:** 2026-01-27
**Core Value:** Every user can access and use the site regardless of ability.

## v1 Requirements

Requirements for complete WCAG 2.1 AA audit and remediation.

### Audit Infrastructure

- [x] **INFRA-01**: Run automated axe-core audit across all public pages
  - Status: Complete (2026-01-27)
  - Result: 11 violations found across 11 pages
  - See: tests/a11y/audit-results/audit-results.json
- [x] **INFRA-02**: Document baseline violations with severity ratings
  - Status: Complete (2026-01-27)
  - Result: 11 P0 violations (all aria-prohibited-attr from ToastProvider)
  - See: VIOLATIONS.md, BASELINE-REPORT.md
- [x] **INFRA-03**: Create manual testing checklist from research findings
  - Status: Complete (2026-01-27)
  - See: MANUAL-TESTING-CHECKLIST.md (551 lines)
- [x] **INFRA-04**: Set up page-level accessibility tests with @axe-core/playwright
  - Status: Complete (2026-01-27)
  - See: tests/a11y/playwright.a11y.spec.ts, playwright.config.ts

### Perceivable (WCAG Principle 1)

- [ ] **PERC-01**: All images have appropriate alt text (informative vs decorative)
- [ ] **PERC-02**: Color contrast meets 4.5:1 for text, 3:1 for large text/UI
- [ ] **PERC-03**: Color is not sole means of conveying information
- [ ] **PERC-04**: Text can be resized to 200% without loss of functionality
- [ ] **PERC-05**: Content reflows at 320px width without horizontal scroll
- [ ] **PERC-06**: All themes (Light, Dark, HCW, HCB) meet contrast requirements

### Operable (WCAG Principle 2)

- [ ] **OPER-01**: All functionality available via keyboard
- [ ] **OPER-02**: No keyboard traps (user can navigate away from any element)
- [ ] **OPER-03**: Skip links allow bypassing repetitive navigation
- [ ] **OPER-04**: Focus visible on all interactive elements
- [ ] **OPER-05**: Focus order follows logical reading sequence
- [ ] **OPER-06**: Interactive elements have sufficient touch/click targets (44x44px)
- [ ] **OPER-07**: No content flashes more than 3 times per second

### Understandable (WCAG Principle 3)

- [ ] **UNDR-01**: Page language declared in HTML lang attribute
- [ ] **UNDR-02**: Form inputs have visible labels
- [ ] **UNDR-03**: Error messages identify the field and describe the error
- [ ] **UNDR-04**: Required fields are clearly indicated
- [ ] **UNDR-05**: Error suggestions provided where possible
- [ ] **UNDR-06**: Navigation is consistent across pages

### Robust (WCAG Principle 4)

- [x] **RBST-01**: Valid HTML (no parsing errors)
  - Status: Complete (2026-01-27)
  - Result: Baseline audit showed 0 HTML parsing errors
- [x] **RBST-02**: All interactive elements have accessible names
  - Status: Complete (2026-01-27)
  - Result: Baseline audit showed 264 name-related checks passed
- [x] **RBST-03**: ARIA attributes used correctly (valid roles, states, properties)
  - Status: Complete (2026-01-27)
  - Fix: Added role="status" to Toaster container
  - Result: 0 violations (was 11 aria-prohibited-attr)
- [ ] **RBST-04**: Status messages announced to assistive technology
  - Status: Pending (Phase 8 manual testing)
  - Note: Requires VoiceOver verification
- [ ] **RBST-05**: Dynamic content updates announced appropriately
  - Status: Pending (Phase 8 manual testing)
  - Note: Requires screen reader verification

### Component Fixes

- [ ] **COMP-01**: Modal - fix focus management and aria-live usage
- [ ] **COMP-02**: Navigation - add skip links and aria-label to nav element
- [ ] **COMP-03**: Forms - add aria-invalid, aria-describedby for error states
- [ ] **COMP-04**: ChatWidget - add aria-expanded to toggle, role="log" to messages
- [ ] **COMP-05**: Tabs - add tabpanel role, aria-controls, aria-labelledby
- [ ] **COMP-06**: Accordion - use hidden attribute instead of conditional render
- [ ] **COMP-07**: Toast - persist live region container in DOM
- [ ] **COMP-08**: Buttons - ensure icon-only buttons have accessible names
- [ ] **COMP-09**: Links - distinguish from buttons, ensure visible focus

### Page-Level Fixes

- [ ] **PAGE-01**: Home page passes automated and manual audit
- [ ] **PAGE-02**: About page passes automated and manual audit
- [ ] **PAGE-03**: Work/Portfolio pages pass automated and manual audit
- [ ] **PAGE-04**: Blog pages pass automated and manual audit
- [ ] **PAGE-05**: Contact page passes automated and manual audit

### Verification

- [ ] **VERF-01**: Screen reader testing (VoiceOver) on all pages
- [ ] **VERF-02**: Keyboard-only navigation test on all pages
- [ ] **VERF-03**: High contrast mode verification
- [ ] **VERF-04**: Zoom to 200% verification
- [ ] **VERF-05**: Document final audit results

## v2 Requirements

Deferred to future work.

- **A11Y-V2-01**: WCAG 2.2 AA compliance (Focus Not Obscured, Dragging Movements)
- **A11Y-V2-02**: Mobile screen reader testing (TalkBack, VoiceOver iOS)
- **A11Y-V2-03**: NVDA testing (requires Windows)
- **A11Y-V2-04**: Automated CI/CD accessibility gates
- **A11Y-V2-05**: Accessibility statement page

## Out of Scope

| Feature | Reason |
|---------|--------|
| WCAG 2.1 AAA | Exceeds current needs, significant additional effort |
| Legacy Vite app | Deprecated, not public-facing |
| Third-party embeds | Limited control (YouTube, external widgets) |
| Admin tools | Focus on public site only |
| NVDA testing | Requires Windows access |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | **Complete** |
| INFRA-02 | Phase 1 | **Complete** |
| INFRA-03 | Phase 1 | **Complete** |
| INFRA-04 | Phase 1 | **Complete** |
| PERC-01 | Phase 2 | Pending |
| PERC-02 | Phase 2 | Pending |
| PERC-03 | Phase 2 | Pending |
| PERC-04 | Phase 2 | Pending |
| PERC-05 | Phase 2 | Pending |
| PERC-06 | Phase 2 | Pending |
| OPER-01 | Phase 3 | Pending |
| OPER-02 | Phase 3 | Pending |
| OPER-03 | Phase 3 | Pending |
| OPER-04 | Phase 3 | Pending |
| OPER-05 | Phase 3 | Pending |
| OPER-06 | Phase 3 | Pending |
| OPER-07 | Phase 3 | Pending |
| UNDR-01 | Phase 4 | Pending |
| UNDR-02 | Phase 4 | Pending |
| UNDR-03 | Phase 4 | Pending |
| UNDR-04 | Phase 4 | Pending |
| UNDR-05 | Phase 4 | Pending |
| UNDR-06 | Phase 4 | Pending |
| RBST-01 | Phase 5 | **Complete** |
| RBST-02 | Phase 5 | **Complete** |
| RBST-03 | Phase 5 | **Complete** |
| RBST-04 | Phase 8 | Pending (manual) |
| RBST-05 | Phase 8 | Pending (manual) |
| COMP-01 | Phase 6 | Pending |
| COMP-02 | Phase 6 | Pending |
| COMP-03 | Phase 6 | Pending |
| COMP-04 | Phase 6 | Pending |
| COMP-05 | Phase 6 | Pending |
| COMP-06 | Phase 6 | Pending |
| COMP-07 | Phase 6 | Pending |
| COMP-08 | Phase 6 | Pending |
| COMP-09 | Phase 6 | Pending |
| PAGE-01 | Phase 7 | Pending |
| PAGE-02 | Phase 7 | Pending |
| PAGE-03 | Phase 7 | Pending |
| PAGE-04 | Phase 7 | Pending |
| PAGE-05 | Phase 7 | Pending |
| VERF-01 | Phase 8 | Pending |
| VERF-02 | Phase 8 | Pending |
| VERF-03 | Phase 8 | Pending |
| VERF-04 | Phase 8 | Pending |
| VERF-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after Phase 5 Plan 1 completion (RBST-01, RBST-02, RBST-03 complete)*
