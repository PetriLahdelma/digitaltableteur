# Phase 7: Page-Level Verification - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify that each public page on the Digitaltableteur website passes complete WCAG 2.1 AA compliance. Both automated (axe-core) and manual testing protocols are used. This phase validates that all fixes from Phases 1-6 work correctly at the page level.

</domain>

<decisions>
## Implementation Decisions

### Verification Scope
- All public routes included (not just core 5 pages)
- All 4 themes per page: Light, Dark, High Contrast Black (HCB), High Contrast White (HCW)
- All dynamic pages verified individually (every blog post, every work project)
- All 3 language variants: English, Finnish, Swedish

### Pass/Fail Criteria
- Zero automated violations threshold — any axe-core violation fails the page
- All manual checklist items must pass
- Documented exceptions allowed with justification and remediation note (e.g., third-party embeds)
- Pre-existing issues from earlier phases must be resolved — page fails if any known issue unfixed

### Audit Documentation
- Full report per page (individual markdown file with all results)
- No visual evidence required — text reports reproducible via test commands
- Reports stored in `tests/a11y/page-reports/`
- Exception documentation as per-page section within each report

### Manual Test Coverage
- Full Phase 1 MANUAL-TESTING-CHECKLIST.md for every page
- VoiceOver (macOS/Safari) + NVDA (Windows/Firefox) screen reader testing
- Full keyboard-only navigation audit per page
- Full 320px reflow + 200% zoom verification per page

### Claude's Discretion
- Report file naming convention
- Order of page verification
- How to group similar pages (e.g., all blog posts together)
- Test execution parallelization strategy

</decisions>

<specifics>
## Specific Ideas

- Leverage existing Playwright infrastructure from Phase 1-4 test suites
- Reuse `tests/a11y/audit-results/` pattern for JSON output
- Cross-reference against REQUIREMENTS.md status for each page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-page-level-verification*
*Context gathered: 2026-01-30*
