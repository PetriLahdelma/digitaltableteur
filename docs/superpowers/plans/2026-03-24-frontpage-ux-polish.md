# Frontpage UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rhythm, micro-interactions, and spatial contrast to the 7 homepage sections without changing content or structure.

**Architecture:** Create 3 shared Framer Motion hooks (useScrollParallax, useMagneticButton, usePerspectiveTilt) and spring presets, then apply section-specific polish (density alternation, scroll choreography, hover effects) to each homepage component. Existing FadeIn/ScrollIndicator use GSAP — new scroll-driven effects use Framer Motion which is already bundled.

**Tech Stack:** React 19, Framer Motion (existing), GSAP (existing for FadeIn), CSS Modules, CSS custom properties, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-24-frontpage-ux-polish-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `nextjs-app/shared/hooks/useScrollParallax.ts` | Returns Framer Motion MotionValue for parallax offset based on scroll |
| `nextjs-app/shared/hooks/useScrollParallax.test.ts` | Tests for useScrollParallax |
| `nextjs-app/shared/hooks/useMagneticButton.ts` | Returns cursor-tracking transform values for magnetic effect |
| `nextjs-app/shared/hooks/useMagneticButton.test.ts` | Tests for useMagneticButton |
| `nextjs-app/shared/hooks/usePerspectiveTilt.ts` | Returns 3D rotation values from cursor position within element |
| `nextjs-app/shared/hooks/usePerspectiveTilt.test.ts` | Tests for usePerspectiveTilt |
| `nextjs-app/shared/hooks/springPresets.ts` | Shared spring easing presets (springSnappy, springGentle) |

### Modified Files
| File | Changes |
|------|---------|
| `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx` | Scroll exit transition, parallax depth, scroll indicator fade |
| `nextjs-app/shared/components/ScrollIndicator/ScrollIndicator.tsx` | Pulse animation, fade-out on scroll |
| `nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx` | Scroll-driven stagger, tighter grid |
| `nextjs-app/shared/components/ServiceCard/ServiceCard.tsx` | Hover lift + shadow, focus states |
| `nextjs-app/shared/components/ServiceCard/ServiceCard.module.css` | Hover/focus transitions, accent variant |
| `nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.tsx` | Whitespace, type scale, asymmetric layout, diagonal sweep, spring button |
| `nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.module.css` | Padding, layout ratios, spring animation |
| `nextjs-app/shared/patterns/HighlightSection/HighlightSection.tsx` | Tighter padding, snap entrance, background parallax |
| `nextjs-app/shared/patterns/HighlightSection/HighlightSection.module.css` | Compact padding, parallax background, button hover |
| `nextjs-app/shared/patterns/WorkPreviewSection/WorkPreviewSection.tsx` | Slower stagger, mobile "View all" fix |
| `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.tsx` | Perspective tilt on hover |
| `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.module.css` | Tilt styles, focus ring polish |
| `nextjs-app/shared/components/ClientLogoMarquee/ClientLogoMarquee.tsx` | Padding, opacity entrance, hover pause, label refinement |
| `nextjs-app/shared/patterns/CTASection/CTASection.tsx` | Viewport entrance, magnetic button, gradient shift |
| `nextjs-app/shared/patterns/CTASection/CTASection.module.css` | Top margin, gradient animation, button focus |

---

## Task 1: Spring Presets

**Files:**
- Create: `nextjs-app/shared/hooks/springPresets.ts`

- [ ] **Step 1: Create spring presets file**

```typescript
import type { SpringOptions } from "framer-motion";

export const springSnappy: SpringOptions = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const springGentle: SpringOptions = {
  stiffness: 150,
  damping: 20,
  mass: 1,
};
```

- [ ] **Step 2: Commit**

```bash
git add nextjs-app/shared/hooks/springPresets.ts
git commit -m "feat: add spring easing presets for UX polish"
```

---

## Task 2: useScrollParallax Hook

**Files:**
- Create: `nextjs-app/shared/hooks/useScrollParallax.ts`
- Create: `nextjs-app/shared/hooks/useScrollParallax.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollParallax } from "./useScrollParallax";

describe("useScrollParallax", () => {
  it("returns a ref and a MotionValue", () => {
    const { result } = renderHook(() => useScrollParallax(0.9));
    expect(result.current.ref).toBeDefined();
    expect(result.current.y).toBeDefined();
    // MotionValue has a get() method
    expect(typeof result.current.y.get).toBe("function");
  });

  it("returns zero offset when reduced motion is preferred", () => {
    // Mock matchMedia for prefers-reduced-motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList;

    const { result } = renderHook(() => useScrollParallax(0.9));
    expect(result.current.y.get()).toBe(0);

    window.matchMedia = originalMatchMedia;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run nextjs-app/shared/hooks/useScrollParallax.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the hook**

```typescript
"use client";

import { useRef } from "react";
import {
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Returns a parallax offset MotionValue based on scroll position.
 * @param speed - Scroll speed multiplier (0.85 = 15% slower than scroll, 1.0 = no effect)
 */
export function useScrollParallax(speed: number): {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Convert scroll progress [0, 1] to pixel offset
  // At speed=0.9, content moves 10% slower than scroll = subtle parallax
  const factor = (1 - speed) * 200; // 200px max travel range
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-factor, factor]
  );

  return { ref, y };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run nextjs-app/shared/hooks/useScrollParallax.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add nextjs-app/shared/hooks/useScrollParallax.ts nextjs-app/shared/hooks/useScrollParallax.test.ts
git commit -m "feat: add useScrollParallax hook with reduced motion support"
```

---

## Task 3: usePerspectiveTilt Hook

**Files:**
- Create: `nextjs-app/shared/hooks/usePerspectiveTilt.ts`
- Create: `nextjs-app/shared/hooks/usePerspectiveTilt.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePerspectiveTilt } from "./usePerspectiveTilt";

describe("usePerspectiveTilt", () => {
  it("returns ref and transform values initialized to zero", () => {
    const { result } = renderHook(() => usePerspectiveTilt(3));
    expect(result.current.ref).toBeDefined();
    expect(result.current.rotateX).toBe(0);
    expect(result.current.rotateY).toBe(0);
  });

  it("resets to zero on mouse leave", () => {
    const { result } = renderHook(() => usePerspectiveTilt(3));
    // After init, values should be zero
    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.rotateX).toBe(0);
    expect(result.current.rotateY).toBe(0);
  });

  it("accepts maxDeg parameter", () => {
    const { result } = renderHook(() => usePerspectiveTilt(5));
    expect(result.current).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run nextjs-app/shared/hooks/usePerspectiveTilt.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the hook**

```typescript
"use client";

import { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface TiltValues {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: number;
  rotateY: number;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  style: React.CSSProperties;
}

/**
 * Returns 3D perspective tilt values tracking cursor position.
 * Disabled for pointer:coarse and prefers-reduced-motion.
 * @param maxDeg - Maximum rotation in degrees (e.g., 3 for ±3deg)
 */
export function usePerspectiveTilt(maxDeg: number): TiltValues {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion) return;
      // Check for fine pointer (no tilt on touch)
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Normalize cursor position to [-1, 1]
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // rotateX is inverted: cursor at top → positive rotation (tilt toward viewer)
      setRotateX(-y * maxDeg);
      setRotateY(x * maxDeg);
    },
    [maxDeg, prefersReducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  const style: React.CSSProperties = {
    transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    transition: rotateX === 0 && rotateY === 0 ? "transform 0.4s ease-out" : "transform 0.1s ease-out",
    willChange: rotateX !== 0 || rotateY !== 0 ? "transform" : "auto",
  };

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave, style };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run nextjs-app/shared/hooks/usePerspectiveTilt.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add nextjs-app/shared/hooks/usePerspectiveTilt.ts nextjs-app/shared/hooks/usePerspectiveTilt.test.ts
git commit -m "feat: add usePerspectiveTilt hook for card hover effects"
```

---

## Task 4: useMagneticButton Hook

**Files:**
- Create: `nextjs-app/shared/hooks/useMagneticButton.ts`
- Create: `nextjs-app/shared/hooks/useMagneticButton.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMagneticButton } from "./useMagneticButton";

describe("useMagneticButton", () => {
  it("returns ref and transform initialized to zero", () => {
    const { result } = renderHook(() => useMagneticButton(40, 6));
    expect(result.current.ref).toBeDefined();
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
  });

  it("resets on mouse leave", () => {
    const { result } = renderHook(() => useMagneticButton(40, 6));
    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
  });

  it("provides a style object with transform", () => {
    const { result } = renderHook(() => useMagneticButton(40, 6));
    expect(result.current.style).toBeDefined();
    expect(result.current.style.transform).toContain("translate");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run nextjs-app/shared/hooks/useMagneticButton.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the hook**

```typescript
"use client";

import { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface MagneticValues {
  ref: React.RefObject<HTMLElement | null>;
  x: number;
  y: number;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  style: React.CSSProperties;
}

/**
 * Magnetic button effect — element subtly follows cursor within a radius.
 * Disabled for pointer:coarse and prefers-reduced-motion.
 * @param radius - Activation radius in pixels (e.g., 40)
 * @param maxDisplacement - Max displacement in pixels (e.g., 6)
 */
export function useMagneticButton(
  radius: number,
  maxDisplacement: number
): MagneticValues {
  const ref = useRef<HTMLElement>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        const strength = 1 - distance / radius;
        setX(distX * strength * (maxDisplacement / radius));
        setY(distY * strength * (maxDisplacement / radius));
      } else {
        setX(0);
        setY(0);
      }
    },
    [radius, maxDisplacement, prefersReducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    setX(0);
    setY(0);
  }, []);

  const style: React.CSSProperties = {
    transform: `translate(${x}px, ${y}px)`,
    transition: x === 0 && y === 0 ? "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "transform 0.08s ease-out",
    willChange: x !== 0 || y !== 0 ? "transform" : "auto",
  };

  return { ref, x, y, onMouseMove, onMouseLeave, style };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run nextjs-app/shared/hooks/useMagneticButton.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add nextjs-app/shared/hooks/useMagneticButton.ts nextjs-app/shared/hooks/useMagneticButton.test.ts
git commit -m "feat: add useMagneticButton hook for CTA interaction"
```

---

## Task 5: HomeHero — Cinematic Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx`
- Modify: `nextjs-app/shared/components/ScrollIndicator/ScrollIndicator.tsx`

**Context:** HomeHero currently uses KineticTitle (wave), TextReveal, FadeIn (GSAP), and ScrollIndicator (GSAP bounce). We're adding Framer Motion scroll-linked exit transition and parallax depth.

- [ ] **Step 1: Read current HomeHero.tsx and ScrollIndicator.tsx**

Read both files in full to understand current implementations before modifying.

- [ ] **Step 2: Add scroll exit transition to HomeHero**

In `HomeHero.tsx`, add Framer Motion `useScroll` and `useTransform` to create a scale-down + fade effect as user scrolls past 60% of the hero:

```typescript
import { useScroll, useTransform, useReducedMotion, motion } from "framer-motion";
```

Add after existing refs/state:
```typescript
const heroRef = useRef<HTMLElement>(null);
const prefersReducedMotion = useReducedMotion();
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],
});
const heroScale = useTransform(scrollYProgress, [0, 0.6, 1], prefersReducedMotion ? [1, 1, 1] : [1, 1, 0.98]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.6, 1], prefersReducedMotion ? [1, 1, 1] : [1, 1, 0.85]);
```

Wrap the hero content in a `motion.div` with `style={{ scale: heroScale, opacity: heroOpacity }}`. Add `ref={heroRef}` to the outer section element.

- [ ] **Step 3: Add parallax depth layers**

Wrap the title/subtitle content in a `motion.div` with a parallax y offset from `useScrollParallax(0.9)`, and the CTA buttons in a separate `motion.div` with `useScrollParallax(0.85)`. The parallax hooks return MotionValues so use `motion.div style={{ y }}`.

```typescript
import { useScrollParallax } from "@/nextjs-app/shared/hooks/useScrollParallax";
```

- [ ] **Step 4: Update ScrollIndicator pulse + fade**

In `ScrollIndicator.tsx`, add scroll-based fade-out. After the existing GSAP bounce animation setup, add:

```typescript
// Fade out after 100px scroll
useEffect(() => {
  const handleScroll = () => {
    if (!indicatorRef.current) return;
    const scrollY = window.scrollY;
    const opacity = Math.max(0, 1 - scrollY / 100);
    indicatorRef.current.style.opacity = String(opacity);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

Enhance the existing GSAP bounce with a subtle pulse: modify the existing yoyo animation to include a slight scale pulse (`scale: 1.05`) on each bounce cycle.

- [ ] **Step 5: Run typecheck and existing tests**

Run: `npm run typecheck && npx vitest run --reporter=verbose 2>&1 | head -80`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add nextjs-app/shared/patterns/HomeHero/HomeHero.tsx nextjs-app/shared/components/ScrollIndicator/ScrollIndicator.tsx
git commit -m "feat(hero): add scroll exit transition, parallax depth, and indicator fade"
```

---

## Task 6: ServicesSection — Dense Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx`
- Modify: `nextjs-app/shared/components/ServiceCard/ServiceCard.tsx`
- Modify: `nextjs-app/shared/components/ServiceCard/ServiceCard.module.css`

- [ ] **Step 1: Read current ServicesSection.tsx, ServiceCard.tsx, and ServiceCard.module.css**

Read all three files in full before modifying.

- [ ] **Step 2: Update grid gap in ServicesSection**

In the grid container, reduce the gap from the current value to create a tighter, more cohesive unit. Change the gap from the current `gap-6` (24px) to `gap-4` (16px) on mobile and `gap-5` (20px) on desktop. This makes the grid feel like a connected system.

- [ ] **Step 3: Add scroll-driven stagger to ServicesSection**

Replace or augment the current FadeIn stagger. Instead of `delay={index * 0.1}` triggering on mount, ensure FadeIn uses its below-the-fold ScrollTrigger behavior (it already has this via GSAP). Verify the `amount` threshold is at 0.3 and the first row (indices 0-2) appears, then the second row (indices 3-5) 100ms later:

Adjust the delay calculation:
```typescript
const rowDelay = Math.floor(index / 3) * 0.1; // 0 for first row, 0.1 for second
const delay = rowDelay + (index % 3) * 0.05; // Slight stagger within each row
```

- [ ] **Step 4: Add hover micro-interactions to ServiceCard**

In `ServiceCard.module.css`, add hover and focus-visible transitions:

```css
.card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease-out;
}

.card:hover,
.card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 4px;
}

.cardIcon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover .cardIcon,
.card:focus-visible .cardIcon {
  transform: scale(1.08);
}
```

Adjust class names to match the actual CSS module class names in the existing file.

- [ ] **Step 5: Add accent variant for hero services**

Add a CSS class for the two "hero" services (Design Systems, AI Solutions). In `ServiceCard.module.css`:

```css
.cardAccent {
  border-inline-start: 3px solid var(--color-primary, currentcolor);
}
```

In `ServiceCard.tsx`, accept an optional `accent` prop and conditionally apply the class. In `ServicesSection.tsx`, pass `accent={true}` for the "Design Systems" and "AI Solutions" service items. Identify them by their translation key or index position.

- [ ] **Step 6: Verify theme compatibility**

Check that the hover shadow and accent border look correct in Dark, HCB, and HCW themes. The shadow uses rgba transparency (works in all), and the accent uses `var(--color-primary)` with `currentcolor` fallback.

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx nextjs-app/shared/components/ServiceCard/ServiceCard.tsx nextjs-app/shared/components/ServiceCard/ServiceCard.module.css
git commit -m "feat(services): add dense polish — tighter grid, hover lift, accent cards"
```

---

## Task 7: DesignSprintsSection — Airy Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.tsx`
- Modify: `nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.module.css`

- [ ] **Step 1: Read current DesignSprintsSection.tsx and CSS module**

Read both files in full.

- [ ] **Step 2: Increase vertical whitespace**

In the section's outer container, increase padding-block to approximately 2x current value. Use design tokens where available:

In the component's wrapping element, change padding from current values to use generous spacing. Target: `py-24 md:py-32 lg:py-40` (Tailwind) or equivalent CSS custom properties. The contrast with the tight Services section above is the primary goal.

- [ ] **Step 3: Type scale jump**

Find the section Title component and increase its `level` or apply a larger font-size class. If the Services section heading is level 2 at default size, this section's heading should get a size class that's noticeably larger (e.g., `text-4xl md:text-5xl` vs Services' likely `text-3xl`).

- [ ] **Step 4: Asymmetric layout (45/55 split)**

Change the 2-column grid from `grid-cols-2` to a custom template:

```css
.layout {
  display: grid;
  grid-template-columns: 45fr 55fr;
  gap: var(--space-layout-32, 2rem);
  align-items: start;
}
```

Or in Tailwind: change from `grid-cols-2` to `grid-cols-[45fr_55fr]` or equivalent.

- [ ] **Step 5: Benefits diagonal sweep animation**

Change the stagger delay calculation for the 4 benefits from linear to diagonal:

```typescript
// Diagonal sweep: top-left(0) → top-right(1) → bottom-left(2) → bottom-right(3)
const diagonalOrder = [0, 1, 2, 3]; // already correct for 2x2
const sweepDelay = 0.15; // slower than Services' 0.05
const delay = diagonalOrder[index] * sweepDelay;
```

Wrap each benefit in a FadeIn with the diagonal delay.

- [ ] **Step 6: SprintButton spring physics**

Replace the CSS `rollClockwise`/`rollCounterClockwise` keyframe animations with Framer Motion spring:

In `DesignSprintsSection.tsx`, wrap the icon circle in a `motion.div` and use `whileHover` with spring transition:

```typescript
import { motion } from "framer-motion";
import { springSnappy } from "@/nextjs-app/shared/hooks/springPresets";

<motion.div
  className={styles.iconCircle}
  animate={{ rotate: 0 }}
  whileHover={{ rotate: 360 }}
  transition={{ type: "spring", ...springSnappy }}
>
```

Remove the CSS keyframe animations from `DesignSprintsSection.module.css` (lines 4, 17, 20-36) since Framer Motion replaces them.

- [ ] **Step 7: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.tsx nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.module.css
git commit -m "feat(sprints): add airy polish — whitespace, type scale, asymmetric layout, spring button"
```

---

## Task 8: HighlightSection — Dense Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/HighlightSection/HighlightSection.tsx`
- Modify: `nextjs-app/shared/patterns/HighlightSection/HighlightSection.module.css`

- [ ] **Step 1: Read current HighlightSection.tsx and CSS module**

Read both files.

- [ ] **Step 2: Tighten vertical padding**

The HighlightSection is used with size="comfortable" (56px padding) on the homepage. Reduce the padding for this usage. Since HighlightSection supports size variants, either:
- Add a new size variant "compact-dense" or reduce the "comfortable" padding
- Or pass a className override from HomePage.tsx

Preferred: In `HomePage.tsx`, the HighlightSection is rendered with `size="comfortable"`. Change to `size="compact"` which has tighter padding, or add a CSS override via the existing className prop.

- [ ] **Step 3: Add snap entrance**

Wrap the HighlightSection content in a FadeIn with short travel distance and quick duration. In `HighlightSection.tsx`, the content area should get:

```tsx
<FadeIn direction="up" distance={16} duration={0.5}>
  {/* existing content */}
</FadeIn>
```

If FadeIn doesn't accept a `distance` prop, use the default but ensure the direction is "up" for the snap feel. The key is the section appears to snap into place — short travel, quick timing.

- [ ] **Step 4: Background parallax on dots pattern**

In `HighlightSection.module.css`, for the dots variant background, add a subtle scroll-linked position shift. Use CSS only (no JS needed):

```css
.dots {
  background-attachment: fixed; /* Creates parallax relative to viewport */
}

@media (prefers-reduced-motion: reduce) {
  .dots {
    background-attachment: scroll;
  }
}
```

Note: `background-attachment: fixed` creates a simple parallax effect. If this doesn't work well on mobile (iOS has issues), scope to `@media (pointer: fine)` as well.

- [ ] **Step 5: CTA button hover spring**

Add spring-based scale on hover for CTA buttons within the HighlightSection. In the CSS module:

```css
.ctaButton {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ctaButton:hover {
  transform: scale(1.03);
}

.ctaButton:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 4px;
}
```

Match the class name to the actual button class in the component.

- [ ] **Step 6: Verify WCAG 2.2 button target sizes**

Check that all CTA buttons have at least 44x44px touch targets. Inspect the rendered button dimensions in the browser. If any button has padding that makes it smaller than 44px in height, increase the padding.

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add nextjs-app/shared/patterns/HighlightSection/HighlightSection.tsx nextjs-app/shared/patterns/HighlightSection/HighlightSection.module.css nextjs-app/shared/components/pages/Home/HomePage.tsx
git commit -m "feat(highlight): add dense polish — compact padding, snap entrance, background parallax"
```

---

## Task 9: WorkPreviewSection — Cinematic Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/WorkPreviewSection/WorkPreviewSection.tsx`
- Modify: `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.tsx`
- Modify: `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.module.css`

- [ ] **Step 1: Read current WorkPreviewSection.tsx, EnhancedProjectCard.tsx, and its CSS module**

Read all three files.

- [ ] **Step 2: Slower scroll reveal stagger**

In `WorkPreviewSection.tsx`, change the FadeIn stagger delay from `index * 0.1` to `index * 0.2` for featured layout mode. Each card gets 200ms between reveals, making the entrance more deliberate and cinematic.

- [ ] **Step 3: Add perspective tilt to EnhancedProjectCard**

In `EnhancedProjectCard.tsx`:

```typescript
import { usePerspectiveTilt } from "@/nextjs-app/shared/hooks/usePerspectiveTilt";
```

Inside the component:
```typescript
const tilt = usePerspectiveTilt(3);
```

Apply to the card's outer container:
```tsx
<div
  ref={tilt.ref}
  onMouseMove={tilt.onMouseMove}
  onMouseLeave={(e) => {
    tilt.onMouseLeave();
    handleMouseLeave?.(); // preserve existing handler
  }}
  style={tilt.style}
  className={styles.card}
>
```

- [ ] **Step 4: Polish focus ring on EnhancedProjectCard**

In `EnhancedProjectCard.module.css`, add a polished focus-visible state:

```css
.card:focus-visible {
  outline: 2px solid var(--color-primary, currentcolor);
  outline-offset: 4px;
  border-radius: inherit;
}
```

- [ ] **Step 5: Fix mobile "View all work" visibility**

In `WorkPreviewSection.tsx`, find the "View all work" link that's hidden on mobile (likely `hidden md:inline-flex` or similar). Change so it's visible on mobile too, positioned below the cards:

- Keep the existing desktop link above the grid
- Add a duplicate link below the cards grid, visible only on mobile: `className="flex md:hidden mt-6 justify-center"`

This ensures mobile users discover the full portfolio.

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add nextjs-app/shared/patterns/WorkPreviewSection/WorkPreviewSection.tsx nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.tsx nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.module.css
git commit -m "feat(work): add cinematic polish — perspective tilt, slower reveal, mobile view-all"
```

---

## Task 10: ClientLogoMarquee — Airy Polish

**Files:**
- Modify: `nextjs-app/shared/components/ClientLogoMarquee/ClientLogoMarquee.tsx`

- [ ] **Step 1: Read current ClientLogoMarquee.tsx**

Read the full file (253 lines).

- [ ] **Step 2: Increase vertical padding**

Add generous padding above and below the marquee section. Change the outer section's padding from current values to approximately `py-16 md:py-24` (or equivalent CSS custom property). This creates the "airy" breathing room.

- [ ] **Step 3: Add scroll-linked opacity entrance**

Use Framer Motion `useInView` to fade the marquee content from 0.4 to 1.0 on scroll. Wrap the marquee container in a `motion.div`:

```typescript
import { motion, useInView } from "framer-motion";

const marqueeRef = useRef(null);
const isInView = useInView(marqueeRef, { once: true, amount: 0.2 });
```

```tsx
<motion.div
  ref={marqueeRef}
  initial={{ opacity: 0.4 }}
  animate={isInView ? { opacity: 1 } : { opacity: 0.4 }}
  transition={{ duration: 0.3 }}
>
  {/* marquee content */}
</motion.div>
```

Ensure the marquee animation starts only after the fade-in completes. Gate the `animationPlayState` on both `isReady` (existing measurement) AND `isInView`.

- [ ] **Step 4: Add hover pause + logo highlight**

On the desktop marquee container, add mouse event handlers:

```typescript
const [isPaused, setIsPaused] = useState(false);

// On the marquee wrapper:
onMouseEnter={() => setIsPaused(true)}
onMouseLeave={() => setIsPaused(false)}
```

When `isPaused`, set `animationPlayState: "paused"` on the marquee track. For individual logo highlight, add CSS:

```css
.logoItem {
  transition: transform 0.2s ease-out;
}

.logoItem:hover {
  transform: scale(1.08);
}
```

- [ ] **Step 5: Add keyboard pause (a11y)**

Make the section focusable and pause on focus-within:

```tsx
<section
  tabIndex={0}
  onFocus={() => setIsPaused(true)}
  onBlur={() => setIsPaused(false)}
  aria-label={t("homeSelectedClientsAria")}
>
```

This satisfies WCAG 2.1 SC 2.2.2 — users can pause the moving content via keyboard.

- [ ] **Step 6: Refine section label typography**

Find the "Selected clients" label element and add letter-spacing:

```css
.sectionLabel {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}
```

Apply via the existing className or inline style, matching the project's approach for label typography.

- [ ] **Step 7: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/components/ClientLogoMarquee/ClientLogoMarquee.tsx
git commit -m "feat(marquee): add airy polish — generous padding, fade entrance, hover pause, keyboard a11y"
```

---

## Task 11: CTASection — Cinematic Polish

**Files:**
- Modify: `nextjs-app/shared/patterns/CTASection/CTASection.tsx`
- Modify: `nextjs-app/shared/patterns/CTASection/CTASection.module.css`

- [ ] **Step 1: Read current CTASection.tsx and CSS module**

Read both files.

- [ ] **Step 2: Viewport-aware entrance**

Add Framer Motion scroll-triggered entrance. The heading springs from scale 0.95 to 1.0, and the button fades in 200ms later:

```typescript
import { motion, useInView, useReducedMotion } from "framer-motion";
import { springGentle } from "@/nextjs-app/shared/hooks/springPresets";
```

```tsx
const ctaRef = useRef(null);
const isInView = useInView(ctaRef, { once: true, amount: 0.3 });
const prefersReducedMotion = useReducedMotion();
```

Wrap heading:
```tsx
<motion.div
  initial={prefersReducedMotion ? {} : { scale: 0.95, opacity: 0 }}
  animate={isInView ? { scale: 1, opacity: 1 } : {}}
  transition={{ type: "spring", ...springGentle }}
>
  <Title>...</Title>
</motion.div>
```

Wrap button:
```tsx
<motion.div
  initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ delay: 0.2, duration: 0.4 }}
>
  <Button>...</Button>
</motion.div>
```

- [ ] **Step 3: Add magnetic button effect**

```typescript
import { useMagneticButton } from "@/nextjs-app/shared/hooks/useMagneticButton";
```

```typescript
const magnetic = useMagneticButton(40, 6);
```

Apply to the button wrapper:
```tsx
<div
  ref={magnetic.ref as React.RefObject<HTMLDivElement>}
  onMouseMove={magnetic.onMouseMove}
  onMouseLeave={magnetic.onMouseLeave}
  style={magnetic.style}
>
  <Button>...</Button>
</div>
```

- [ ] **Step 4: Background gradient hue shift**

In `CTASection.module.css`, add a subtle hue-rotate animation:

```css
.section {
  animation: hueShift 8s ease-in-out infinite alternate;
}

@keyframes hueShift {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(5deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .section {
    animation: none;
  }
}
```

- [ ] **Step 5: Generous top margin**

Add a clear visual break between the logo marquee and the CTA. In the CSS module, increase margin-block-start:

```css
.section {
  margin-block-start: var(--space-layout-64, 4rem);
}
```

Or via Tailwind on the section element: add `mt-16 md:mt-24`.

- [ ] **Step 6: Polish focus state on CTA button**

```css
.ctaButton:focus-visible {
  outline: 2px solid white;
  outline-offset: 4px;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2);
}
```

Ensure this is visible against the primary-color background in all themes.

- [ ] **Step 7: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/patterns/CTASection/CTASection.tsx nextjs-app/shared/patterns/CTASection/CTASection.module.css
git commit -m "feat(cta): add cinematic polish — spring entrance, magnetic button, gradient shift"
```

---

## Task 12: Final Integration Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All existing tests pass, new hook tests pass

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No new lint errors

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Visual verification**

Start dev server and visually verify all 7 sections:

```bash
npm run dev &
# Wait for server to start
npx agent-browser open http://localhost:3000
npx agent-browser screenshot ./frontpage-polish-full.png
```

Check:
- Hero scroll exit transition works
- Services cards have hover lift
- Design Sprints has visible whitespace contrast
- Highlight snaps into place
- Work cards have perspective tilt on hover
- Logo marquee pauses on hover
- CTA button has magnetic effect
- Rhythm is perceptible (alternating density)

- [ ] **Step 6: Reduced motion verification**

```bash
npx agent-browser set media "(prefers-reduced-motion: reduce)"
npx agent-browser screenshot ./frontpage-reduced-motion.png
```

Verify: All animations disabled, all content visible, no functionality lost.

- [ ] **Step 7: Theme verification**

Check Dark theme:
```bash
npx agent-browser set media dark
npx agent-browser screenshot ./frontpage-dark.png
```

Verify: Accent borders, hover shadows, and gradient shift look correct in dark mode.

- [ ] **Step 8: Commit any fixes from verification**

If any issues found during visual verification, fix them and commit:
```bash
git add -A && git commit -m "fix: address visual verification issues from UX polish"
```
