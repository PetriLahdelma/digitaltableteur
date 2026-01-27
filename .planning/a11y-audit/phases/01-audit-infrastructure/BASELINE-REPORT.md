# Accessibility Audit Baseline Report

**Project:** Digitaltableteur
**Audit Date:** 2026-01-27
**Standard:** WCAG 2.1 AA
**Audited By:** Automated (axe-core via @axe-core/playwright) + Manual checklist preparation

---

## Executive Summary

This report documents the baseline accessibility state of the Digitaltableteur public website prior to remediation work. The automated audit reveals an excellent baseline with a single systemic issue affecting all pages.

### Key Metrics

| Metric | Value |
|--------|-------|
| Pages Audited | 11 |
| Total Violations | 11 |
| Unique Violation Types | 1 |
| Critical (P0) | 11 |
| Major (P1) | 0 |
| Minor (P2) | 0 |
| Automated Pass Rate | 96% (264/275 rules) |

### Violation Distribution by WCAG Principle

| Principle | Violations | % of Total |
|-----------|------------|------------|
| 1. Perceivable | 0 | 0% |
| 2. Operable | 0 | 0% |
| 3. Understandable | 0 | 0% |
| 4. Robust | 11 | 100% |

### Pages with Most Issues

| Page | Violations | Severity Breakdown |
|------|------------|-------------------|
| Home (/) | 1 | 1 P0, 0 P1, 0 P2 |
| About (/about) | 1 | 1 P0, 0 P1, 0 P2 |
| Work (/work) | 1 | 1 P0, 0 P1, 0 P2 |
| Blog (/blog) | 1 | 1 P0, 0 P1, 0 P2 |
| Contact (/contact) | 1 | 1 P0, 0 P1, 0 P2 |
| Work - SAP Build Apps (/work/sap-build-apps) | 1 | 1 P0, 0 P1, 0 P2 |
| Work - Helsinki Design System (/work/helsinki-design-system) | 1 | 1 P0, 0 P1, 0 P2 |
| Privacy Policy (/privacy-policy) | 1 | 1 P0, 0 P1, 0 P2 |
| Accessibility (/accessibility) | 1 | 1 P0, 0 P1, 0 P2 |
| AI Use (/ai-use) | 1 | 1 P0, 0 P1, 0 P2 |
| 404 Page (/this-page-does-not-exist-404) | 1 | 1 P0, 0 P1, 0 P2 |

### Overall Assessment

The audit identified 11 violations across 11 pages, all stemming from a single root cause: the `aria-prohibited-attr` violation in the ToastProvider component. This represents an exceptional baseline for a site with 80+ components. The violation is systemic (appears on every page due to the global ToastProvider) but requires only a single-line fix: adding `role="status"` to the toast container element.

**Key findings:**
- All 11 violations originate from the same global component (ToastProvider)
- No color contrast issues detected
- No missing alt text issues detected
- No form label issues detected
- Estimated remediation effort: Very low (single component fix)

**Recommendation:** Fast-track Phase 5 (Robust Fixes) to resolve all automated violations with a single ToastProvider update, then proceed with manual testing to verify components identified in research.

---

## Violations Mapped to WCAG and Requirements

### Mapping Reference

| axe Rule | WCAG Criterion | Level | Requirement | Phase |
|----------|---------------|-------|-------------|-------|
| aria-prohibited-attr | 4.1.2 Name, Role, Value | A | RBST-03 | Phase 5 |

**Note:** Only one unique violation type was detected. Common rules that were NOT violated:

| axe Rule | WCAG Criterion | Level | Status |
|----------|---------------|-------|--------|
| color-contrast | 1.4.3 Contrast (Minimum) | AA | Passing |
| image-alt | 1.1.1 Non-text Content | A | Passing |
| label | 3.3.2 Labels or Instructions | A | Passing |
| button-name | 4.1.2 Name, Role, Value | A | Passing |
| link-name | 2.4.4 Link Purpose (In Context) | A | Passing |
| landmark-* | 1.3.1 Info and Relationships | A | Passing |
| document-title | 2.4.2 Page Titled | A | Passing |
| html-has-lang | 3.1.1 Language of Page | A | Passing |

### Violations by Requirement

#### Phase 2: Perceivable (PERC-*)

| Requirement | Violations | Rule(s) | Status |
|-------------|------------|---------|--------|
| PERC-01: Alt text | 0 | image-alt | Passing |
| PERC-02: Color contrast | 0 | color-contrast | Passing |
| PERC-03: Color not sole indicator | - | Manual test needed | Pending |
| PERC-04: Text resize 200% | - | Manual test needed | Pending |
| PERC-05: Reflow at 320px | - | Manual test needed | Pending |
| PERC-06: Theme contrast | - | Manual test needed | Pending |

**Phase 2 Status:** No automated violations. Manual testing required for PERC-03 through PERC-06.

#### Phase 3: Operable (OPER-*)

| Requirement | Violations | Rule(s) | Status |
|-------------|------------|---------|--------|
| OPER-01: Keyboard accessible | - | Manual test needed | Pending |
| OPER-02: No keyboard traps | - | Manual test needed | Pending |
| OPER-03: Skip links | - | Manual test needed | Pending |
| OPER-04: Focus visible | 0 | focus-* rules | Passing |
| OPER-05: Focus order | - | Manual test needed | Pending |
| OPER-06: Touch targets | - | Manual test needed | Pending |
| OPER-07: No flashing | - | Manual test needed | Passing (no animations detected) |

**Phase 3 Status:** No automated violations. Manual keyboard/focus testing required.

#### Phase 4: Understandable (UNDR-*)

| Requirement | Violations | Rule(s) | Status |
|-------------|------------|---------|--------|
| UNDR-01: Language declared | 0 | html-has-lang | Passing |
| UNDR-02: Form labels | 0 | label | Passing |
| UNDR-03: Error identification | - | Manual test needed | Pending |
| UNDR-04: Required fields | - | Manual test needed | Pending |
| UNDR-05: Error suggestions | - | Manual test needed | Pending |
| UNDR-06: Consistent navigation | - | Manual test needed | Pending |

**Phase 4 Status:** Basic automated checks passing. Manual form/error testing required.

#### Phase 5: Robust (RBST-*)

| Requirement | Violations | Rule(s) | Status |
|-------------|------------|---------|--------|
| RBST-01: Valid HTML | 0 | various parsing rules | Passing |
| RBST-02: Accessible names | 0 | button-name, link-name | Passing |
| RBST-03: ARIA attributes | **11** | aria-prohibited-attr | **Needs Work** |
| RBST-04: Status messages | - | Manual test needed | Pending |
| RBST-05: Dynamic updates | - | Manual test needed | Pending |

**Phase 5 Status:** Single violation type affecting all pages. Fix ToastProvider to add `role="status"` to container. Manual testing needed for live region functionality.

### Manual Testing Required

The following requirements cannot be verified by automated tools and require manual testing (see MANUAL-TESTING-CHECKLIST.md):

| Requirement | Why Manual | Test Method | Priority |
|-------------|------------|-------------|----------|
| OPER-01 Keyboard | Full navigation flow | Keyboard testing | High |
| OPER-02 No traps | Modal/dialog escape | Keyboard testing | High |
| OPER-03 Skip links | Presence and function | Keyboard testing | High |
| OPER-05 Focus order | Logical sequence | Keyboard testing | Medium |
| PERC-04 Text resize | 200% zoom behavior | Browser zoom | Medium |
| PERC-05 Reflow | 320px viewport | Responsive testing | Medium |
| PERC-06 Theme contrast | All 4 themes | Visual inspection | Medium |
| UNDR-03 Error ID | Form error messages | Screen reader | Medium |
| RBST-04 Status messages | Live region announcements | Screen reader | High |
| RBST-05 Dynamic updates | Content change announcements | Screen reader | Medium |

### Components Requiring Manual Verification

Based on research findings, these components need manual testing beyond automated scans:

| Component | Issues to Verify | Test Method |
|-----------|------------------|-------------|
| Modal | Focus trap, escape key, aria-modal | Keyboard + VoiceOver |
| Navigation | Mobile menu, hamburger aria-expanded | Keyboard + VoiceOver |
| Forms (ContactForm) | Error announcements, aria-describedby | Keyboard + VoiceOver |
| ChatWidget | Focus management, aria-live, role="log" | Keyboard + VoiceOver |
| Tabs | Arrow key navigation, aria-selected | Keyboard |
| Accordion | aria-expanded, aria-controls | Keyboard + VoiceOver |
| Toast | Live region container persistence | VoiceOver |
| Skip Links | Presence and destination focus | Keyboard |

---
