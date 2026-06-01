# Accessibility Testing Tools and Methodology

**Domain:** Accessibility Audit for Next.js 16 / React 19 Site
**Researched:** 2026-01-27
**Overall Confidence:** HIGH (well-established domain, verified sources)

---

## Executive Summary

This document provides a comprehensive guide to accessibility testing tools and methodologies for auditing a production Next.js 16 / React 19 website. The project already has axe-core integrated via `jest-axe` in the test suite. This research covers how to maximize that investment while adding complementary manual testing.

**Key insight:** Automated tools catch 30-40% of WCAG violations. A robust audit requires combining automation with manual keyboard testing, screen reader testing, and visual inspection.

---

## Automated Testing Tools

### Primary: axe-core (Already Integrated)

**Status:** HIGH confidence - already in project via `jest-axe` and `vitest-axe`
**Package:** `jest-axe@10.0.0` (per package.json)

axe-core is the industry-standard accessibility testing engine developed by Deque Systems. It powers Lighthouse accessibility audits and is the most widely used automated a11y testing library.

**Current integration points:**
- Component-level tests: `*.a11y.test.tsx` files
- Vitest setup: `toHaveNoViolations` matcher extended globally
- Example pattern in `Button.a11y.test.tsx`

**What axe-core tests:**
- WCAG 2.0, 2.1, and 2.2 at levels A, AA, and AAA
- Over 70 accessibility rules
- Color contrast ratios
- Missing alt text
- Invalid ARIA attributes
- Missing form labels
- Heading hierarchy issues
- Landmark structure

**Limitations (cannot detect):**
- Logical reading order
- Content quality (is alt text descriptive?)
- Keyboard trap edge cases
- Screen reader announcement quality
- Complex interaction patterns
- Focus management in SPAs

**Recommended usage pattern (already in codebase):**
```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("has no accessibility violations", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**WCAG-specific scanning:**
```typescript
const results = await axe(container, {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
});
```

**Sources:**
- [Deque axe-core Documentation](https://www.deque.com/axe/axe-core/)
- [jest-axe npm](https://www.npmjs.com/package/jest-axe)

---

### Secondary: Playwright + @axe-core/playwright (Page-Level Testing)

**Status:** HIGH confidence - Playwright already in project
**Package:** `playwright@1.57.0` (per package.json)
**Recommendation:** Add `@axe-core/playwright` for full-page accessibility audits

**Why needed:** Component tests with jest-axe test isolated components. Page-level tests catch:
- Page structure issues (landmark regions, skip links)
- Navigation flow problems
- Layout-level contrast issues
- Full-page heading hierarchy

**Integration:**
```bash
npm install -D @axe-core/playwright
```

```typescript
// Example: app/__tests__/a11y-audit.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Audit", () => {
  test("home page has no violations", async ({ page }) => {
    await page.goto("/");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("contact form has no violations", async ({ page }) => {
    await page.goto("/contact");
    const results = await new AxeBuilder({ page })
      .include("form")
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

**Benefits:**
- Tests rendered pages (including SSR content)
- Can test authenticated pages
- Can test dynamic content states
- Integrates with existing Playwright setup
- CI/CD integration ready

**Sources:**
- [Playwright Accessibility Testing Docs](https://playwright.dev/docs/accessibility-testing)
- [@axe-core/playwright npm](https://www.npmjs.com/package/@axe-core/playwright)

---

### Tertiary: Lighthouse (Existing)

**Status:** HIGH confidence - already configured
**Commands:** `npm run lighthouse:a11y`, `npm run lighthouse:ci`

Lighthouse provides accessibility audits as part of its broader web vitals testing. It uses axe-core under the hood but runs fewer tests than the full axe-core library.

**Current configuration (from package.json):**
```json
{
  "lighthouse:a11y": "lighthouse http://localhost:3000 --only-categories=accessibility --output html --output-path ./lighthouse-a11y-report.html --view",
  "lighthouse:ci": "lhci autorun"
}
```

**Lighthouse vs axe-core:**
| Aspect | Lighthouse | axe-core (full) |
|--------|-----------|-----------------|
| Tests run | ~40 | 70+ |
| Purpose | Quick overview | Comprehensive audit |
| Best for | CI/CD gates | Deep testing |
| WCAG detail | Limited | Extensive |

**Recommendation:** Use Lighthouse for quick smoke tests, axe-core for thorough audits.

**Sources:**
- [Google Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Lighthouse vs axe Comparison](https://sparkbox.com/foundry/lighthouse_chrome_website_accessibility_audit_website_accessibility_checker)

---

### Browser Extensions for Manual Verification

#### WAVE (Web Accessibility Evaluation Tool)

**Confidence:** HIGH - industry standard
**Availability:** Chrome, Firefox, Edge extensions

WAVE injects visual indicators directly into the page, making it easy to spot issues in context. It's the recommended tool for quick manual checks during development.

**Key features:**
- Visual error/warning indicators
- Contrast checking with alpha/opacity support
- Navigation order panel with accessible names
- Structure view showing landmarks and headings
- 100% client-side (works on localhost, intranets)

**Usage workflow:**
1. Install WAVE extension
2. Navigate to page
3. Click WAVE icon (or Ctrl+Shift+U / Cmd+Shift+U)
4. Review visual indicators
5. Check Details, Structure, and Contrast tabs

**Best for:**
- Development-time checks
- Understanding visual/structural issues
- Checking specific components in isolation

**Sources:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [WAVE Tool Guide](https://www.audioeye.com/post/wave-accessibility-tool/)

#### Accessibility Insights for Web

**Confidence:** MEDIUM - Microsoft tool, less common in React ecosystem
**Availability:** Chrome, Edge

Provides two modes:
1. **FastPass** - Quick 2-step check for high-impact issues (<5 min)
2. **Assessment** - Full WCAG 2.1 AA evaluation

**Best for:** Structured assessment workflows, compliance documentation

**Sources:**
- [Accessibility Insights](https://accessibilityinsights.io/)

---

## Color Contrast Tools

### WebAIM Contrast Checker (Primary)

**Confidence:** HIGH - industry standard
**URL:** https://webaim.org/resources/contrastchecker/

**WCAG Requirements:**
| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | N/A |

**Large text definition:** 18pt+ regular or 14pt+ bold

**Usage:** Enter foreground and background hex values. Get instant pass/fail for all levels.

**Sources:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Colour Contrast Analyser (CCA) by Vispero

**Confidence:** HIGH - desktop application
**Platform:** Windows, macOS

**Best for:**
- Testing color combinations from design files
- Checking against vision deficiency simulations
- WCAG 2.0, 2.1, and 2.2 compliance display

**Features:**
- Color picker (test any on-screen color)
- 8 vision deficiency simulations
- Foreground/background sliders

**Sources:**
- [Colour Contrast Analyser](https://vispero.com/color-contrast-checker/)

### In-Browser Options

| Tool | URL | Notes |
|------|-----|-------|
| Accessible Colors | https://accessible-colors.com/ | Quick WCAG 2.0 checker |
| Siteimprove | https://www.siteimprove.com/toolkit/color-contrast-checker/ | Shows AA/AAA results |
| colourcontrast.cc | https://colourcontrast.cc/ | Minimal, fast |
| Silktide Toolbar | Browser extension | Integrated with page inspection |

**Recommendation:** Use WebAIM for documentation, WAVE extension for in-page verification.

---

## Keyboard Navigation Testing

### Testing Methodology

**Confidence:** HIGH - fundamental WCAG requirement

Keyboard testing is essential. Approximately 5-10% of users rely on keyboard navigation, including power users, users with motor impairments, and screen reader users.

### Testing Checklist

#### Basic Navigation
- [ ] **Tab through page**: All interactive elements reachable
- [ ] **Tab order logical**: Follows visual layout (left-to-right, top-to-bottom for LTR)
- [ ] **No keyboard traps**: Can Tab away from every element
- [ ] **Skip link present**: "Skip to main content" link at page start
- [ ] **Focus visible**: Clear visual indicator on focused element

#### Interactive Elements
- [ ] **Links**: Activate with Enter
- [ ] **Buttons**: Activate with Enter and Space
- [ ] **Checkboxes**: Toggle with Space
- [ ] **Radio buttons**: Arrow keys move selection
- [ ] **Dropdowns**: Arrow keys navigate, Enter selects
- [ ] **Modals**: Focus trapped inside, Escape closes
- [ ] **Menus**: Arrow keys navigate, Escape closes

#### Focus Indicators (WCAG 2.2)
- [ ] **2.4.11 Focus Not Obscured (Minimum)**: Focus indicator not completely hidden by sticky elements
- [ ] **2.4.7 Focus Visible**: Focus indicator clearly visible (3:1 contrast minimum)

### Key Combinations Reference

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate links, buttons |
| Space | Activate buttons, toggle checkboxes, select items |
| Arrow keys | Navigate within components (menus, tabs, radio groups) |
| Escape | Close modals, menus, dropdowns |
| Home/End | Jump to first/last item in list |

### Testing Tools

#### Browser DevTools
Chrome/Firefox DevTools can show tab order:
1. Open DevTools (F12)
2. Go to Accessibility panel
3. Use "Show tab order" option

#### focus-visible Polyfill Check
Ensure `:focus-visible` styles are applied:
```css
/* Should show focus ring only on keyboard focus */
button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

**Sources:**
- [WebAIM Keyboard Testing](https://webaim.org/techniques/keyboard/)
- [WCAG 2.2 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [Keyboard Navigation Testing Guide](https://testparty.ai/blog/keyboard-navigation-testing)

---

## Screen Reader Testing

### Recommended Screen Readers

**Confidence:** HIGH - verified testing approach

| Screen Reader | Platform | Browser | Market Share |
|--------------|----------|---------|--------------|
| NVDA | Windows | Firefox, Chrome | 65.6% (WebAIM 2024) |
| VoiceOver | macOS | Safari | ~15% |
| JAWS | Windows | Chrome, IE | ~15% |
| VoiceOver | iOS | Safari Mobile | Significant on mobile |
| TalkBack | Android | Chrome | Significant on mobile |

**Minimum recommendation:** Test with NVDA (Windows) and VoiceOver (macOS).

### VoiceOver (macOS) Guide

**Enable:** Cmd+F5 or System Preferences > Accessibility > VoiceOver

**Essential Commands:**
| Action | Keys |
|--------|------|
| Start VoiceOver | Cmd+F5 |
| Stop VoiceOver | Cmd+F5 |
| Read next item | VO+Right Arrow |
| Read previous item | VO+Left Arrow |
| Read all | VO+A |
| Interact with group | VO+Shift+Down Arrow |
| Stop interacting | VO+Shift+Up Arrow |
| Open rotor | VO+U |
| Click item | VO+Space |

**Note:** VO = Control+Option (default VoiceOver modifier)

**Testing with Safari:**
Safari has the best VoiceOver support. Test in Safari first, then verify Chrome/Firefox.

### NVDA (Windows) Guide

**Download:** https://www.nvaccess.org/download/
**Cost:** Free and open-source

**Essential Commands:**
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
| Speech Viewer (visual output) | Insert+T (to log) |

**NVDA Speech Viewer:**
Enable Tools > Speech Viewer to see text output while testing. Essential for sighted testers.

**Best browser:** Firefox (best NVDA compatibility)

### Screen Reader Testing Checklist

#### Page Structure
- [ ] Page title announced on load
- [ ] Landmarks announced (main, nav, banner, contentinfo)
- [ ] Heading structure navigable and logical
- [ ] Skip links work

#### Content
- [ ] Alt text descriptive and accurate
- [ ] Decorative images hidden (aria-hidden="true" or empty alt)
- [ ] Links/buttons have meaningful names
- [ ] Tables have proper headers and associations
- [ ] Lists announced with count

#### Interactive Elements
- [ ] Form fields: Labels announced
- [ ] Form fields: Required state announced
- [ ] Form fields: Error messages announced
- [ ] Buttons: Role and name announced
- [ ] Modals: Focus moves to modal, announced
- [ ] Live regions: Dynamic content changes announced

#### Dynamic Content
- [ ] Status messages use aria-live
- [ ] Loading states announced
- [ ] Error notifications announced
- [ ] Form validation errors announced

### NvdaTestingDriver (Automated Screen Reader Testing)

**Confidence:** MEDIUM - emerging tool

For automated screen reader testing:
```bash
npm install nvda-testing-driver
```

Allows running screen reader assertions in CI pipelines. Useful for regression testing but doesn't replace manual testing.

**Sources:**
- [Screen Reader Testing Guide](https://testparty.ai/blog/screen-reader-testing-guide)
- [Harvard NVDA Testing Guide](https://accessibility.huit.harvard.edu/nvda)
- [BrowserStack NVDA Testing](https://www.browserstack.com/guide/what-is-nvda)

---

## Recommended Audit Workflow

### Phase 1: Automated Baseline

1. **Run existing tests:**
   ```bash
   npm run test:a11y
   ```

2. **Run Lighthouse audit:**
   ```bash
   npm run lighthouse:a11y
   ```

3. **Add Playwright page audits:**
   - Install `@axe-core/playwright`
   - Create page-level test suite
   - Run against all public pages

4. **Document all automated findings**

### Phase 2: Manual Audit

For each page:

1. **Keyboard navigation:**
   - Tab through entire page
   - Check focus indicators
   - Test all interactive elements
   - Verify no keyboard traps

2. **WAVE extension scan:**
   - Check structure
   - Review errors/warnings
   - Verify contrast

3. **Screen reader testing:**
   - VoiceOver in Safari
   - NVDA in Firefox (if Windows available)
   - Navigate by headings
   - Navigate by landmarks
   - Test forms
   - Test interactive widgets

4. **Visual inspection:**
   - Color contrast (use CCA or WebAIM)
   - Text spacing (zoom to 200%)
   - Responsive behavior (mobile viewport)

### Phase 3: Fix and Verify

1. **Prioritize by severity:**
   - P0 (Critical): Complete blockers
   - P1 (Major): Significant barriers
   - P2 (Minor): Inconveniences

2. **Fix issues:**
   - Update components
   - Add/fix ARIA attributes
   - Improve keyboard handling
   - Fix color contrast

3. **Verify fixes:**
   - Re-run automated tests
   - Manual verification of each fix
   - Screen reader verification

4. **Document remediation:**
   - Update component tests
   - Create new a11y test cases

---

## Testing Matrix

### Pages to Audit

| Page | Route | Priority | Complexity |
|------|-------|----------|------------|
| Home | `/` | High | High (animations, chat widget) |
| About | `/about` | High | Medium |
| Work Index | `/work` | High | Medium (grid, filters) |
| Work Detail | `/work/[slug]` | High | Medium (gallery, lightbox) |
| Blog Index | `/blog` | High | Medium (filters, pagination) |
| Blog Article | `/blog/[slug]` | High | Medium (prose, sharing) |
| Contact | `/contact` | High | High (forms, validation) |
| Services | `/services/*` | Medium | Low-Medium |
| Legal | `/privacy`, `/terms` | Low | Low (static content) |

### Components to Audit

| Component | Tests Exist? | Priority | Known Issues |
|-----------|--------------|----------|--------------|
| Button | Yes (a11y tests) | Done | None known |
| Modal | Yes (a11y tests) | High | Focus management |
| ChatWidget | Partial | High | Complex interactions |
| ContactForm | Partial | High | Validation messaging |
| Header/Nav | Partial | High | Mobile menu |
| Card | Yes (a11y tests) | Medium | Link wrapping |
| Select | Partial | High | Dropdown keyboard |
| Checkbox/Switch | Yes (a11y tests) | Done | None known |
| TextInput/TextArea | Yes (a11y tests) | Done | None known |
| Gallery | No | Medium | Keyboard navigation |
| Toast | Partial | Medium | Live region timing |

---

## CI/CD Integration

### Recommended Pipeline

```yaml
# .github/workflows/a11y.yml
name: Accessibility Checks

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      # Unit-level a11y tests
      - run: npm run test:a11y

      # Lighthouse audit
      - run: npm run build
      - run: npm run start &
      - run: npx wait-on http://localhost:3000
      - run: npm run lighthouse:a11y:ci

      # Page-level axe audits (if configured)
      - run: npx playwright test --project=a11y
```

### Thresholds

Recommended CI gates:
- **axe-core tests:** 0 violations (fail on any)
- **Lighthouse a11y score:** >= 90 (warn at 80-89, fail below 80)

---

## Summary: Tool Selection

| Task | Tool | When to Use |
|------|------|-------------|
| Component testing | jest-axe (existing) | Every component, in CI |
| Page testing | @axe-core/playwright | Every page, in CI |
| Quick overview | Lighthouse | Development, PR review |
| Visual inspection | WAVE extension | Development, audit |
| Contrast checking | WebAIM / CCA | Design review, audit |
| Keyboard testing | Manual (browser) | Every page, audit |
| VoiceOver testing | Manual (macOS) | Every page, audit |
| NVDA testing | Manual (Windows) | Every page, audit (if available) |

**Confidence levels:**
- **HIGH:** axe-core, Lighthouse, WAVE, WebAIM, VoiceOver, NVDA
- **MEDIUM:** Accessibility Insights, NvdaTestingDriver
- **Context-dependent:** Browser-specific tools

---

## Sources

### Automated Testing
- [Deque axe-core](https://www.deque.com/axe/axe-core/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Google Lighthouse Accessibility](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [WAVE Tool Guide](https://wave.webaim.org/)
- [inclly Free Tools Comparison](https://inclly.com/resources/accessibility-testing-tools-comparison)

### Manual Testing
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://vispero.com/color-contrast-checker/)
- [Harvard NVDA Testing Guide](https://accessibility.huit.harvard.edu/nvda)
- [Screen Reader Testing Guide](https://testparty.ai/blog/screen-reader-testing-guide)
- [Keyboard Navigation Testing](https://testparty.ai/blog/keyboard-navigation-testing)

### Standards and Checklists
- [W3C WAI Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/list/)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [Deque WCAG 2.2 Checklist PDF](https://media.dequeuniversity.com/en/docs/web-accessibility-checklist-wcag-2.2.pdf)
- [WCAG 2.2 Guidelines Complete](https://accessifylabs.com/blog/wcag-2-2)

### Methodology
- [BrowserStack Automated Accessibility Testing](https://www.browserstack.com/guide/automate-accessibility-testing)
- [Section 508 Development Process Integration](https://www.section508.gov/develop/incorporating-accessibility-conformance/)
- [AudioEye People + Automation Approach](https://www.audioeye.com/post/why-people-plus-automation-is-the-right-approach-to-accessibility-testing/)
