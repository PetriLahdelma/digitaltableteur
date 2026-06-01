# Phase 8: Final Verification - Research

**Researched:** 2026-01-30
**Domain:** Manual accessibility verification and documentation
**Confidence:** HIGH

## Summary

This research documents the methodology and deliverables for completing manual accessibility verification of the Digitaltableteur site. Phase 8 is the final phase of an 8-phase accessibility audit project. With automated testing complete (188/188 page combinations pass axe-core), this phase focuses on what automation cannot verify: real assistive technology experiences, keyboard navigation flows, theme compatibility, and zoom behavior.

The phase produces three key outputs:
1. Manual testing verification with VoiceOver (primary) and NVDA (secondary)
2. Internal audit report documenting complete testing methodology and results
3. Public accessibility statement with full transparency for the `/accessibility` page

**Primary recommendation:** Follow a structured page-by-page manual testing workflow using the existing MANUAL-TESTING-CHECKLIST.md as foundation, with Claude providing step-by-step guidance while the user executes tests and reports findings. Fix any issues immediately before continuing. Document everything in standardized report format.

## Standard Stack

The established tools for manual accessibility verification:

### Core Testing Tools
| Tool | Version/Platform | Purpose | Why Standard |
|------|------------------|---------|--------------|
| VoiceOver | macOS 15+ / Safari | Primary screen reader testing | Best macOS screen reader, 15% market share, already accessible |
| NVDA | Windows / Firefox | Secondary screen reader testing | Free, 65% market share, industry standard |
| Chrome DevTools | Latest | Forced colors emulation, focus visualization | Built-in, no install required |
| WebAIM Contrast Checker | Web | Manual contrast verification | Industry standard, free |

### Documentation Tools
| Tool | Purpose | When to Use |
|------|---------|-------------|
| VPAT 2.5 WCAG Edition | Procurement documentation | For B2B/enterprise compliance documentation |
| W3C Report Template | Structured audit report | For detailed internal documentation |
| Accessibility Statement | Public transparency | For `/accessibility` page |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| WAVE Extension | Chrome/Firefox | Visual issue identification | Quick verification during testing |
| Colour Contrast Analyser | Desktop app | Precise contrast measurement | When browser tools insufficient |
| Edge DevTools | Latest | Forced colors emulation on macOS | Testing Windows high contrast on Mac |

**Installation:**
```bash
# NVDA (Windows only - free download)
# https://www.nvaccess.org/download/

# No additional npm packages needed - all tools are browser-based or OS-native
```

## Architecture Patterns

### Recommended Testing Flow Structure
```
Testing Session/
├── Page Under Test/
│   ├── Screen Reader Test (VoiceOver then NVDA)
│   │   ├── Structure verification (landmarks, headings)
│   │   ├── Content verification (alt text, labels)
│   │   ├── Interactive verification (forms, buttons, modals)
│   │   └── Dynamic content verification (live regions)
│   ├── Keyboard Test
│   │   ├── Tab order verification
│   │   ├── Focus visibility check
│   │   ├── Interactive element activation
│   │   └── Keyboard trap check
│   ├── Theme Test (all 4 themes)
│   │   ├── Light theme
│   │   ├── Dark theme
│   │   ├── High Contrast Black
│   │   └── High Contrast White
│   └── Zoom Test
│       ├── 200% browser zoom
│       └── Text spacing override test
└── Issue Found → Fix Immediately → Retest → Continue
```

### Pattern 1: Structured Screen Reader Testing
**What:** Systematic verification of screen reader announcements per page
**When to use:** Every page during final verification
**Example:**
```markdown
## Page: /contact

### VoiceOver Test (macOS + Safari)
| Element | Expected Announcement | Actual | Pass |
|---------|----------------------|--------|------|
| Page load | "Digitaltableteur Contact, web content" | [tester fills] | [ ] |
| Skip link | "Skip to main content, link" | [tester fills] | [ ] |
| H1 | "Contact, heading level 1" | [tester fills] | [ ] |
| Name field | "Your name, required, edit text" | [tester fills] | [ ] |
| Submit button | "Send message, button" | [tester fills] | [ ] |
```

### Pattern 2: Fix-Then-Continue Workflow
**What:** Stop testing, fix issue, retest, then continue
**When to use:** Any time an issue is found during verification
**Rationale:** Zero tolerance for issues since automated testing already passed 100%. Manual testing validates, not discovers. Any issue found indicates a gap that must be fixed immediately.
**Example:**
```
1. Tester discovers: "Submit button announces 'button' without name"
2. Stop testing current page
3. Claude investigates and provides fix
4. User applies fix
5. User retests the specific element
6. If passes, continue from where testing stopped
7. If fails, iterate on fix
```

### Anti-Patterns to Avoid
- **Batch issue collection:** Don't collect all issues then fix later. Fix immediately while context is fresh.
- **Skipping themes:** Don't test only one theme. All 4 themes must be verified.
- **VoiceOver-only testing:** Always test NVDA as secondary screen reader for coverage.
- **Skipping pages:** All 31 pages need verification, no shortcuts.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| VPAT documentation | Custom format | ITI VPAT 2.5 WCAG template | Industry standard, recognized by procurement teams |
| Accessibility statement | Ad-hoc text | W3C report template structure | Legal defensibility, completeness |
| Screen reader testing scripts | Custom test suite | Manual testing with structured checklist | Screen reader automation unreliable, manual is gold standard |
| Contrast verification | Eyeball judgment | WebAIM Contrast Checker / CCA | Legal requirement for specific ratios |
| High contrast testing | Custom CSS | Windows/Edge forced colors emulation | Tests actual system behavior |

**Key insight:** Manual accessibility testing cannot be fully automated. Screen reader behavior varies between versions and configurations. The human experience is the definitive test. Tools assist but don't replace human verification.

## Common Pitfalls

### Pitfall 1: Testing Only VoiceOver
**What goes wrong:** Issues that only appear in NVDA are missed
**Why it happens:** VoiceOver is convenient on Mac development machines
**How to avoid:** Always test both screen readers per the CONTEXT.md decision
**Warning signs:** "Works in VoiceOver" assumed to mean "works everywhere"

### Pitfall 2: Assuming Automated Pass Means Full Compliance
**What goes wrong:** Screen reader announcement quality issues missed
**Why it happens:** axe-core tests DOM structure, not actual screen reader experience
**How to avoid:** Verify actual announcements match expected behavior
**Warning signs:** ARIA attributes present but content not meaningful

### Pitfall 3: Testing High Contrast in Browser Only
**What goes wrong:** Actual Windows High Contrast Mode behaves differently
**Why it happens:** Browser emulation uses single theme, not real Windows behavior
**How to avoid:** Use Edge DevTools emulation at minimum; real Windows testing preferred
**Warning signs:** "Works in DevTools emulation" but users report issues

### Pitfall 4: Incomplete Focus Indicator Testing
**What goes wrong:** Focus visible in one theme but invisible in another
**Why it happens:** Focus ring color may have insufficient contrast against specific theme backgrounds
**How to avoid:** Test focus visibility in ALL 4 themes
**Warning signs:** Focus indicator uses fixed color without theme adaptation

### Pitfall 5: Skipping Dynamic Content Verification
**What goes wrong:** Toast messages, form errors, chat messages not announced
**Why it happens:** Static page structure looks fine; live regions require interaction testing
**How to avoid:** Trigger all dynamic content types and verify announcement
**Warning signs:** Live regions exist in code but content changes silently

### Pitfall 6: Unclear Audit Documentation
**What goes wrong:** Audit report lacks evidence, testing dates, or methodology details
**Why it happens:** Focus on pass/fail without documenting process
**How to avoid:** Use standardized report template, document everything
**Warning signs:** Report can't answer "how was this tested?" or "when?"

## Code Examples

No code changes expected in this phase. This is verification, not implementation.

### VoiceOver Quick Reference (for testing)
```
Enable VoiceOver:  Cmd+F5
VoiceOver key (VO): Ctrl+Option

Navigation:
VO+Right Arrow    - Next item
VO+Left Arrow     - Previous item
VO+A              - Read all from here
VO+U              - Open rotor (landmarks, headings, links, forms)
VO+Space          - Activate/click item
Ctrl              - Stop speaking

Rotor navigation (after VO+U):
Left/Right Arrow  - Switch category (headings, landmarks, links)
Up/Down Arrow     - Navigate within category
Enter             - Go to selected item
Escape            - Close rotor
```

### NVDA Quick Reference (for testing)
```
NVDA key: Insert (or Caps Lock if configured)

Navigation:
H / Shift+H       - Next/previous heading
D / Shift+D       - Next/previous landmark
K / Shift+K       - Next/previous link
F / Shift+F       - Next/previous form field
B / Shift+B       - Next/previous button
Insert+F7         - Elements list (headings, links, landmarks)

Reading:
Insert+Down       - Start reading
Ctrl              - Stop reading
Insert+T          - Open Speech Viewer (visual output)

Best browser: Firefox
```

### Forced Colors Emulation (Chrome DevTools)
```
1. Open DevTools (F12 or Cmd+Shift+I)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "rendering" and select "Show Rendering"
4. Scroll to "Emulate CSS media feature forced-colors"
5. Select "forced-colors:active"
```

### Browser Zoom Test (200%)
```
Zoom in:  Cmd++ (Mac) / Ctrl++ (Windows)
Zoom out: Cmd+- (Mac) / Ctrl+- (Windows)
Reset:    Cmd+0 (Mac) / Ctrl+0 (Windows)

Test at: 100%, 150%, 200%
Verify:  No horizontal scroll, no content cut off, no overlapping text
```

## Deliverables Structure

### 1. Internal Audit Report: `.planning/FINAL-AUDIT-REPORT.md`
```markdown
# Digitaltableteur Accessibility Audit Report

**Audit Completed:** [date]
**Standard:** WCAG 2.1 Level AA
**Overall Result:** [Conforms / Partially Conforms / Does Not Conform]

## Executive Summary
[2-3 paragraphs: scope, methodology, key findings, recommendations]

## Scope
- **Pages tested:** 31 public pages
- **Standards applied:** WCAG 2.1 AA (50 success criteria)
- **Assistive technologies:** VoiceOver (macOS/Safari), NVDA (Windows/Firefox)
- **Browsers:** Safari, Firefox, Chrome
- **Themes:** Light, Dark, High Contrast Black, High Contrast White
- **Languages:** EN, FI, SV

## Methodology
### Automated Testing
- Tool: axe-core via @axe-core/playwright
- Coverage: 188 page/theme/language combinations
- Result: 0 violations

### Manual Testing
- Screen readers: VoiceOver (primary), NVDA (secondary)
- Keyboard navigation: Tab, arrow keys, Enter, Space, Escape
- Visual inspection: Focus visibility, contrast, zoom
- Duration: [X] hours

## Results Summary
| Category | Tested | Passed | Issues Found | Issues Fixed |
|----------|--------|--------|--------------|--------------|
| Perceivable | [X] | [X] | [X] | [X] |
| Operable | [X] | [X] | [X] | [X] |
| Understandable | [X] | [X] | [X] | [X] |
| Robust | [X] | [X] | [X] | [X] |

## Detailed Results by Page
[Per-page testing results with pass/fail for each test type]

## Issues Found and Remediation
[Any issues discovered during manual testing and their fixes]

## Appendices
- A: Full page test results
- B: Screen reader test transcripts
- C: Testing methodology details
```

### 2. Public Accessibility Statement: `/accessibility` page content
```markdown
# Accessibility Statement

**Last updated:** [date]
**Compliance target:** WCAG 2.1 Level AA

## Our Commitment
Digitaltableteur is committed to ensuring digital accessibility for people with disabilities.

## Conformance Status
[Site name] is [fully conformant / partially conformant / non-conformant] with WCAG 2.1 Level AA.

## Technical Specifications
This site uses the following technologies:
- HTML5
- CSS (with CSS custom properties)
- JavaScript (React 19, Next.js 16)
- ARIA (Accessible Rich Internet Applications)

Accessibility features rely on:
- Semantic HTML structure
- Keyboard navigation
- Screen reader compatibility
- High contrast theme options
- Responsive design (320px minimum)

## Testing
We tested this site using:
- Automated: axe-core accessibility testing library
- Screen readers: VoiceOver (macOS/Safari), NVDA (Windows/Firefox)
- Keyboard: Full keyboard navigation verification
- Visual: Color contrast, zoom to 200%, high contrast modes

## Known Limitations
[List any known accessibility issues with workarounds and remediation timeline]

## Feedback
We welcome your feedback on the accessibility of this site. Please contact us:
- Email: [contact email]
- Contact form: [/contact link]

We aim to respond to accessibility feedback within [X] business days.

## Assessment Information
- **Audit date:** [date]
- **Audited by:** [internal/external]
- **Standard:** WCAG 2.1 Level AA
```

### 3. VPAT 2.5 WCAG Edition (Optional but Recommended)

Per CONTEXT.md decision, create VPAT for potential B2B/enterprise clients.

**Location:** `.planning/VPAT-2.5-WCAG.md`

**Key sections to complete:**
1. Product Information (name, version, product description)
2. Evaluation Methods Used (testing tools, assistive technologies)
3. WCAG 2.1 AA Criteria Table:
   - For each success criterion: Supports / Partially Supports / Does Not Support / Not Applicable
   - Remarks explaining how conformance is achieved or what limitations exist

**Conformance levels:**
| Level | Definition |
|-------|------------|
| Supports | Functionality meets criterion without known defects |
| Partially Supports | Some functionality does not meet criterion |
| Does Not Support | Most functionality does not meet criterion |
| Not Applicable | Criterion not relevant to this product |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `-ms-high-contrast` CSS | `forced-colors` media query | 2024 deprecation announcement | Use standard CSS for high contrast |
| WCAG 2.1 AA as minimum | WCAG 2.2 AA emerging | WCAG 2.2 published 2023 | 2.1 AA still acceptable for compliance |
| Manual screen reader only | Automated + Manual hybrid | Industry shift 2020-2024 | Automation catches ~30-40%, manual catches rest |
| Single screen reader testing | Multiple AT testing | Best practice emerging | VoiceOver + NVDA minimum recommended |
| VPAT 2.4 | VPAT 2.5 | April 2025 | Updated structure, same purpose |

**Deprecated/outdated:**
- `-ms-high-contrast` CSS media query: Use `forced-colors` instead
- VPAT 2.4: Use VPAT 2.5Rev (April 2025) version
- Testing only with mouse: Keyboard testing is mandatory

## Open Questions

Things that couldn't be fully resolved:

1. **NVDA on Windows availability**
   - What we know: CONTEXT.md specifies VoiceOver primary, NVDA secondary
   - What's unclear: Whether Windows testing environment is available
   - Recommendation: Test with VoiceOver first; document NVDA as "not tested" if unavailable, or use cloud service like Assistiv Labs

2. **ChatWidget live region behavior**
   - What we know: PATTERNS.md documents gaps in message container live region
   - What's unclear: Whether RBST-04/RBST-05 screen reader status message fixes are complete
   - Recommendation: Prioritize ChatWidget screen reader testing early in manual verification

3. **High Contrast theme vs Windows Forced Colors**
   - What we know: Site has built-in HCB/HCW themes; Windows also has forced colors
   - What's unclear: Whether built-in themes are sufficient or Windows forced colors also needs testing
   - Recommendation: Test both built-in high contrast themes AND Windows forced colors emulation

## Sources

### Primary (HIGH confidence)
- [W3C WAI Evaluation Report Template](https://www.w3.org/WAI/test-evaluate/report-template/) - Official report structure
- [ITI VPAT Templates](https://www.itic.org/policy/accessibility/vpat) - VPAT 2.5 official source
- [Next.js Accessibility Architecture](https://nextjs.org/docs/architecture/accessibility) - Framework guidance
- [WebAIM Screen Reader Survey](https://webaim.org/projects/screenreadersurvey10/) - Market share data
- [Microsoft Forced Colors Documentation](https://learn.microsoft.com/en-us/fluent-ui/web-components/design-system/high-contrast) - High contrast CSS

### Secondary (MEDIUM confidence)
- [Smashing Magazine: Windows High Contrast Mode Guide](https://www.smashingmagazine.com/2022/06/guide-windows-high-contrast-mode/) - Testing methodology
- [TestParty Accessibility Audit Reports Guide](https://testparty.ai/blog/accessibility-audit-reports-complete-guide-for-2025) - Report structure
- [Harvard NVDA Testing Guide](https://accessibility.huit.harvard.edu/nvda) - NVDA commands

### Tertiary (Project-specific, HIGH confidence)
- `.planning/phases/01-audit-infrastructure/MANUAL-TESTING-CHECKLIST.md` - Existing checklist
- `.planning/research/TOOLS.md` - Tool documentation
- `.planning/research/PATTERNS.md` - ARIA patterns
- `.planning/research/PITFALLS.md` - Common mistakes

## Metadata

**Confidence breakdown:**
- Screen reader testing methodology: HIGH - Established practices, documented extensively
- Keyboard testing: HIGH - Straightforward, well-documented
- High contrast testing: MEDIUM - Some ambiguity between theme vs forced colors
- Report deliverables: HIGH - W3C template and VPAT are standardized
- VPAT structure: HIGH - Official ITI templates available

**Research date:** 2026-01-30
**Valid until:** 2026-06-30 (stable domain, 6-month validity)
