# Phase 3: Operable Fixes - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all WCAG Principle 2 (Operable) violations. Ensure all functionality works via keyboard only, focus is visible on all interactive elements, focus order is logical, no keyboard traps exist, and touch targets meet minimum size requirements.

</domain>

<decisions>
## Implementation Decisions

### Skip Link Placement
- Position: Top-left corner, hidden until focused
- Target: Single "Skip to main content" link targeting `<main>` element
- Visibility: Only appears on keyboard focus (standard pattern)
- Text: "Skip to main content" — clear, standard wording

### Focus Indicator Styling
- Style: Custom outline using design system colors
- Color: Theme-aware — different focus colors per theme for optimal contrast
- Trigger: `:focus-visible` only — no focus ring on mouse click
- Thickness: 2px — meets WCAG minimum, standard visible thickness

### Keyboard Trap Handling
- Modal focus: Trap focus inside modal until dismissed
- Escape key: Close modal and return focus to trigger element
- Initial focus: First focusable element inside modal
- ChatWidget: Trap focus when expanded — user must explicitly close to return to page

### Touch Target Sizing
- Responsive: Larger touch targets on mobile than desktop
- Inline links: Add vertical padding to increase tap area without visual change
- Icon buttons: Invisible padding — larger hit area, no visual change

### Claude's Discretion
- Exact touch target sizes (44x44px vs 24x24px based on component audit)
- Specific focus ring colors per theme
- Implementation details for skip link animation/transition

</decisions>

<specifics>
## Specific Ideas

- Focus indicators should use `:focus-visible` to avoid cluttering mouse users' experience
- Skip link should use standard pattern — hidden but accessible, revealed on first Tab
- Modal focus trap should restore focus to the exact element that triggered the modal
- ChatWidget behaves like a modal when expanded (focus trapped)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-operable-fixes*
*Context gathered: 2026-01-30*
