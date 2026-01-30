# Phase 4: Understandable Fixes - Research

**Researched:** 2026-01-30
**Domain:** WCAG Principle 3 (Understandable) - Language, Forms, Error Handling, Navigation
**Confidence:** HIGH

## Summary

This phase addresses WCAG 2.1 Principle 3 (Understandable) requirements: page language declaration, form labeling, error messaging, required field indication, and navigation consistency. The codebase already has strong foundations - HtmlLangSync component exists for dynamic language updates, form components have label associations, error display uses HelperText with `role="alert"`, and aria-current is implemented on navigation links.

Key gaps identified:
1. **Language notices missing** for English-only content (blog/work) when UI is in FI/SV
2. **Required field indicator** uses asterisk but lacks screen reader text "(required)"
3. **Error messages** are descriptive but don't include email typo suggestions
4. **Navigation consistency** needs verification test + missing `aria-current="page"` in mobile menu nav links

**Primary recommendation:** Enhance existing patterns rather than building new infrastructure. The HtmlLangSync, form components, and navigation already implement most WCAG requirements - this phase is about filling gaps and adding polish.

## Standard Stack

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| i18next | ^23.x | Internationalization | Already integrated, drives language detection |
| react-i18next | ^14.x | React bindings for i18n | Already integrated |
| @phosphor-icons/react | ^2.x | Icon system | Used in HelperText for error states |

### Supporting (No New Dependencies Needed)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| Native HTML | `lang` attribute, `aria-required`, `aria-invalid` | All language/form fixes |
| CSS Modules | Visual styling for notices, error states | Already standard in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom email suggestion | mailcheck.js | Over-engineering for simple typo detection |
| Complex live region | Native Next.js route announcer | Next.js already handles SPA navigation |

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
No new folders needed. Enhancements go in existing locations:

```
app/
├── components/
│   └── HtmlLangSync.tsx         # Already exists - working correctly
│   └── LanguageNotice/          # NEW: English-only content notice
│       ├── LanguageNotice.tsx
│       ├── LanguageNotice.module.css
│       └── index.ts
├── blog/
│   └── [slug]/
│       └── ClientArticle.tsx    # MODIFY: Add lang="en" wrapper

nextjs-app/shared/
├── components/
│   ├── Label/
│   │   └── Label.tsx            # MODIFY: Add screen reader "(required)" text
│   ├── Inputs/
│   │   ├── Inputs.tsx           # MODIFY: Enhance required indicator
│   │   └── TextArea.tsx         # MODIFY: Enhance required indicator
│   ├── NextMobileMenu/
│   │   └── NextMobileMenu.tsx   # VERIFY: aria-current on nav items
│   ├── NextHeader/
│   │   └── NextHeader.tsx       # VERIFY: aria-current on nav items
├── patterns/
│   └── Footer/
│       └── Footer.tsx           # VERIFY: Different from header (allowed)
```

### Pattern 1: Language Notice for English-Only Content
**What:** A subtle notice component informing users when content is English-only
**When to use:** Blog posts, work/portfolio pages when UI language is FI or SV

**Example:**
```tsx
// Source: WCAG 3.1.2 Language of Parts
interface LanguageNoticeProps {
  contentLanguage: string; // "en"
  className?: string;
}

export function LanguageNotice({ contentLanguage, className }: LanguageNoticeProps) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en';

  // Don't show if current UI language matches content
  if (currentLang === contentLanguage) return null;

  return (
    <p
      className={cn(styles.notice, className)}
      lang={currentLang} // Notice text is in UI language
    >
      {t('contentLanguageNotice', { language: 'English' })}
    </p>
  );
}

// Usage in blog article:
<article lang="en">
  <LanguageNotice contentLanguage="en" />
  <ArticleContent>{children}</ArticleContent>
</article>
```

### Pattern 2: Required Field with Screen Reader Text
**What:** Visual asterisk + hidden "(required)" text for screen readers
**When to use:** All required form fields

**Example:**
```tsx
// Source: WCAG 3.3.2, Harvard Accessibility Technique
<label htmlFor={htmlFor} className={styles.label}>
  {children}
  {required && (
    <>
      <span aria-hidden="true" className={styles.asterisk}>*</span>
      <span className="sr-only">(required)</span>
    </>
  )}
</label>
```

### Pattern 3: Error Message with Suggestion
**What:** Descriptive error that suggests corrections for common email typos
**When to use:** Email validation errors

**Example:**
```tsx
// Source: WCAG 3.3.3 Error Suggestion
const commonTypos: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
};

function suggestEmailCorrection(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && commonTypos[domain]
    ? email.replace(domain, commonTypos[domain])
    : null;
}

// In validation:
const suggestion = suggestEmailCorrection(email);
if (suggestion) {
  return t('contactValidationEmailSuggestion', { suggestion });
  // "Did you mean {{suggestion}}?"
}
```

### Anti-Patterns to Avoid
- **Color-only error indication:** Always pair with text message and `aria-invalid`
- **Asterisk-only required:** Screen readers may not announce asterisk meaningfully
- **Generic error messages:** "Invalid input" instead of "Please enter email in format name@domain.com"
- **Blocking validation:** Don't prevent typing; validate on blur/submit

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page change announcement | Custom live region | Next.js route announcer | Built-in, handles edge cases |
| Language detection | Manual parsing | i18next `i18n.language` | Already normalized, cookie-synced |
| Focus management | Manual element tracking | HtmlLangSync already in layout | Centralized, tested |
| Form state | Custom validation library | Existing Inputs/TextArea onChange | Already has validation patterns |

**Key insight:** Most WCAG Understandable requirements are already partially implemented. This phase enhances existing patterns rather than replacing them.

## Common Pitfalls

### Pitfall 1: Forgetting `lang` Attribute on Mixed Content
**What goes wrong:** Blog content in English reads with Finnish/Swedish pronunciation
**Why it happens:** Assuming `<html lang>` covers all content
**How to avoid:** Wrap English-only sections with `lang="en"` explicitly
**Warning signs:** Screen reader testing sounds wrong on blog pages with FI/SV UI

### Pitfall 2: Redundant Screen Reader Announcements
**What goes wrong:** "Required, asterisk" announced (redundant)
**Why it happens:** Not hiding decorative asterisk from AT
**How to avoid:** Use `aria-hidden="true"` on asterisk, separate `sr-only` text
**Warning signs:** VoiceOver/NVDA tests reveal repetition

### Pitfall 3: Error Focus Not Moving
**What goes wrong:** User doesn't notice inline error after submit
**Why it happens:** Relying only on `role="alert"` without focus management
**How to avoid:** Focus first error field on submit; HelperText already has `role="alert"`
**Warning signs:** Keyboard users miss error feedback

### Pitfall 4: Navigation Order Mismatch
**What goes wrong:** Mobile drawer has different order than desktop nav
**Why it happens:** Building mobile menu independently without reference to desktop
**How to avoid:** Single source of truth for nav items (navItemsBase array)
**Warning signs:** Automated test comparing desktop vs mobile fails

### Pitfall 5: Language Notice Too Prominent
**What goes wrong:** English notice distracts from content
**Why it happens:** Making it too visually loud
**How to avoid:** Subtle muted text, placed near title, not blocking content
**Warning signs:** User feedback about intrusive notices

## Code Examples

### Verified: HtmlLangSync (Already Working)
```tsx
// Source: /app/components/HtmlLangSync.tsx
"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return null;
}
```

### Verified: Navigation with aria-current (NextHeader)
```tsx
// Source: /nextjs-app/shared/components/NextHeader/NextHeader.tsx
<Link
  href={item.href}
  className={active ? styles.selected : undefined}
  aria-current={active ? "page" : undefined}
>
  {item.label}
</Link>
```

### Verified: HelperText with role="alert"
```tsx
// Source: /nextjs-app/shared/components/HelperText/HelperText.tsx
<p
  ref={ref}
  id={id}
  className={mergedClassName}
  role={state === "error" ? "alert" : undefined}
>
  {icon && <span className={styles.icon}>{icon}</span>}
  {children}
</p>
```

### Verified: Form Input with aria-invalid and aria-describedby
```tsx
// Source: /nextjs-app/shared/components/Inputs/Inputs.tsx
<input
  id={inputId}
  type={type}
  aria-invalid={hasError || undefined}
  aria-describedby={describedBy}
  {...rest}
/>
{hasError && (
  <HelperText id={errorId} state="error">
    {errorMessage}
  </HelperText>
)}
```

### Current: Error Messages in Translations
```json
// Source: /nextjs-app/shared/locales/en/translation.json
{
  "contactValidationFullNameRequired": "Full name is required",
  "contactValidationEmailRequired": "Email is required",
  "contactValidationEmailInvalid": "Please enter a valid email address",
  "contactValidationMessageRequired": "Message is required"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Asterisk alone for required | Asterisk + aria-required + sr-only text | WCAG 2.1 | Screen readers announce "required" |
| Color-only errors | Icon + text + aria-invalid + role="alert" | WCAG 2.0 | Multiple modalities for errors |
| Manual page title announcement | Next.js route announcer | Next.js 13 | Built-in SPA navigation support |
| Generic error text | Specific field + action suggestion | WCAG 2.1 3.3.3 | Users can self-correct |

**Deprecated/outdated:**
- Using `aria-required` alone without HTML5 `required`: Use both for maximum compatibility
- Relying on placeholder for labels: Always use visible `<label>` element

## Current State Audit

### UNDR-01: Page Language (HTML lang)
- **Status:** Implemented via HtmlLangSync
- **Gap:** None - dynamically updates on language change
- **Action:** Verify with screen reader test

### UNDR-02: Form Input Labels
- **Status:** Implemented - Label component with htmlFor
- **Gap:** Labels positioned correctly (above input)
- **Action:** Verify all forms use Label component

### UNDR-03: Error Messages
- **Status:** Implemented - HelperText with role="alert"
- **Gap:** Missing email typo suggestions
- **Action:** Add suggestion logic for common domain typos

### UNDR-04: Required Field Indication
- **Status:** Partially implemented - asterisk shown
- **Gap:** Missing sr-only "(required)" text
- **Action:** Update Label component

### UNDR-05: Error Suggestions
- **Status:** Not implemented for email
- **Gap:** No "Did you mean?" for common typos
- **Action:** Add email suggestion utility

### UNDR-06: Navigation Consistency
- **Status:** Implemented - navItemsBase shared array
- **Gap:** Need verification test
- **Action:** Add automated test comparing nav orders

### English-Only Content (From CONTEXT.md)
- **Status:** Not implemented
- **Gap:** Blog/work content needs lang="en" + language notice
- **Action:** Create LanguageNotice component, wrap content

## Open Questions

Things that couldn't be fully resolved:

1. **Next.js Route Announcer Reliability**
   - What we know: Next.js has built-in `next-route-announcer` with `role="alert"` and `aria-live="assertive"`
   - What's unclear: Some reports of announcing previous page title
   - Recommendation: Test current behavior; if reliable, use as-is; if buggy, consider custom announcement

2. **Language Notice Announcement Strategy**
   - What we know: User decided Claude determines approach
   - Options: In-flow (just rendered text) vs. aria-live announcement
   - Recommendation: Start with in-flow (simpler), test with screen reader, add announcement only if needed

3. **Form Validation Timing Edge Cases**
   - What we know: Hybrid approach decided (blur for simple, submit for complex)
   - What's unclear: When exactly to show email suggestions (on blur? on submit only?)
   - Recommendation: Show on blur for instant feedback, but don't block submission

## Sources

### Primary (HIGH confidence)
- **W3C WCAG 2.1** - Success Criteria 3.1.1, 3.1.2, 3.3.1, 3.3.2, 3.3.3
- **Codebase audit** - HtmlLangSync, Label, Inputs, HelperText, NextHeader, NextMobileMenu

### Secondary (MEDIUM confidence)
- [W3C Understanding Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [Harvard Required Fields Technique](https://accessibility.huit.harvard.edu/technique-required-fields)
- [Deque Required Form Fields](https://www.deque.com/blog/anatomy-of-accessible-forms-required-form-fields/)
- [W3C Form Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [Penn State Language Tags](https://accessibility.psu.edu/foreignlanguages/langtaghtml/)

### Tertiary (LOW confidence - needs validation)
- [Next.js Route Announcer Issues](https://github.com/vercel/next.js/issues/35831) - May be fixed in current version
- [Orange SPA Recommendations](https://a11y-guidelines.orange.com/en/articles/single-page-app/) - General SPA patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries, no new dependencies
- Architecture: HIGH - Enhancing existing components
- Pitfalls: HIGH - Based on WCAG standards and codebase patterns

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable domain)
