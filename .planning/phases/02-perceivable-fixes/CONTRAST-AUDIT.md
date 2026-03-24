# Color Contrast Audit (PERC-02, PERC-06)

**Audit Date:** 2026-01-28
**Auditor:** Automated (axe-core 4.11 via Playwright)
**Standard:** WCAG 2.1 AA

---

## Test Configuration

- **Pages tested:** home (/), about (/about), contact (/contact), blog (/blog), work (/work)
- **Themes tested:** Light, Dark, High Contrast Black (HCB), High Contrast White (HCW)
- **axe-core rules:** color-contrast, link-in-text-block
- **Test file:** `tests/a11y/perceivable/color-contrast-audit.spec.ts`
- **Results file:** `tests/a11y/audit-results/contrast/contrast-audit-results.json`

---

## Results by Theme

### Light Theme (Default)

**Violations:** 0
**Status:** PASS

All text elements meet the required contrast ratios in light theme.

| Element | Contrast | Required | Issue |
|---------|----------|----------|-------|
| - | - | - | No violations |

### Dark Theme

**Violations:** 5 (across 5 pages)
**Status:** FAIL

Two recurring issues across all pages:

| Element | Contrast | Required | Issue |
|---------|----------|----------|-------|
| Logo text (`.lg\\:text-xl`) | 1.26-2.99:1 | 3:1 (large text) | Insufficient contrast against dark background |
| Chat widget label (`.ChatWidget_toggleLabel__5c18w`) | 2.31:1 | 4.5:1 (normal text) | Blue text on purple background |

**Specific instances:**

1. **Logo "Digitaltableteur" text**
   - Home: 2.86:1 (foreground #3b6495, background #181a1b)
   - About: 2.99:1 (foreground #3e6799, background #181a1b)
   - Contact: 1.27:1 (foreground #143043, background #181a1b)
   - Blog: 2.95:1 (foreground #3d6698, background #181a1b)
   - Work: 1.26:1 (foreground #142f43, background #181a1b)
   - **Note:** Contrast varies by page, likely due to background color blending/scrolling effects

2. **ChatWidget toggle label "Chat"**
   - All pages: 2.31:1 (foreground #6fa8ff, background #812eff)
   - Required: 4.5:1 for normal text at 18px

### High Contrast Black (themeHCB)

**Violations:** 3 (on 3 of 5 pages)
**Status:** PARTIAL FAIL

| Element | Contrast | Required | Issue |
|---------|----------|----------|-------|
| Logo text (`.lg\\:text-xl`) | 1.82-1.87:1 | 3:1 (large text) | Logo text not respecting high contrast overrides |

**Specific instances:**

- Contact: 1.82:1 (foreground #293c43, background #000000)
- Blog: 1.87:1 (foreground #2a3e44, background #000000)
- Work: 1.87:1 (foreground #2a3e44, background #000000)

**Note:** Home and About pages pass - the logo text color appears to differ based on scroll position or hero section context.

### High Contrast White (themeHCW)

**Violations:** 0
**Status:** PASS

All text elements meet required contrast ratios in high contrast white theme.

| Element | Contrast | Required | Issue |
|---------|----------|----------|-------|
| - | - | - | No violations |

---

## CSS Variable Analysis

### Text Colors by Theme

| Variable | Light | Dark | HCB | HCW | Notes |
|----------|-------|------|-----|-----|-------|
| `--color-text` | #041b23 | #e0e0e0 | #fff | #000 | Main body text - OK |
| `--primary-text-color` | #041b23 | #6fa8ff | #fff | #000 | Primary text - OK |
| `--color-title` | #041b23 | #6fa8ff | #fff | #000 | Headings - OK |
| `--link-color` | #041b23 | #71efff | #fff | #000 | Links - OK |

### Background Colors by Theme

| Variable | Light | Dark | HCB | HCW | Notes |
|----------|-------|------|-----|-----|-------|
| `--main-body-background-color` | #fff | #181a1b | #000 | #fff | Main background |
| `--logo-background` | #dfff00 | #812eff | #fff | #000 | Logo container |

### Identified Contrast Issues

1. **Logo text in dark/HCB themes:**
   - The logo text appears to use a color that doesn't adapt properly to dark backgrounds
   - The color (#3b6495 - #142f43) creates insufficient contrast against #181a1b or #000000

2. **ChatWidget toggle in dark theme:**
   - Uses `--color-primary` (#6fa8ff) on `--logo-background` (#812eff)
   - Blue on purple = 2.31:1 contrast (needs 4.5:1)

---

## PERC-02 Status (Contrast Minimum)

**WCAG Success Criterion 1.4.3**

- [x] Normal text: 4.5:1 contrast ratio - **Light/HCW themes only**
- [x] Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio - **Light/HCW themes only**
- [ ] All themes pass - **Dark and HCB have violations**

### Summary

| Requirement | Light | Dark | HCB | HCW |
|-------------|-------|------|-----|-----|
| Normal text (4.5:1) | PASS | FAIL | PASS | PASS |
| Large text (3:1) | PASS | FAIL | FAIL | PASS |

---

## PERC-06 Status (All Themes)

**Custom Requirement: All themes must meet contrast standards**

- [x] Light theme passes contrast requirements
- [ ] Dark theme passes contrast requirements
- [ ] High Contrast Black passes contrast requirements
- [x] High Contrast White passes contrast requirements

### Overall Status: PARTIAL PASS (2/4 themes)

---

## Issues Found

### Issue 1: Logo Text Contrast in Dark Themes

**Severity:** Serious (WCAG 2.1 AA violation)
**Affected themes:** Dark, High Contrast Black
**Affected elements:** `.lg\\:text-xl`, `.text-lg` (logo wordmark)

**Current behavior:**
- Logo text color varies (#142f43 to #3e6799) against dark backgrounds (#181a1b, #000)
- Contrast ratios range from 1.26:1 to 2.99:1
- Required: 3:1 for large bold text

**Recommended fix:**
```css
.themeDark .logo-text,
.themeHCB .logo-text {
  color: var(--color-text); /* Inherit theme text color */
}
```

### Issue 2: ChatWidget Toggle Label in Dark Theme

**Severity:** Serious (WCAG 2.1 AA violation)
**Affected themes:** Dark
**Affected element:** `.ChatWidget_toggleLabel__5c18w`

**Current behavior:**
- Text: #6fa8ff (light blue)
- Background: #812eff (purple)
- Contrast: 2.31:1
- Required: 4.5:1 for normal text

**Recommended fix:**
```css
.themeDark .ChatWidget_toggleLabel__5c18w {
  color: #fff; /* White text on purple background */
}
```

Or use a darker background:
```css
.themeDark .ChatWidget_toggle {
  background-color: var(--color-primary); /* #6fa8ff */
}
.themeDark .ChatWidget_toggleLabel__5c18w {
  color: #181a1b; /* Dark text on light background */
}
```

---

## Recommendation

### Immediate Actions (P0 - Critical)

1. **Fix ChatWidget toggle label contrast in dark theme**
   - Change text color to white or adjust background color
   - Ensure 4.5:1 contrast ratio

2. **Fix logo text contrast in dark/HCB themes**
   - Investigate why logo text doesn't inherit theme colors properly
   - May be related to gradient/hover transition effects
   - Consider using CSS custom properties that adapt to theme

### Future Considerations

3. **Add contrast regression tests**
   - Run contrast audit as part of CI pipeline
   - Fail builds on new contrast violations

4. **Create design tokens for text-on-background combinations**
   - Ensure all text/background pairs are pre-validated
   - Document approved color combinations

---

## Test Evidence

Test suite: `tests/a11y/perceivable/color-contrast-audit.spec.ts`
Results JSON: `tests/a11y/audit-results/contrast/contrast-audit-results.json`

```bash
# Run the contrast audit
npx playwright test tests/a11y/perceivable/color-contrast-audit.spec.ts --workers=1
```

---

*Last updated: 2026-01-28*
