# Manual Accessibility Testing Checklist

**Project:** Digitaltableteur
**Standard:** WCAG 2.1 AA
**Purpose:** Systematic manual verification for issues automated tools cannot detect

> **Why Manual Testing?** Automated tools (axe-core) catch only 30-57% of WCAG violations. The remaining 43-70% require manual testing: keyboard navigation, screen reader compatibility, focus visibility, logical reading order, and content quality.

## How to Use This Checklist

1. **Before testing:** Clear browser data, disable password managers
2. **Test each page:** Go through all sections for each public page
3. **Document issues:** Note page, element, and specific failure using the template at the end
4. **Re-test after fixes:** Mark items as verified

---

## 1. Keyboard Navigation Testing

Test with keyboard only - no mouse allowed during these tests.

### 1.1 Basic Navigation

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Tab through page | Press Tab repeatedly | All interactive elements receive focus in logical order |
| Reverse tab | Press Shift+Tab | Focus moves backward through same elements |
| Skip link | Tab once from page load | "Skip to main content" link appears and is focusable |
| Skip link activation | Press Enter on skip link | Focus moves to main content |

### 1.2 Focus Visibility

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Focus indicator present | Tab to each element | Clear visible indicator on every focused element |
| Focus indicator contrast | Visual inspection | Focus ring has minimum 3:1 contrast against background |
| Focus not obscured (2.4.11) | Tab through with sticky header | Focus indicator not hidden by sticky elements |
| Focus in all themes | Test Light, Dark, HCW, HCB | Focus ring visible in all theme modes |

### 1.3 Interactive Elements

| Element Type | Activation Keys | Test Steps |
|--------------|-----------------|------------|
| Links | Enter | Tab to link, press Enter, verify navigation |
| Buttons | Enter AND Space | Tab to button, press Enter (works), press Space (works) |
| Checkboxes | Space | Tab to checkbox, press Space, verify toggle |
| Radio buttons | Arrow keys | Tab to group, use arrows to change selection |
| Dropdowns/Select | Space/Enter + Arrows | Open with Space, navigate with arrows, select with Enter |
| Modals | Escape | Open modal, verify focus trapped, press Escape to close |
| Menus | Escape + Arrows | Open menu, navigate with arrows, Escape to close |
| Accordions | Enter/Space | Toggle open/close with keyboard |
| Tabs | Arrow keys | Move between tabs with Left/Right arrows |
| Chat widget | Escape | Open with button, close with Escape key |

### 1.4 Keyboard Traps

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| No trap on any element | Tab continuously through entire page | Can Tab away from every element |
| Modal trap is intentional | Open modal, Tab repeatedly | Focus stays within modal (correct behavior) |
| Modal escape works | Press Escape in modal | Modal closes, focus returns to trigger |
| Chat widget escapable | Open chat, press Escape | Chat closes, focus returns to trigger button |

### 1.5 Key Combinations Reference

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate links, buttons |
| Space | Activate buttons, toggle checkboxes, select items |
| Arrow keys | Navigate within components (menus, tabs, radio groups) |
| Escape | Close modals, menus, dropdowns |
| Home/End | Jump to first/last item in list |

### 1.6 Per-Page Keyboard Checklist

#### Home Page (/)

- [ ] Skip link present and works
- [ ] Navigation links all focusable and activatable
- [ ] Hero CTA buttons work with Enter and Space
- [ ] Chat widget opens with keyboard
- [ ] Chat widget can be closed with Escape
- [ ] All cards/links are focusable
- [ ] Footer links all accessible
- [ ] No keyboard traps anywhere on page

#### About Page (/about)

- [ ] Skip link works
- [ ] All content links focusable
- [ ] Any expandable sections work with keyboard
- [ ] Image galleries (if any) keyboard navigable

#### Work Page (/work)

- [ ] Project cards are keyboard navigable
- [ ] Filter/sort controls (if any) work with keyboard
- [ ] Links within cards activatable
- [ ] Portfolio items all reachable via Tab

#### Blog Index Page (/blog)

- [ ] Blog post links focusable
- [ ] Pagination (if any) works with keyboard
- [ ] Category filters (if any) keyboard accessible
- [ ] Search (if any) accessible

#### Blog Article Pages (/blog/[slug])

- [ ] All content links accessible
- [ ] Code blocks (if any) don't trap focus
- [ ] Share buttons keyboard accessible
- [ ] Related posts links focusable

#### Contact Page (/contact)

- [ ] All form fields reachable via Tab
- [ ] Form can be submitted with Enter in last field or button
- [ ] Required fields indicated
- [ ] Error messages announced (test invalid submission)
- [ ] Success message accessible after submission

#### Services Pages (/services/*)

- [ ] All service links focusable
- [ ] CTAs work with keyboard
- [ ] Any accordions/expandables keyboard operable

#### Legal Pages (/privacy, /terms)

- [ ] All links in content focusable
- [ ] Table of contents (if any) navigable

---

## 2. Screen Reader Testing

Primary: VoiceOver (macOS + Safari)
Secondary: NVDA (Windows + Firefox) if available

### 2.1 VoiceOver Quick Reference (macOS)

**Enable:** Cmd+F5 or System Settings > Accessibility > VoiceOver

| Action | Keys |
|--------|------|
| Start/Stop VoiceOver | Cmd+F5 |
| Read next item | VO+Right Arrow (VO = Ctrl+Option) |
| Read previous item | VO+Left Arrow |
| Read all from here | VO+A |
| Open rotor (navigation menu) | VO+U |
| Interact with group | VO+Shift+Down Arrow |
| Stop interacting | VO+Shift+Up Arrow |
| Click/Activate | VO+Space |
| Stop speaking | Ctrl |

**Best browser:** Safari (best VoiceOver compatibility)

### 2.2 NVDA Quick Reference (Windows)

**Download:** https://www.nvaccess.org/download/ (Free)

| Action | Keys |
|--------|------|
| Start reading | Insert+Down Arrow or Caps Lock+Down Arrow |
| Stop reading | Ctrl |
| Next heading | H |
| Previous heading | Shift+H |
| Next landmark | D |
| Previous landmark | Shift+D |
| Next link | K |
| Next form element | F |
| Elements list | Insert+F7 |
| Speech Viewer | Tools > Speech Viewer (visual output) |

**Best browser:** Firefox (best NVDA compatibility)

### 2.3 Page Structure Tests

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Page title announced | Navigate to page | VoiceOver announces descriptive page title |
| Landmarks present | Open rotor (VO+U), select Landmarks | Main, Navigation, Banner, Contentinfo landmarks exist |
| Heading structure | Open rotor, select Headings | Logical hierarchy (h1 -> h2 -> h3), no skipped levels |
| Single h1 per page | Check headings in rotor | Only one h1 on each page |
| Skip link announced | Start VoiceOver on page load | First item is "Skip to main content" link |

### 2.4 Content Tests

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Images have alt text | Navigate to images | VoiceOver announces image description, not filename |
| Decorative images hidden | Navigate past decorative images | Decorative images not announced |
| Links describe destination | Navigate to links | Link text describes where it goes (not "click here") |
| Lists announced | Navigate to list content | "List, X items" announced before list content |
| Tables have headers | Navigate to any tables | Table structure and headers announced |
| Language attribute | Check page language | Correct pronunciation (EN/FI/SV content) |

### 2.5 Interactive Element Tests

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Form labels | Navigate to form fields | Field purpose announced (e.g., "Email, text field") |
| Required fields | Navigate to required inputs | "Required" announced for required fields |
| Error messages | Submit invalid form | Errors announced, linked to specific fields |
| Button purpose | Navigate to buttons | Button name and role announced |
| Modal announcements | Open modal | Dialog role and title announced |
| Live region updates | Trigger toast/notification | Status message announced without focus change |
| Expanded/collapsed state | Navigate to accordions | "Expanded" or "collapsed" state announced |

### 2.6 Dynamic Content Tests

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Loading states | Trigger async operation | "Loading" or similar announced |
| Status messages | Trigger success action | "Success" message announced via live region |
| Error messages | Trigger error | Error announced immediately |
| Chat messages | Send/receive chat message | New messages announced |
| Form submission | Submit form | Success/error feedback announced |

### 2.7 Per-Page Screen Reader Checklist

#### Home Page (/)

- [ ] Page title: "Digitaltableteur - [Description]" or similar
- [ ] Landmarks: main, nav, banner present
- [ ] Headings: h1 exists, logical structure
- [ ] Hero content readable and understandable
- [ ] Chat widget: aria-label identifies purpose
- [ ] Chat widget toggle: expanded/collapsed state announced
- [ ] Images have descriptive alt text
- [ ] All CTAs have descriptive button names

#### About Page (/about)

- [ ] Page title reflects content
- [ ] Landmarks present
- [ ] Heading hierarchy logical
- [ ] Profile images have alt text
- [ ] Timeline/history sections navigable

#### Work Page (/work)

- [ ] Project cards have descriptive links
- [ ] Images have meaningful alt text
- [ ] Filter state (if any) announced
- [ ] Card interactions announced

#### Blog Index (/blog)

- [ ] Post titles are announced as links
- [ ] Publication dates announced
- [ ] Category/tag information accessible
- [ ] Pagination state announced

#### Blog Article (/blog/[slug])

- [ ] Article title is h1
- [ ] Author and date accessible
- [ ] Code blocks announced appropriately
- [ ] Related posts section navigable

#### Contact Page (/contact)

- [ ] Form fields all labeled
- [ ] Required fields indicated
- [ ] Submit button has clear name
- [ ] Success/error messages announced
- [ ] Helper text (if any) associated with fields

#### Chat Widget (Global)

- [ ] Toggle button has accessible name
- [ ] Dialog role announced when opened
- [ ] Messages container is a live region
- [ ] Input field has label
- [ ] Close action accessible

---

## 3. Visual Inspection Testing

### 3.1 Color Contrast

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Text contrast | WebAIM Contrast Checker or WAVE | Normal text: 4.5:1, Large text (18pt+): 3:1 |
| UI component contrast | Inspect borders, icons, form controls | 3:1 against adjacent colors |
| Focus indicator contrast | Tab to elements, measure focus ring | 3:1 contrast |
| Placeholder text | Check input placeholders | 4.5:1 contrast (often fails) |
| Disabled state | Check disabled buttons/inputs | Still readable (AAA not required but recommended) |

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAVE browser extension
- Chrome DevTools color picker
- Colour Contrast Analyser (desktop app)

### 3.2 Responsive and Zoom Testing

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| 200% zoom | Ctrl/Cmd + zoom to 200% | All content visible, no horizontal scroll for text |
| 400% zoom | Zoom to 400% (WCAG 2.2) | Content reflows, still usable |
| 320px reflow | DevTools responsive mode at 320px | Content reflows, no horizontal scroll |
| Text spacing | Apply test stylesheet (see below) | Content remains visible, no overlap |
| Orientation | Test portrait and landscape | Content works in both orientations |

**Text Spacing Test Stylesheet (WCAG 1.4.12):**

Apply this CSS via DevTools or browser extension to test text spacing:

```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p {
  margin-bottom: 2em !important;
}
```

All content must remain visible and functional with these styles applied.

### 3.3 Motion and Animation

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Reduced motion | Enable "Reduce Motion" in OS settings | Animations are reduced or stopped |
| No auto-play video | Check for auto-playing media | Audio/video doesn't auto-play or has controls |
| No flashing content | Visual scan | No content flashes more than 3 times/second |
| Pause controls | Check carousels, animations | User can pause/stop moving content |

**How to enable reduced motion:**
- macOS: System Settings > Accessibility > Display > Reduce motion
- Windows: Settings > Ease of Access > Display > Show animations
- iOS: Settings > Accessibility > Motion > Reduce Motion
- Chrome DevTools: Rendering > Emulate CSS media feature prefers-reduced-motion

### 3.4 Color Independence

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| Error indicators | Trigger form errors | Errors use icon/text, not just red color |
| Required fields | Check required indicators | More than just red asterisk (label or icon) |
| Links in text | View links in paragraphs | Links have underline or other non-color indicator |
| Status indicators | Check success/warning/error states | Status conveyed by icon/text, not color alone |
| Charts/graphs | Check any data visualizations | Patterns or labels, not just colors |

**Test tip:** Use a grayscale filter or colorblind simulation to check if information is still conveyed.

### 3.5 Visual Focus Testing

For each interactive element, tab to it and verify:

- [ ] Focus indicator is visible
- [ ] Focus indicator has sufficient contrast (3:1)
- [ ] Focus indicator is not obscured by other elements (sticky headers, overlays)
- [ ] Focus indicator style is consistent across the site

---

## 4. Cross-Cutting Verifications

### 4.1 Theme Testing Matrix

Test each page in each theme mode. Mark with checkmark when verified.

| Page | Light | Dark | High Contrast Black | High Contrast White |
|------|-------|------|---------------------|---------------------|
| Home (/) | [ ] | [ ] | [ ] | [ ] |
| About (/about) | [ ] | [ ] | [ ] | [ ] |
| Work (/work) | [ ] | [ ] | [ ] | [ ] |
| Blog (/blog) | [ ] | [ ] | [ ] | [ ] |
| Blog Article | [ ] | [ ] | [ ] | [ ] |
| Contact (/contact) | [ ] | [ ] | [ ] | [ ] |
| Services | [ ] | [ ] | [ ] | [ ] |
| Privacy (/privacy) | [ ] | [ ] | [ ] | [ ] |
| Terms (/terms) | [ ] | [ ] | [ ] | [ ] |

**For each theme, verify:**
- [ ] Text contrast meets 4.5:1 (AA)
- [ ] Focus indicators visible
- [ ] Icons/UI elements have 3:1 contrast
- [ ] No information lost in theme switch

### 4.2 Language and i18n Testing

The site supports EN, FI, SV. Test each language.

| Test | How to Verify | Pass Criteria |
|------|---------------|---------------|
| HTML lang attribute | Inspect `<html>` element | `lang="en"` (or fi/sv) present |
| Language switching | Switch locale | `lang` attribute updates |
| Content in different language | Check for inline foreign text | Has `lang` attribute on container |
| Screen reader pronunciation | Listen with VoiceOver | Correct pronunciation for language |
| RTL support (if applicable) | N/A for EN/FI/SV | Not required |

**Per-language checklist:**

| Page | English (en) | Finnish (fi) | Swedish (sv) |
|------|--------------|--------------|--------------|
| Home | [ ] | [ ] | [ ] |
| About | [ ] | [ ] | [ ] |
| Contact | [ ] | [ ] | [ ] |

### 4.3 Form Error Handling

For all forms, verify:

- [ ] Error messages in text (not color only)
- [ ] Error messages linked to fields (aria-describedby)
- [ ] Focus moves to first error on submission (or error summary)
- [ ] Success messages announced (via live region)
- [ ] Inline validation (if used) doesn't interfere with typing
- [ ] Required fields clearly indicated before submission

### 4.4 Component State Testing

Test these states for interactive components:

| Component | Default | Hover | Focus | Active | Disabled | Error |
|-----------|---------|-------|-------|--------|----------|-------|
| Button | [ ] | [ ] | [ ] | [ ] | [ ] | N/A |
| Link | [ ] | [ ] | [ ] | [ ] | N/A | N/A |
| Input | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Textarea | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Checkbox | [ ] | [ ] | [ ] | [ ] | [ ] | N/A |
| Select | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Card | [ ] | [ ] | [ ] | [ ] | [ ] | N/A |

---

## 5. Issue Tracking Template

When you find an issue, document it using this template:

```markdown
### Issue: [Brief description]

**Page:** /path
**Element:** [CSS selector or description]
**Test Type:** Keyboard / Screen Reader / Visual / Cross-cutting
**WCAG Criterion:** X.X.X [Name]
**Level:** A / AA / AAA
**Severity:** P0 (Critical) / P1 (Major) / P2 (Minor)

**Description:**
[What's wrong]

**How to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Observe: ...]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What currently happens]

**Screenshot/Recording:**
[Attach if applicable]

**Suggested Fix:**
[If known]

**Tested On:**
- Browser: [Chrome/Safari/Firefox]
- Screen Reader: [VoiceOver/NVDA/None]
- Theme: [Light/Dark/HCW/HCB]
- Viewport: [Desktop/Mobile/Zoom level]
```

### Severity Definitions

| Severity | Definition | Examples |
|----------|------------|----------|
| P0 (Critical) | Complete blocker for AT users | Keyboard trap, missing form labels, no focus indicator |
| P1 (Major) | Significant barrier, workaround difficult | Poor contrast, missing alt text on informative images |
| P2 (Minor) | Inconvenience, workaround exists | Suboptimal heading structure, verbose alt text |

---

## 6. Testing Schedule Recommendation

For comprehensive audit, plan approximately:

| Phase | Time Estimate | Focus |
|-------|---------------|-------|
| Automated scan | 30 min | Run axe-core Playwright audit, review report |
| Keyboard testing | 2-3 hours | All pages, all interactive elements |
| Screen reader testing | 3-4 hours | VoiceOver on all pages (add 2h for NVDA) |
| Visual inspection | 1-2 hours | Contrast, zoom, themes |
| Cross-cutting | 1-2 hours | Theme matrix, i18n, states |
| Documentation | 1-2 hours | Issue writeup, prioritization |

**Total:** ~10-14 hours for thorough manual audit

### Recommended Order

1. **Run automated scan first** - Identify quick wins and patterns
2. **Keyboard test each page** - Fastest manual test
3. **Screen reader test critical flows** - Contact form, navigation, chat
4. **Visual inspection** - Contrast and zoom testing
5. **Theme testing** - All pages in all themes
6. **Document and prioritize** - Create issues for Phase 2+

---

## 7. Verification Checklist Summary

After completing all tests, verify these high-level requirements:

### WCAG 2.1 AA Core Requirements

- [ ] **1.1.1** All images have appropriate alt text
- [ ] **1.3.1** Content structure is semantic (headings, lists, landmarks)
- [ ] **1.4.3** Text contrast is at least 4.5:1 (3:1 for large text)
- [ ] **1.4.11** Non-text contrast is at least 3:1
- [ ] **2.1.1** All functionality is keyboard accessible
- [ ] **2.1.2** No keyboard traps (except intentional modal traps with escape)
- [ ] **2.4.1** Skip link bypasses navigation
- [ ] **2.4.3** Focus order is logical
- [ ] **2.4.7** Focus indicator is visible
- [ ] **3.1.1** Page language is declared
- [ ] **3.3.1** Form errors are identified in text
- [ ] **3.3.2** Form fields have labels
- [ ] **4.1.2** Custom components have appropriate roles and states
- [ ] **4.1.3** Status messages are announced to screen readers

### Site-Specific Requirements

- [ ] Chat widget is fully keyboard accessible
- [ ] Chat widget works with screen readers
- [ ] All four themes (Light, Dark, HCW, HCB) pass contrast
- [ ] All three languages (EN, FI, SV) are properly declared
- [ ] Forms provide accessible error feedback
- [ ] Animations respect prefers-reduced-motion

---

*Checklist compiled from:*
- WCAG 2.1 Quick Reference (W3C)
- WAI-ARIA Authoring Practices Guide
- Deque axe-core documentation
- WebAIM testing methodology
- Project-specific research (TOOLS.md, PITFALLS.md, PATTERNS.md)
