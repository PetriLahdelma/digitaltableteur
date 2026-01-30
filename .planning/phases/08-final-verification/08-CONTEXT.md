# Phase 8: Final Verification - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete manual screen reader, keyboard, and theme testing to validate WCAG 2.1 AA compliance across all 31 public pages. This phase validates that automated fixes (Phases 1-7) work correctly with real assistive technologies. No new fixes are implemented here — issues found trigger immediate remediation before continuing.

</domain>

<decisions>
## Implementation Decisions

### Screen Reader Testing Scope
- Test with both VoiceOver (macOS/Safari) as primary and NVDA (Windows/Firefox) as secondary
- Test all 31 public pages (5 core + 11 work + 12 blog + 3 legal)
- Full walkthrough per page: navigate every element, verify all announcements, test all interactions
- Test all 4 themes per page: Light, Dark, High Contrast Black, High Contrast White
- Desktop testing only (macOS + Windows); mobile iOS VoiceOver deferred

### Testing Workflow
- Use structured checklist with pre-built pass/fail checkboxes and notes field per page
- Zero tolerance pass criteria: any screen reader problem fails the page
- Fix immediately: stop testing, fix the issue, retest, then continue
- Claude guides, you execute: step-by-step instructions provided, user reports what they hear/see

### Report Deliverables
- Both internal detailed report AND public accessibility statement
- Internal: `.planning/FINAL-AUDIT-REPORT.md` — developer-facing detailed results
- Public: `/accessibility` page with full transparency (compliance level + techniques + known limitations + testing methodology)
- Evidence: summary statistics only (X pages tested, Y% pass rate, dates tested)
- VPAT 2.4: Yes, create Voluntary Product Accessibility Template for procurement contexts

### Verification Checklist
- Checklist includes exact expected announcements (e.g., "Submit, button" not just "button role announced")
- Tester verifies screen reader says the expected text

### Claude's Discretion
- Checklist granularity approach (component-based, WCAG-based, or interaction-based — Claude to determine optimal structure)
- ChatWidget verification depth (Claude to determine appropriate test coverage for chat interactions)
- Checklist template design and organization
- VPAT 2.4 structure and formatting

</decisions>

<specifics>
## Specific Ideas

- VoiceOver + NVDA covers ~85% of screen reader market share
- Pass criteria is strict (zero issues) because automated testing already achieved 100% — manual should validate, not discover
- "Fix immediately" workflow ensures issues don't compound; easier to fix one thing than debug multiple
- VPAT 2.4 useful for any potential B2B/enterprise clients who require accessibility documentation
- Full transparency on public statement builds trust and demonstrates commitment to accessibility

</specifics>

<deferred>
## Deferred Ideas

- iOS VoiceOver mobile testing — could be added as Phase 9 if desktop testing reveals mobile-specific concerns
- Video recordings of testing sessions — documentation decision, not in scope for verification phase

</deferred>

---

*Phase: 08-final-verification*
*Context gathered: 2026-01-30*
