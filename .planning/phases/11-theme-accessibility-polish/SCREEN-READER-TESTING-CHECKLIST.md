# Screen Reader Testing Checklist

**Project:** Digitaltableteur Website
**Purpose:** Manual QA checklist for screen reader compatibility
**Target:** WCAG 2.1 AA Compliance

---

## Recommended Screen Readers

| Platform | Screen Reader | Priority |
|----------|---------------|----------|
| macOS | VoiceOver | High |
| Windows | NVDA (free) | High |
| Windows | JAWS | Medium |
| iOS | VoiceOver | High |
| Android | TalkBack | Medium |

---

## Quick Start Commands

### VoiceOver (macOS)
- **Enable:** `Cmd + F5`
- **Navigate:** `VO + Left/Right Arrow` (VO = Ctrl + Option)
- **Interact:** `VO + Shift + Down Arrow`
- **Stop:** `Ctrl`
- **Rotor:** `VO + U`

### NVDA (Windows)
- **Enable:** Launch from Start Menu
- **Navigate:** Arrow keys
- **Elements List:** `NVDA + F7`
- **Stop:** `Ctrl`
- **Tab Navigation:** `Tab` / `Shift + Tab`

---

## Testing Checklist by Page

### Home Page

#### Landmarks
- [ ] Page has exactly one `<main>` landmark
- [ ] Header announced as "banner"
- [ ] Footer announced as "contentinfo"
- [ ] Navigation sections announced as "navigation"

#### Content
- [ ] Page title is announced on load
- [ ] H1 heading is present and announces page topic
- [ ] Heading hierarchy is logical (h1 -> h2 -> h3)
- [ ] Hero text content is read correctly
- [ ] Service cards are announced with context

#### Navigation
- [ ] Skip link is first focusable element
- [ ] Skip link moves focus to main content
- [ ] All nav links are announced with text
- [ ] Current page is indicated (aria-current="page")

#### Interactive Elements
- [ ] All buttons announce their purpose
- [ ] Links announce where they lead
- [ ] Icons are decorative or have accessible names

---

### About Page

#### Content
- [ ] Main heading announces "About" context
- [ ] Profile image has descriptive alt text
- [ ] Skills list is announced as list with items
- [ ] Values section has proper heading structure

#### Achievements/Stats
- [ ] Numbers are announced with context
- [ ] Charts/graphs have text alternatives (if present)

---

### Work/Portfolio Page

#### Project Grid
- [ ] Projects announced as list or grid
- [ ] Each project card has:
  - [ ] Clear title
  - [ ] Brief description
  - [ ] Link to details
- [ ] Images are decorative or described

#### Project Detail Pages
- [ ] H1 matches project title
- [ ] Metadata (year, client, role) is announced
- [ ] Gallery images have descriptions
- [ ] Related projects section is navigable

---

### Blog Pages

#### Blog Index
- [ ] H1 announces "Blog" or articles list
- [ ] Category filters announce:
  - [ ] Current selection (aria-selected)
  - [ ] Available options
- [ ] Articles list announces as list
- [ ] Each article has:
  - [ ] Title (linked)
  - [ ] Date
  - [ ] Author (if shown)
  - [ ] Excerpt

#### Blog Article
- [ ] H1 is article title
- [ ] Author and date are announced
- [ ] Table of contents (if present):
  - [ ] Announced as navigation
  - [ ] Links work correctly
- [ ] Article content reads smoothly
- [ ] Code blocks are announced as code
- [ ] Share buttons have accessible names

---

### Contact Page

#### Form
- [ ] Form is announced with label/description
- [ ] Each field announces:
  - [ ] Label
  - [ ] Required state (if required)
  - [ ] Current value
  - [ ] Error message (if invalid)
- [ ] Submit button announces purpose
- [ ] Success message is announced on submit

#### Contact Info
- [ ] Email links announce as links
- [ ] Phone numbers are announced clearly
- [ ] Address is readable

---

## Component Testing

### Buttons
- [ ] Role: "button"
- [ ] Name: visible text or aria-label
- [ ] State: disabled, pressed, expanded
- [ ] Action: activates on Enter/Space

### Form Inputs
- [ ] Label is announced on focus
- [ ] Error messages are announced
- [ ] Required fields indicate required
- [ ] Helper text is associated

### Checkboxes
- [ ] Role: "checkbox"
- [ ] State: checked/unchecked
- [ ] Indeterminate state announced

### Switches
- [ ] Role: "switch"
- [ ] State: on/off (aria-checked)
- [ ] Label is announced

### Modals/Dialogs
- [ ] Role: "dialog" or "alertdialog"
- [ ] Modal is announced on open
- [ ] Title is first thing announced
- [ ] Focus moves to modal content
- [ ] Cannot navigate outside modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger

### Menus (Avatar/Dropdown)
- [ ] Role: "menu" with "menuitem" children
- [ ] Opens with click or Enter
- [ ] Arrow keys navigate items
- [ ] Enter activates item
- [ ] Escape closes menu

### Badges
- [ ] Static badges: no announcement
- [ ] Dynamic badges: announce changes

### Cards
- [ ] Content is readable in logical order
- [ ] Interactive elements are focusable
- [ ] Linked cards announce as links

### Tabs
- [ ] Role: "tablist" with "tab" children
- [ ] Selected tab announced (aria-selected)
- [ ] Tab panels announced correctly
- [ ] Arrow keys switch tabs

---

## Global Checks

### Language
- [ ] Page language is announced
- [ ] Language changes are announced (multilingual content)

### Live Regions
- [ ] Toast notifications are announced
- [ ] Form errors are announced
- [ ] Loading states are announced
- [ ] Success messages are announced

### Focus Management
- [ ] Focus is visible at all times
- [ ] Focus order is logical
- [ ] No focus traps (except modals)
- [ ] Focus returns after modal close

### Images
- [ ] Content images have alt text
- [ ] Decorative images are hidden (alt="" or aria-hidden)
- [ ] Complex images have long descriptions

### Links
- [ ] Link text is descriptive
- [ ] "Click here" links avoided
- [ ] External links announced (if indicated)
- [ ] Same-page links work correctly

---

## Common Issues to Watch For

### Critical
- [ ] Missing form labels
- [ ] Missing alt text on content images
- [ ] Missing skip link
- [ ] Keyboard traps
- [ ] Missing page title

### High
- [ ] Incorrect heading hierarchy
- [ ] Missing landmark roles
- [ ] Non-descriptive link text
- [ ] Missing error announcements
- [ ] Modal focus issues

### Medium
- [ ] Redundant announcements
- [ ] Verbose alt text
- [ ] Unexplained abbreviations
- [ ] Missing language changes

### Low
- [ ] Decorative images not hidden
- [ ] Generic region names
- [ ] Missing table headers

---

## Testing Tips

### Before Testing
1. Turn off mouse/trackpad
2. Use only keyboard + screen reader
3. Note your initial impressions
4. Test with browser zoom at 100% and 200%

### During Testing
1. Navigate with Tab first, then arrow keys
2. Use landmarks to jump sections
3. Listen to full page read-through
4. Check heading navigation (H key in VoiceOver/NVDA)
5. Verify form interactions

### After Testing
1. Document any issues found
2. Note the screen reader and browser used
3. Prioritize fixes by severity
4. Retest after fixes

---

## Issue Reporting Template

```markdown
## Issue: [Brief Description]

**Severity:** Critical / High / Medium / Low
**Screen Reader:** [VoiceOver / NVDA / etc.]
**Browser:** [Chrome / Firefox / Safari / etc.]
**Page/Component:** [Location]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Steps to Reproduce
1. Navigate to [page]
2. [Action]
3. [Result]

### Suggested Fix
[If known]
```

---

## Sign-Off

| Page | VoiceOver | NVDA | Date | Tester |
|------|-----------|------|------|--------|
| Home | [ ] | [ ] | | |
| About | [ ] | [ ] | | |
| Work | [ ] | [ ] | | |
| Blog Index | [ ] | [ ] | | |
| Blog Article | [ ] | [ ] | | |
| Contact | [ ] | [ ] | | |

---

**Last Updated:** 2026-01-14
**Next Review:** Before each major release
