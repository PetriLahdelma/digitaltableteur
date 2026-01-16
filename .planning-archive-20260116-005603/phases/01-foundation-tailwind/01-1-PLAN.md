# Phase 01: Foundation & Tailwind Setup — Execution Plan

> **Phase**: 01 of 12
> **Objective**: Establish Tailwind CSS 4.x + shadcn/ui infrastructure alongside existing CSS Modules for gradual migration
> **Estimated Scope**: Medium (single session)
> **Created**: 2026-01-14

---

## Objective

Install and configure Tailwind CSS 4.x with shadcn/ui v2 in a way that:
1. Coexists peacefully with existing CSS Modules (hybrid approach)
2. Maps all existing CSS custom properties to Tailwind design tokens
3. Provides accessible, unstyled base primitives via shadcn/ui + Radix UI
4. Supports the 4-theme system (light, dark, HC white, HC black)
5. Integrates with the existing PostCSS/SWC build pipeline
6. Does NOT break any existing functionality

---

## Execution Context

### Files to Create
- `tailwind.config.ts` — Tailwind configuration with design tokens
- `postcss.config.mjs` — PostCSS configuration for hybrid CSS Modules + Tailwind
- `app/tailwind.css` — Tailwind base/components/utilities imports
- `components.json` — shadcn/ui configuration
- `lib/utils.ts` — shadcn/ui utility functions (cn helper)
- `components/ui/` — shadcn/ui base primitives directory

### Files to Modify
- `package.json` — Add Tailwind + shadcn dependencies
- `app/globals.css` — Import Tailwind styles alongside existing CSS
- `next.config.ts` — Ensure Tailwind content paths work correctly
- `tsconfig.json` — Add path aliases for shadcn/ui

### Files to Reference (Read-Only)
- `nextjs-app/shared/styles/variables.css` — Source of truth for design tokens
- `.planning/PROJECT.md` — Project vision and requirements
- `.planning/ROADMAP.md` — Phase dependencies

---

## Context

### Current State
- **Styling**: CSS Modules only (77+ components in `nextjs-app/shared/components/`)
- **Design Tokens**: CSS custom properties in `nextjs-app/shared/styles/variables.css`
- **Themes**: 4 themes (`:root`, `.themeDark`, `.themeHCB`, `.themeHCW`) via class selectors
- **Build**: Next.js 15.5.9 with SWC compiler (no Babel)
- **PostCSS**: Built-in to Next.js (no custom config currently)
- **Component Primitives**: Custom implementations, no Radix UI

### Target State
- **Styling**: Hybrid CSS Modules + Tailwind CSS (utilities for new components)
- **Design Tokens**: Tailwind config mirrors CSS custom properties
- **Themes**: Tailwind dark mode + custom theme classes
- **Build**: PostCSS processes both CSS Modules and Tailwind
- **Component Primitives**: shadcn/ui + Radix UI for accessible base components

### Key Design Decisions
1. **Tailwind 4.x** — Latest version with CSS-first configuration
2. **shadcn/ui v2** — Accessible, unstyled primitives built on Radix UI
3. **Hybrid approach** — CSS Modules continue working, Tailwind for new work
4. **Token mapping** — Tailwind utilities reference CSS custom properties
5. **Theme support** — `dark:` variant + custom `hcb:` and `hcw:` variants

---

## Tasks

### Task 1: Install Tailwind CSS 4.x Dependencies

**Objective**: Add Tailwind CSS and required PostCSS plugins

**Actions**:
```bash
npm install -D tailwindcss@4 @tailwindcss/postcss postcss
```

**Verification**:
- `package.json` includes `tailwindcss@4`, `@tailwindcss/postcss`, `postcss`
- `npm ls tailwindcss` shows version 4.x

---

### Task 2: Initialize shadcn/ui

**Objective**: Set up shadcn/ui v2 with Radix UI primitives

**Actions**:
```bash
# Initialize shadcn/ui
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate (we'll customize to match our tokens)
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Components path: components/ui
# - Utils path: lib/utils.ts
# - React Server Components: Yes
```

**This creates**:
- `components.json` — shadcn/ui configuration
- `lib/utils.ts` — Utility functions including `cn()` for className merging
- `components/ui/` — Directory for shadcn primitives

**Verification**:
- `components.json` exists at project root
- `lib/utils.ts` exists with `cn()` function
- Required dependencies added to `package.json`:
  - `class-variance-authority` — For variant styling
  - `clsx` — For conditional classes
  - `tailwind-merge` — For merging Tailwind classes

---

### Task 3: Add shadcn/ui Base Primitives

**Objective**: Install essential accessible primitives from shadcn/ui

**Actions**:
```bash
# Core primitives (built on Radix UI)
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tooltip
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add label
```

**This adds Radix UI dependencies**:
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-tabs`
- `@radix-ui/react-accordion`
- `@radix-ui/react-select`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-switch`
- `@radix-ui/react-label`
- `@radix-ui/react-slot`

**Verification**:
- Components exist in `components/ui/`
- Each component is accessible (keyboard navigation, ARIA attributes)
- No TypeScript errors

---

### Task 4: Create PostCSS Configuration

**Objective**: Configure PostCSS for hybrid CSS Modules + Tailwind

**File**: `postcss.config.mjs`

**Content**:
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Verification**:
- File exists at project root
- No build errors when running `npm run dev`

---

### Task 5: Create Tailwind CSS Entry Point

**Objective**: Create Tailwind CSS file with layer imports and shadcn/ui styles

**File**: `app/tailwind.css`

**Content**:
```css
/* Tailwind CSS 4.x entry point */
@import "tailwindcss";

/*
 * shadcn/ui CSS variables
 * These work alongside our existing CSS custom properties
 */
@layer base {
  :root {
    /* shadcn/ui base tokens mapped to our design system */
    --background: var(--main-body-background-color);
    --foreground: var(--primary-text-color);
    --card: var(--main-body-background-color);
    --card-foreground: var(--primary-text-color);
    --popover: var(--main-body-background-color);
    --popover-foreground: var(--primary-text-color);
    --primary: var(--color-primary);
    --primary-foreground: var(--inverted-text-color);
    --secondary: var(--color-muted);
    --secondary-foreground: var(--primary-text-color);
    --muted: var(--color-muted);
    --muted-foreground: var(--secondary-text-color);
    --accent: var(--accent-purple);
    --accent-foreground: var(--inverted-text-color);
    --destructive: var(--color-error);
    --destructive-foreground: var(--inverted-text-color);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-primary);
    --radius: var(--radius-md);
  }

  .themeDark {
    --background: var(--main-body-background-color);
    --foreground: var(--primary-text-color);
    --card: var(--main-body-background-color);
    --card-foreground: var(--primary-text-color);
    --popover: var(--main-body-background-color);
    --popover-foreground: var(--primary-text-color);
    --primary: var(--color-primary);
    --primary-foreground: var(--inverted-text-color);
    --secondary: var(--color-muted);
    --secondary-foreground: var(--primary-text-color);
    --muted: var(--color-muted);
    --muted-foreground: var(--secondary-text-color);
    --accent: var(--accent-purple);
    --accent-foreground: var(--inverted-text-color);
    --destructive: var(--color-error);
    --destructive-foreground: var(--inverted-text-color);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-primary);
  }

  .themeHCB {
    --background: var(--main-body-background-color);
    --foreground: var(--primary-text-color);
    --card: var(--main-body-background-color);
    --card-foreground: var(--primary-text-color);
    --popover: var(--main-body-background-color);
    --popover-foreground: var(--primary-text-color);
    --primary: var(--color-primary);
    --primary-foreground: var(--inverted-text-color);
    --secondary: var(--color-muted);
    --secondary-foreground: var(--primary-text-color);
    --muted: var(--color-muted);
    --muted-foreground: var(--secondary-text-color);
    --accent: var(--color-primary);
    --accent-foreground: var(--inverted-text-color);
    --destructive: var(--color-error);
    --destructive-foreground: var(--inverted-text-color);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-primary);
  }

  .themeHCW {
    --background: var(--main-body-background-color);
    --foreground: var(--primary-text-color);
    --card: var(--main-body-background-color);
    --card-foreground: var(--primary-text-color);
    --popover: var(--main-body-background-color);
    --popover-foreground: var(--primary-text-color);
    --primary: var(--color-primary);
    --primary-foreground: var(--inverted-text-color);
    --secondary: var(--color-muted);
    --secondary-foreground: var(--primary-text-color);
    --muted: var(--color-muted);
    --muted-foreground: var(--secondary-text-color);
    --accent: var(--color-primary);
    --accent-foreground: var(--inverted-text-color);
    --destructive: var(--color-error);
    --destructive-foreground: var(--inverted-text-color);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-primary);
  }
}

/* Custom variants for high-contrast themes */
@custom-variant hcb (&:is(.themeHCB *));
@custom-variant hcw (&:is(.themeHCW *));

/*
 * Hybrid approach note:
 * - CSS Modules continue to work as-is for existing components
 * - New components can use Tailwind utilities + shadcn/ui primitives
 * - All utilities reference CSS custom properties for consistency
 */
```

**Verification**:
- File exists at `app/tailwind.css`
- Tailwind classes work when applied to elements
- shadcn/ui components render correctly in all 4 themes

---

### Task 6: Create Tailwind Configuration

**Objective**: Configure Tailwind with design tokens matching existing CSS variables

**File**: `tailwind.config.ts`

**Content**:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // Enable dark mode via class (supports our theme system)
  darkMode: ["class"],

  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./nextjs-app/shared/components/**/*.{ts,tsx}",
    "./nextjs-app/shared/patterns/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],

  theme: {
    // Container configuration
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      // Typography - reference existing CSS custom properties
      fontFamily: {
        title: "var(--font-title)",
        text: "var(--font-text)",
        sans: "var(--font-text)",
        serif: "var(--font-title)",
        "body-primary": "var(--primary-body-font)",
        "body-secondary": "var(--secondary-body-font)",
        "heading-primary": "var(--primary-heading-font)",
        "heading-secondary": "var(--secondary-heading-font)",
      },

      fontSize: {
        // Responsive clamp-based sizes from variables.css
        "text-s": "var(--font-size-text-s)",
        "text-m": "var(--font-size-text-m)",
        "text-l": "var(--font-size-text-l)",
        "title-s": "var(--font-size-title-s)",
        "title-m": "var(--font-size-title-m)",
        "title-l": "var(--font-size-title-l)",
        "title-xl": "var(--font-size-title-xl)",
        display: "var(--font-size-display)",
        "button-s": "var(--font-size-button-s)",
        "button-m": "var(--font-size-button-m)",
        "button-l": "var(--font-size-button-l)",
      },

      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },

      // shadcn/ui colors (mapped to our design tokens via CSS variables)
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Our existing design tokens (direct var references)
        "dt-primary": {
          DEFAULT: "var(--color-primary)",
          disabled: "var(--color-primary-disabled)",
        },
        success: "var(--color-success)",
        info: "var(--color-info)",
        error: {
          DEFAULT: "var(--color-error)",
          bg: "var(--color-error-bg)",
          text: "var(--color-error-text)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          contrast: "var(--color-warning-contrast)",
          text: "var(--color-warning-text)",
        },
        "dt-accent": {
          pink: "var(--accent-pink)",
          purple: "var(--accent-purple)",
          teal: "var(--accent-teal)",
          violet: "var(--accent-violet)",
          cyan: "var(--accent-cyan)",
          yellow: "var(--accent-yellow)",
        },
      },

      // Spacing - reference existing CSS custom properties
      spacing: {
        // Internal (component) spacing
        "internal-0": "var(--space-internal-0)",
        "internal-2": "var(--space-internal-2)",
        "internal-4": "var(--space-internal-4)",
        "internal-6": "var(--space-internal-6)",
        "internal-8": "var(--space-internal-8)",
        "internal-12": "var(--space-internal-12)",
        "internal-16": "var(--space-internal-16)",
        "internal-24": "var(--space-internal-24)",
        "internal-32": "var(--space-internal-32)",

        // Layout (outer) spacing
        "layout-0": "var(--space-layout-0)",
        "layout-4": "var(--space-layout-4)",
        "layout-6": "var(--space-layout-6)",
        "layout-8": "var(--space-layout-8)",
        "layout-16": "var(--space-layout-16)",
        "layout-24": "var(--space-layout-24)",
        "layout-32": "var(--space-layout-32)",
        "layout-40": "var(--space-layout-40)",
        "layout-48": "var(--space-layout-48)",
        "layout-64": "var(--space-layout-64)",
        "layout-80": "var(--space-layout-80)",
        "layout-96": "var(--space-layout-96)",
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Container/sizing
      maxWidth: {
        "container-sm": "var(--container-sm)",
        "container-md": "var(--container-md)",
        "container-lg": "var(--container-lg)",
        "container-xl": "var(--container-xl)",
        form: "var(--size-width-form)",
      },

      // Breakpoints
      screens: {
        mobile: "480px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1440px",
        ultra: "1920px",
      },

      // Animation keyframes for shadcn/ui
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Additional Dependency**:
```bash
npm install -D tailwindcss-animate
```

**Verification**:
- File exists at project root
- TypeScript has no errors
- `npm run typecheck` passes

---

### Task 7: Update Path Aliases

**Objective**: Add path aliases for shadcn/ui components

**File**: `tsconfig.json`

**Add to compilerOptions.paths**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

**Verification**:
- TypeScript resolves `@/components/ui/button` correctly
- No import errors

---

### Task 8: Update globals.css

**Objective**: Import Tailwind CSS alongside existing styles

**File**: `app/globals.css`

**Current Content**:
```css
@import url("../nextjs-app/shared/index.css");
```

**New Content**:
```css
/* Tailwind CSS 4.x + shadcn/ui */
@import "./tailwind.css";

/* Existing CSS Modules and design system */
@import url("../nextjs-app/shared/index.css");
```

**Verification**:
- Both Tailwind and existing styles load
- No visual regressions in existing components
- Theme switching still works
- shadcn/ui components render correctly

---

### Task 9: Verify Build Pipeline

**Objective**: Ensure development and production builds work

**Actions**:
```bash
# Development build
npm run dev

# Verify in browser:
# 1. Open http://localhost:3000
# 2. Check theme switching works
# 3. Check existing components render correctly

# Production build
npm run build

# Type checking
npm run typecheck

# Lint
npm run lint
```

**Verification**:
- `npm run dev` starts without errors
- `npm run build` completes successfully
- No TypeScript errors
- No lint errors
- Existing pages render correctly
- Theme switching works

---

### Task 10: Create Test Component with shadcn/ui

**Objective**: Verify Tailwind + shadcn/ui integration works

**File**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

**Content**:
```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Temporary test component to verify Tailwind CSS + shadcn/ui integration.
 * DELETE THIS after Phase 01 is verified working.
 */
export default function TailwindTest() {
  return (
    <div className="p-internal-16 bg-background border border-border rounded-lg max-w-container-md mx-auto">
      <h2 className="font-title text-title-m text-foreground mb-internal-8">
        Tailwind + shadcn/ui Test
      </h2>

      <p className="font-text text-text-m text-muted-foreground mb-internal-16">
        If you can see this styled correctly, the setup is working!
      </p>

      {/* shadcn/ui Button variants */}
      <div className="flex flex-wrap gap-internal-8 mb-internal-16">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      {/* shadcn/ui Dialog */}
      <div className="mb-internal-16">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>
                This dialog is built with Radix UI primitives and is fully
                accessible (keyboard navigation, focus trap, screen reader
                support).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* shadcn/ui Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. Built on Radix UI primitives with full keyboard navigation and
            ARIA support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled with Tailwind?</AccordionTrigger>
          <AccordionContent>
            Yes. All styles use Tailwind utilities mapped to our design tokens.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Does it support our themes?</AccordionTrigger>
          <AccordionContent>
            Yes. The shadcn/ui CSS variables are mapped to our existing theme
            system (light, dark, HC white, HC black).
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-internal-16 p-internal-8 bg-muted rounded-sm">
        <p className="text-sm text-muted-foreground">
          Theme tokens from CSS variables are being used via Tailwind utilities
          + shadcn/ui components.
        </p>
      </div>
    </div>
  );
}
```

**File**: `nextjs-app/shared/components/TailwindTest/index.ts`

**Content**:
```typescript
export { default } from "./TailwindTest";
```

**Verification**:
- Component renders with correct styling
- shadcn/ui components are accessible (keyboard navigation works)
- Colors match design tokens
- Works in all 4 themes

---

### Task 11: Update Documentation

**Objective**: Document hybrid styling approach with shadcn/ui

**File**: `.planning/codebase/CONVENTIONS.md`

**Add Section**:
```markdown
## Hybrid Styling (CSS Modules + Tailwind + shadcn/ui)

### Migration Status
- **Existing Components**: CSS Modules (77+ components)
- **New Components**: Tailwind CSS utilities + shadcn/ui primitives
- **Design Tokens**: CSS custom properties (source of truth)

### Component Library Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Primitives | shadcn/ui + Radix UI | Accessible, unstyled base components |
| Styling | Tailwind CSS | Utility-first CSS |
| Tokens | CSS custom properties | Design system values |
| Legacy | CSS Modules | Existing components |

### When to Use What
| Scenario | Approach |
|----------|----------|
| Existing component modification | CSS Modules (match existing style) |
| New accessible primitive | shadcn/ui component |
| New component styling | Tailwind CSS utilities |
| Design token values | Always use CSS variables via Tailwind |
| Complex animations | CSS Modules or GSAP (Phase 03) |

### shadcn/ui Components Available
- `Button` — Primary, secondary, outline, ghost, destructive variants
- `Dialog` — Accessible modal with focus trap
- `DropdownMenu` — Accessible dropdown
- `Tooltip` — Accessible tooltip
- `Tabs` — Accessible tab interface
- `Accordion` — Accessible accordion
- `Input` — Styled text input
- `Textarea` — Styled textarea
- `Select` — Accessible select dropdown
- `Checkbox` — Accessible checkbox
- `Switch` — Accessible toggle switch
- `Label` — Form label with accessibility

### Example: New Component with shadcn/ui
\`\`\`tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function MyComponent() {
  return (
    <div className="p-internal-16 bg-background">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <p className="text-foreground">Content here</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
\`\`\`

### Theme-Aware Utilities
- `dark:` — Dark theme variant (via Tailwind)
- `hcb:` — High Contrast Black variant (custom)
- `hcw:` — High Contrast White variant (custom)

\`\`\`tsx
<div className="bg-background dark:bg-background hcb:bg-black hcw:bg-white">
  Theme-aware background
</div>
\`\`\`
```

**Verification**:
- Documentation is accurate
- Examples work as shown

---

## Verification Checklist

### Build Verification
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (no new errors)

### Functionality Verification
- [ ] All existing pages render correctly (no visual regressions)
- [ ] Theme switching works (light, dark, HC white, HC black)
- [ ] CSS Modules continue working
- [ ] Tailwind utilities apply correctly
- [ ] shadcn/ui components render correctly

### Accessibility Verification
- [ ] shadcn/ui Dialog has focus trap
- [ ] shadcn/ui components are keyboard navigable
- [ ] ARIA attributes present on interactive elements
- [ ] High contrast themes work with shadcn/ui

### Integration Verification
- [ ] TailwindTest component displays correctly
- [ ] Tailwind utilities use CSS custom property values
- [ ] Custom theme variants (hcb:, hcw:) work
- [ ] No conflicts between CSS Modules and Tailwind
- [ ] shadcn/ui color tokens map to our theme system

---

## Success Criteria

From ROADMAP.md:

1. **Tailwind CSS 4.x installed and configured** — All dependencies present, config valid
2. **shadcn/ui v2 initialized** — Base primitives available, Radix UI integrated
3. **Design tokens mapped to Tailwind** — All CSS variables accessible via utilities
4. **4-theme support configured** — dark:, hcb:, hcw: variants + shadcn theme mapping
5. **PostCSS pipeline working** — Both CSS Modules and Tailwind process correctly
6. **Build configuration updated** — Dev and production builds succeed
7. **Accessible primitives available** — Dialog, Button, Accordion, etc. work correctly
8. **No regressions** — Existing functionality preserved

---

## Output

Upon completion:
- `tailwind.config.ts` — Tailwind configuration with design tokens
- `postcss.config.mjs` — PostCSS for hybrid CSS Modules + Tailwind
- `app/tailwind.css` — Tailwind entry point with theme mappings
- `components.json` — shadcn/ui configuration
- `lib/utils.ts` — cn() utility function
- `components/ui/*` — shadcn/ui base primitives
- Updated `app/globals.css` — Imports both style systems
- Updated `tsconfig.json` — Path aliases for shadcn/ui
- Updated `.planning/codebase/CONVENTIONS.md` — Hybrid styling documentation
- TailwindTest component — Verification that setup works

---

## Dependencies Added

```json
{
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.x.x",
    "tailwindcss-animate": "^1.x.x"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x.x",
    "tailwind-merge": "^2.x.x",
    "@radix-ui/react-dialog": "^1.x.x",
    "@radix-ui/react-dropdown-menu": "^2.x.x",
    "@radix-ui/react-tooltip": "^1.x.x",
    "@radix-ui/react-tabs": "^1.x.x",
    "@radix-ui/react-accordion": "^1.x.x",
    "@radix-ui/react-select": "^2.x.x",
    "@radix-ui/react-checkbox": "^1.x.x",
    "@radix-ui/react-switch": "^1.x.x",
    "@radix-ui/react-label": "^2.x.x",
    "@radix-ui/react-slot": "^1.x.x"
  }
}
```

---

## Rollback Plan

If issues arise:
1. Remove Tailwind imports from `app/globals.css`
2. Delete `app/tailwind.css`
3. Delete `tailwind.config.ts`
4. Delete `postcss.config.mjs`
5. Delete `components.json`
6. Delete `lib/utils.ts`
7. Delete `components/ui/` directory
8. Remove dependencies:
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss postcss tailwindcss-animate \
     class-variance-authority clsx tailwind-merge \
     @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip \
     @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-select \
     @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-label \
     @radix-ui/react-slot
   ```
9. Revert `tsconfig.json` path changes
10. Run `npm run build` to verify rollback

---

## Next Phase

After Phase 01 completion:
- **Phase 02**: Typography & Font System — Select new font pairing, build type primitives
- **Phase 03**: Animation Infrastructure — GSAP, Lenis, animation primitives

---

*Plan created: 2026-01-14*
*Updated: 2026-01-14 — Added shadcn/ui v2 integration*
