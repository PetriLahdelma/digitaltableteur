# WCAG 2.1 AA Accessibility Standards Reference

**Project:** Digitaltableteur A11y Audit
**Researched:** 2026-01-27
**Overall Confidence:** HIGH (W3C official documentation as primary source)

---

## Executive Summary

WCAG 2.1 AA is the current legal accessibility standard required by ADA Title II (effective April 2026 for larger entities). It contains **50 success criteria** organized around four principles: Perceivable, Operable, Understandable, and Robust (POUR).

For a React 19 / Next.js 16 application with 80+ components, the most critical areas are:
1. **Keyboard accessibility** (2.1.x) - React's synthetic event system requires explicit keyboard handling
2. **Focus management** (2.4.x) - SPA navigation breaks native focus behavior
3. **Name, Role, Value** (4.1.2) - Custom components need ARIA attributes
4. **Status messages** (4.1.3) - Async operations need live region announcements
5. **Reflow/Text Spacing** (1.4.10-12) - CSS must accommodate user preferences

**Testing reality:** Automated tools (axe-core) catch ~30-57% of issues. The remaining 43-70% require manual testing with assistive technologies.

---

## Principle 1: Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

### Guideline 1.1 - Text Alternatives

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **1.1.1 Non-text Content** | A | All non-text content has text alternative | Every `<Image>`, `<Icon>`, `<svg>` needs `alt` or `aria-label` | **Automated:** axe-core detects missing alt. **Manual:** Verify alt text is meaningful, not just present |

**Implementation checklist:**
- [ ] All `<Image>` components have `alt` prop
- [ ] Decorative images use `alt=""`
- [ ] Icon-only buttons have `aria-label` or `accessibleName`
- [ ] SVG icons have `role="img"` and `aria-label` OR `aria-hidden="true"`
- [ ] Form controls with icons have visible labels

### Guideline 1.2 - Time-based Media

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **1.2.1 Audio-only/Video-only** | A | Prerecorded audio needs transcript; video needs audio track or text | Applies to any embedded media | **Manual:** Verify transcripts exist |
| **1.2.2 Captions (Prerecorded)** | A | All prerecorded audio in video has captions | Video components need captions | **Manual:** Verify caption accuracy |
| **1.2.3 Audio Description** | A | Video has audio description or text alternative | Descriptive track for visual content | **Manual:** Review descriptions |
| **1.2.4 Captions (Live)** | AA | Live audio has captions | Streaming/live video needs captions | **Manual:** Verify live caption service |
| **1.2.5 Audio Description (Prerecorded)** | AA | All prerecorded video has audio description | More rigorous than 1.2.3 | **Manual:** Verify description track |

**Note:** If your site has no audio/video content, these criteria do not apply.

### Guideline 1.3 - Adaptable

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **1.3.1 Info and Relationships** | A | Structure is programmatically determinable | Semantic HTML: proper headings, lists, tables, landmarks | **Automated:** axe detects missing landmarks, heading issues. **Manual:** Screen reader testing |
| **1.3.2 Meaningful Sequence** | A | Reading order is programmatically determinable | DOM order matches visual order; CSS doesn't reorder confusingly | **Manual:** Tab through, use screen reader |
| **1.3.3 Sensory Characteristics** | A | Instructions don't rely solely on shape/color/sound | "Click the red button" is insufficient | **Manual:** Content review |
| **1.3.4 Orientation** | AA | Content doesn't restrict to portrait/landscape | No CSS `orientation` lock | **Automated:** Check for orientation lock. **Manual:** Test both orientations |
| **1.3.5 Identify Input Purpose** | AA | Input fields support autocomplete | Use `autocomplete` attribute on form inputs | **Automated:** axe checks autocomplete values |

**React-specific implementation:**
```tsx
// Good: Semantic structure
<main>
  <nav aria-label="Main navigation">...</nav>
  <article>
    <h1>Page Title</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section</h2>
    </section>
  </article>
</main>

// Good: Autocomplete
<input type="email" autoComplete="email" />
<input type="tel" autoComplete="tel" />
```

### Guideline 1.4 - Distinguishable

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **1.4.1 Use of Color** | A | Color is not the only visual means | Error states need icons/text, not just red | **Manual:** View in grayscale |
| **1.4.2 Audio Control** | A | Auto-playing audio >3s has pause control | Any audio component needs controls | **Manual:** Check for controls |
| **1.4.3 Contrast (Minimum)** | AA | 4.5:1 for normal text, 3:1 for large text | CSS colors must meet ratios | **Automated:** axe checks contrast |
| **1.4.4 Resize Text** | AA | Text scales to 200% without loss | Use relative units (rem, em); no fixed heights | **Manual:** Zoom to 200% |
| **1.4.5 Images of Text** | AA | Use actual text, not images of text | Avoid text in images except logos | **Manual:** Content review |
| **1.4.10 Reflow** | AA | Content reflows at 320px width without horizontal scroll | Responsive CSS; no fixed widths | **Manual:** Test at 320px width |
| **1.4.11 Non-text Contrast** | AA | UI components/graphics have 3:1 contrast | Icons, borders, form controls | **Automated:** axe partial. **Manual:** Measure boundaries |
| **1.4.12 Text Spacing** | AA | Content works with increased text spacing | No fixed-height containers; use flexbox/grid | **Manual:** Apply test stylesheet |
| **1.4.13 Content on Hover/Focus** | AA | Tooltips are dismissible, hoverable, persistent | Tooltip/popover components | **Manual:** Test Escape key, hover persistence |

**CSS implementation for 1.4.12 (Text Spacing):**
```css
/* Test stylesheet - content must remain visible with these values */
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p {
  margin-bottom: 2em !important;
}
```

**CRITICAL for React apps:**
- The project already uses CSS custom properties for colors - verify they all meet contrast ratios
- High Contrast themes (HCW, HCB) must maintain even higher contrast

---

## Principle 2: Operable

User interface components and navigation must be operable.

### Guideline 2.1 - Keyboard Accessible

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **2.1.1 Keyboard** | A | All functionality available via keyboard | onClick handlers need onKeyDown; custom widgets need keyboard support | **Manual:** Navigate entire app with keyboard only |
| **2.1.2 No Keyboard Trap** | A | Focus can always be moved away | Modal focus traps must be escapable | **Manual:** Tab through all components |
| **2.1.4 Character Key Shortcuts** | A | Single-key shortcuts can be turned off/remapped | Any keyboard shortcuts using letters/numbers | **Manual:** Identify and test shortcuts |

**React implementation patterns:**
```tsx
// Bad: Click-only
<div onClick={handleAction}>Action</div>

// Good: Keyboard accessible
<button onClick={handleAction}>Action</button>

// Good: Custom keyboard handling when needed
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  Action
</div>
```

### Guideline 2.2 - Enough Time

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **2.2.1 Timing Adjustable** | A | Users can control time limits | Session timeouts, auto-logout | **Manual:** Test timeout behavior |
| **2.2.2 Pause, Stop, Hide** | A | Users can pause moving/blinking content | Carousels, animations, auto-updating content | **Manual:** Test pause controls |

**React animation handling:**
```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Guideline 2.3 - Seizures and Physical Reactions

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **2.3.1 Three Flashes** | A | Content doesn't flash >3 times/second | Video content, animations | **Manual/Tool:** PEAT analysis for video |

### Guideline 2.4 - Navigable

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **2.4.1 Bypass Blocks** | A | Skip navigation mechanism exists | Skip link to main content | **Manual:** Check skip link functionality |
| **2.4.2 Page Titled** | A | Pages have descriptive titles | Next.js `metadata` or `<title>` | **Automated:** axe checks title existence |
| **2.4.3 Focus Order** | A | Focus order is logical | Tab order matches visual flow | **Manual:** Tab through all interactive elements |
| **2.4.4 Link Purpose (In Context)** | A | Link text describes destination | No "click here"; context-dependent is OK | **Manual:** Review link text |
| **2.4.5 Multiple Ways** | AA | Multiple navigation methods exist | Site search, sitemap, navigation | **Manual:** Verify multiple paths |
| **2.4.6 Headings and Labels** | AA | Headings/labels describe content | `<Title>` components are descriptive | **Manual:** Review heading hierarchy |
| **2.4.7 Focus Visible** | AA | Focus indicator is visible | CSS focus styles; no `outline: none` | **Automated:** axe partial. **Manual:** Visual inspection |

**Next.js 16 specific - Focus management for SPA navigation:**
```tsx
// After route change, move focus to main content
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

function Layout({ children }) {
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Focus main content after navigation
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <main ref={mainRef} tabIndex={-1}>
      {children}
    </main>
  );
}
```

### Guideline 2.5 - Input Modalities

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **2.5.1 Pointer Gestures** | A | No multipoint/path-based gestures required | Swipe carousels need button alternatives | **Manual:** Test single-click alternatives |
| **2.5.2 Pointer Cancellation** | A | No up-event activation; abort possible | Events fire on mouseup/click, not mousedown | **Manual:** Test pointer abort |
| **2.5.3 Label in Name** | A | Visible label is in accessible name | Text on buttons matches aria-label | **Automated:** axe checks this |
| **2.5.4 Motion Actuation** | A | Motion-triggered functions have alternatives | Shake-to-undo needs button alternative | **Manual:** Check for motion features |

---

## Principle 3: Understandable

Information and operation of user interface must be understandable.

### Guideline 3.1 - Readable

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **3.1.1 Language of Page** | A | Page lang is programmatically set | `<html lang="en">` | **Automated:** axe checks lang attribute |
| **3.1.2 Language of Parts** | AA | Content in different language is marked | `<span lang="fi">` for Finnish text | **Manual:** Review multilingual content |

**Next.js implementation:**
```tsx
// app/layout.tsx
export default function RootLayout({ children, params }) {
  return (
    <html lang={params.locale || 'en'}>
      <body>{children}</body>
    </html>
  );
}
```

### Guideline 3.2 - Predictable

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **3.2.1 On Focus** | A | Focus doesn't trigger context change | No auto-submit on focus | **Manual:** Tab through forms |
| **3.2.2 On Input** | A | Input doesn't trigger unexpected change | Select doesn't auto-navigate without warning | **Manual:** Test form controls |
| **3.2.3 Consistent Navigation** | AA | Navigation is consistent across pages | Same nav order on all pages | **Manual:** Compare multiple pages |
| **3.2.4 Consistent Identification** | AA | Same functions have same labels | Search icon always means search | **Manual:** Review UI consistency |

### Guideline 3.3 - Input Assistance

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **3.3.1 Error Identification** | A | Errors are identified in text | Show error messages, not just red borders | **Automated:** axe partial. **Manual:** Test form errors |
| **3.3.2 Labels or Instructions** | A | Inputs have labels | All form fields have visible labels | **Automated:** axe checks label association |
| **3.3.3 Error Suggestion** | AA | Provide correction suggestions | "Email must include @" not just "Invalid" | **Manual:** Review error messages |
| **3.3.4 Error Prevention (Legal, Financial)** | AA | Reversible/confirmable for important actions | Confirmation dialogs for destructive actions | **Manual:** Test critical workflows |

**React form accessibility pattern:**
```tsx
function FormField({ label, error, id, ...props }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

---

## Principle 4: Robust

Content must be robust enough to be interpreted by assistive technologies.

### Guideline 4.1 - Compatible

| Criterion | Level | Summary | React/Next.js Relevance | Testing Approach |
|-----------|-------|---------|------------------------|------------------|
| **4.1.1 Parsing** | A | Valid HTML markup | No duplicate IDs, proper nesting | **Automated:** HTML validator, axe |
| **4.1.2 Name, Role, Value** | A | Custom components expose name/role/state | ARIA attributes on custom widgets | **Automated:** axe. **Manual:** Screen reader testing |
| **4.1.3 Status Messages** | AA | Status updates announced without focus | Toast notifications use `role="status"` or `aria-live` | **Manual:** Screen reader testing |

**Status message implementation (CRITICAL for React SPAs):**
```tsx
// Toast with live region
function Toast({ message, type }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {message}
    </div>
  );
}

// Loading state announcement
function AsyncContent({ isLoading, children }) {
  return (
    <div aria-busy={isLoading}>
      {isLoading && (
        <span role="status" aria-live="polite">
          Loading content...
        </span>
      )}
      {children}
    </div>
  );
}
```

---

## Testing Matrix: Automated vs Manual

### What axe-core CAN Test (approximately 30-57% of issues)

| Category | Specific Checks |
|----------|-----------------|
| Missing alt text | Images without alt |
| Color contrast | Text/background ratios (4.5:1, 3:1) |
| Form labels | Input/label association |
| Heading structure | Skipped heading levels |
| ARIA misuse | Invalid ARIA attributes |
| Duplicate IDs | Multiple elements with same ID |
| Link text | Empty links, generic text |
| Language attribute | Missing lang on html |
| Landmark regions | Missing main, duplicate banners |
| Autocomplete values | Invalid autocomplete tokens |
| Table structure | Missing headers |
| Button names | Empty buttons |

### What Requires MANUAL Testing (approximately 43-70% of issues)

| Criterion | Why Manual Required |
|-----------|---------------------|
| 1.1.1 Non-text Content | Tool can't verify alt text is *meaningful* |
| 1.2.x Time-based Media | Requires caption/transcript content review |
| 1.3.2 Meaningful Sequence | Tool can't determine logical order |
| 1.4.1 Use of Color | Tool can't determine information reliance |
| 1.4.10 Reflow | Requires visual inspection at 320px |
| 1.4.12 Text Spacing | Requires testing with modified spacing |
| 1.4.13 Content on Hover | Requires interaction testing |
| 2.1.1 Keyboard | Requires full keyboard navigation test |
| 2.1.2 No Keyboard Trap | Requires manual navigation |
| 2.4.3 Focus Order | Tool can't determine logical order |
| 2.4.6 Headings and Labels | Tool can't judge descriptiveness |
| 2.4.7 Focus Visible | Requires visual inspection |
| 2.5.x Input Modalities | Requires gesture/motion testing |
| 3.2.x Predictable | Requires interaction testing |
| 3.3.x Input Assistance | Error message quality is subjective |
| 4.1.3 Status Messages | Screen reader testing required |

---

## React/Next.js Specific Priorities

Based on the project context (80+ components, interactive chat, forms, i18n), prioritize these criteria:

### HIGH PRIORITY (Most likely to have issues in SPAs)

1. **2.4.7 Focus Visible** - Custom components often lose focus styles
2. **4.1.2 Name, Role, Value** - Custom widgets need proper ARIA
3. **4.1.3 Status Messages** - Chat widget, toasts, loading states
4. **2.1.1 Keyboard** - All interactions must work without mouse
5. **1.4.3 Contrast** - Verify across all 4 themes
6. **3.3.1/3.3.2 Form Errors/Labels** - ContactForm, ChatWidget inputs

### MEDIUM PRIORITY (Common issues)

7. **1.1.1 Non-text Content** - Icons need labels
8. **1.3.1 Info and Relationships** - Semantic HTML structure
9. **2.4.1 Bypass Blocks** - Skip navigation link
10. **1.4.10 Reflow** - Mobile-first design helps
11. **1.4.13 Content on Hover** - Tooltips, popovers

### LOWER PRIORITY (Less common in this type of site)

12. **1.2.x Time-based Media** - Only if video exists
13. **2.5.x Input Modalities** - Unless gesture features exist
14. **2.2.x Timing** - Unless auto-timeout features exist

---

## Testing Tools and Approach

### Automated Testing Stack (already in project)

| Tool | Coverage | Integration |
|------|----------|-------------|
| **jest-axe** | Unit tests | Already in vitest.setup.ts |
| **axe-core** | Component testing | Via `.a11y.test.tsx` files |
| **Lighthouse** | Page audits | lighthouserc.js configured |
| **Storybook a11y addon** | Component stories | Verify in storybook config |

### Manual Testing Protocol

1. **Keyboard-only navigation:** Tab through entire site without mouse
2. **Screen reader testing:** VoiceOver (Mac), NVDA (Windows)
3. **Zoom testing:** 200% zoom, verify no content loss
4. **Reflow testing:** 320px viewport width
5. **Text spacing test:** Apply custom stylesheet
6. **Theme testing:** All 4 themes (Light, Dark, HCW, HCB)
7. **Reduced motion:** Enable `prefers-reduced-motion: reduce`

### Recommended Testing Workflow

```
Phase 1: Automated baseline
  - Run axe-core on all components
  - Run Lighthouse accessibility audit
  - Fix all automated findings

Phase 2: Component-level manual testing
  - Test each component with keyboard
  - Test each component with screen reader
  - Verify focus states visually

Phase 3: Page-level integration testing
  - Full keyboard navigation path
  - Screen reader page announcements
  - Focus management on navigation

Phase 4: Cross-cutting concerns
  - All themes
  - All viewports (mobile, tablet, desktop)
  - Text spacing test
```

---

## Sources

### Primary Sources (HIGH confidence)
- [W3C WCAG 2.1 Specification](https://www.w3.org/TR/WCAG21/)
- [W3C WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Deque University WCAG 2.1 New Criteria](https://dequeuniversity.com/resources/wcag2.1/)
- [axe-core GitHub - Rule Descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

### Secondary Sources (MEDIUM confidence)
- [W3C Understanding Test Rules for WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/understanding-act-rules.html)
- [Adrian Roselli - Comparing Manual and Automated WCAG Reviews](https://adrianroselli.com/2023/01/comparing-manual-and-free-automated-wcag-reviews.html)
- [Deque - Automated Accessibility Testing Coverage Report](https://www.deque.com/automated-accessibility-testing-coverage/)
- [Accessible.org WCAG Checklist](https://accessible.org/wcag/)

### Legal Context
- [ADA Title II Web Accessibility Requirements (2026 deadline)](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/)

---

## Appendix: Complete Success Criteria Reference

### Level A (30 criteria)

| # | Criterion | Principle |
|---|-----------|-----------|
| 1.1.1 | Non-text Content | Perceivable |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | Perceivable |
| 1.2.2 | Captions (Prerecorded) | Perceivable |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | Perceivable |
| 1.3.1 | Info and Relationships | Perceivable |
| 1.3.2 | Meaningful Sequence | Perceivable |
| 1.3.3 | Sensory Characteristics | Perceivable |
| 1.4.1 | Use of Color | Perceivable |
| 1.4.2 | Audio Control | Perceivable |
| 2.1.1 | Keyboard | Operable |
| 2.1.2 | No Keyboard Trap | Operable |
| 2.1.4 | Character Key Shortcuts | Operable |
| 2.2.1 | Timing Adjustable | Operable |
| 2.2.2 | Pause, Stop, Hide | Operable |
| 2.3.1 | Three Flashes or Below Threshold | Operable |
| 2.4.1 | Bypass Blocks | Operable |
| 2.4.2 | Page Titled | Operable |
| 2.4.3 | Focus Order | Operable |
| 2.4.4 | Link Purpose (In Context) | Operable |
| 2.5.1 | Pointer Gestures | Operable |
| 2.5.2 | Pointer Cancellation | Operable |
| 2.5.3 | Label in Name | Operable |
| 2.5.4 | Motion Actuation | Operable |
| 3.1.1 | Language of Page | Understandable |
| 3.2.1 | On Focus | Understandable |
| 3.2.2 | On Input | Understandable |
| 3.3.1 | Error Identification | Understandable |
| 3.3.2 | Labels or Instructions | Understandable |
| 4.1.1 | Parsing | Robust |
| 4.1.2 | Name, Role, Value | Robust |

### Level AA (20 additional criteria)

| # | Criterion | Principle |
|---|-----------|-----------|
| 1.2.4 | Captions (Live) | Perceivable |
| 1.2.5 | Audio Description (Prerecorded) | Perceivable |
| 1.3.4 | Orientation | Perceivable |
| 1.3.5 | Identify Input Purpose | Perceivable |
| 1.4.3 | Contrast (Minimum) | Perceivable |
| 1.4.4 | Resize Text | Perceivable |
| 1.4.5 | Images of Text | Perceivable |
| 1.4.10 | Reflow | Perceivable |
| 1.4.11 | Non-text Contrast | Perceivable |
| 1.4.12 | Text Spacing | Perceivable |
| 1.4.13 | Content on Hover or Focus | Perceivable |
| 2.4.5 | Multiple Ways | Operable |
| 2.4.6 | Headings and Labels | Operable |
| 2.4.7 | Focus Visible | Operable |
| 3.1.2 | Language of Parts | Understandable |
| 3.2.3 | Consistent Navigation | Understandable |
| 3.2.4 | Consistent Identification | Understandable |
| 3.3.3 | Error Suggestion | Understandable |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | Understandable |
| 4.1.3 | Status Messages | Robust |

---

**Total WCAG 2.1 AA Success Criteria: 50**
- Level A: 30 criteria
- Level AA: 20 criteria

**Note:** WCAG 2.2 (published October 2023) adds 9 more criteria including Focus Not Obscured (2.4.11) and Target Size (2.5.8). Consider reviewing these for future-proofing.
