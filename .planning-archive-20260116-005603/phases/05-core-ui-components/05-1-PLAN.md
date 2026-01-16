# Phase 05-1: Core UI Components Enhancement

> **Phase**: 05 (Core UI Components)
> **Plan**: 1 of 2
> **Status**: Ready
> **Estimated Tasks**: 10

---

## Objective

Enhance core UI components with Tailwind-first variants and create missing primitives. This plan focuses on button, link, badge, and icon components — establishing patterns for Tailwind integration.

**Deliverables:**
1. Tailwind-enhanced Button variants (extending shadcn/ui)
2. Tailwind-enhanced Link with animation support
3. Badge component with Tailwind styling
4. Icon wrapper using Tailwind size classes
5. Divider component (horizontal/vertical)

---

## Existing Infrastructure

The codebase has two component systems:

| System | Location | Style Approach |
|--------|----------|----------------|
| Design System | `nextjs-app/shared/components/` | CSS Modules |
| shadcn/ui | `components/ui/` | Tailwind + CVA |

**Key existing components:**
- `Button` (CSS Modules) — Feature-rich but not Tailwind-first
- `Button` (shadcn/ui) — Tailwind-first, basic variants
- `Link` (CSS Modules) — External link detection, wavy underline
- `Badge` (CSS Modules) — States, removable, icons
- `Icon` (CSS Modules) — Phosphor icons wrapper

**Goal:** Create Tailwind-first alternatives that integrate with both systems.

---

## Context

**Files to read before executing:**

```
components/ui/button.tsx                           # shadcn/ui button pattern
nextjs-app/shared/components/Button/Button.tsx    # Existing button (reference)
nextjs-app/shared/components/Link/Link.tsx        # Existing link
nextjs-app/shared/components/Badge/Badge.tsx      # Existing badge
nextjs-app/shared/components/Icon/Icon.tsx        # Existing icon
lib/utils.ts                                       # cn() utility
```

**Design system tokens:**
- Colors: `--color-*`, shadcn variables (`--primary`, `--secondary`, etc.)
- Spacing: Tailwind config extends with design tokens
- Typography: `font-heading`, `font-body` from Phase 02

---

## Tasks

### Task 1: Extend shadcn/ui Button with Studio Variants
**Action**: Add custom variants to match design language

**Edit**: `components/ui/button.tsx`

Add new variants to buttonVariants:
```typescript
variants: {
  variant: {
    // Existing shadcn variants
    default: "...",
    destructive: "...",
    outline: "...",
    secondary: "...",
    ghost: "...",
    link: "...",

    // NEW: Studio variants
    primary: "bg-foreground text-background hover:bg-foreground/90 font-heading",
    inverse: "bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background font-heading",
    minimal: "text-foreground hover:opacity-70 underline-offset-4 hover:underline font-body",
  },
  size: {
    // Existing
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3",
    lg: "h-10 px-6",
    icon: "size-9",

    // NEW: Studio sizes
    xl: "h-12 px-8 text-text-m font-semibold",
  }
}
```

**Verification**: `<Button variant="primary">` renders with studio styling

---

### Task 2: Create TextLink Component
**Action**: Create Tailwind-first link for inline text with hover effects

**Create folder**: `nextjs-app/shared/components/TextLink/`

```typescript
// TextLink.tsx
"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TextLinkProps {
  href: string;
  children: ReactNode;
  variant?: "default" | "muted" | "accent";
  underline?: "always" | "hover" | "none";
  external?: boolean;
  className?: string;
}

const variantClasses = {
  default: "text-foreground hover:text-foreground/80",
  muted: "text-muted-foreground hover:text-foreground",
  accent: "text-primary hover:text-primary/80",
} as const;

const underlineClasses = {
  always: "underline underline-offset-4",
  hover: "hover:underline underline-offset-4",
  none: "",
} as const;

export function TextLink({
  href,
  children,
  variant = "default",
  underline = "hover",
  external,
  className,
}: TextLinkProps) {
  const isExternal = external ?? (!href.startsWith("/") && !href.startsWith("#"));

  const linkClasses = cn(
    "inline-flex items-center gap-1 transition-colors font-body",
    variantClasses[variant],
    underlineClasses[underline],
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span className="inline-block size-3.5" aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <Link href={href} className={linkClasses}>
      {children}
    </Link>
  );
}
```

Create `index.ts` barrel export.

**Verification**: TextLink renders with hover underline effect

---

### Task 3: Create Tailwind Badge Component
**Action**: Create simple Tailwind-first badge/tag component

**Create folder**: `nextjs-app/shared/components/Tag/`

```typescript
// Tag.tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TagProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-foreground",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
} as const;

const sizeClasses = {
  sm: "px-2 py-0.5 text-text-s",
  md: "px-2.5 py-1 text-text-s",
  lg: "px-3 py-1.5 text-text-m",
} as const;

export function Tag({
  children,
  variant = "default",
  size = "md",
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-body font-medium rounded-sm",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Tag renders with correct variant colors

---

### Task 4: Create Divider Component
**Action**: Create horizontal/vertical divider component

**Create folder**: `nextjs-app/shared/components/Divider/`

```typescript
// Divider.tsx
import { cn } from "@/lib/utils";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  decorative = true,
  className,
}: DividerProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}
```

Create `index.ts` barrel export.

**Verification**: Divider renders as thin line

---

### Task 5: Create IconButton Component
**Action**: Create icon-only button wrapper with consistent sizing

**Create folder**: `nextjs-app/shared/components/IconButton/`

```typescript
// IconButton.tsx
"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface IconButtonProps {
  icon: ReactNode;
  label: string; // Required for accessibility
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const sizeMap = {
  sm: "icon-sm" as const,
  md: "icon" as const,
  lg: "icon-lg" as const,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = "ghost", size = "md", className, onClick, disabled }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={sizeMap[size]}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn("rounded-full", className)}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
```

Create `index.ts` barrel export.

**Verification**: IconButton renders as circular button with icon

---

### Task 6: Create VisuallyHidden Component
**Action**: Create screen-reader-only content utility

**Create folder**: `nextjs-app/shared/components/VisuallyHidden/`

```typescript
// VisuallyHidden.tsx
import { type ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  as?: "span" | "div";
}

export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Content hidden visually but readable by screen readers

---

### Task 7: Create Prose Component
**Action**: Create prose wrapper for rich text content

**Create folder**: `nextjs-app/shared/components/Prose/`

```typescript
// Prose.tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProseProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "prose-sm",
  md: "prose-base",
  lg: "prose-lg",
} as const;

export function Prose({
  children,
  size = "md",
  className,
}: ProseProps) {
  return (
    <div
      className={cn(
        "prose-width font-body",
        "[&>p]:mb-4 [&>p]:leading-relaxed",
        "[&>h2]:font-heading [&>h2]:text-title-m [&>h2]:mt-8 [&>h2]:mb-4",
        "[&>h3]:font-heading [&>h3]:text-title-s [&>h3]:mt-6 [&>h3]:mb-3",
        "[&>ul]:pl-5 [&>ol]:pl-5",
        "[&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:italic",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Prose applies consistent typography to nested content

---

### Task 8: Create Barrel Export for UI Components
**Action**: Create central export for all UI primitive components

**Create**: `nextjs-app/shared/components/ui/index.ts`

```typescript
// Re-export Tailwind-first UI primitives
export { TextLink, type TextLinkProps } from "../TextLink";
export { Tag, type TagProps } from "../Tag";
export { Divider, type DividerProps } from "../Divider";
export { IconButton, type IconButtonProps } from "../IconButton";
export { VisuallyHidden, type VisuallyHiddenProps } from "../VisuallyHidden";
export { Prose, type ProseProps } from "../Prose";

// Re-export shadcn/ui components for convenience
export { Button, buttonVariants } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Textarea } from "@/components/ui/textarea";
export { Label } from "@/components/ui/label";
export { Checkbox } from "@/components/ui/checkbox";
export { Switch } from "@/components/ui/switch";
```

**Verification**: All UI components importable from single path

---

### Task 9: Add UI Components Demo to TailwindTest
**Action**: Extend TailwindTest with UI components showcase

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add new section after Layout Demo:

```typescript
// Add imports
import { TextLink, Tag, Divider, IconButton, Prose } from "../ui";
import { ArrowRight, Heart, Share } from "@phosphor-icons/react";

// Add new section:
{/* UI Components Demo - Phase 05 */}
<div className="mt-8 pt-8 border-t border-border">
  <h3 className="font-heading text-title-m font-bold mb-6">
    UI Components
  </h3>

  <Stack gap="lg">
    {/* Button variants */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Button variants:</p>
      <Stack direction="horizontal" gap="sm" wrap>
        <Button variant="primary">Primary</Button>
        <Button variant="inverse">Inverse</Button>
        <Button variant="minimal">Minimal</Button>
      </Stack>
    </div>

    {/* TextLink */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">TextLink:</p>
      <Stack direction="horizontal" gap="md">
        <TextLink href="/about">Internal link</TextLink>
        <TextLink href="https://example.com" variant="accent">External link</TextLink>
      </Stack>
    </div>

    {/* Tags */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Tags:</p>
      <Stack direction="horizontal" gap="xs" wrap>
        <Tag>Default</Tag>
        <Tag variant="secondary">Secondary</Tag>
        <Tag variant="outline">Outline</Tag>
        <Tag variant="success">Success</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="error">Error</Tag>
      </Stack>
    </div>

    {/* Divider */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Divider:</p>
      <Stack gap="sm">
        <p className="font-body text-text-m">Content above</p>
        <Divider />
        <p className="font-body text-text-m">Content below</p>
      </Stack>
    </div>

    {/* IconButton */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">IconButton:</p>
      <Stack direction="horizontal" gap="sm">
        <IconButton icon={<Heart size={20} />} label="Like" />
        <IconButton icon={<Share size={20} />} label="Share" variant="outline" />
        <IconButton icon={<ArrowRight size={20} />} label="Next" variant="default" />
      </Stack>
    </div>
  </Stack>

  <div className="mt-6 p-4 bg-muted/50 rounded-sm">
    <p className="font-body text-text-s">
      <strong className="font-heading">UI Stack:</strong> TextLink, Tag, Divider, IconButton, VisuallyHidden, Prose
    </p>
  </div>
</div>
```

**Verification**: Navigate to TailwindTest, UI components display correctly

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
1. Open TailwindTest page — UI components render
2. Button variants display correctly
3. TextLink handles internal/external links
4. Tags show variant colors
5. Divider renders as thin line
6. IconButton is accessible with label

**Verification Checklist**:
- [ ] Button variants work (primary, inverse, minimal)
- [ ] TextLink component works
- [ ] Tag component works
- [ ] Divider component works
- [ ] IconButton component works
- [ ] VisuallyHidden component works
- [ ] Prose component works
- [ ] Barrel export works
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] shadcn/ui Button extended with studio variants
- [ ] TextLink component created
- [ ] Tag component created
- [ ] Divider component created
- [ ] IconButton component created
- [ ] VisuallyHidden component created
- [ ] Prose component created
- [ ] Barrel export created
- [ ] Demo added to TailwindTest
- [ ] TypeScript compiles without errors

---

## Output

After completion:
1. Commit each component individually
2. Proceed to Phase 05-2 (Form Components)
3. Or run `/gsd:verify-work` to test UI components

---

## Notes

- **Complements existing system**: New components work alongside existing CSS Modules components
- **Tailwind-first**: All new components use `cn()` utility
- **shadcn/ui integration**: Extends rather than replaces shadcn/ui
- **No breaking changes**: Existing components continue working

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 05-1`*
