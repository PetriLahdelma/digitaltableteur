# Phase 02: Typography & Font System — Execution Plan

> **Phase**: 02 of 12
> **Objective**: Replace TiemposHeadline + Moderat with Syne + Satoshi using next/font optimization
> **Estimated Scope**: Medium (single session)
> **Created**: 2026-01-14

---

## Objective

Implement a new typography system with:
1. **Syne** (Google Fonts, variable) — Bold display font for headings
2. **Satoshi** (Fontshare, variable) — Clean geometric sans for body text
3. **next/font** optimization — Self-hosting, zero layout shift
4. CSS variables for Tailwind integration
5. Updated typography primitives (Heading, Text, Display)

---

## Execution Context

### Files to Create
- `app/fonts.ts` — Font configuration with next/font
- `app/fonts/Satoshi-Variable.woff2` — Satoshi variable font file
- `app/fonts/Satoshi-VariableItalic.woff2` — Satoshi italic variable
- `nextjs-app/shared/components/Heading/` — New heading component (Tailwind-based)
- `nextjs-app/shared/components/Display/` — Display text component

### Files to Modify
- `app/layout.tsx` — Add font CSS variables to html element
- `app/globals.css` — Update font imports
- `tailwind.config.ts` — Update fontFamily configuration
- `nextjs-app/shared/styles/variables.css` — Update font CSS custom properties
- `nextjs-app/shared/components/Title/Title.tsx` — Map to new fonts
- `nextjs-app/shared/components/Text/Text.tsx` — Map to new fonts

### Files to Reference (Read-Only)
- `nextjs-app/shared/styles/fonts.css` — Current @font-face definitions
- `.planning/phases/02-typography-fonts/02-RESEARCH.md` — Research findings

---

## Context

### Current State
- **Heading Font**: TiemposHeadline (serif, multiple static weights)
- **Body Font**: Moderat (sans-serif, static files)
- **Loading**: @font-face in CSS (not optimized)
- **Typography Components**: Title, Text (CSS Modules)
- **Variables**: --font-title, --font-text in variables.css

### Target State
- **Heading Font**: Syne (sans-serif, variable, 400-800)
- **Body Font**: Satoshi (sans-serif, variable, 300-900)
- **Loading**: next/font with self-hosting
- **Typography Components**: Updated with Tailwind support
- **Variables**: CSS variables from next/font + Tailwind integration

### Font Pairing Rationale
- **Syne**: Experimental display font with widening weights, perfect for bold studio aesthetic
- **Satoshi**: Clean geometric sans with excellent readability, modernist feel

---

## Tasks

### Task 1: Download Satoshi Variable Font Files

**Objective**: Get Satoshi variable font files from Fontshare

**Actions**:
1. Download Satoshi Variable from https://www.fontshare.com/fonts/satoshi
2. Extract `Satoshi-Variable.woff2` and `Satoshi-VariableItalic.woff2`
3. Place in `app/fonts/` directory

**Verification**:
- `app/fonts/Satoshi-Variable.woff2` exists
- `app/fonts/Satoshi-VariableItalic.woff2` exists
- Files are WOFF2 format (optimal for web)

---

### Task 2: Create Font Configuration

**Objective**: Set up next/font with Syne (Google) and Satoshi (local)

**File**: `app/fonts.ts`

**Content**:
```typescript
import { Syne } from "next/font/google";
import localFont from "next/font/local";

/**
 * Syne — Display/heading font (variable, 400-800)
 * Experimental, widening weights for bold studio aesthetic
 * Source: Google Fonts
 */
export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: "400..800",
});

/**
 * Satoshi — Body/text font (variable, 300-900)
 * Clean geometric sans-serif for excellent readability
 * Source: Fontshare (Indian Type Foundry)
 */
export const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

/**
 * CSS classes for applying fonts
 */
export const fontVariables = `${syne.variable} ${satoshi.variable}`;
```

**Verification**:
- File compiles without TypeScript errors
- Both fonts exported with CSS variables

---

### Task 3: Update Root Layout

**Objective**: Apply font CSS variables to the HTML element

**File**: `app/layout.tsx`

**Changes**:
1. Import fonts from `./fonts`
2. Add font variables to `<html>` className

**Updated Code**:
```tsx
import { fontVariables } from "./fonts";

// In RootLayout:
<html lang="en" className={fontVariables} suppressHydrationWarning>
```

**Verification**:
- CSS variables `--font-heading` and `--font-body` are applied to `<html>`
- No hydration warnings related to fonts
- DevTools shows font variables in Computed styles

---

### Task 4: Update Tailwind Font Configuration

**Objective**: Configure Tailwind to use the new font CSS variables

**File**: `tailwind.config.ts`

**Update theme.extend.fontFamily**:
```typescript
fontFamily: {
  // Primary fonts (new system)
  heading: ["var(--font-heading)", "system-ui", "sans-serif"],
  body: ["var(--font-body)", "system-ui", "sans-serif"],

  // Semantic aliases
  display: ["var(--font-heading)", "system-ui", "sans-serif"],
  sans: ["var(--font-body)", "system-ui", "sans-serif"],

  // Legacy compatibility (maps old tokens to new fonts)
  title: ["var(--font-heading)", "system-ui", "sans-serif"],
  text: ["var(--font-body)", "system-ui", "sans-serif"],
  "body-primary": ["var(--font-body)", "system-ui", "sans-serif"],
  "body-secondary": ["var(--font-heading)", "system-ui", "sans-serif"],
  "heading-primary": ["var(--font-heading)", "system-ui", "sans-serif"],
  "heading-secondary": ["var(--font-body)", "system-ui", "sans-serif"],
},
```

**Verification**:
- `font-heading`, `font-body`, `font-display` utilities work
- Legacy `font-title`, `font-text` still work
- No TypeScript errors

---

### Task 5: Update CSS Custom Properties

**Objective**: Update variables.css to reference new fonts

**File**: `nextjs-app/shared/styles/variables.css`

**Changes to :root**:
```css
/* Typography tokens - updated for Syne + Satoshi */
--font-title: var(--font-heading), system-ui, sans-serif;
--font-text: var(--font-body), system-ui, sans-serif;

/* Font family aliases */
--primary-body-font: var(--font-body), system-ui, sans-serif;
--secondary-body-font: var(--font-heading), system-ui, sans-serif;
--primary-bold-font: var(--font-body), system-ui, sans-serif;
--secondary-bold-font: var(--font-heading), system-ui, sans-serif;
--primary-heading-font: var(--font-heading), system-ui, sans-serif;
--secondary-heading-font: var(--font-body), system-ui, sans-serif;
```

**Verification**:
- Existing components using `var(--font-title)` get Syne
- Existing components using `var(--font-text)` get Satoshi
- No visual regressions in existing pages

---

### Task 6: Update Title Component

**Objective**: Update Title component to work with new fonts

**File**: `nextjs-app/shared/components/Title/Title.tsx`

**Changes**:
- Update `terminals` prop behavior:
  - `serif` → Uses heading font (Syne) — keeping semantic meaning
  - `sans` → Uses body font (Satoshi)
- Note: Syne is technically sans-serif but serves the "display/heading" role

**File**: `nextjs-app/shared/components/Title/Title.module.css`

**Update font-family rules**:
```css
.fontSerif {
  font-family: var(--font-heading), system-ui, sans-serif;
}

.fontSans {
  font-family: var(--font-body), system-ui, sans-serif;
}
```

**Verification**:
- Title component renders with Syne by default
- `terminals="sans"` uses Satoshi
- All existing Title usages work without changes

---

### Task 7: Update Text Component

**Objective**: Update Text component to use new fonts

**File**: `nextjs-app/shared/components/Text/Text.module.css`

**Update font-family rules**:
```css
.serif {
  font-family: var(--font-heading), system-ui, sans-serif;
}

.sans {
  font-family: var(--font-body), system-ui, sans-serif;
}
```

**Verification**:
- Text component renders with Satoshi by default
- `terminals="serif"` uses Syne
- All existing Text usages work without changes

---

### Task 8: Create Heading Component (Tailwind-based)

**Objective**: Create new Heading component using Tailwind utilities

**Directory**: `nextjs-app/shared/components/Heading/`

**Files to create**:

`Heading.tsx`:
```tsx
import React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "display" | "xl" | "lg" | "md" | "sm" | "xs";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: `h${HeadingLevel}`;
  size?: HeadingSize;
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  display: "text-display font-bold leading-tight",
  xl: "text-title-xl font-bold leading-tight",
  lg: "text-title-l font-semibold leading-snug",
  md: "text-title-m font-semibold leading-snug",
  sm: "text-title-s font-medium leading-normal",
  xs: "text-text-l font-medium leading-normal",
};

export function Heading({
  level = 2,
  as,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as || (`h${level}` as const);
  const defaultSize = level === 1 ? "xl" : level === 2 ? "lg" : level === 3 ? "md" : "sm";
  const sizeClass = sizeClasses[size || defaultSize];

  return (
    <Tag
      className={cn("font-heading text-foreground", sizeClass, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Heading;
```

`index.ts`:
```typescript
export { Heading, default } from "./Heading";
```

**Verification**:
- Component renders with Syne font
- Size variants work correctly
- Tailwind classes apply properly

---

### Task 9: Create Display Component

**Objective**: Create Display component for hero/large text

**Directory**: `nextjs-app/shared/components/Display/`

**Files to create**:

`Display.tsx`:
```tsx
import React from "react";
import { cn } from "@/lib/utils";

interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "p" | "span" | "div";
  children: React.ReactNode;
}

export function Display({
  as: Tag = "h1",
  className,
  children,
  ...props
}: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-display font-bold leading-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Display;
```

`index.ts`:
```typescript
export { Display, default } from "./Display";
```

**Verification**:
- Component renders at display size
- Uses Syne font
- Works in all 4 themes

---

### Task 10: Update Typography Test Component

**Objective**: Update TailwindTest to demonstrate new typography

**File**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

**Add Typography Section**:
```tsx
{/* Typography Demo */}
<div className="mb-internal-16 space-y-internal-8">
  <h3 className="font-heading text-title-m font-bold">Typography System</h3>

  <div className="space-y-internal-4">
    <p className="font-heading text-display font-bold leading-tight">
      Display — Syne Bold
    </p>
    <p className="font-heading text-title-xl font-semibold">
      Heading XL — Syne Semibold
    </p>
    <p className="font-heading text-title-l">
      Heading L — Syne Regular
    </p>
    <p className="font-body text-text-l">
      Body Large — Satoshi for body text and UI elements
    </p>
    <p className="font-body text-text-m">
      Body Medium — Clean and readable at any size
    </p>
    <p className="font-body text-text-s text-muted-foreground">
      Body Small — Muted for secondary content
    </p>
  </div>
</div>
```

**Verification**:
- Syne renders for headings
- Satoshi renders for body
- Font weights work correctly
- All sizes render properly

---

### Task 11: Verify Build and Themes

**Objective**: Ensure fonts work in all environments

**Actions**:
```bash
# Development
npm run dev

# Verify in browser:
# 1. Check fonts load correctly (Network tab)
# 2. Test all 4 themes
# 3. Check no FOUT (flash of unstyled text)

# Type checking
npm run typecheck

# Lint
npm run lint
```

**Verification**:
- `npm run dev` works
- No FOUT when loading pages
- Fonts work in light, dark, HC white, HC black themes
- No TypeScript errors
- No lint errors

---

### Task 12: Update Documentation

**Objective**: Document the new typography system

**File**: `.planning/codebase/CONVENTIONS.md`

**Add/Update Typography Section**:
```markdown
## Typography System

### Font Stack
| Role | Font | Source | Variable |
|------|------|--------|----------|
| Heading/Display | Syne | Google Fonts | `--font-heading` |
| Body/Text | Satoshi | Fontshare | `--font-body` |

### Tailwind Utilities
- `font-heading` — Syne (display, headings)
- `font-body` — Satoshi (body text, UI)
- `font-display` — Alias for heading
- `font-sans` — Alias for body

### Typography Components
| Component | Purpose | Default Font |
|-----------|---------|--------------|
| `<Heading>` | Section headings | Syne |
| `<Display>` | Hero text | Syne |
| `<Title>` | Legacy heading | Syne (serif) / Satoshi (sans) |
| `<Text>` | Body text | Satoshi (sans) / Syne (serif) |

### Size Scale
| Token | CSS Variable | Range |
|-------|--------------|-------|
| display | `--font-size-display` | 80px → 128px |
| title-xl | `--font-size-title-xl` | 56px → 88px |
| title-l | `--font-size-title-l` | 44px → 68px |
| title-m | `--font-size-title-m` | 32px → 48px |
| title-s | `--font-size-title-s` | 24px → 36px |
| text-l | `--font-size-text-l` | 18px → 24px |
| text-m | `--font-size-text-m` | 16px → 20px |
| text-s | `--font-size-text-s` | 12px → 17px |
```

**Verification**:
- Documentation is accurate
- Examples work as shown

---

## Verification Checklist

### Build Verification
- [ ] `npm run dev` starts without errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes

### Font Loading
- [ ] Syne loads from Google Fonts (self-hosted)
- [ ] Satoshi loads from local files
- [ ] No FOUT on initial page load
- [ ] Font files are WOFF2 (compressed)

### Component Verification
- [ ] Title component uses correct fonts
- [ ] Text component uses correct fonts
- [ ] New Heading component works
- [ ] New Display component works
- [ ] TailwindTest shows all typography variants

### Theme Verification
- [ ] Fonts work in light theme
- [ ] Fonts work in dark theme
- [ ] Fonts work in HC white theme
- [ ] Fonts work in HC black theme

---

## Success Criteria

1. **Syne + Satoshi fonts installed** — Both variable fonts loading correctly
2. **next/font optimization active** — Self-hosted, no external requests
3. **CSS variables configured** — `--font-heading`, `--font-body` available
4. **Tailwind integration working** — `font-heading`, `font-body` utilities
5. **Existing components updated** — Title, Text use new fonts
6. **New components created** — Heading, Display available
7. **No regressions** — All existing pages render correctly
8. **All themes working** — 4-theme support maintained

---

## Output

Upon completion:
- `app/fonts.ts` — Font configuration
- `app/fonts/Satoshi-*.woff2` — Local font files
- Updated `app/layout.tsx` — Font variables applied
- Updated `tailwind.config.ts` — Font family configuration
- Updated `variables.css` — CSS custom properties
- Updated Title/Text components — New font mappings
- New Heading component — Tailwind-based
- New Display component — Hero text
- Updated documentation

---

## Rollback Plan

If issues arise:
1. Remove font imports from `app/layout.tsx`
2. Delete `app/fonts.ts`
3. Delete `app/fonts/` directory
4. Revert `tailwind.config.ts` fontFamily changes
5. Revert `variables.css` font variable changes
6. Revert Title/Text component CSS changes
7. Delete new Heading/Display components
8. Run `npm run dev` to verify rollback

---

## Next Phase

After Phase 02 completion:
- **Phase 03**: Animation Infrastructure — GSAP, Lenis, animation primitives
- **Phase 04**: Layout System — Grid, Container, Section components

---

*Plan created: 2026-01-14*
*Font selection: Option A (Syne + Satoshi)*
