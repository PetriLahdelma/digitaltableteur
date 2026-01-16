# Phase 06-1: Interactive Components Enhancement

> **Phase**: 06 (Interactive Components)
> **Plan**: 1 of 2
> **Status**: Ready
> **Estimated Tasks**: 10

---

## Objective

Enhance and integrate interactive components with Tailwind-first patterns and GSAP animations. This plan focuses on extending shadcn/ui components with studio variants, creating animated wrappers, and adding toast notifications with proper animation support.

**Deliverables:**
1. Extended Dialog with studio variants and animation
2. Extended Accordion with animation support
3. Extended Tabs with studio styling
4. Tooltip integration with studio styling
5. Toast notification system (Tailwind-first)
6. Interactive components barrel export

---

## Existing Infrastructure

### shadcn/ui Components (Already Installed)
| Component | Location | Status |
|-----------|----------|--------|
| Dialog | `components/ui/dialog.tsx` | Base Radix + Tailwind |
| Accordion | `components/ui/accordion.tsx` | Base Radix + Tailwind |
| Tabs | `components/ui/tabs.tsx` | Base Radix + Tailwind |
| Tooltip | `components/ui/tooltip.tsx` | Base Radix + Tailwind |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | Base Radix + Tailwind |

### CSS Modules Components (Legacy)
| Component | Location | Status |
|-----------|----------|--------|
| Modal | `nextjs-app/shared/components/Modal/` | Feature-rich, CSS Modules |
| Accordion | `nextjs-app/shared/components/Accordion/` | Basic, CSS Modules |
| Tabs | `nextjs-app/shared/components/Tabs/` | Multiple variants, CSS Modules |
| Toast | `nextjs-app/shared/components/Toast/` | Basic, CSS Modules |

### Animation Infrastructure (Phase 03)
- GSAP + ScrollTrigger installed
- Animation primitives: FadeIn, SlideIn, TextReveal, Parallax
- AnimationProvider for context

**Goal:** Create Tailwind-first enhanced versions that integrate animations.

---

## Context

**Files to read before executing:**

```
components/ui/dialog.tsx                           # shadcn/ui dialog pattern
components/ui/accordion.tsx                        # shadcn/ui accordion pattern
components/ui/tabs.tsx                             # shadcn/ui tabs pattern
components/ui/tooltip.tsx                          # shadcn/ui tooltip pattern
nextjs-app/shared/components/Modal/Modal.tsx      # Reference for severity variants
nextjs-app/shared/components/Toast/Toast.tsx      # Reference for toast patterns
nextjs-app/shared/components/animations/          # Animation primitives
lib/utils.ts                                       # cn() utility
```

---

## Tasks

### Task 1: Extend Dialog with Studio Variants

**Action**: Add studio-specific variants and animation support to Dialog

**Edit**: `components/ui/dialog.tsx`

Add new variant props to DialogContent:
```typescript
// Add to DialogContent props
interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  severity?: "default" | "success" | "warning" | "error" | "info";
}

// Add size classes
const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[calc(100vw-4rem)] sm:max-h-[calc(100vh-4rem)]",
} as const;

// Add severity styling
const severityClasses = {
  default: "",
  success: "border-green-500/50",
  warning: "border-yellow-500/50",
  error: "border-red-500/50",
  info: "border-blue-500/50",
} as const;
```

Update DialogContent to use new props:
```typescript
function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "md",
  severity = "default",
  ...props
}: DialogContentProps) {
  // Apply size and severity classes
}
```

Add DialogIcon component for severity icons:
```typescript
function DialogIcon({ severity }: { severity: DialogContentProps["severity"] }) {
  // Return appropriate Phosphor icon
}
```

**Verification**: `<DialogContent size="lg" severity="warning">` renders with correct size and border

---

### Task 2: Create AnimatedDialog Wrapper

**Action**: Create wrapper that adds GSAP animations to Dialog

**Create folder**: `nextjs-app/shared/components/AnimatedDialog/`

```typescript
// AnimatedDialog.tsx
"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface AnimatedDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  severity?: "default" | "success" | "warning" | "error" | "info";
  animationType?: "scale" | "slide" | "fade";
}

export function AnimatedDialog({
  open,
  onOpenChange,
  children,
  trigger,
  size = "md",
  severity = "default",
  animationType = "scale",
}: AnimatedDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Entry animation based on type
      if (animationType === "scale") {
        gsap.from(contentRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      } else if (animationType === "slide") {
        gsap.from(contentRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, [open, animationType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent ref={contentRef} size={size} severity={severity}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Re-export dialog parts for convenience
export {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
```

Create `index.ts` barrel export.

**Verification**: AnimatedDialog opens with smooth animation

---

### Task 3: Extend Accordion with Studio Styling

**Action**: Add studio variants to Accordion component

**Edit**: `components/ui/accordion.tsx`

Add variant prop to AccordionItem and AccordionTrigger:
```typescript
// Add variant types
type AccordionVariant = "default" | "bordered" | "minimal" | "card";

// Update AccordionItem
function AccordionItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item> & {
  variant?: AccordionVariant;
}) {
  const variantClasses = {
    default: "border-b last:border-b-0",
    bordered: "border rounded-md mb-2 last:mb-0",
    minimal: "",
    card: "border rounded-lg mb-3 bg-muted/30 last:mb-0",
  };

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}

// Update AccordionTrigger with font-heading
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "font-heading flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all...",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="..." />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
```

**Verification**: `<AccordionItem variant="card">` renders with card styling

---

### Task 4: Extend Tabs with Studio Styling

**Action**: Add studio variants to Tabs component

**Edit**: `components/ui/tabs.tsx`

Add variant prop:
```typescript
// Add variant type
type TabsVariant = "default" | "underline" | "pills" | "bordered";

// Update TabsList with variant support
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
}) {
  const variantClasses = {
    default: "bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]",
    underline: "inline-flex h-9 items-center gap-4 border-b border-border",
    pills: "inline-flex h-9 items-center gap-2",
    bordered: "inline-flex h-9 items-center gap-2 border border-border rounded-lg p-1",
  };

  return (
    <TabsPrimitive.List
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}

// Update TabsTrigger with variant-specific styling
function TabsTrigger({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: TabsVariant;
}) {
  const variantTriggerClasses = {
    default: "data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 py-1.5",
    underline: "border-b-2 border-transparent data-[state=active]:border-foreground pb-2",
    pills: "data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4 py-1.5",
    bordered: "data-[state=active]:bg-accent rounded-md px-3 py-1.5",
  };

  return (
    <TabsPrimitive.Trigger
      className={cn(
        "font-body text-sm font-medium transition-all",
        variantTriggerClasses[variant],
        className
      )}
      {...props}
    />
  );
}
```

**Verification**: `<TabsList variant="underline">` renders with underline styling

---

### Task 5: Create Toaster Component

**Action**: Create toast notification system with animations

**Create folder**: `nextjs-app/shared/components/Toaster/`

```typescript
// Toaster.tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";

export type ToastSeverity = "success" | "error" | "warning" | "info";
export type ToastPosition = "top-right" | "top-center" | "bottom-right" | "bottom-center";

interface Toast {
  id: string;
  message: string;
  severity?: ToastSeverity;
  duration?: number;
}

interface ToasterContextValue {
  toast: (message: string, options?: Omit<Toast, "id" | "message">) => void;
  dismiss: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function useToast() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToast must be used within a ToasterProvider");
  }
  return context;
}

const severityIcons: Record<ToastSeverity, ReactNode> = {
  success: <CheckCircle weight="fill" className="size-5 text-green-500" />,
  error: <XCircle weight="fill" className="size-5 text-red-500" />,
  warning: <Warning weight="fill" className="size-5 text-yellow-500" />,
  info: <Info weight="fill" className="size-5 text-blue-500" />,
};

const severityClasses: Record<ToastSeverity, string> = {
  success: "border-green-500/50 bg-green-500/5",
  error: "border-red-500/50 bg-red-500/5",
  warning: "border-yellow-500/50 bg-yellow-500/5",
  info: "border-blue-500/50 bg-blue-500/5",
};

interface ToasterProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
}

export function ToasterProvider({
  children,
  position = "bottom-right",
  defaultDuration = 4000,
}: ToasterProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, options?: Omit<Toast, "id" | "message">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: Toast = { id, message, ...options };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      const duration = options?.duration ?? defaultDuration;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [defaultDuration]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <ToasterContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className={cn(
          "fixed z-50 flex flex-col gap-2",
          positionClasses[position]
        )}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 min-w-[280px] max-w-[400px] rounded-lg border bg-background p-4 shadow-lg",
              "animate-in slide-in-from-right-full duration-200",
              t.severity && severityClasses[t.severity]
            )}
            role="status"
          >
            {t.severity && severityIcons[t.severity]}
            <p className="font-body text-text-m flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
```

Create `index.ts` barrel export.

**Verification**: `useToast().toast("Message", { severity: "success" })` shows toast

---

### Task 6: Create Lightbox Component

**Action**: Create image lightbox for gallery images

**Create folder**: `nextjs-app/shared/components/Lightbox/`

```typescript
// Lightbox.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Lightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goNext, goPrev]);

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        showCloseButton={false}
      >
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 z-10 text-white/70 hover:text-white">
            <X className="size-8" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Previous image"
              >
                <CaretLeft className="size-8" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Next image"
              >
                <CaretRight className="size-8" />
              </button>
            </>
          )}

          {/* Image */}
          <figure className="flex flex-col items-center">
            <img
              src={currentImage?.src}
              alt={currentImage?.alt ?? ""}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {currentImage?.caption && (
              <figcaption className="mt-4 text-white/70 font-body text-text-m text-center max-w-2xl px-4">
                {currentImage.caption}
              </figcaption>
            )}
          </figure>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-body text-text-s">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Create `index.ts` barrel export.

**Verification**: Lightbox opens with image, keyboard navigation works

---

### Task 7: Create Interactive Components Barrel Export

**Action**: Create central export for all interactive components

**Create**: `nextjs-app/shared/components/interactive/index.ts`

```typescript
// Re-export enhanced shadcn/ui interactive components
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// Custom interactive components
export { AnimatedDialog, type AnimatedDialogProps } from "../AnimatedDialog";
export { ToasterProvider, useToast, type ToastSeverity, type ToastPosition } from "../Toaster";
export { Lightbox, type LightboxProps, type LightboxImage } from "../Lightbox";
```

**Verification**: All interactive components importable from single path

---

### Task 8: Add ToasterProvider to App Layout

**Action**: Integrate ToasterProvider into the app layout

**Edit**: `app/layout.tsx`

Add ToasterProvider wrapping the app:
```typescript
import { ToasterProvider } from "@/nextjs-app/shared/components/interactive";

// In the layout JSX, wrap children:
<ToasterProvider position="bottom-right">
  {children}
</ToasterProvider>
```

**Verification**: Toast notifications can be triggered from any page

---

### Task 9: Add Interactive Components Demo to TailwindTest

**Action**: Extend TailwindTest with interactive components showcase

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add new section after Form Components Demo:

```typescript
// Add imports
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  useToast,
} from "../interactive";
import { Lightbox } from "../Lightbox";

// Add state for lightbox demo
const [lightboxOpen, setLightboxOpen] = useState(false);
const { toast } = useToast();

// Add new section:
{/* Interactive Components Demo - Phase 06 */}
<div className="mt-8 pt-8 border-t border-border">
  <h3 className="font-heading text-title-m font-bold mb-6">
    Interactive Components
  </h3>

  <Stack gap="lg">
    {/* Tooltip */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Tooltip:</p>
      <Stack direction="horizontal" gap="md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a tooltip!</p>
          </TooltipContent>
        </Tooltip>
      </Stack>
    </div>

    {/* Toast */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Toast:</p>
      <Stack direction="horizontal" gap="sm" wrap>
        <Button onClick={() => toast("This is a success message!", { severity: "success" })}>
          Success Toast
        </Button>
        <Button onClick={() => toast("This is an error message!", { severity: "error" })} variant="destructive">
          Error Toast
        </Button>
      </Stack>
    </div>

    {/* Lightbox trigger */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">Lightbox:</p>
      <Button onClick={() => setLightboxOpen(true)} variant="outline">
        Open Lightbox Demo
      </Button>
    </div>
  </Stack>

  <div className="mt-6 p-4 bg-muted/50 rounded-sm">
    <p className="font-body text-text-s">
      <strong className="font-heading">Interactive Stack:</strong> Dialog, Accordion, Tabs, Tooltip, DropdownMenu, Toast, Lightbox
    </p>
  </div>
</div>

{/* Lightbox component */}
<Lightbox
  open={lightboxOpen}
  onOpenChange={setLightboxOpen}
  images={[
    { src: "/placeholder-1.jpg", alt: "Demo image 1", caption: "First image" },
    { src: "/placeholder-2.jpg", alt: "Demo image 2", caption: "Second image" },
  ]}
/>
```

**Verification**: Navigate to TailwindTest, interactive components display correctly

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
1. Open TailwindTest page — interactive components render
2. Dialog opens with animation
3. Accordion variants display correctly
4. Tabs variants work
5. Tooltip appears on hover
6. Toast notifications show and dismiss
7. Lightbox opens and keyboard navigation works

**Verification Checklist**:
- [ ] Dialog with size/severity variants works
- [ ] AnimatedDialog component works
- [ ] Accordion variants work
- [ ] Tabs variants work
- [ ] Tooltip works
- [ ] Toaster system works
- [ ] Lightbox works with keyboard nav
- [ ] Barrel export works
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] Dialog extended with studio variants
- [ ] AnimatedDialog wrapper created
- [ ] Accordion extended with variants
- [ ] Tabs extended with variants
- [ ] Toaster system created
- [ ] Lightbox component created
- [ ] Interactive barrel export created
- [ ] ToasterProvider integrated in layout
- [ ] Demo added to TailwindTest
- [ ] TypeScript compiles without errors

---

## Output

After completion:
1. Commit each component individually
2. Proceed to Phase 06-2 (Navigation Components)
3. Or run `/gsd:verify-work` to test interactive components

---

## Notes

- **shadcn/ui enhancement**: Extends existing components, doesn't replace
- **Animation integration**: GSAP available but optional (CSS animations work too)
- **Accessibility preserved**: All Radix primitives maintain ARIA patterns
- **No breaking changes**: Existing shadcn/ui usage continues working

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 06-1`*
