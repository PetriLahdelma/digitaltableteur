# Phase 11-1: Theme Verification & Fixes

> **Phase**: 11 (Theme & Accessibility Polish)
> **Plan**: 1 of 2
> **Tasks**: 10

---

## Objective

Verify all 4 themes (light, dark, HC black, HC white) work correctly across all components and pages. Fix any theme-related issues including missing focus states, color contrast violations, and inconsistent styling.

---

## Context

### Current State
- 4 themes defined in `nextjs-app/shared/styles/variables.css`: light, dark, hcb, hcw
- ThemeProvider at `nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx`
- Theme toggle in navigation (language switcher pattern)
- ~90 CSS custom properties per theme
- Theme classes: `.themeDark`, `.themeHCB`, `.themeHCW` (light is default)

### Known Issues (from exploration)
1. **Button has no `:focus-visible` styles** - Critical accessibility gap
2. **Limited `prefers-contrast: more` support** - Only light theme responds
3. **No `prefers-color-scheme: dark` auto-detection at startup**
4. **NextMobileMenu type error on Label size prop**
5. **Some components missing explicit theme color mappings**

### Key Files
- `nextjs-app/shared/styles/variables.css` — Theme color definitions
- `nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx` — Theme switching logic
- `nextjs-app/shared/components/Button/Button.module.css` — Missing focus states
- Components with CSS Modules throughout `nextjs-app/shared/components/`

### Dependencies
- Phase 05: Core UI Components (Button, TextInput, etc.)
- Phase 06: Interactive Components (Dialog, Tabs, etc.)

---

## Tasks

### Task 1: Create Focus Ring CSS Utility
**Files**: `nextjs-app/shared/styles/utilities.css`, `nextjs-app/shared/styles/variables.css`

Create a consistent focus ring utility for all interactive elements:
- Define `--focus-ring-color` in variables.css for each theme
- Create `.focus-ring` utility class in new utilities.css
- Use CSS outline with offset (not box-shadow) for better a11y
- Ensure high contrast themes have maximum visibility
- Support `@media (forced-colors: active)` for Windows High Contrast

```css
/* variables.css per theme */
--focus-ring-color: var(--color-primary);
--focus-ring-width: 2px;
--focus-ring-offset: 2px;

/* utilities.css */
.focus-ring:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

@media (forced-colors: active) {
  .focus-ring:focus-visible {
    outline: 3px solid Highlight;
  }
}
```

**Verification**: Focus ring visible in all 4 themes, tested in Windows High Contrast mode simulator

---

### Task 2: Add Focus States to Button Component
**Files**: `nextjs-app/shared/components/Button/Button.module.css`, `nextjs-app/shared/components/ui/Button.tsx`

Add missing `:focus-visible` styles to Button:
- Add focus ring to `.button` base class
- Ensure all variants (primary, secondary, ghost, outline, inverse, minimal) have visible focus
- Test focus appearance in all 4 themes
- Ensure Tailwind Button variant (`components/ui/Button.tsx`) also has focus styles

```css
/* Button.module.css */
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* High contrast override */
.button:focus-visible {
  box-shadow: none; /* Use outline only */
}
```

**Verification**: Tab through buttons in all themes, focus is clearly visible

---

### Task 3: Add Focus States to Form Components
**Files**: Multiple CSS Modules in form components

Add `:focus-visible` to form inputs:
- `TextInput/TextInput.module.css`
- `TextArea/TextArea.module.css`
- `Select/Select.module.css` (if exists)
- `Checkbox/Checkbox.module.css`
- `Switch/Switch.module.css`

Focus patterns:
- Text inputs: border color change + outline
- Checkboxes/switches: outline ring
- Dropdowns: outline on trigger

**Verification**: Tab through contact form, all fields have visible focus

---

### Task 4: Verify Theme Colors in All Components
**Files**: Audit of all `*.module.css` files

Systematic verification:
- List all components using hardcoded colors (grep for `#`, `rgb`, `hsl`)
- Replace with CSS custom properties from variables.css
- Test each component in dark theme specifically
- Test each component in HC black/white themes

Priority components to check:
- Card backgrounds
- Modal overlays
- Toast notifications
- Badge colors
- Code block backgrounds
- Quote/callout blocks

**Verification**: No hardcoded colors visible in dark/HC themes

---

### Task 5: Add `prefers-color-scheme` Auto-Detection
**Files**: `nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx`

Enhance ThemeProvider startup logic:
- Check `prefers-color-scheme: dark` media query on first load
- If no stored preference, respect OS preference
- Store explicit user choice to override auto-detection
- Provide hook: `useTheme().systemPreference` for reading OS setting

```tsx
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// In provider initialization
const storedTheme = getStoredTheme();
const initialTheme = storedTheme ?? getSystemTheme();
```

**Verification**: Open site with OS dark mode enabled, should auto-apply dark theme

---

### Task 6: Add `prefers-contrast: more` Support
**Files**: `nextjs-app/shared/styles/variables.css`

Add high contrast media query support:
- When `prefers-contrast: more` is active, increase contrast
- Boost text contrast in light/dark themes
- Consider auto-switching to HC themes when detected

```css
@media (prefers-contrast: more) {
  :root {
    --color-text: #000;
    --color-background: #fff;
    --color-text-secondary: #333;
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root {
    --color-text: #fff;
    --color-background: #000;
    --color-text-secondary: #ccc;
  }
}
```

**Verification**: Enable "Increase Contrast" in macOS accessibility settings, text becomes more readable

---

### Task 7: Fix NextMobileMenu Label Type Error
**Files**: `nextjs-app/shared/components/NextMobileMenu/NextMobileMenu.tsx`

Fix the known TypeScript error:
- Identify the Label component size prop issue
- Update prop types or usage to resolve error
- Ensure theme switcher in mobile menu works correctly
- Test theme switching from mobile menu

**Verification**: `npm run typecheck` passes with no errors in NextMobileMenu

---

### Task 8: Create Theme Testing Storybook Story
**Files**: `nextjs-app/shared/components/ThemeProvider/ThemeProvider.stories.tsx`

Create comprehensive Storybook story for theme testing:
- Show all 4 themes side-by-side
- Display key color tokens
- Show buttons in all variants × themes
- Show form inputs in all themes
- Include text samples for contrast checking

```tsx
export const AllThemes: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {["light", "dark", "hcb", "hcw"].map((theme) => (
        <ThemePreview theme={theme} key={theme} />
      ))}
    </div>
  ),
};
```

**Verification**: Story renders showing all themes, can visually compare

---

### Task 9: Run Theme Verification Tests
**Files**: Create new test file `app/__tests__/theme-verification.test.tsx`

Automated theme verification:
- Test each theme class applies correct CSS variable values
- Test theme toggle changes class on document
- Test localStorage persistence
- Test prefers-color-scheme media query response

```tsx
describe("Theme System", () => {
  it("applies dark theme class correctly", () => {
    // ...
  });

  it("persists theme choice to localStorage", () => {
    // ...
  });

  it("respects prefers-color-scheme", () => {
    // ...
  });
});
```

**Verification**: All theme tests pass

---

### Task 10: Document Theme System
**Files**: `docs/THEME_SYSTEM.md`

Create developer documentation:
- How to use themes in components
- CSS custom property reference
- How to add new theme colors
- Focus state patterns
- High contrast mode support
- Testing themes in Storybook

**Verification**: Documentation is complete and accurate

---

## Success Criteria

- [ ] Focus ring utility created and documented
- [ ] Button has visible focus states in all themes
- [ ] Form components have visible focus states
- [ ] No hardcoded colors in component CSS
- [ ] `prefers-color-scheme: dark` auto-detected on first visit
- [ ] `prefers-contrast: more` increases text contrast
- [ ] NextMobileMenu TypeScript error fixed
- [ ] Theme testing Storybook story created
- [ ] Theme verification tests pass
- [ ] Theme system documented

---

## Output

```
styles/
  utilities.css (new)
  variables.css (updated with focus ring vars)

components/
  Button/Button.module.css (focus states)
  TextInput/TextInput.module.css (focus states)
  TextArea/TextArea.module.css (focus states)
  Checkbox/Checkbox.module.css (focus states)
  Switch/Switch.module.css (focus states)
  ThemeProvider/ThemeProvider.tsx (prefers-color-scheme)
  ThemeProvider/ThemeProvider.stories.tsx (theme testing)
  NextMobileMenu/NextMobileMenu.tsx (type fix)

tests/
  app/__tests__/theme-verification.test.tsx (new)

docs/
  THEME_SYSTEM.md (new)
```

---

## Notes

- **Focus states are critical for WCAG 2.4.7 Focus Visible**
- **High contrast themes must maintain AAA contrast ratios (7:1)**
- **Test with actual assistive tech if possible (VoiceOver, NVDA)**
- **Windows High Contrast Mode uses `forced-colors: active` media query**

---

*Created: 2026-01-14*
