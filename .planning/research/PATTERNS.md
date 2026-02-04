# Accessibility Patterns for UI Components

**Project:** Digitaltableteur Component Library
**Researched:** 2026-01-27
**Standard:** WCAG 2.1 AA (with WCAG 2.2 awareness)
**Confidence:** HIGH (based on WAI-ARIA APG official patterns)

## Executive Summary

This document provides authoritative accessibility patterns for common UI components based on the W3C WAI-ARIA Authoring Practices Guide (APG). Each pattern includes required ARIA attributes, keyboard interactions, focus management, and screen reader considerations aligned with WCAG 2.1 AA compliance.

---

## Table of Contents

1. [Modal/Dialog Pattern](#1-modaldialog-pattern)
2. [Navigation/Menu Pattern](#2-navigationmenu-pattern)
3. [Form Accessibility Pattern](#3-form-accessibility-pattern)
4. [Button and Link Pattern](#4-button-and-link-pattern)
5. [Image Accessibility Pattern](#5-image-accessibility-pattern)
6. [Tabs Pattern](#6-tabs-pattern)
7. [Accordion Pattern](#7-accordion-pattern)
8. [Focus Management in SPAs](#8-focus-management-in-spas)
9. [Live Region Patterns](#9-live-region-patterns)
10. [Card/Interactive Container Pattern](#10-cardinteractive-container-pattern)
11. [Chat Widget Pattern](#11-chat-widget-pattern)
12. [Toast/Notification Pattern](#12-toastnotification-pattern)

---

## 1. Modal/Dialog Pattern

### WCAG Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.3.1 Info and Relationships | A | Dialog role and labeling must be programmatically determinable |
| 2.1.1 Keyboard | A | All dialog functions must be operable via keyboard |
| 2.1.2 No Keyboard Trap | A | User must be able to exit dialog via keyboard |
| 2.4.3 Focus Order | A | Focus order must be logical within dialog |

### Required ARIA Attributes

```tsx
<div
  role="dialog"           // or "alertdialog" for warnings/errors
  aria-modal="true"       // Indicates modal behavior
  aria-labelledby="dialog-title"  // Points to visible title
  aria-describedby="dialog-desc"  // Optional: points to description
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-desc">Description of the dialog purpose</p>
  <!-- content -->
</div>
```

### Role Selection

| Scenario | Role | aria-live |
|----------|------|-----------|
| General dialog (info, form) | `dialog` | none |
| Error/warning alerts | `alertdialog` | `assertive` |
| Success confirmations | `alertdialog` | `polite` |

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move focus to next focusable element within dialog |
| Shift+Tab | Move focus to previous focusable element within dialog |
| Escape | Close the dialog |

### Focus Management Requirements

1. **On Open:**
   - Store reference to the element that triggered the dialog
   - Move focus to the first focusable element OR a static element with `tabindex="-1"` if content is complex
   - Trap focus within the dialog (use `inert` attribute on background content)

2. **On Close:**
   - Return focus to the triggering element
   - Remove `inert` from background content

3. **Focus Trap Implementation:**
   ```tsx
   // Recommended: Use inert attribute on main content
   const mainContent = document.getElementById("main-content");
   mainContent.setAttribute("inert", "");

   // On close:
   mainContent.removeAttribute("inert");
   ```

### Current Implementation Review (Modal.tsx)

**Strengths:**
- Uses `role="dialog"` / `role="alertdialog"` based on severity
- Has `aria-modal="true"`
- Uses `aria-labelledby` with title
- Stores previous focus and restores on close
- Uses `inert` attribute for focus trapping
- Handles Escape key

**Gaps to Address:**
- `aria-live` on dialog element may cause double announcement
- Close button should have `aria-label="Close dialog"` (currently customizable via prop)
- Consider adding `aria-describedby` for dialogs with descriptive content

### Recommended Pattern

```tsx
<div
  role={severity === "error" ? "alertdialog" : "dialog"}
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={hasDescription ? descriptionId : undefined}
>
  <div className={styles.header}>
    <h2 id={titleId}>{title}</h2>
    <button
      type="button"
      aria-label="Close dialog"
      onClick={onClose}
    >
      <Icon name="x" decorative />
    </button>
  </div>
  {description && <p id={descriptionId}>{description}</p>}
  <div className={styles.content}>{children}</div>
  <div className={styles.footer}>{footer}</div>
</div>
```

---

## 2. Navigation/Menu Pattern

### WCAG Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 2.4.1 Bypass Blocks | A | Skip links to bypass repeated navigation |
| 2.4.5 Multiple Ways | AA | More than one way to locate pages |
| 2.4.8 Location | AAA | Information about user's location within site |
| 4.1.2 Name, Role, Value | A | Navigation landmarks must be labeled |

### Navigation Structure

```tsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li>
      <a
        href="/about"
        aria-current={isCurrentPage ? "page" : undefined}
      >
        About
      </a>
    </li>
    {/* more items */}
  </ul>
</nav>
```

### Key Attributes

| Attribute | Purpose | When to Use |
|-----------|---------|-------------|
| `aria-label` | Names the navigation region | When there are multiple `<nav>` elements |
| `aria-current="page"` | Indicates current page | On the link to the current page |
| `aria-expanded` | Indicates submenu state | On buttons that control submenus |

### Disclosure Navigation (Submenus)

Use the disclosure pattern, NOT the menu role for site navigation:

```tsx
<nav aria-label="Main">
  <ul>
    <li>
      <button
        aria-expanded={isOpen}
        aria-controls="submenu-id"
      >
        Products
      </button>
      <ul id="submenu-id" hidden={!isOpen}>
        <li><a href="/products/a">Product A</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**Important:** Do NOT use `role="menu"` for site navigation. The menu role is for application menus (like a File menu in a desktop app), not navigation links.

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move between navigation items |
| Enter | Activate link or toggle submenu |
| Escape | Close submenu (if applicable) |

### Current Implementation Review (NavMenuList.tsx)

**Strengths:**
- Uses `aria-current="page"` for active links
- Semantic `<ul>/<li>` structure

**Gaps to Address:**
- Missing `<nav>` wrapper with `aria-label`
- No skip link implementation
- Mobile menu needs `aria-expanded` on toggle button

---

## 3. Form Accessibility Pattern

### WCAG Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.3.1 Info and Relationships | A | Labels programmatically associated |
| 2.4.6 Headings and Labels | AA | Labels describe topic or purpose |
| 3.3.1 Error Identification | A | Errors automatically identified and described |
| 3.3.2 Labels or Instructions | A | Labels provided for user input |
| 3.3.3 Error Suggestion | AA | Suggestions for fixing errors |

### Label Association

**Method 1: Explicit Association (Recommended)**
```tsx
<label htmlFor="email">Email address</label>
<input id="email" type="email" />
```

**Method 2: Implicit Association**
```tsx
<label>
  Email address
  <input type="email" />
</label>
```

### Required Field Indication

```tsx
<label htmlFor="email">
  Email address
  <span className="required" aria-hidden="true">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  required
/>
```

**Note:** Use both `required` attribute and `aria-required="true"` for maximum compatibility.

### Error Handling

```tsx
<div className="form-field">
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <span id="email-error" role="alert">
      Please enter a valid email address
    </span>
  )}
</div>
```

### Helper Text and Instructions

```tsx
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-help password-requirements"
/>
<span id="password-help">Must be at least 8 characters</span>
<ul id="password-requirements">
  <li>One uppercase letter</li>
  <li>One number</li>
</ul>
```

### Form Submission Feedback

```tsx
// Error summary at form level
<div role="alert" aria-labelledby="error-summary-title">
  <h2 id="error-summary-title">There were errors with your submission</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password is too short</a></li>
  </ul>
</div>
```

### Current Implementation Review (Inputs.tsx, ContactForm.tsx)

**Strengths:**
- Uses Label component with `htmlFor`
- Has HelperText for errors
- Uses `aria-hidden="true"` on honeypot field

**Gaps to Address:**
- Input `id` is derived from label text (brittle, not guaranteed unique)
- Missing `aria-describedby` linking to helper text
- Missing `aria-invalid` attribute on error state
- Required fields don't use `aria-required="true"`
- Error messages should use `role="alert"`

### Recommended Form Field Pattern

```tsx
function FormField({ id, label, error, helperText, required, ...inputProps }) {
  const fieldId = useId();
  const inputId = id || fieldId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const describedBy = [
    error && errorId,
    helperText && !error && helperId,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-field">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <HelperText id={errorId} state="error" role="alert">
          {error}
        </HelperText>
      )}
      {helperText && !error && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}
    </div>
  );
}
```

---

## 4. Button and Link Pattern

### Semantic Rule

> **Links navigate; buttons act.**

| Use Case | Element | Reason |
|----------|---------|--------|
| Navigate to new page/route | `<a href>` | URL changes |
| Submit form | `<button type="submit">` | Action on current page |
| Toggle visibility | `<button>` | Action on current page |
| Open modal | `<button>` | Action on current page |
| Download file | `<a href download>` | Navigation (file download) |

### Keyboard Expectations

| Element | Activation Keys |
|---------|-----------------|
| `<a>` (link) | Enter only |
| `<button>` | Enter AND Space |

**Critical:** Using a styled link with `role="button"` requires implementing Space key handling. Missing this fails WCAG 2.1.1.

### Button Accessibility

```tsx
// Icon-only button MUST have accessible name
<button
  type="button"
  aria-label="Close"
>
  <Icon name="x" decorative />
</button>

// Button with loading state
<button
  type="submit"
  aria-disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Toggle button
<button
  type="button"
  aria-pressed={isActive}
>
  Bold
</button>
```

### Link Patterns

```tsx
// External link
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
>
  External Site
  <span className="visually-hidden">(opens in new tab)</span>
</a>

// Download link
<a href="/file.pdf" download>
  Download PDF
  <span className="visually-hidden">(PDF, 2.4MB)</span>
</a>
```

### Current Implementation Review (Button.tsx)

**Strengths:**
- Polymorphic (button or anchor)
- Has `accessibleName`, `accessibleDescription` props
- Adds `rel="noopener noreferrer"` for `target="_blank"`
- Uses `aria-disabled` for disabled links

**Gaps to Address:**
- Icon-only buttons need guaranteed `aria-label`
- Loading state should add `aria-busy="true"`
- No `aria-pressed` support for toggle buttons

---

## 5. Image Accessibility Pattern

### WCAG Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.1.1 Non-text Content | A | All meaningful images need text alternatives |
| 1.4.5 Images of Text | AA | Avoid text in images (except logos) |

### Image Categories

| Type | alt Attribute | Example |
|------|---------------|---------|
| Informative | Describe content/purpose | `alt="Team photo at company retreat"` |
| Decorative | Empty | `alt=""` |
| Functional | Describe action | `alt="Search"` (for search icon button) |
| Complex | Brief alt + long description | Charts, diagrams |
| Images of text | Reproduce the text | `alt="50% off sale"` |

### Decorative Image Patterns

```tsx
// Method 1: Empty alt (preferred)
<img src="divider.png" alt="" />

// Method 2: Presentation role
<img src="bg-pattern.png" role="presentation" alt="" />

// Method 3: aria-hidden (for supporting content)
<span aria-hidden="true">
  <img src="decorative.png" alt="" />
</span>

// Method 4: CSS background (best for pure decoration)
// Use CSS instead of <img> for decorative images
```

### Informative Image Pattern

```tsx
<figure>
  <img
    src="chart.png"
    alt="Bar chart showing Q4 revenue growth of 25%"
  />
  <figcaption>
    Quarterly revenue comparison 2025
  </figcaption>
</figure>
```

### Complex Image Pattern (Charts, Diagrams)

```tsx
<figure aria-labelledby="chart-title" aria-describedby="chart-desc">
  <img
    src="complex-chart.png"
    alt="Revenue by region - see detailed description below"
  />
  <figcaption id="chart-title">Regional Revenue Distribution</figcaption>
  <details id="chart-desc">
    <summary>Detailed chart data</summary>
    <table>
      {/* Data table as alternative */}
    </table>
  </details>
</figure>
```

### Current Implementation Review (Icon.tsx, MdxImage.tsx)

**Strengths (Icon):**
- Has `decorative` prop (defaults to true if no `ariaLabel`)
- Uses `aria-hidden` for decorative icons
- Uses `role="img"` with `aria-label` for informative icons
- Inner SVG has `aria-hidden="true"` and `focusable="false"`

**Strengths (MdxImage):**
- Defaults `alt=""` (empty string, not missing)
- Uses Next.js Image for optimization

**Gaps to Address:**
- MdxImage accepts empty `alt` without warning for potentially informative images
- No mechanism to enforce alt text review

---

## 6. Tabs Pattern

### WCAG Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.3.1 Info and Relationships | A | Tab/tabpanel relationships programmatically determinable |
| 2.1.1 Keyboard | A | Tabs must be keyboard operable |
| 4.1.2 Name, Role, Value | A | Tab state must be exposed |

### Required Structure

```tsx
<div className="tabs-container">
  <div role="tablist" aria-label="Account settings">
    <button
      role="tab"
      id="tab-1"
      aria-selected={activeTab === 'profile'}
      aria-controls="panel-1"
      tabIndex={activeTab === 'profile' ? 0 : -1}
    >
      Profile
    </button>
    <button
      role="tab"
      id="tab-2"
      aria-selected={activeTab === 'security'}
      aria-controls="panel-2"
      tabIndex={activeTab === 'security' ? 0 : -1}
    >
      Security
    </button>
  </div>

  <div
    role="tabpanel"
    id="panel-1"
    aria-labelledby="tab-1"
    hidden={activeTab !== 'profile'}
    tabIndex={0}
  >
    Profile content
  </div>

  <div
    role="tabpanel"
    id="panel-2"
    aria-labelledby="tab-2"
    hidden={activeTab !== 'security'}
  >
    Security content
  </div>
</div>
```

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move focus into/out of tablist |
| Arrow Left/Up | Focus previous tab |
| Arrow Right/Down | Focus next tab |
| Home | Focus first tab |
| End | Focus last tab |
| Enter/Space | Activate focused tab |

### Focus Management Options

**Automatic Activation (Recommended for few tabs):**
- Arrow keys move focus AND activate tab
- Reduces keystrokes

**Manual Activation:**
- Arrow keys move focus only
- Enter/Space activates
- Better for many tabs or slow-loading content

### Current Implementation Review (Tabs.tsx)

**Strengths:**
- Has `role="tablist"` with `aria-label`
- Uses `role="tab"` on buttons
- Uses `aria-selected`
- Implements `tabIndex` roving (0 for active, -1 for inactive)
- Keyboard navigation with arrow keys, Home, End

**Gaps to Address:**
- Missing `role="tabpanel"` implementation (delegated to parent)
- Missing `aria-controls` on tabs
- Missing `aria-labelledby` on panels
- `aria-disabled` should not be used alongside `disabled` (use one or the other)

---

## 7. Accordion Pattern

### Required Structure

```tsx
<div className="accordion">
  <h3>
    <button
      type="button"
      id="accordion-header-1"
      aria-expanded={isOpen}
      aria-controls="accordion-panel-1"
    >
      Section Title
      <span aria-hidden="true">{isOpen ? '-' : '+'}</span>
    </button>
  </h3>
  <div
    id="accordion-panel-1"
    role="region"
    aria-labelledby="accordion-header-1"
    hidden={!isOpen}
  >
    Panel content
  </div>
</div>
```

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Enter/Space | Toggle section |
| Tab | Move between accordion headers |
| Arrow Down | Focus next header (optional) |
| Arrow Up | Focus previous header (optional) |
| Home | Focus first header (optional) |
| End | Focus last header (optional) |

### Current Implementation Review (Accordion.tsx)

**Strengths:**
- Uses `aria-expanded` on trigger buttons
- Uses `aria-controls` pointing to panel
- Uses `role="region"` on panel
- Uses `aria-labelledby` on panel
- Uses `aria-hidden` on decorative icon

**Gaps to Address:**
- Panel is conditionally rendered instead of using `hidden` attribute
- Missing wrapper heading element for proper structure
- Arrow key navigation not implemented (optional but nice to have)

---

## 8. Focus Management in SPAs

### The Problem

Single-page applications don't trigger browser page load events, so:
- Screen readers don't announce page changes
- Focus can get lost or stuck
- Users lose context of where they are

### Solutions

#### 1. Skip Link Pattern

```tsx
// At top of layout, before navigation
<a
  href="#main-content"
  className="skip-link"
>
  Skip to main content
</a>

// Main content target
<main id="main-content" tabIndex={-1}>
  {/* page content */}
</main>
```

**CSS for Skip Link:**
```css
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
  /* visible styling */
}
```

#### 2. Focus on Route Change

```tsx
// Next.js App Router approach
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function FocusOnRouteChange() {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Focus the main content or h1 on route change
    const target = document.querySelector('h1') as HTMLElement;
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
    }
  }, [pathname]);

  return null;
}
```

#### 3. Route Change Announcements

```tsx
// Live region for route announcements
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Get page title for announcement
    const title = document.title;
    setAnnouncement(`Navigated to ${title}`);
  }, [pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="visually-hidden"
    >
      {announcement}
    </div>
  );
}
```

### Best Practices

1. **Focus Target Selection:**
   - Focus the `<h1>` of the new page (add `tabIndex={-1}`)
   - OR focus the main content region
   - NOT the body element (causes issues)

2. **Timing:**
   - Wait for route change to complete
   - Wait for content to render
   - Use `requestAnimationFrame` for reliability

3. **Testing:**
   - Verify focus moves on navigation
   - Verify screen reader announces change
   - Verify browser back/forward works correctly

---

## 9. Live Region Patterns

### When to Use Each Type

| Content Type | Role/aria-live | Example |
|--------------|----------------|---------|
| Error messages | `role="alert"` or `aria-live="assertive"` | Form validation errors |
| Status updates | `role="status"` or `aria-live="polite"` | "Item added to cart" |
| Progress | `aria-live="polite"` | "Uploading: 50%" |
| Chat messages | `aria-live="polite"` | New incoming messages |
| Search results | `aria-live="polite"` | "10 results found" |

### Implementation Patterns

#### Alert Pattern (Assertive)

```tsx
// Error notification
<div role="alert">
  Unable to save changes. Please try again.
</div>

// Or equivalently:
<div aria-live="assertive" aria-atomic="true">
  Unable to save changes. Please try again.
</div>
```

#### Status Pattern (Polite)

```tsx
// Success message
<div role="status">
  Message sent successfully
</div>

// Or equivalently:
<div aria-live="polite" aria-atomic="true">
  Message sent successfully
</div>
```

### Critical Rules

1. **Live region must exist in DOM before content changes:**
   ```tsx
   // WRONG - live region added with content
   {error && <div role="alert">{error}</div>}

   // RIGHT - live region always present
   <div role="alert">{error}</div>
   ```

2. **Update content, don't replace container:**
   ```tsx
   // RIGHT - update text content
   <div role="status">{statusMessage}</div>

   // WRONG - toggle entire container
   {statusMessage && <div role="status">{statusMessage}</div>}
   ```

3. **Use sparingly:** Over-announcing creates noise and frustration.

### Current Implementation Review (Toast.tsx, ChatWidget.tsx)

**Strengths (Toast):**
- Uses `role="status"`
- Uses `aria-live` based on severity
- Proper polite/assertive selection

**Strengths (ChatWidget):**
- Uses `role="status"` for error banner
- Uses `aria-live="polite"` for status

**Gaps to Address:**
- Toast appears/disappears (live region should persist)
- Consider using `aria-atomic="true"` for complete announcements

---

## 10. Card/Interactive Container Pattern

### Non-Interactive Cards

```tsx
<article className="card">
  <img src="photo.jpg" alt="Project screenshot" />
  <h3>Project Title</h3>
  <p>Description of the project.</p>
  <a href="/projects/1">Read more</a>
</article>
```

### Clickable Cards

**Option 1: Stretched Link (Preferred)**
```tsx
<article className="card">
  <img src="photo.jpg" alt="" />
  <h3>
    <a href="/projects/1" className="stretched-link">
      Project Title
    </a>
  </h3>
  <p>Description</p>
</article>
```

**Option 2: JavaScript Click with Keyboard Support**
```tsx
<article
  className="card"
  onClick={handleClick}
  onKeyDown={handleKeyDown} // Handle Enter/Space
  tabIndex={0}
  role="button"
  aria-label="View Project Title details"
>
  {/* content */}
</article>
```

### Current Implementation Review (Card.tsx)

**Strengths:**
- Uses `role="button"` when interactive
- Handles keyboard events (Enter/Space)
- Uses `aria-label`/`linkLabel` for link cards
- Loading state has `aria-busy="true"` and `role="status"`
- Status message uses `role="alert"` or `role="status"`

**Gaps to Address:**
- Interactive cards should consider using the stretched-link pattern instead of div-as-button
- When using `role="button"`, ensure full keyboard support is tested

---

## 11. Chat Widget Pattern

### Dialog-like Behavior

The chat panel should behave as a non-modal dialog:

```tsx
<div
  role="dialog"
  aria-modal="false" // Non-modal - doesn't trap focus
  aria-label="Chat with Donny"
  aria-hidden={!isOpen}
  tabIndex={isOpen ? 0 : -1}
>
  <ChatHeader />
  <ChatMessages />
  <ChatComposer />
</div>
```

### Toggle Button

```tsx
<button
  aria-expanded={isOpen}
  aria-controls="chat-panel"
  aria-label={isOpen ? "Close chat" : "Open chat"}
>
  <Icon name="chat" decorative />
</button>
```

### Message Feed

```tsx
<div
  role="log"
  aria-live="polite"
  aria-label="Chat messages"
  aria-relevant="additions"
>
  {messages.map(msg => (
    <div key={msg.id}>
      {/* message content */}
    </div>
  ))}
</div>
```

### Current Implementation Review (ChatWidget.tsx)

**Strengths:**
- Uses `role="dialog"` with `aria-modal="false"`
- Uses `aria-hidden` based on open state
- Uses `inert` attribute via ref
- Toggle has `aria-controls`
- Error banner uses `role="status"` and `aria-live="polite"`
- Handles Escape key to close

**Gaps to Address:**
- Toggle button should have `aria-expanded`
- Message container should have `role="log"` with `aria-live="polite"`
- Consider announcing new messages to screen readers

---

## 12. Toast/Notification Pattern

### Proper Implementation

```tsx
// Container ALWAYS in DOM (even when empty)
<div
  className="toast-container"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {toast && (
    <div className="toast">
      {toast.message}
    </div>
  )}
</div>
```

### Severity-based Live Regions

| Severity | aria-live | Rationale |
|----------|-----------|-----------|
| success | polite | Non-urgent, wait for pause |
| info | polite | Non-urgent |
| warning | assertive | May require action |
| error | assertive | Requires immediate attention |

### Dismissible Toasts

```tsx
<div role="status" aria-live="polite">
  <div className="toast">
    <span>{message}</span>
    <button
      aria-label="Dismiss notification"
      onClick={onDismiss}
    >
      <Icon name="x" decorative />
    </button>
  </div>
</div>
```

---

## Quick Reference: Common Mistakes to Avoid

### Modal Dialogs
- Missing `aria-modal="true"` (focus escapes)
- Not trapping focus (user gets lost)
- Not restoring focus on close
- Using `aria-live` on dialog element (double announcement)

### Forms
- Using label text as input ID (not unique)
- Missing `aria-invalid` on error state
- Missing `aria-describedby` for helper text
- Not using `role="alert"` for error messages
- Using only color to indicate errors

### Navigation
- Using `role="menu"` for site navigation
- Missing `aria-current="page"` on current link
- No skip link for bypass

### Images
- Missing alt attribute entirely (screen reader reads filename)
- Using "image of..." in alt text (redundant)
- Non-empty alt for truly decorative images
- Alt text too long (over 150 characters)

### Buttons/Links
- Link styled as button missing Space key handler
- Button without accessible name (icon-only)
- Using div/span instead of semantic element

### Live Regions
- Adding live region dynamically with content
- Overusing assertive (everything interrupts)
- Using live region for static content
- Not testing with actual screen readers

---

## Testing Checklist

For each component, verify:

- [ ] **Keyboard:** All functionality works with keyboard only
- [ ] **Focus visible:** Focus indicator is always visible
- [ ] **Focus order:** Tab order is logical
- [ ] **Screen reader:** Component is announced correctly
- [ ] **ARIA:** All ARIA attributes are valid and correctly used
- [ ] **Color:** Information not conveyed by color alone
- [ ] **Contrast:** Text meets 4.5:1 (AA) contrast ratio
- [ ] **Zoom:** Component works at 200% zoom
- [ ] **Motion:** Animations can be disabled (prefers-reduced-motion)

---

## Sources

- [W3C WAI-ARIA APG - Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [W3C WAI-ARIA APG - Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C WAI-ARIA APG - Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [W3C WAI-ARIA APG - All Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [W3C WCAG 2.1 Understanding SC 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
- [W3C Form Instructions Tutorial](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [W3C Decorative Images Tutorial](https://www.w3.org/WAI/tutorials/images/decorative/)
- [W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [MDN aria-modal attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
- [A11Y Collective - Button vs Link](https://www.a11y-collective.com/blog/button-vs-link/)
- [A11Y Collective - ARIA Live Regions](https://www.a11y-collective.com/blog/aria-live/)
- [SPA Accessibility Best Practices](https://testparty.ai/blog/spa-accessibility)
- [Form Accessibility Guide](https://testparty.ai/blog/form-accessibility-guide)
