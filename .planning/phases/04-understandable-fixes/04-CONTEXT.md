# Phase 4: Understandable Fixes - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all WCAG Principle 3 (Understandable) violations: page language declaration, form labels, error messaging, required field indication, and navigation consistency. Requirements UNDR-01 through UNDR-06.

</domain>

<decisions>
## Implementation Decisions

### Language handling
- HTML `lang` attribute updates dynamically when user switches language via i18next
- Blog and work content is English-only across all languages — mark with `lang="en"` on content container
- Add a language notice when English-only content displays on FI/SV pages
- Language notice: Claude determines placement and visual style (should be informative but unobtrusive)
- Language switcher shows no distinction between UI translation and content availability — just switches language
- Screen reader experience for language notice: Claude determines best approach (in-flow vs announced)

### Form labeling patterns
- Labels positioned above inputs (stacked layout)
- Required fields marked with both: visual asterisk (*) AND "(required)" for screen readers via aria-label
- Only required fields are marked — optional fields have no indicator
- Placeholder usage: Claude determines based on current patterns and a11y best practices

### Error messaging strategy
- Hybrid validation timing: on blur for simple checks (format), on submit for complex validation
- Error summary at top of form: Claude determines based on form complexity and a11y best practices
- Error tone: match existing brand voice (Claude to audit current messaging patterns)
- Email validation: suggest corrections for common typos (gmail, hotmail domain typos)

### Navigation consistency
- Verification approach: both manual review and lightweight automated test
- Mobile drawer: exact same items in exact same order as desktop navigation
- Current page indication: visual highlight + `aria-current="page"` for screen readers
- Footer navigation: can differ from header (utility links like privacy, terms allowed)
- Page change announcement: Claude determines best approach for Next.js SPA navigation

### Claude's Discretion
- HTML lang attribute change mechanism (i18next hook vs layout effect)
- Language notice placement (near title vs top of content)
- Language notice visual style (muted text vs badge/tag)
- Screen reader announcement strategy for language notice
- Placeholder text usage patterns
- Error summary implementation (if needed based on form complexity)
- Brand voice analysis for error messages
- Page change announcement approach for SPA navigation

</decisions>

<specifics>
## Specific Ideas

- Language notice should be "not too flashy nor too subtle" — informative but doesn't distract from content
- Email suggestions should catch common domain typos (gmail.com vs gmial.com, etc.)
- Required field pattern: asterisk for visual users, full "(required)" text for screen readers

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-understandable-fixes*
*Context gathered: 2026-01-30*
