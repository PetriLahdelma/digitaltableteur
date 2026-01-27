# Research Summary: WCAG 2.1 AA Accessibility Audit

**Domain:** Accessibility compliance audit for existing Next.js/React application
**Researched:** 2026-01-27
**Overall confidence:** HIGH

## Executive Summary

This research documents the complete WCAG 2.1 AA requirements for auditing the Digitaltableteur site. WCAG 2.1 AA contains 50 success criteria organized across four principles (Perceivable, Operable, Understandable, Robust). The project already has strong accessibility foundations: axe-core integrated in tests, accessibility test templates, high contrast themes, and documented a11y requirements in component generation rules.

The primary gaps to investigate during the audit will be:
1. **Manual testing coverage** - Automated tools catch only 30-57% of issues
2. **SPA-specific patterns** - Focus management, status announcements, keyboard navigation
3. **Custom widget accessibility** - Chat widget, forms, interactive components
4. **Cross-theme contrast verification** - All 4 themes need contrast validation

## Key Findings

**Standards:** WCAG 2.1 AA is the legal requirement (ADA Title II effective April 2026). Contains 50 success criteria - 30 at Level A, 20 at Level AA.

**Testing reality:** axe-core catches ~30-57% of issues. The remaining 43-70% require manual testing with assistive technologies. The project's existing `*.a11y.test.tsx` pattern is good but needs to be expanded to all components.

**React/Next.js priorities:** Focus management (2.4.x), keyboard accessibility (2.1.x), status messages (4.1.3), and Name/Role/Value (4.1.2) are the most critical areas for SPAs.

## Implications for Audit

Based on research, suggested audit phases:

1. **Automated Baseline** - Run axe-core audit on all pages/components
   - Addresses: 1.1.1, 1.3.1, 1.4.3, 2.4.2, 3.3.2, 4.1.1
   - Rationale: Establish baseline, catch low-hanging fruit quickly

2. **Component-Level Manual Testing** - Keyboard + screen reader per component
   - Addresses: 2.1.1, 2.1.2, 2.4.7, 4.1.2
   - Rationale: Component library is foundation for entire site

3. **Form and Input Accessibility** - Deep dive on ContactForm, ChatWidget
   - Addresses: 1.3.5, 3.3.1, 3.3.2, 3.3.3, 4.1.3
   - Rationale: Critical user interaction paths

4. **Navigation and Structure** - Skip links, landmarks, heading hierarchy
   - Addresses: 1.3.1, 2.4.1, 2.4.3, 2.4.5, 2.4.6
   - Rationale: Site-wide structural requirements

5. **Visual and Reflow Testing** - All viewports, text spacing, themes
   - Addresses: 1.4.3, 1.4.10, 1.4.11, 1.4.12
   - Rationale: Cross-cutting visual concerns

**Phase ordering rationale:**
- Automated first to establish baseline and find quick wins
- Component-level before page-level (foundation first)
- Forms are highest user impact
- Structure affects all pages
- Visual testing last as it's most labor-intensive

**Audit flags:**
- ChatWidget: Complex interactive component, likely needs deep investigation
- Modal: Focus trap implementation needs verification
- Theme switching: Contrast in all 4 themes needs systematic verification

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Standards (WCAG criteria) | HIGH | W3C official documentation as primary source |
| Testing coverage claims | HIGH | Multiple authoritative sources agree (30-57% automated) |
| React/Next.js patterns | HIGH | Aligned with project's existing patterns in LLM_COMPONENT_GENERATION_RULES.md |
| axe-core capabilities | HIGH | Official Deque documentation |

## Gaps to Address

- Specific component audit findings (to be discovered during actual audit)
- Assistive technology testing matrix (which AT combinations to test)
- Browser/device test matrix

## Files Created

| File | Purpose |
|------|---------|
| .planning/a11y-audit/research/STANDARDS.md | Complete WCAG 2.1 AA criteria reference with React/Next.js guidance |
| .planning/a11y-audit/research/SUMMARY.md | This summary file |

## Ready for Audit

Research complete. The STANDARDS.md file provides:
- All 50 WCAG 2.1 AA success criteria organized by principle
- Relevance to React/Next.js applications
- Testing approach (automated vs manual) for each criterion
- Implementation code patterns
- Priority ranking for this specific project
