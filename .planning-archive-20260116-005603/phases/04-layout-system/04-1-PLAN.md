# Phase 04-1: Layout System Enhancement

> **Phase**: 04 (Layout System)
> **Plan**: 1 of 1
> **Status**: Complete
> **Completed**: 2026-01-14

---

## Objective

Enhance the existing layout system with Tailwind-first components and additional utilities. Build on top of existing PageLayout, Grid, and FlexBox while adding missing primitives.

**Deliverables:**
1. Container component (Tailwind-first, simpler than PageLayout)
2. Section component (semantic sections with vertical rhythm)
3. Stack component (vertical/horizontal stacking with consistent gaps)
4. Tailwind spacing utility classes
5. Asymmetric grid utilities

---

## Existing Infrastructure

The codebase already has comprehensive layout tools:

| Component | Location | Purpose |
|-----------|----------|---------|
| PageLayout | `patterns/PageLayout/` | Full-featured page sections with grid |
| Grid | `components/Grid/` | CSS Grid with span support |
| FlexBox | `components/FlexBox/` | Flexbox layout |
| CSS Variables | `styles/variables.css` | Spacing/breakpoint tokens |
| Tailwind Config | `tailwind.config.ts` | Extended spacing/screens |

**What's Missing:**
- Simple Container for content centering (PageLayout is feature-heavy)
- Stack for quick vertical/horizontal spacing
- Section for semantic page structure
- Tailwind utility classes for common layout patterns

---

## Context

**Files to read before executing:**

```
nextjs-app/shared/patterns/PageLayout/PageLayout.tsx   # Pattern to complement
nextjs-app/shared/components/Grid/Grid.tsx             # Existing grid component
nextjs-app/shared/styles/variables.css                 # Design tokens
tailwind.config.ts                                     # Tailwind configuration
app/globals.css                                        # Tailwind @theme block
```

**Existing patterns to follow:**
- Components in `nextjs-app/shared/components/` with folder structure
- Patterns in `nextjs-app/shared/patterns/` for complex compositions
- CSS Modules for styling, Tailwind for utilities
- `"use client"` only when needed

---

## Tasks

### Task 1: Create Container Component
**Action**: Create simple Tailwind-first container for content centering

**Create folder**: `nextjs-app/shared/components/Container/`

```typescript
// Container.tsx
import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  center?: boolean;
  className?: string;
  as?: ElementType;
}

const sizeClasses = {
  sm: "max-w-container-sm",   // 640px
  md: "max-w-container-md",   // 960px
  lg: "max-w-container-lg",   // 1200px
  xl: "max-w-container-xl",   // 1440px
  full: "max-w-full",
} as const;

export function Container({
  children,
  size = "lg",
  center = true,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full px-4 tablet:px-8 desktop:px-12",
        sizeClasses[size],
        center && "mx-auto",
        className
      )}
    >
      {children}
    </Component>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Container centers content with responsive padding

---

### Task 2: Create Section Component
**Action**: Create semantic section wrapper with vertical rhythm

**Create folder**: `nextjs-app/shared/components/Section/`

```typescript
// Section.tsx
"use client";

import { type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  children: ReactNode;
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "default" | "muted" | "accent" | "inverse";
  className?: string;
  id?: string;
}

const spacingClasses = {
  none: "",
  sm: "py-8 tablet:py-12 desktop:py-16",
  md: "py-12 tablet:py-16 desktop:py-24",
  lg: "py-16 tablet:py-24 desktop:py-32",
  xl: "py-24 tablet:py-32 desktop:py-48",
} as const;

const backgroundClasses = {
  default: "bg-background",
  muted: "bg-muted",
  accent: "bg-primary/5",
  inverse: "bg-foreground text-background",
} as const;

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing = "md", background = "default", className, id }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          spacingClasses[spacing],
          backgroundClasses[background],
          className
        )}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";
```

Create `index.ts` barrel export.

**Verification**: Section applies consistent vertical spacing

---

### Task 3: Create Stack Component
**Action**: Create vertical/horizontal stacking component with consistent gaps

**Create folder**: `nextjs-app/shared/components/Stack/`

```typescript
// Stack.tsx
import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface StackProps {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  className?: string;
  as?: ElementType;
}

const gapClasses = {
  none: "gap-0",
  xs: "gap-1",      // 4px
  sm: "gap-2",      // 8px
  md: "gap-4",      // 16px
  lg: "gap-6",      // 24px
  xl: "gap-8",      // 32px
} as const;

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

export function Stack({
  children,
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  className,
  as: Component = "div",
}: StackProps) {
  return (
    <Component
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </Component>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Stack provides consistent spacing between children

---

### Task 4: Create Spacer Component
**Action**: Create explicit spacing component for fine control

**Create folder**: `nextjs-app/shared/components/Spacer/`

```typescript
// Spacer.tsx
import { cn } from "@/lib/utils";

export interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  axis?: "vertical" | "horizontal";
  className?: string;
}

const sizeMap = {
  xs: { vertical: "h-2", horizontal: "w-2" },      // 8px
  sm: { vertical: "h-4", horizontal: "w-4" },      // 16px
  md: { vertical: "h-6", horizontal: "w-6" },      // 24px
  lg: { vertical: "h-8", horizontal: "w-8" },      // 32px
  xl: { vertical: "h-12", horizontal: "w-12" },    // 48px
  "2xl": { vertical: "h-16", horizontal: "w-16" }, // 64px
} as const;

export function Spacer({
  size = "md",
  axis = "vertical",
  className,
}: SpacerProps) {
  return (
    <div
      className={cn(sizeMap[size][axis], className)}
      aria-hidden="true"
    />
  );
}
```

Create `index.ts` barrel export.

**Verification**: Spacer creates explicit whitespace

---

### Task 5: Create AspectRatio Component
**Action**: Create aspect ratio container for images/videos

**Create folder**: `nextjs-app/shared/components/AspectRatio/`

```typescript
// AspectRatio.tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AspectRatioProps {
  children: ReactNode;
  ratio?: "1:1" | "4:3" | "16:9" | "21:9" | "3:2" | "2:3";
  className?: string;
}

const ratioClasses = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
} as const;

export function AspectRatio({
  children,
  ratio = "16:9",
  className,
}: AspectRatioProps) {
  return (
    <div className={cn("relative overflow-hidden", ratioClasses[ratio], className)}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
```

Create `index.ts` barrel export.

**Verification**: AspectRatio maintains proportions

---

### Task 6: Create Center Component
**Action**: Create centering utility component

**Create folder**: `nextjs-app/shared/components/Center/`

```typescript
// Center.tsx
import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface CenterProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function Center({
  children,
  className,
  as: Component = "div",
}: CenterProps) {
  return (
    <Component
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      {children}
    </Component>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Center horizontally and vertically centers content

---

### Task 7: Add Tailwind Layout Utilities
**Action**: Add custom layout utility classes to globals.css

**Edit**: `app/globals.css`

Add after existing @theme block:

```css
/* Layout Utilities */
@layer utilities {
  /* Full bleed - break out of container */
  .full-bleed {
    width: 100vw;
    margin-left: calc(50% - 50vw);
  }

  /* Prose width for readable content */
  .prose-width {
    max-width: 65ch;
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Grid utilities for asymmetric layouts */
  .grid-asymmetric-2-1 {
    grid-template-columns: 2fr 1fr;
  }

  .grid-asymmetric-1-2 {
    grid-template-columns: 1fr 2fr;
  }

  .grid-asymmetric-3-1 {
    grid-template-columns: 3fr 1fr;
  }

  .grid-sidebar-left {
    grid-template-columns: 280px 1fr;
  }

  .grid-sidebar-right {
    grid-template-columns: 1fr 280px;
  }

  /* Responsive grid column spans */
  .col-span-full {
    grid-column: 1 / -1;
  }
}

/* Responsive asymmetric grids */
@media (max-width: 768px) {
  .grid-asymmetric-2-1,
  .grid-asymmetric-1-2,
  .grid-asymmetric-3-1,
  .grid-sidebar-left,
  .grid-sidebar-right {
    grid-template-columns: 1fr;
  }
}
```

**Verification**: Utility classes work in Tailwind

---

### Task 8: Create Barrel Export for Layout Components
**Action**: Create central export for all layout components

**Create**: `nextjs-app/shared/components/layout/index.ts`

```typescript
// Re-export all layout components
export { Container, type ContainerProps } from "../Container";
export { Section, type SectionProps } from "../Section";
export { Stack, type StackProps } from "../Stack";
export { Spacer, type SpacerProps } from "../Spacer";
export { AspectRatio, type AspectRatioProps } from "../AspectRatio";
export { Center, type CenterProps } from "../Center";

// Re-export existing layout components
export { default as Grid, GridItem } from "../Grid";
export { default as FlexBox, type FlexBoxProps } from "../FlexBox";
```

**Verification**: All layout components importable from single path

---

### Task 9: Add Layout Demo to TailwindTest
**Action**: Extend TailwindTest with layout component showcase

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add new section demonstrating layout primitives:

```typescript
// Add imports
import { Container, Section, Stack, Spacer, Center, AspectRatio } from "../layout";

// Add new section after Animation Demo:
{/* Layout Demo - Phase 04 */}
<div className="mt-8 pt-8 border-t border-border">
  <h3 className="font-heading text-title-m font-bold mb-6">
    Layout Primitives
  </h3>

  <Stack gap="lg">
    {/* Container demo */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Container (md):</p>
      <Container size="md" className="bg-primary/10 p-4 rounded">
        <p className="font-body text-text-m text-center">Centered content with max-width</p>
      </Container>
    </div>

    {/* Stack demo */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Stack (horizontal, gap-md):</p>
      <Stack direction="horizontal" gap="md">
        <div className="bg-primary/20 p-3 rounded">Item 1</div>
        <div className="bg-primary/20 p-3 rounded">Item 2</div>
        <div className="bg-primary/20 p-3 rounded">Item 3</div>
      </Stack>
    </div>

    {/* Center demo */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Center:</p>
      <Center className="h-24 bg-primary/10 rounded">
        <p className="font-body text-text-m">Centered content</p>
      </Center>
    </div>

    {/* AspectRatio demo */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">AspectRatio (16:9):</p>
      <AspectRatio ratio="16:9" className="bg-primary/20 rounded max-w-sm">
        <Center className="h-full">
          <p className="font-body text-text-m">16:9 Container</p>
        </Center>
      </AspectRatio>
    </div>
  </Stack>

  <div className="mt-6 p-4 bg-muted/50 rounded-sm">
    <p className="font-body text-text-s">
      <strong className="font-heading">Layout Stack:</strong> Container, Section, Stack, Spacer, Center, AspectRatio + existing Grid/FlexBox
    </p>
  </div>
</div>
```

**Verification**: Navigate to TailwindTest, layout components display correctly

---

### Task 10: Verify and Test
**Action**: Run dev server and verify all functionality

**Commands**:
```bash
npm run dev
npm run typecheck
npm run lint
```

**Manual Testing**:
1. Open TailwindTest page — layout components render
2. Container centers content with responsive padding
3. Stack handles vertical/horizontal spacing
4. Section applies vertical rhythm
5. AspectRatio maintains proportions
6. Utility classes work (full-bleed, grid-asymmetric-*)

**Verification Checklist**:
- [ ] Container component works
- [ ] Section component works
- [ ] Stack component works
- [ ] Spacer component works
- [ ] AspectRatio component works
- [ ] Center component works
- [ ] Tailwind utilities available
- [ ] Barrel export works
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] Container component created with size variants
- [ ] Section component with spacing/background options
- [ ] Stack component for vertical/horizontal stacking
- [ ] Spacer component for explicit whitespace
- [ ] AspectRatio component for media containers
- [ ] Center component for centering
- [ ] Tailwind layout utilities added
- [ ] Barrel export created
- [ ] Demo added to TailwindTest
- [ ] TypeScript compiles without errors

---

## Output

After completion:
1. Commit each component individually
2. Update `.planning/STATE.md` to mark Phase 04 complete
3. Run `/gsd:verify-work` to test layout components

---

## Notes

- **Complements existing system**: These components work alongside PageLayout, Grid, and FlexBox — not replacing them
- **Tailwind-first**: New components use Tailwind classes via `cn()` utility
- **No breaking changes**: Existing layout patterns continue working
- **Section vs PageLayout**: Section is simpler (just spacing/background), PageLayout has grid system and max-width

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 04-1`*
