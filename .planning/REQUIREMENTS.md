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

- [x] **PERC-01**: All images have appropriate alt text (informative vs decorative)
  - Status: Complete (2026-01-28)
  - Result: Zero violations across 11 pages
  - Verified: 28 Image components, 17 img elements, 92 Icon usages
  - See: IMAGE-ALT-AUDIT.md
- [x] **PERC-02**: Color contrast meets 4.5:1 for text, 3:1 for large text/UI
  - Status: Complete (2026-01-29)
  - Result: All 4 themes pass contrast audit - 0 violations
  - Fix: Added --logo-text-color CSS variable for logo wordmark, added Dark theme override for ChatWidget toggle
  - See: CONTRAST-AUDIT.md, 02-06-SUMMARY.md
- [x] **PERC-03**: Color is not sole means of conveying information
  - Status: Mostly Compliant (2026-01-28)
  - Result: 11 components pass with icon+color patterns; 5 minor P2 gaps documented
  - Note: Toast/Tag components could benefit from icons; TextInput relies on FormField
  - See: COLOR-INDEPENDENCE-AUDIT.md
- [x] **PERC-04**: Text can be resized to 200% without loss of functionality
  - Status: Complete (2026-01-28)
  - Result: All 8 public pages pass 640px viewport test (simulates 200% zoom)
  - Verified: CSS uses relative units, responsive breakpoints work correctly
  - See: REFLOW-ZOOM-AUDIT.md
- [x] **PERC-05**: Content reflows at 320px width without horizontal scroll
  - Status: Complete (2026-01-28)
  - Result: All 8 public pages pass 320px viewport test without horizontal scroll
  - Verified: CSS Grid/Flexbox layouts adapt properly, text spacing overrides work
  - See: REFLOW-ZOOM-AUDIT.md
- [x] **PERC-06**: All themes (Light, Dark, HCW, HCB) meet contrast requirements
  - Status: Complete (2026-01-29)
  - Result: 4/4 themes pass contrast audit - 0 violations across all themes
  - Fix: Added --logo-text-color CSS variable, Dark theme ChatWidget toggle override
  - See: CONTRAST-AUDIT.md, 02-06-SUMMARY.md

### Operable (WCAG Principle 2)

- [x] **OPER-01**: All functionality available via keyboard
  - Status: Complete (2026-01-30)
  - Result: All 5 public pages pass keyboard navigation tests
  - Verified: Tab navigation, Enter/Space activation, Arrow key navigation
  - See: KEYBOARD-AUDIT.md, keyboard-navigation.spec.ts (810 lines)
- [x] **OPER-02**: No keyboard traps (user can navigate away from any element)
  - Status: Complete (2026-01-30)
  - Result: Modal, ChatWidget, MobileDrawer all release focus correctly
  - Fix: Added focus management to MobileDrawer (inert, focus restoration)
  - See: focus-trap.spec.ts (818 lines)
- [x] **OPER-03**: Skip links allow bypassing repetitive navigation
  - Status: Complete (2026-01-30)
  - Result: Skip link visible on focus, navigates to #main-content
  - Verified: /, /about, /contact pages pass skip link tests
  - See: focus-trap.spec.ts
- [x] **OPER-04**: Focus visible on all interactive elements
  - Status: Complete (2026-01-30)
  - Result: All interactive components show visible focus ring
  - Fix: Added :focus-visible styling to Accordion trigger
  - See: focus-visibility.spec.ts (351 lines)
- [x] **OPER-05**: Focus order follows logical reading sequence
  - Status: Complete (2026-01-30)
  - Result: Focus order follows DOM structure and visual layout
  - Note: 3-5 minor deviations in footer grid acceptable per WCAG
  - See: keyboard-navigation.spec.ts
- [x] **OPER-06**: Interactive elements have sufficient touch/click targets (44x44px)
  - Status: Complete (2026-01-30)
  - Result: All touch targets meet 44x44px minimum on mobile
  - Fix: Added mobile media query for Button.sm/md iconOnly (now 44px)
  - See: TOUCH-TARGET-AUDIT.md, touch-targets.spec.ts (372 lines)
- [x] **OPER-07**: No content flashes more than 3 times per second
  - Status: Complete (2026-01-30)
  - Result: No animations exceed 3Hz; prefers-reduced-motion supported
  - Verified: DonnyAvatar speak animation is shape transform, not luminance
  - See: TOUCH-TARGET-AUDIT.md

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

- [x] **COMP-01**: Modal - fix focus management and aria-live usage
  - Status: Complete (2026-01-28)
  - Fix: Removed aria-live from dialog element (role=dialog/alertdialog already implies announcement)
  - See: 06-01-SUMMARY.md
- [x] **COMP-02**: Navigation - add skip links and aria-label to nav element
  - Status: Complete (pre-existing)
  - Note: SkipLink component exists with sr-only + focus:not-sr-only pattern
  - Note: NextLayout renders SkipLink before SiteHeader
  - Note: SiteHeader nav has aria-label via translation key
- [x] **COMP-03**: Forms - add aria-invalid, aria-describedby for error states
  - Status: Complete (2026-01-28)
  - Fix: Added aria-invalid, aria-describedby to Input, role="alert" to HelperText error state
  - See: 06-02-SUMMARY.md
- [x] **COMP-04**: ChatWidget - add aria-expanded to toggle, role="log" to messages
  - Status: Complete (2026-01-28)
  - Note: aria-expanded was pre-existing on ChatToggle
  - Fix: Added role="log", aria-live="polite", aria-relevant="additions" to ChatMessages
  - See: 06-03-SUMMARY.md
- [x] **COMP-05**: Tabs - add tabpanel role, aria-controls, aria-labelledby
  - Status: Complete (2026-01-28)
  - Fix: Added id and aria-controls to tab buttons, exported getTabPanelProps helper
  - See: 06-04-SUMMARY.md
- [x] **COMP-06**: Accordion - use hidden attribute instead of conditional render
  - Status: Complete (2026-01-28)
  - Fix: Panels always in DOM with hidden attribute for valid aria-controls references
  - See: 06-05-SUMMARY.md
- [x] **COMP-07**: Toast - persist live region container in DOM
  - Status: Complete (Phase 5, 2026-01-27)
  - Fix: Added role="status" to Toaster container (always in DOM)
  - See: 05-01-SUMMARY.md
- [x] **COMP-08**: Buttons - ensure icon-only buttons have accessible names
  - Status: Complete (2026-01-28)
  - Fix: Added dev warning, tooltip-as-label fallback, aria-busy for loading state
  - See: 06-06-SUMMARY.md
- [x] **COMP-09**: Links - distinguish from buttons, ensure visible focus
  - Status: Complete (pre-existing)
  - Note: Link component uses semantic `<a>` element
  - Note: Button renders as `<a>` when href provided (polymorphic)
  - Note: Link has wavyUnderline class for visible focus/hover styling

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
| PERC-01 | Phase 2 | **Complete** |
| PERC-02 | Phase 2 | **Complete** |
| PERC-03 | Phase 2 | **Mostly Compliant** |
| PERC-04 | Phase 2 | **Complete** |
| PERC-05 | Phase 2 | **Complete** |
| PERC-06 | Phase 2 | **Complete** |
| OPER-01 | Phase 3 | **Complete** |
| OPER-02 | Phase 3 | **Complete** |
| OPER-03 | Phase 3 | **Complete** |
| OPER-04 | Phase 3 | **Complete** |
| OPER-05 | Phase 3 | **Complete** |
| OPER-06 | Phase 3 | **Complete** |
| OPER-07 | Phase 3 | **Complete** |
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
| COMP-01 | Phase 6 | **Complete** |
| COMP-02 | Phase 6 | **Complete** (pre-existing) |
| COMP-03 | Phase 6 | **Complete** |
| COMP-04 | Phase 6 | **Complete** |
| COMP-05 | Phase 6 | **Complete** |
| COMP-06 | Phase 6 | **Complete** |
| COMP-07 | Phase 5 | **Complete** |
| COMP-08 | Phase 6 | **Complete** |
| COMP-09 | Phase 6 | **Complete** (pre-existing) |
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
*Last updated: 2026-01-30 after Phase 3 completion (OPER-01 through OPER-07 all complete)*
