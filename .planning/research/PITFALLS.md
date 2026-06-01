# Accessibility Pitfalls for React/Next.js Applications

**Domain:** Next.js 16 / React 19 web application accessibility audit
**Researched:** 2026-01-27
**Confidence:** HIGH (sources: WebAIM studies, W3C WCAG documentation, MDN, official React docs)

## Executive Summary

A 2024 WebAIM study found that 96.4% of all WCAG errors fall into six categories that have remained unchanged for 5+ years. React Single Page Applications (SPAs) introduce unique accessibility challenges beyond these common issues: client-side routing without page announcements, dynamic content updates without screen reader notifications, and complex component interactions.

This document catalogs pitfalls specific to React/Next.js with guidance for detection and remediation.

---

## Critical Pitfalls

Mistakes that cause WCAG compliance failures or significantly impact users with disabilities.

### Pitfall 1: Missing or Inadequate Focus Management

**What the issue looks like:**
- Focus disappears after modal closes (goes to `<body>` or random element)
- Route changes leave focus at top of page, not main content
- Dynamic content appears but focus remains on trigger
- Tab order becomes illogical after DOM updates

**Why it happens in React/Next.js:**
- React's declarative model makes manual focus management feel unnatural
- `useEffect` runs after render, creating timing issues with focus
- Next.js client-side routing doesn't trigger browser's native focus behavior
- Developers forget to restore focus when modals/drawers close

**How to detect it:**
- Tab through entire page with keyboard only
- Open and close all modals, check where focus lands
- Navigate between routes, verify focus announcement
- Use axe DevTools "Tab Stops" visualization

**How to fix it:**
```tsx
// Modal: Save previous focus, restore on close
const previousActiveElement = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
  }
  return () => previousActiveElement.current?.focus();
}, [isOpen]);

// Route change: Focus main content
useEffect(() => {
  const main = document.querySelector('main');
  main?.setAttribute('tabindex', '-1');
  main?.focus();
}, [pathname]);
```

**WCAG criterion violated:**
- 2.4.3 Focus Order (Level A)
- 2.4.7 Focus Visible (Level AA)
- 2.1.2 No Keyboard Trap (Level A)

---

### Pitfall 2: Missing Focus Trap in Modal Dialogs

**What the issue looks like:**
- User can Tab out of modal to background content
- Focus cycles through entire page including elements behind overlay
- Screen reader users can navigate to hidden content using arrow keys

**Why it happens in React/Next.js:**
- Native `<dialog>` element is not used, custom divs lack trapping
- `aria-modal="true"` alone doesn't trap focus (it's a hint to AT, not enforcement)
- Developers assume overlay click-blocking equals focus blocking

**How to detect it:**
- Open modal, repeatedly press Tab
- If focus ever leaves the modal (visible outline moves to background), it's broken
- Test with screen reader: can you arrow-key navigate to background text?

**How to fix it:**
```tsx
// Use the inert attribute on background content
useEffect(() => {
  if (!isOpen) return;
  const mainContent = document.getElementById('main-content');
  mainContent?.setAttribute('inert', '');
  return () => mainContent?.removeAttribute('inert');
}, [isOpen]);

// Or use native <dialog> element which handles this automatically
<dialog ref={dialogRef} aria-labelledby={titleId}>
  {/* content */}
</dialog>
```

**WCAG criterion violated:**
- 2.1.2 No Keyboard Trap (Level A) - paradoxically, modals SHOULD trap focus
- 2.4.3 Focus Order (Level A)

**Note:** WCAG allows focus trapping in modals as an exception to 2.1.2, but the modal must provide a clear way to close (Escape key, close button).

---

### Pitfall 3: Low Color Contrast

**What the issue looks like:**
- Text is difficult to read against background
- Placeholder text is too light
- Disabled state contrast is insufficient
- Links indistinguishable from surrounding text without hover

**Why it happens in React/Next.js:**
- Design system uses aesthetically pleasing but low-contrast colors
- Dark mode themes not tested for contrast
- Placeholder text contrast often ignored
- Disabled states made too subtle

**How to detect it:**
- Use browser DevTools contrast checker
- Run axe-core automated scan
- Test all theme variants (light, dark, high contrast)
- Check placeholder text specifically (often missed)

**How to fix it:**
```css
/* Minimum contrast ratios */
/* Normal text: 4.5:1 (Level AA) */
/* Large text (18pt+ or 14pt+ bold): 3:1 */
/* Non-text UI (icons, borders): 3:1 */

:root {
  /* Example: ensure sufficient contrast */
  --color-text: #333; /* Against white: 12.6:1 */
  --color-muted: #5e5e5e; /* Against white: 7:1 - OK for large text */
  --color-placeholder: #757575; /* Against white: 4.6:1 - passes AA */
}

/* Support system high contrast preferences */
@media (prefers-contrast: more) {
  :root {
    --color-text: #000;
    --focus-ring-width: 3px;
  }
}
```

**WCAG criterion violated:**
- 1.4.3 Contrast (Minimum) (Level AA)
- 1.4.6 Contrast (Enhanced) (Level AAA)
- 1.4.11 Non-text Contrast (Level AA)

---

### Pitfall 4: Form Inputs Without Proper Labels

**What the issue looks like:**
- Screen reader announces "edit text" with no field description
- Placeholder used as only label (disappears on input)
- Error messages not associated with fields
- Required status not announced

**Why it happens in React/Next.js:**
- Placeholder attribute mistaken for accessible label
- `htmlFor` (JSX) / `for` (HTML) attribute forgotten
- `aria-describedby` not used for error/helper text
- Reusable input components don't enforce labels

**How to detect it:**
- Focus each form field with screen reader
- Check if field purpose is announced without visual reference
- Verify error messages are announced when they appear
- Automated: eslint-plugin-jsx-a11y catches many cases

**How to fix it:**
```tsx
// Always use visible labels with explicit association
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-describedby={error ? "email-error" : "email-hint"}
  aria-invalid={!!error}
  aria-required="true"
/>
{error && (
  <span id="email-error" role="alert">
    {error}
  </span>
)}
<span id="email-hint">We'll never share your email</span>
```

**WCAG criterion violated:**
- 1.3.1 Info and Relationships (Level A)
- 3.3.2 Labels or Instructions (Level A)
- 4.1.2 Name, Role, Value (Level A)

---

### Pitfall 5: Missing Accessible Names on Interactive Elements

**What the issue looks like:**
- Icon-only button announces nothing or just "button"
- Link announces only "link" without destination
- Image button has no alt text
- SVG icons are announced with file name or nothing

**Why it happens in React/Next.js:**
- Icon components don't include accessible labels
- Developers rely on visual context that AT users don't have
- `aria-label` forgotten on icon-only buttons
- SVG accessibility attributes missing

**How to detect it:**
- Tab to each interactive element with screen reader
- Verify purpose is announced
- Check all icon-only buttons for labels
- Automated: axe-core "button-name" rule

**How to fix it:**
```tsx
// Icon-only button - provide aria-label
<button aria-label="Close dialog" onClick={onClose}>
  <Icon name="x" decorative />
</button>

// Decorative icons should be hidden from AT
<Icon name="star" aria-hidden="true" />

// Or mark as decorative
<svg role="presentation" aria-hidden="true">...</svg>

// Link with icon needs descriptive text
<a href="/cart">
  <Icon name="shopping-cart" decorative />
  <span>Shopping cart (3 items)</span>
</a>
```

**WCAG criterion violated:**
- 4.1.2 Name, Role, Value (Level A)
- 1.1.1 Non-text Content (Level A)

---

### Pitfall 6: Dynamic Content Updates Not Announced

**What the issue looks like:**
- Toast/notification appears but screen reader doesn't announce it
- Form submission success message goes unnoticed
- Loading state changes silently
- Live search results update without announcement

**Why it happens in React/Next.js:**
- React's DOM diffing doesn't trigger AT announcements by default
- `aria-live` regions added dynamically don't work reliably
- Developers don't know about live regions
- React render cycles don't align with AT detection timing

**How to detect it:**
- Trigger dynamic updates with screen reader active
- Check if toasts, errors, loading states are announced
- Test form submission feedback
- Verify search results are announced

**How to fix it:**
```tsx
// Live region must exist in DOM on page load (empty is fine)
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// For errors/urgent messages
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Use role="status" for non-urgent updates
<div role="status">
  {searchResults.length} results found
</div>

// CRITICAL: Don't add aria-live dynamically
// BAD:
{showMessage && <div aria-live="polite">{message}</div>}

// GOOD:
<div aria-live="polite">
  {showMessage && message}
</div>
```

**WCAG criterion violated:**
- 4.1.3 Status Messages (Level AA)
- 1.3.1 Info and Relationships (Level A)

---

### Pitfall 7: Missing Document Language

**What the issue looks like:**
- Screen reader uses wrong language pronunciation
- Translation tools can't identify page language
- Multi-language content pronounced incorrectly

**Why it happens in React/Next.js:**
- `lang` attribute forgotten on `<html>` element
- Language change not reflected in `lang` when user switches
- Inline content in different languages not marked with `lang`
- Next.js App Router: `<html lang>` must be set in root layout

**How to detect it:**
- Check `<html>` element for `lang` attribute
- Verify language matches content
- Check if language updates when locale changes
- Automated: axe-core "html-has-lang" rule

**How to fix it:**
```tsx
// Next.js App Router layout.tsx
export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}

// For inline content in different language
<p>
  The French word for hello is <span lang="fr">bonjour</span>.
</p>
```

**WCAG criterion violated:**
- 3.1.1 Language of Page (Level A)
- 3.1.2 Language of Parts (Level AA)

---

### Pitfall 8: Keyboard Trap (Non-Modal)

**What the issue looks like:**
- Focus gets stuck in a component with no way to Tab out
- Custom widget captures all keyboard events
- Dropdown menu can't be exited with keyboard
- Infinite scroll traps focus at bottom of list

**Why it happens in React/Next.js:**
- Custom components intercept Tab key incorrectly
- `tabIndex` manipulation creates unreachable elements
- Event handlers use `event.preventDefault()` on Tab
- Focus order logic has edge case bugs

**How to detect it:**
- Tab through entire page repeatedly
- If you can't reach every interactive element, there's a trap
- Check custom widgets (carousels, accordions, dropdowns)
- Test Escape key as exit mechanism

**How to fix it:**
```tsx
// Always allow Tab to naturally move focus
// Don't preventDefault on Tab unless in a modal

// For complex widgets, implement arrow key navigation
// but keep Tab for moving out of the widget
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault(); // Only prevent default for arrow keys
      focusNextItem();
      break;
    case 'Tab':
      // Let Tab work naturally to exit the widget
      break;
    case 'Escape':
      closeWidget();
      break;
  }
};
```

**WCAG criterion violated:**
- 2.1.2 No Keyboard Trap (Level A)

---

## Moderate Pitfalls

Mistakes that cause usability issues but may not be strict WCAG failures.

### Pitfall 9: Route Changes Not Announced

**What the issue looks like:**
- Screen reader user navigates to new page, no announcement
- Focus stays at top, user must navigate to find new content
- Back/forward navigation doesn't announce page change

**Why it happens in React/Next.js:**
- Client-side routing doesn't trigger browser's page load announcement
- Next.js built-in route announcer depends on good `<title>` and `<h1>`
- Custom routing solutions bypass Next.js announcer
- Document title not updated on route change

**How to detect it:**
- Navigate between pages with screen reader
- Check if new page title/heading is announced
- Verify focus moves appropriately after navigation

**How to fix it:**
```tsx
// Next.js handles this IF you have:
// 1. Unique <title> per page
// 2. Good <h1> on each page

// Custom announcement (if needed):
useEffect(() => {
  // Announce route change
  const title = document.title;
  const announcer = document.getElementById('route-announcer');
  if (announcer) {
    announcer.textContent = `Navigated to ${title}`;
  }
}, [pathname]);

// In layout:
<div
  id="route-announcer"
  role="status"
  aria-live="polite"
  className="sr-only"
/>
```

**WCAG criterion violated:**
- 2.4.2 Page Titled (Level A)
- 4.1.3 Status Messages (Level AA)

---

### Pitfall 10: Missing Skip Links

**What the issue looks like:**
- Keyboard users must Tab through entire navigation on every page
- No way to quickly reach main content
- Repetitive navigation blocks access to content

**Why it happens in React/Next.js:**
- Developers aren't keyboard users, don't feel the pain
- Skip links seem "ugly" and get deprioritized
- Not clear where to put skip link in component architecture
- Main content area not properly identified

**How to detect it:**
- Press Tab immediately after page load
- First focusable element should be skip link
- Skip link should be visible when focused
- Activating it should move focus to main content

**How to fix it:**
```tsx
// Add as first child of body/layout
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>

// Main content area
<main id="main-content" tabIndex={-1}>
  {children}
</main>

// CSS - visible only on focus
.skipLink {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 1rem;
  background: var(--color-primary);
  color: var(--color-white);
}

.skipLink:focus {
  left: 0;
  top: 0;
}
```

**WCAG criterion violated:**
- 2.4.1 Bypass Blocks (Level A)

---

### Pitfall 11: Inadequate Touch Target Size

**What the issue looks like:**
- Small buttons/links hard to tap on mobile
- Interactive elements too close together
- Users accidentally tap wrong element
- Frustrating for users with motor impairments

**Why it happens in React/Next.js:**
- Desktop-first design with small clickable areas
- Icon buttons without padding
- Inline links with minimal tap area
- Dense navigation menus

**How to detect it:**
- Test on mobile device with varying finger sizes
- Measure tap targets (Chrome DevTools mobile preview)
- Check spacing between adjacent targets
- WCAG 2.2: minimum 24x24px, recommended 44x44px

**How to fix it:**
```css
/* Minimum touch target: 24x24 CSS pixels (WCAG 2.2 Level AA) */
/* Recommended: 44x44 CSS pixels (WCAG 2.1 Level AAA) */

.button {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-internal-12);
}

/* For inline links, expand touch area with padding */
.link {
  padding: 8px 4px;
  margin: -8px -4px; /* Compensate visual position */
}

/* Ensure spacing between adjacent targets */
.navItem + .navItem {
  margin-inline-start: 8px;
}
```

**WCAG criterion violated:**
- 2.5.5 Target Size (Enhanced) (Level AAA) - 44x44px
- 2.5.8 Target Size (Minimum) (Level AA) - 24x24px

---

### Pitfall 12: Removed Focus Outlines Without Replacement

**What the issue looks like:**
- No visible indication of focused element
- Keyboard users can't tell where they are
- Tab key seems to do nothing visually

**Why it happens in React/Next.js:**
- `outline: none` or `outline: 0` in reset CSS
- Designers dislike default browser outlines
- `:focus-visible` not understood or used
- Custom focus styles not applied consistently

**How to detect it:**
- Tab through page, watch for focus indicator
- Check CSS for `outline: none` without replacement
- Verify all interactive elements have visible focus state
- Test in high contrast mode

**How to fix it:**
```css
/* Never do this without replacement */
/* BAD: *:focus { outline: none; } */

/* Use :focus-visible for keyboard-only focus styles */
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* For browsers that don't support :focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode needs stronger focus */
@media (prefers-contrast: more) {
  :focus-visible {
    outline-width: 3px;
  }
}
```

**WCAG criterion violated:**
- 2.4.7 Focus Visible (Level AA)

---

### Pitfall 13: Animation Without Reduced Motion Support

**What the issue looks like:**
- Animations continue despite user's OS reduced motion setting
- Parallax effects cause vestibular discomfort
- Auto-playing animations can't be stopped
- Large-scale motion triggers motion sickness

**Why it happens in React/Next.js:**
- `prefers-reduced-motion` media query not checked
- Framer Motion/animation libraries default to full motion
- Decorative animations seem harmless to developers
- No testing with reduced motion enabled

**How to detect it:**
- Enable "Reduce Motion" in OS accessibility settings
- Check if animations still play
- Verify parallax, zooming, and panning effects respect preference
- Test auto-playing carousels and videos

**How to fix it:**
```css
/* CSS approach - disable animations for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Or selectively disable specific animations */
@media (prefers-reduced-motion: reduce) {
  .parallax {
    transform: none !important;
  }
}
```

```tsx
// React approach with Framer Motion
import { MotionConfig } from "framer-motion";

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Hook approach
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const animationConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.3, ease: 'easeOut' };
```

**WCAG criterion violated:**
- 2.3.3 Animation from Interactions (Level AAA)
- 2.2.2 Pause, Stop, Hide (Level A)

---

## Minor Pitfalls

Mistakes that cause annoyance but are relatively easy to fix.

### Pitfall 14: Missing Heading Hierarchy

**What the issue looks like:**
- Multiple `<h1>` elements on page
- Headings skip levels (h1 -> h3)
- Visual headings not using heading elements
- Screen reader users can't navigate by headings

**Why it happens in React/Next.js:**
- Component authors pick heading level based on visual size
- Reusable components hardcode heading levels
- `<h1>` used for "importance" not document structure
- CSS used to style text as heading without semantic markup

**How to detect it:**
- Use browser DevTools heading outline
- HeadingsMap browser extension
- axe-core "heading-order" rule
- Screen reader heading navigation (NVDA: H key)

**How to fix it:**
```tsx
// Design system: separate visual size from semantic level
<Title level={2} size="xl">
  {/* Renders <h2> with XL styling */}
  Section Heading
</Title>

// Accept heading level as prop for reusable components
interface CardProps {
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Card = ({ headingLevel = 2, title }) => {
  const Heading = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  return <Heading className={styles.cardTitle}>{title}</Heading>;
};
```

**WCAG criterion violated:**
- 1.3.1 Info and Relationships (Level A)
- 2.4.6 Headings and Labels (Level AA)

---

### Pitfall 15: Images of Text

**What the issue looks like:**
- Important text rendered as image
- Users can't resize text in images
- Text in images can't be translated
- Screen magnifiers pixelate image text

**Why it happens in React/Next.js:**
- Fancy fonts not available as web fonts
- Complex text effects easier as image
- Screenshots used for code examples
- Logos contain text without alt text

**How to detect it:**
- Check if text can be selected
- Zoom to 200% - does text remain crisp?
- Verify image alt text captures all visible text

**How to fix it:**
```tsx
// Use actual text with CSS styling
<h1 className={styles.fancyHeading}>
  Welcome
</h1>

// If image of text is unavoidable, provide complete alt
<img
  src="/hero-text.png"
  alt="Welcome to Digitaltableteur - Design that moves"
/>

// For decorative text images
<img src="/decorative-flourish.png" alt="" role="presentation" />
```

**WCAG criterion violated:**
- 1.4.5 Images of Text (Level AA)

---

### Pitfall 16: Non-Descriptive Link Text

**What the issue looks like:**
- Links say "click here", "read more", "learn more"
- Same link text for different destinations
- Link purpose unclear out of context
- Screen reader link list shows identical items

**Why it happens in React/Next.js:**
- Copy-paste patterns from web templates
- Designers prefer minimal link text
- Component reuse with generic "Read more"

**How to detect it:**
- Screen reader link list (NVDA: K key to cycle links)
- Check if each link makes sense out of context
- axe-core "link-name" rule

**How to fix it:**
```tsx
// Instead of "Read more"
<a href="/blog/design-systems">
  Read more about design systems
</a>

// Or use visually hidden text
<a href="/blog/design-systems">
  Read more
  <span className="sr-only"> about design systems</span>
</a>

// Card pattern - make heading the link
<article>
  <h2>
    <a href="/blog/design-systems">
      Building Scalable Design Systems
    </a>
  </h2>
  <p>Learn how we approach...</p>
</article>
```

**WCAG criterion violated:**
- 2.4.4 Link Purpose (In Context) (Level A)
- 2.4.9 Link Purpose (Link Only) (Level AAA)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| ChatWidget | Focus trap, dynamic updates, keyboard navigation | Test with screen reader, ensure Escape closes, announce messages |
| Modal dialogs | Focus trap missing, focus restoration broken | Use `inert` attribute, save/restore focus |
| Forms | Missing labels, error association, required state | Every input needs label, use `aria-describedby` for errors |
| Theme switching | Contrast failures in dark/high contrast | Test all themes with contrast checker |
| Route navigation | Silent transitions, focus management | Ensure route announcer works, focus main content |
| Image handling | Missing alt text, decorative images not hidden | Audit all images, use `alt=""` for decorative |
| Animations | Motion sickness, no reduced motion support | Respect `prefers-reduced-motion` |
| Mobile touch | Small tap targets, cramped spacing | Minimum 44x44px recommended |

---

## Detection Tools

### Automated Testing

| Tool | What It Catches | Limitations |
|------|-----------------|-------------|
| axe-core | ~57% of WCAG issues | Can't test keyboard/focus, dynamic content timing |
| eslint-plugin-jsx-a11y | Static JSX issues | No runtime behavior |
| Lighthouse | Subset of axe rules | Limited depth |
| pa11y | Page-level automated | Same as axe limitations |

### Manual Testing Required

| Issue Type | Why Automation Fails |
|------------|---------------------|
| Focus management | Requires testing user flows |
| Keyboard navigation | Requires sequential interaction |
| Screen reader announcements | Timing-dependent, AT-specific |
| Cognitive accessibility | Requires human judgment |
| Color contrast in context | Overlays, images, gradients |

### Recommended Testing Protocol

1. **Automated first:** Run axe-core, fix all issues
2. **Keyboard audit:** Tab through entire site, check focus visibility and order
3. **Screen reader audit:** NVDA/VoiceOver for all interactive flows
4. **Zoom test:** 200% zoom, verify layout doesn't break
5. **Color contrast:** All themes with contrast checker
6. **Motion test:** Enable reduced motion, verify animations stop

---

## Sources

### High Confidence (Official Documentation)

- [W3C WCAG 2.1 Understanding Docs](https://www.w3.org/WAI/WCAG21/Understanding/)
- [MDN ARIA Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [React Accessibility Documentation](https://legacy.reactjs.org/docs/accessibility.html)
- [Next.js Accessibility Architecture](https://nextjs.org/docs/architecture/accessibility)

### Medium Confidence (Expert Sources)

- [WebAIM Million Report](https://webaim.org/projects/million/) - Annual analysis of top 1M sites
- [Deque axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Inclusive Components by Heydon Pickering](https://inclusive-components.design/)
- [A11y with Lindsey - Reducing Motion](https://www.a11ywithlindsey.com/blog/reducing-motion-improve-accessibility/)

### Implementation Guides

- [Josh Comeau - Accessible Animations](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
- [Smashing Magazine - Target Sizes](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [CSS-Tricks - Focus Trap](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/)
- [Sara Soueidan - ARIA Live Regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/)
