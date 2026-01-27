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
