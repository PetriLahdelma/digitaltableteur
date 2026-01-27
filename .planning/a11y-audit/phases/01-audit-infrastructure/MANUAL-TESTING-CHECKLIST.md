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
