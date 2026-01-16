# Theme System Documentation

> Complete guide to the Digitaltableteur theme system including usage, customization, and accessibility support.

## Overview

The theme system supports four distinct themes:

| Theme | Class | Description |
|-------|-------|-------------|
| **Light** | (default) | Standard light mode with blue accents |
| **Dark** | `.themeDark` | Dark mode with adjusted colors for reduced eye strain |
| **HC Black** | `.themeHCB` | High contrast black - maximum contrast for accessibility |
| **HC White** | `.themeHCW` | High contrast white - high contrast light mode |

---

## Quick Start

### Using the ThemeProvider

Wrap your application with `ThemeProvider`:

```tsx
import { ThemeProvider } from "@dt/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Accessing Theme in Components

Use the `useTheme` hook to access and control themes:

```tsx
import { useTheme } from "@dt/ThemeProvider";

function ThemeToggle() {
  const { theme, toggleTheme, setTheme, systemPreference, isExplicitChoice, resetToSystemPreference } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme} | System: {systemPreference}
    </button>
  );
}
```

### useTheme Hook API

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `Theme` | Current active theme (`light`, `dark`, `hcb`, `hcw`) |
| `toggleTheme` | `() => void` | Cycles to next theme in sequence |
| `setTheme` | `(theme: Theme) => void` | Sets specific theme |
| `systemPreference` | `"light" \| "dark"` | OS color scheme preference |
| `isExplicitChoice` | `boolean` | Whether user manually chose a theme |
| `resetToSystemPreference` | `() => void` | Clears stored preference, follows system |

---

## CSS Custom Properties Reference

### Core Colors

```css
/* Text */
--color-text              /* Primary text color */
--primary-text-color      /* Alias for primary text */
--secondary-text-color    /* Subdued text */
--inverted-text-color     /* Text on dark backgrounds */

/* Backgrounds */
--main-body-background-color   /* Page background */
--color-light-bg               /* Card/section backgrounds */
--color-white                  /* Pure white (inverted in dark) */

/* Brand/Primary */
--color-primary           /* Primary brand color */
--color-primary-disabled  /* Disabled state */
--link-color              /* Link text color */

/* Semantic */
--color-success           /* Success states */
--color-error             /* Error states */
--color-warning           /* Warning states */
--color-info              /* Info states */

/* UI */
--color-border            /* Border color */
--color-border-light      /* Light borders */
--color-muted             /* Muted elements */
```

### Focus Ring Tokens

```css
--focus-ring-color   /* Color of focus outline */
--focus-ring-width   /* Width of focus outline (2px default, 3px HC) */
--focus-ring-offset  /* Offset from element (2px default, 3px HC) */
```

### Component-Specific Tokens

```css
/* Modal */
--modal-overlay-bg   /* Modal backdrop color */
--modal-shadow       /* Modal shadow */

/* Gallery */
--gallery-caption-bg /* Image caption background */

/* Checkbox */
--checkbox-checkmark-color  /* Check mark color */
--checkbox-background-color /* Unchecked background */
```

---

## Using Theme Colors in Components

### CSS Modules (Recommended)

```css
/* MyComponent.module.css */
.container {
  background-color: var(--main-body-background-color);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.title {
  color: var(--color-primary);
}

.error {
  color: var(--color-error);
  background-color: var(--color-error-bg);
}
```

### Focus States

Always use the focus ring tokens for consistent focus visibility:

```css
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* For Windows High Contrast Mode */
@media (forced-colors: active) {
  .button:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}
```

---

## Adding New Theme Colors

### Step 1: Add to :root (Light Theme)

```css
/* In variables.css */
:root {
  --color-my-new-token: #value;
}
```

### Step 2: Add Dark Theme Override

```css
.themeDark {
  --color-my-new-token: #dark-value;
}
```

### Step 3: Add High Contrast Overrides

```css
.themeHCB {
  --color-my-new-token: #fff; /* or appropriate HC value */
}

.themeHCW {
  --color-my-new-token: #000; /* or appropriate HC value */
}
```

### High Contrast Guidelines

- **HCB (High Contrast Black)**: Background is pure black (#000), text is pure white (#fff)
- **HCW (High Contrast White)**: Background is pure white (#fff), text is pure black (#000)
- Avoid gradients and subtle shadows in HC modes
- Use solid colors with maximum contrast

---

## System Preference Detection

### prefers-color-scheme Support

The ThemeProvider automatically detects OS color scheme:

```tsx
// On first visit with no stored preference:
// - If OS prefers dark mode → dark theme applied
// - If OS prefers light mode → light theme applied

// Once user toggles theme, their choice is stored
// and takes precedence over system preference.
```

### Listening for System Changes

The provider listens for real-time system preference changes:

```tsx
// If user changes OS from light to dark mode,
// and they haven't explicitly chosen a theme,
// the site will automatically switch to dark.
```

### prefers-contrast Support

The CSS variables respond to `prefers-contrast: more`:

```css
@media (prefers-contrast: more) {
  :root {
    --color-text: #000;           /* Pure black text */
    --color-border: #000;         /* Solid borders */
    --focus-ring-width: 3px;      /* Thicker focus ring */
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root {
    --color-text: #fff;           /* Pure white text */
    --main-body-background-color: #000;
  }
}
```

---

## Testing Themes

### In Storybook

Visit **Foundation > ThemeProvider** for comprehensive theme testing:

- **AllThemes**: Side-by-side comparison of all 4 themes
- **Interactive**: Live theme switching demo
- **FocusStates**: Keyboard accessibility testing
- **ColorTokens**: Full color palette reference

### Manual Testing Checklist

1. **Light Theme**: Default appearance, blue primary color
2. **Dark Theme**: Dark background, light text, adjusted accent colors
3. **HC Black**: Pure black background, white text, no gradients
4. **HC White**: Pure white background, black text, no gradients

### Focus Testing

1. Tab through all interactive elements
2. Verify focus ring is visible in each theme
3. Test in Windows High Contrast Mode (or simulator)
4. Verify focus ring uses `Highlight` system color in forced-colors mode

---

## High Contrast Mode Support

### Windows High Contrast Mode

Use the `forced-colors` media query:

```css
@media (forced-colors: active) {
  .component {
    /* Use system colors */
    color: CanvasText;
    background: Canvas;
    border-color: CanvasText;
  }

  .component:focus-visible {
    outline: 3px solid Highlight;
  }
}
```

### System Color Keywords

| Keyword | Description |
|---------|-------------|
| `Canvas` | Background color |
| `CanvasText` | Text color |
| `Highlight` | Focus/selection color |
| `LinkText` | Link color |
| `ButtonText` | Button text color |

---

## Persistence

### Storage Strategy

1. **Primary**: localStorage (`theme` key)
2. **Fallback**: Cookie (`dt_theme`, 1 year expiry)

```tsx
// Theme is persisted automatically when:
// - User calls toggleTheme()
// - User calls setTheme()

// Theme is read on page load:
// 1. Check localStorage
// 2. If not found, check cookie
// 3. If not found, use system preference
```

### Clearing Preference

```tsx
const { resetToSystemPreference } = useTheme();

// This clears localStorage and cookie,
// and reverts to system preference
resetToSystemPreference();
```

---

## Troubleshooting

### Theme Not Applying

1. Ensure `ThemeProvider` wraps your app
2. Check if `forcedTheme` prop is overriding user preference
3. Clear localStorage: `localStorage.removeItem('theme')`

### Focus Ring Not Visible

1. Verify component uses `:focus-visible` (not `:focus`)
2. Check that `outline` is not set to `none` elsewhere
3. Ensure focus ring tokens are being inherited

### System Preference Not Working

1. Check browser supports `prefers-color-scheme`
2. Clear stored theme preference
3. Verify OS accessibility settings

### High Contrast Issues

1. Test with Windows High Contrast Mode
2. Use `forced-colors: active` media query
3. Avoid custom colors in forced-colors mode

---

## File Locations

| File | Purpose |
|------|---------|
| `nextjs-app/shared/styles/variables.css` | Theme color definitions |
| `nextjs-app/shared/styles/utilities.css` | Focus ring utilities |
| `nextjs-app/shared/components/ThemeProvider/ThemeProvider.tsx` | Theme state management |
| `nextjs-app/shared/components/ThemeProvider/ThemeProvider.stories.tsx` | Theme testing stories |
| `app/__tests__/theme-verification.test.tsx` | Theme integration tests |

---

## Related Documentation

- [LLM Component Generation Rules](./LLM_COMPONENT_GENERATION_RULES.md) - Component styling guidelines
- [Accessibility Guidelines](./ACCESSIBILITY.md) - Full a11y documentation
- [CSS Custom Properties](./CSS_CUSTOM_PROPERTIES.md) - Complete token reference

---

*Last updated: 2026-01-14*
