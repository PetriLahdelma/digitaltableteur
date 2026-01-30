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

## Remediation Plan by Phase

### Phase 2: Perceivable Fixes

**Estimated Effort:** Low
**Automated Violations to Fix:** 0
**Manual Testing Required:** Yes

| Priority | Requirement | Issue | Component/Page | Fix Approach |
|----------|-------------|-------|----------------|--------------|
| - | PERC-01 | No issues found | All pages | Passing - no action needed |
| - | PERC-02 | No issues found | All pages | Passing - no action needed |
| P1 | PERC-03 | Verify color usage | All pages | Manual audit of color-dependent info |
| P1 | PERC-04 | Text resize | All pages | Test 200% zoom |
| P1 | PERC-05 | Reflow | All pages | Test 320px viewport |
| P1 | PERC-06 | Theme contrast | All themes | Verify Light/Dark/HCW/HCB |

**Key Actions:**
1. Conduct manual color usage audit (verify info not conveyed by color alone)
2. Test all pages at 200% browser zoom
3. Test responsive reflow at 320px width
4. Verify all 4 themes meet contrast requirements
5. Document any issues found during manual testing

**Estimated Time:** 2-3 hours (manual testing only)

### Phase 3: Operable Fixes

**Estimated Effort:** Medium
**Automated Violations to Fix:** 0
**Manual Testing Required:** Yes

| Priority | Requirement | Issue | Component/Page | Fix Approach |
|----------|-------------|-------|----------------|--------------|
| P0 | OPER-01 | Keyboard access | All interactive elements | Tab through entire site |
| P0 | OPER-02 | Keyboard traps | Modal, ChatWidget | Test escape from all dialogs |
| P0 | OPER-03 | Skip links | Layout | Add/verify skip link |
| P1 | OPER-04 | Focus visible | All elements | No issues found - verify visually |
| P1 | OPER-05 | Focus order | All pages | Verify logical tab sequence |
| P2 | OPER-06 | Touch targets | Mobile | Verify 44x44px minimum |
| P2 | OPER-07 | Flashing | Animations | No animations >3Hz detected |

**Key Actions:**
1. Full keyboard-only navigation test on all pages
2. Verify Modal has working focus trap with Escape exit
3. Add skip link to layout if missing
4. Ensure ChatWidget is keyboard accessible
5. Test mobile menu keyboard interaction
6. Verify arrow key navigation in Tabs component

**Estimated Time:** 3-4 hours (testing + potential fixes)

### Phase 4: Understandable Fixes

**Estimated Effort:** Low
**Automated Violations to Fix:** 0
**Manual Testing Required:** Yes

| Priority | Requirement | Issue | Component/Page | Fix Approach |
|----------|-------------|-------|----------------|--------------|
| - | UNDR-01 | Language | html lang | Passing - verified |
| - | UNDR-02 | Form labels | ContactForm | Passing - verified |
| P1 | UNDR-03 | Error messages | ContactForm | Verify screen reader announces errors |
| P1 | UNDR-04 | Required fields | ContactForm | Verify indication method |
| P1 | UNDR-05 | Error suggestions | ContactForm | Verify helpful messages |
| P2 | UNDR-06 | Consistent nav | All pages | Verify same order |

**Key Actions:**
1. Test ContactForm with screen reader
2. Verify error messages are descriptive and linked to fields
3. Ensure required fields have clear indication
4. Verify navigation consistency across all pages

**Estimated Time:** 1-2 hours

### Phase 5: Robust Fixes

**Estimated Effort:** Very Low
**Automated Violations to Fix:** 11 (single fix resolves all)
**Manual Testing Required:** Yes

| Priority | Requirement | Count | Component/Page | Fix Approach |
|----------|-------------|-------|----------------|--------------|
| **P0** | RBST-03 | **11** | **ToastProvider** | **Add `role="status"` to container** |
| - | RBST-01 | 0 | All pages | Passing |
| - | RBST-02 | 0 | All pages | Passing |
| P1 | RBST-04 | - | Toast, ChatWidget | Verify live region announcements |
| P1 | RBST-05 | - | All dynamic content | Verify AT announcements |

**Key Actions:**
1. **CRITICAL:** Update `/providers/ToastProvider.tsx`:
   ```tsx
   // Change:
   <div aria-live="polite" aria-label="Notifications">

   // To:
   <div role="status" aria-live="polite" aria-label="Notifications">
   ```
2. Re-run automated audit to verify 0 violations
3. Test toast announcements with VoiceOver
4. Verify ChatWidget live region announcements

**Estimated Time:** 30 minutes (code fix + verification)

---

## Phase Execution Order

Based on the audit findings, recommended execution order:

```
Phase 5 (Robust)     ─────> 30 min  ─────> 0 violations
     ↓
Phase 2 (Perceivable) ────> 2-3 hrs ─────> Manual testing
     ↓
Phase 3 (Operable)   ────> 3-4 hrs ─────> Keyboard testing
     ↓
Phase 4 (Understandable) -> 1-2 hrs ─────> Form testing
     ↓
Phase 6 (Component)  ────> TBD     ─────> Fix issues found
     ↓
Phase 7 (Page-Level) ────> TBD     ─────> Full page audits
     ↓
Phase 8 (Final)      ────> TBD     ─────> Screen reader verification
```

**Recommendation:** Start with Phase 5 to immediately eliminate all automated violations with a single component fix.

---

## Success Criteria

Phase 1 is complete when:
- [x] axe-core audit runs without errors
- [x] Baseline violations documented with severity
- [x] Manual testing checklist created
- [x] @axe-core/playwright configured for page-level tests
- [x] Baseline report with remediation plan created

All Phase 1 success criteria have been met. Next phases can begin.

---

## Appendix: Data Sources

- **Automated Audit:** tests/a11y/audit-results/audit-results.json
- **Violation Summary:** .planning/a11y-audit/phases/01-audit-infrastructure/VIOLATIONS.md
- **Manual Checklist:** .planning/a11y-audit/phases/01-audit-infrastructure/MANUAL-TESTING-CHECKLIST.md
- **WCAG Reference:** .planning/a11y-audit/research/STANDARDS.md
- **Project Requirements:** .planning/a11y-audit/REQUIREMENTS.md

---
*Report generated: 2026-01-27*
*Last updated: 2026-01-27*
