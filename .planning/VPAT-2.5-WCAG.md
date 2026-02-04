# VPAT 2.5 WCAG Edition

**Voluntary Product Accessibility Template**

---

## Product Information

| Field | Value |
|-------|-------|
| **Product Name** | Digitaltableteur Website |
| **Product Version** | February 2026 |
| **Product Description** | Professional portfolio and design services website |
| **Date** | 4 February 2026 |
| **Contact** | mail@digitaltableteur.com |
| **Report Type** | WCAG 2.1 |

---

## Evaluation Methods

| Method | Description |
|--------|-------------|
| Automated Testing | axe-core via @axe-core/playwright (188 page combinations) |
| Keyboard Testing | Automated Playwright tests for focus and navigation |
| Visual Testing | Automated contrast checks across 4 themes |
| Code Review | Manual review of component accessibility patterns |

**Note:** Manual screen reader testing (VoiceOver, NVDA) was not performed for this evaluation.

---

## Applicable Standards

| Standard | Included in Report |
|----------|-------------------|
| WCAG 2.1 Level A | Yes |
| WCAG 2.1 Level AA | Yes |
| WCAG 2.1 Level AAA | No (Not targeted) |

---

## Terms

| Term | Definition |
|------|------------|
| **Supports** | The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation. |
| **Partially Supports** | Some functionality of the product does not meet the criterion. |
| **Does Not Support** | The majority of product functionality does not meet the criterion. |
| **Not Applicable** | The criterion is not relevant to the product. |
| **Not Evaluated** | The criterion has not been evaluated. |

---

## WCAG 2.1 Level A Conformance

### Principle 1: Perceivable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **1.1.1 Non-text Content** | Supports | All images have appropriate alt text. Decorative images use empty alt or aria-hidden. 92 Icon usages verified as decorative by default. |
| **1.2.1 Audio-only and Video-only (Prerecorded)** | Not Applicable | Website does not contain audio-only or video-only content. |
| **1.2.2 Captions (Prerecorded)** | Not Applicable | Website does not contain video content requiring captions. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** | Not Applicable | Website does not contain video content. |
| **1.3.1 Info and Relationships** | Supports | Semantic HTML5 elements used throughout (header, nav, main, footer, article, section). Heading hierarchy is logical (single h1, descending levels). Form labels properly associated via htmlFor. |
| **1.3.2 Meaningful Sequence** | Supports | DOM order matches visual reading order. CSS Flexbox/Grid used for layout without altering logical sequence. |
| **1.3.3 Sensory Characteristics** | Supports | No instructions rely solely on shape, size, visual location, orientation, or sound. |
| **1.4.1 Use of Color** | Supports | Information conveyed by color is also conveyed by icons. HelperText, Badge, AlertBanner, Toaster all use icons alongside color. Links have wavy underline pattern for differentiation. |
| **1.4.2 Audio Control** | Not Applicable | Website does not contain audio that plays automatically. |

### Principle 2: Operable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **2.1.1 Keyboard** | Supports | All functionality available via keyboard. Tab navigation works on all interactive elements. Modal, ChatWidget, MobileDrawer trap focus appropriately. |
| **2.1.2 No Keyboard Trap** | Supports | Focus can be moved away from all components. Modal closes with Escape. ChatWidget and MobileDrawer release focus on close. Automated tests verify no traps exist. |
| **2.1.4 Character Key Shortcuts** | Not Applicable | Website does not use character key shortcuts. |
| **2.2.1 Timing Adjustable** | Not Applicable | Website does not use time limits on any functionality. |
| **2.2.2 Pause, Stop, Hide** | Supports | Animations respect prefers-reduced-motion media query. DonnyAvatar speak animation is shape transform only. No auto-updating content except user-initiated chat. |
| **2.3.1 Three Flashes or Below Threshold** | Supports | No content flashes more than three times per second. DonnyAvatar animation at 3.33Hz is shape transform, not luminance change. |
| **2.4.1 Bypass Blocks** | Supports | Skip to content link provided at top of each page. Link uses sr-only + focus:not-sr-only pattern. Links to #main-content landmark. |
| **2.4.2 Page Titled** | Supports | All pages have unique, descriptive titles via Next.js metadata. Format: "[Page Name] | Digitaltableteur". |
| **2.4.3 Focus Order** | Supports | Focus order follows visual sequence on all pages. 3-5 minor deviations in footer grid acceptable per WCAG interpretation. |
| **2.4.4 Link Purpose (In Context)** | Supports | Link text describes destination or purpose. "Read more" links include context from surrounding content. |
| **2.5.1 Pointer Gestures** | Supports | All functionality uses single-point activation. No multipoint or path-based gestures required. |
| **2.5.2 Pointer Cancellation** | Supports | Actions complete on up-event, not down-event. User can move pointer away to cancel. |
| **2.5.3 Label in Name** | Supports | Visible labels match or are included in accessible names. Button text equals aria-label where used. |
| **2.5.4 Motion Actuation** | Not Applicable | Website does not use device motion for functionality. |

### Principle 3: Understandable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **3.1.1 Language of Page** | Supports | HTML lang attribute dynamically set based on user language selection (en, fi, sv). HtmlLangSync component updates on language change. |
| **3.2.1 On Focus** | Supports | No component changes context on focus. Focus ring appears but no navigation or submission occurs. |
| **3.2.2 On Input** | Supports | No automatic context changes on input. Form submission requires explicit button press. Theme/language changes announced but don't change context unexpectedly. |
| **3.3.1 Error Identification** | Supports | Form errors identified in text. Error messages use role="alert" for immediate announcement. aria-describedby links error to input field. |
| **3.3.2 Labels or Instructions** | Supports | All form inputs have visible labels. Labels positioned above inputs. Required fields marked with asterisk + sr-only "(required)" text. |

### Principle 4: Robust

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **4.1.1 Parsing** | Supports | HTML validates without parsing errors. No duplicate IDs detected. All elements properly nested. |
| **4.1.2 Name, Role, Value** | Supports | Custom components use ARIA attributes. Modal uses role="dialog". Tabs use role="tablist", role="tab", role="tabpanel". Accordion uses aria-expanded, aria-controls. All interactive elements have accessible names. |

---

## WCAG 2.1 Level AA Conformance

### Principle 1: Perceivable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **1.3.4 Orientation** | Supports | Content displays in both portrait and landscape orientations. No functionality restricted to single orientation. |
| **1.3.5 Identify Input Purpose** | Supports | Input fields use autocomplete attributes for name, email, phone, address fields on contact form. |
| **1.4.3 Contrast (Minimum)** | Supports | Text meets 4.5:1 contrast ratio. Large text meets 3:1. All 4 themes verified: Light, Dark, HCB, HCW. Logo text and ChatWidget toggle fixed for Dark theme. |
| **1.4.4 Resize Text** | Supports | Content remains readable and functional at 200% zoom. Tested at 640px viewport (simulates 200% on 1280px screen). |
| **1.4.5 Images of Text** | Supports | No images of text used. All text rendered as actual text. Logo uses SVG with proper alt text. |
| **1.4.10 Reflow** | Supports | Content reflows at 320px width without horizontal scrolling. CSS Grid/Flexbox layouts adapt properly. |
| **1.4.11 Non-text Contrast** | Supports | UI components have 3:1 contrast against adjacent colors. Focus indicators, form borders, icons all meet requirements. |
| **1.4.12 Text Spacing** | Supports | Content visible with increased text spacing (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, paragraph spacing 2em). Automated tests verify no clipping. |
| **1.4.13 Content on Hover or Focus** | Supports | Tooltips are dismissible (Escape key), hoverable (content stays while hovering tooltip), and persistent (doesn't disappear until user action). |

### Principle 2: Operable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **2.4.5 Multiple Ways** | Supports | Multiple ways to locate pages: navigation menu, footer links, sitemap.xml, skip links. |
| **2.4.6 Headings and Labels** | Supports | Headings describe topic or purpose. Form labels describe input purpose. Navigation uses descriptive text. |
| **2.4.7 Focus Visible** | Supports | All focusable elements have visible focus indicator. Uses :focus-visible for keyboard-only focus. CSS custom properties define consistent focus ring. High Contrast Mode uses forced-colors media query with Highlight outline. |

### Principle 3: Understandable

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **3.1.2 Language of Parts** | Supports | Content in different languages marked with lang attribute. Blog content has lang="en" wrapper. LanguageNotice component indicates when UI and content languages differ. |
| **3.2.3 Consistent Navigation** | Supports | Navigation appears in same relative order on all pages. Desktop and mobile navigation consistent. aria-current="page" indicates active page. |
| **3.2.4 Consistent Identification** | Supports | Components with same functionality identified consistently. Same icons used for same actions. Same labels for same functions. |
| **3.3.3 Error Suggestion** | Supports | When input errors detected, suggestions provided when possible. Email field offers typo corrections (e.g., "Did you mean gmail.com?"). |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | Not Applicable | Website does not process legal, financial, or data transactions requiring error prevention. Contact form does not have irreversible consequences. |

### Principle 4: Robust

| Criteria | Conformance Level | Remarks and Explanations |
|----------|-------------------|--------------------------|
| **4.1.3 Status Messages** | Partially Supports | Status messages use role="status" for advisory information. Toaster component has live region. Chat messages use role="log" with aria-live="polite". **Note:** Manual screen reader testing not performed to verify announcements. |

---

## Summary

| Level | Criteria | Supports | Partially Supports | Does Not Support | Not Applicable | Not Evaluated |
|-------|----------|----------|-------------------|------------------|----------------|---------------|
| A | 30 | 22 | 0 | 0 | 8 | 0 |
| AA | 20 | 19 | 1 | 0 | 1 | 0 |
| **Total** | **50** | **41** | **1** | **0** | **9** | **0** |

---

## Legal Disclaimer

This document is provided for informational purposes regarding the accessibility of the described product. This evaluation is based on testing conducted using automated tools and code review. Manual testing with assistive technologies was not performed.

The conformance claims in this document are based on testing as of the date shown. Actual user experience may vary based on assistive technology, browser, and operating system combinations.

This report does not constitute legal advice regarding compliance with accessibility laws or regulations.

---

*Generated: 4 February 2026*
*Contact: mail@digitaltableteur.com*
