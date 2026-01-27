# Accessibility Audit Baseline - VIOLATIONS

**Audit Date:** 2026-01-27
**Standard:** WCAG 2.1 AA
**Tool:** axe-core via @axe-core/playwright
**Pages Audited:** 11

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Violations | 11 |
| Critical (serious/critical impact) | 11 |
| Major (moderate impact) | 0 |
| Minor (minor impact) | 0 |
| Pages with Issues | 11/11 |
| Unique Violation Types | 1 |

### Key Finding

All 11 pages share the **same single violation** originating from a global component (Toaster). This means fixing one component will resolve all 11 violations.

## Violations by Impact

### Critical (P0) - Serious/Critical Impact

These violations completely block access for some users.

| Rule | Count | Pages | Description |
|------|-------|-------|-------------|
| aria-prohibited-attr | 11 | all pages | Elements must only use permitted ARIA attributes |

### Major (P1) - Moderate Impact

These violations create significant barriers.

| Rule | Count | Pages | Description |
|------|-------|-------|-------------|
| *none* | - | - | - |

### Minor (P2) - Minor Impact

These violations cause inconvenience but don't block access.

| Rule | Count | Pages | Description |
|------|-------|-------|-------------|
| *none* | - | - | - |

## Violation Details

### aria-prohibited-attr (Serious)

**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)

**Description:** Ensure ARIA attributes are not prohibited for an element's role

**Impact:** Serious - Screen reader users may receive incorrect information about the element's purpose

**Learn More:** https://dequeuniversity.com/rules/axe/4.11/aria-prohibited-attr

**Affected Element:**
```html
<div class="fixed z-50 flex flex-col gap-2 pointer-events-none bottom-4 right-4"
     aria-live="polite"
     aria-label="Notifications">
</div>
```

**Issue:** The `aria-label` attribute is prohibited on elements with implicit `role="generic"` (which `<div>` elements have by default when no explicit role is set). The `aria-live="polite"` is valid, but `aria-label` requires an explicit role that supports naming.

**Root Cause:** Toaster component in `nextjs-app/shared/components/Toaster/Toaster.tsx` (lines 100-107)

> Note: There is also a separate `/providers/ToastProvider.tsx` file, but that one delegates to a Toast component and does not contain the aria-live container. The violation originates from `Toaster.tsx`.

**How to Fix:**
1. Add an explicit role to the container: `role="status"` or `role="log"`
2. OR remove `aria-label` and use a visually hidden label
3. OR use `role="region"` which supports `aria-label`

**Recommended Fix:**
```html
<div class="fixed z-50 flex flex-col gap-2 pointer-events-none bottom-4 right-4"
     role="status"
     aria-live="polite"
     aria-label="Notifications">
</div>
```

## Violations by Page

### Home (/)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### About (/about)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### Work (/work)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### Blog (/blog)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### Contact (/contact)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### Work - SAP Build Apps (/work/sap-build-apps)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.pointer-events-none` (Toaster) | Add `role="status"` to container |

### Work - Helsinki Design System (/work/helsinki-design-system)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.pointer-events-none` (Toaster) | Add `role="status"` to container |

### Privacy Policy (/privacy-policy)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### Accessibility (/accessibility)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### AI Use (/ai-use)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

### 404 Page (/this-page-does-not-exist-404)

| Severity | Rule | Element | Fix |
|----------|------|---------|-----|
| serious | aria-prohibited-attr | `.fixed` (Toaster) | Add `role="status"` to container |

## Most Common Violations

Top violations across all pages (ranked by frequency):

1. **aria-prohibited-attr** - 11 instances (100% of pages)
   - **Description:** Elements must only use permitted ARIA attributes
   - **How to fix:** Add explicit `role="status"` to the Toaster container element in `nextjs-app/shared/components/Toaster/Toaster.tsx`
   - **Learn more:** https://dequeuniversity.com/rules/axe/4.11/aria-prohibited-attr
   - **Effort:** Low (single component fix)
   - **Impact:** High (fixes all 11 violations)

## Audit Statistics

| Page | Violations | Passes | Incomplete |
|------|------------|--------|------------|
| home | 1 | 24 | 1 |
| about | 1 | 24 | 1 |
| work | 1 | 24 | 2 |
| blog | 1 | 24 | 1 |
| contact | 1 | 24 | 0 |
| work-sap-build-apps | 1 | 24 | 0 |
| work-helsinki-design-system | 1 | 24 | 1 |
| privacy | 1 | 24 | 1 |
| accessibility | 1 | 24 | 1 |
| ai-use | 1 | 24 | 1 |
| 404 | 1 | 24 | 0 |
| **TOTAL** | **11** | **264** | **9** |

**Pass Rate:** 264 / (264 + 11) = **96%** (before fixes)

## Next Steps

Based on this audit:

1. **Phase 2 (Perceivable):** No contrast or alt text issues found in automated scan
2. **Phase 3 (Operable):** Manual keyboard testing needed (see MANUAL-TESTING-CHECKLIST.md)
3. **Phase 4 (Understandable):** Manual form testing needed (see MANUAL-TESTING-CHECKLIST.md)
4. **Phase 5 (Robust):** Fix Toaster aria-prohibited-attr (P0 - single fix resolves all)

### Priority Actions

| Priority | Component | Issue | Effort | Impact |
|----------|-----------|-------|--------|--------|
| P0 | Toaster | aria-prohibited-attr | Low | Fixes 11 violations |

### Components Requiring Manual Testing

The automated audit found few issues, but these components identified in research need manual verification:

- **Modal:** Focus trap, escape key, aria-modal
- **Navigation:** Mobile menu keyboard access, hamburger aria-expanded
- **Forms:** Error announcements, aria-describedby
- **ChatWidget:** Focus management, aria-live regions
- **Tabs:** Arrow key navigation, aria-selected
- **Accordion:** aria-expanded, aria-controls
- **Skip Links:** Presence and functionality

## Notes

- Automated testing covers ~30-40% of WCAG criteria
- Manual testing required for keyboard navigation, screen reader compatibility
- See MANUAL-TESTING-CHECKLIST.md for comprehensive testing protocol
- All violations traceable to single global component (Toaster)

---
*Generated from tests/a11y/audit-results/audit-results.json*
*Audit completed: 2026-01-27*
*File path corrected: 2026-01-27 (ToastProvider.tsx -> Toaster.tsx)*
