# Phase 03-1: Animation Infrastructure

> **Phase**: 03 (Animation Infrastructure)
> **Plan**: 1 of 1
> **Status**: Ready
> **Estimated Tasks**: 14
> **Research**: [03-RESEARCH.md](./03-RESEARCH.md)

---

## Objective

Set up professional animation toolkit for kinetic experience using GSAP + Lenis.

**Deliverables:**
1. GSAP installed with central plugin registration
2. Lenis smooth scroll provider integrated into app
3. Animation primitives (FadeIn, SlideIn, TextReveal, Parallax)
4. Accessibility support (prefers-reduced-motion)
5. Demo showcasing all animation capabilities

---

## Execution Context

**Key Research Findings (from 03-RESEARCH.md):**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation Library | GSAP + @gsap/react | Now 100% free, excellent React hooks |
| Smooth Scroll | Lenis (not ScrollSmoother) | 2KB vs 26KB, preserves CSS sticky/fixed |
| 3D Graphics | **Defer** | React Three Fiber has Next.js 15 issues |
| Text Animation | SplitText | Free, built-in ARIA for accessibility |

**Architecture Pattern:**
- Central GSAP registration in `nextjs-app/shared/lib/gsap/`
- Provider for Lenis in `providers/`
- Animation components in `nextjs-app/shared/components/animations/`
- Follow existing provider pattern from `ThemeProvider.tsx`

---

## Context

**Files to read before executing:**

```
app/layout.tsx                              # Provider insertion point
providers/ThemeProvider.tsx                 # Provider pattern reference
nextjs-app/shared/styles/variables.css      # Design tokens for timing
nextjs-app/shared/components/TailwindTest/  # Demo component to extend
```

**Existing patterns to follow:**
- Provider wrapping in `app/layout.tsx` (line 159-168)
- Component folder structure with `.tsx`, `.module.css`, `index.ts`
- CSS Modules for all styling
- `"use client"` for any client-side functionality

---

## Tasks

### Task 1: Install Dependencies
**Action**: Install GSAP ecosystem and Lenis packages

```bash
npm install gsap @gsap/react lenis
```

**Verification**: `package.json` shows all three packages

---

### Task 2: Create GSAP Library Directory
**Action**: Create central GSAP configuration

**Create**: `nextjs-app/shared/lib/gsap/index.ts`

```typescript
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register all plugins once at app startup
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

// Global defaults matching design system
gsap.defaults({
  duration: 0.8,
  ease: "power2.out",
});

export { gsap, useGSAP, ScrollTrigger, SplitText };
```

**Verification**: No TypeScript errors when importing

---

### Task 3: Create Motion Safety Utility
**Action**: Add prefers-reduced-motion support

**Create**: `nextjs-app/shared/lib/gsap/motion-safe.ts`

```typescript
"use client";

import gsap from "gsap";

export type MotionPreference = "full" | "reduced";

let currentPreference: MotionPreference = "full";

export function setupReducedMotion(): () => void {
  if (typeof window === "undefined") return () => {};

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    currentPreference = "full";
    gsap.globalTimeline.timeScale(1);
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    currentPreference = "reduced";
    // Reduce animation speed significantly but don't disable entirely
    gsap.globalTimeline.timeScale(3); // 3x faster = shorter animations
  });

  // Return cleanup function
  return () => mm.revert();
}

export function getMotionPreference(): MotionPreference {
  return currentPreference;
}

export function isReducedMotion(): boolean {
  return currentPreference === "reduced";
}
```

**Verification**: Correctly responds to OS reduced motion setting

---

### Task 4: Create SmoothScrollProvider
**Action**: Create Lenis provider component

**Create**: `providers/SmoothScrollProvider.tsx`

```typescript
"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sync Lenis scroll position with GSAP ScrollTrigger
function ScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    // Refresh ScrollTrigger after layout settles
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false, // Better mobile performance
        touchMultiplier: 2,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
```

**Verification**: Smooth scrolling works when wrapping content

---

### Task 5: Create AnimationProvider
**Action**: Create provider to initialize GSAP and reduced motion

**Create**: `providers/AnimationProvider.tsx`

```typescript
"use client";

import { useEffect, createContext, useContext, useState, type ReactNode } from "react";
import { setupReducedMotion, type MotionPreference, getMotionPreference } from "@/nextjs-app/shared/lib/gsap/motion-safe";

// Import GSAP to ensure plugins are registered
import "@/nextjs-app/shared/lib/gsap";

interface AnimationContextValue {
  motionPreference: MotionPreference;
  isReady: boolean;
}

const AnimationContext = createContext<AnimationContextValue>({
  motionPreference: "full",
  isReady: false,
});

export function useAnimationContext() {
  return useContext(AnimationContext);
}

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [motionPreference, setMotionPreference] = useState<MotionPreference>("full");

  useEffect(() => {
    const cleanup = setupReducedMotion();
    setMotionPreference(getMotionPreference());
    setIsReady(true);

    // Re-check preference on media query change
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setMotionPreference(getMotionPreference());
    mediaQuery.addEventListener("change", handler);

    return () => {
      cleanup();
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ motionPreference, isReady }}>
      {children}
    </AnimationContext.Provider>
  );
}
```

**Verification**: Context accessible from child components

---

### Task 6: Integrate Providers into Layout
**Action**: Add animation providers to `app/layout.tsx`

**Edit**: `app/layout.tsx`

Insert `AnimationProvider` and `SmoothScrollProvider` in the provider chain:

```typescript
import { AnimationProvider } from "../providers/AnimationProvider";
import { SmoothScrollProvider } from "../providers/SmoothScrollProvider";

// In the provider chain (inside <body>):
<NextThemeProvider>
  <I18nProvider>
    <HtmlLangSync />
    <AnimationProvider>
      <SmoothScrollProvider>
        <ToastProvider>
          <CookieConsentProvider autoShow={true}>
            <NextLayout>{children}</NextLayout>
          </CookieConsentProvider>
        </ToastProvider>
      </SmoothScrollProvider>
    </AnimationProvider>
  </I18nProvider>
</NextThemeProvider>
```

**Verification**: Dev server starts without errors, smooth scroll active

---

### Task 7: Create FadeIn Component
**Action**: Create reusable fade-in animation primitive

**Create folder**: `nextjs-app/shared/components/animations/FadeIn/`

**Create**: `FadeIn.tsx`, `FadeIn.module.css`, `index.ts`

```typescript
// FadeIn.tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./FadeIn.module.css";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 50,
  threshold = "top 85%",
  className = "",
  as: Component = "div",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(() => {
    if (!ref.current) return;

    // Respect reduced motion preference
    const actualDistance = motionPreference === "reduced" ? 0 : distance;
    const actualDuration = motionPreference === "reduced" ? 0.2 : duration;

    const from: gsap.TweenVars = {
      opacity: 0,
      ...(direction === "up" && { y: actualDistance }),
      ...(direction === "down" && { y: -actualDistance }),
      ...(direction === "left" && { x: -actualDistance }),
      ...(direction === "right" && { x: actualDistance }),
    };

    gsap.from(ref.current, {
      ...from,
      delay,
      duration: actualDuration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: threshold,
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref, dependencies: [motionPreference] });

  return (
    <Component ref={ref} className={`${styles.fadeIn} ${className}`}>
      {children}
    </Component>
  );
}
```

```css
/* FadeIn.module.css */
.fadeIn {
  will-change: opacity, transform;
}
```

```typescript
// index.ts
export { FadeIn } from "./FadeIn";
export type { FadeInProps } from "./FadeIn";
```

**Verification**: Elements fade in on scroll

---

### Task 8: Create SlideIn Component
**Action**: Create slide-in animation for larger elements

**Create folder**: `nextjs-app/shared/components/animations/SlideIn/`

Similar structure to FadeIn but with more dramatic motion and stagger support:

```typescript
// SlideIn.tsx
"use client";

import { useRef, Children, cloneElement, isValidElement } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./SlideIn.module.css";

type Direction = "left" | "right" | "up" | "down";

interface SlideInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: string;
  className?: string;
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  duration = 1,
  stagger = 0.1,
  threshold = "top 80%",
  className = "",
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(() => {
    if (!ref.current) return;

    const isReduced = motionPreference === "reduced";
    const distance = isReduced ? 0 : 100;
    const actualDuration = isReduced ? 0.2 : duration;

    const from: gsap.TweenVars = {
      opacity: 0,
      ...(direction === "left" && { x: -distance }),
      ...(direction === "right" && { x: distance }),
      ...(direction === "up" && { y: distance }),
      ...(direction === "down" && { y: -distance }),
    };

    gsap.from(ref.current.children, {
      ...from,
      delay,
      duration: actualDuration,
      stagger: isReduced ? 0 : stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: threshold,
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref, dependencies: [motionPreference] });

  return (
    <div ref={ref} className={`${styles.slideIn} ${className}`}>
      {children}
    </div>
  );
}
```

**Verification**: Children stagger in from specified direction

---

### Task 9: Create TextReveal Component
**Action**: Create kinetic typography component using SplitText

**Create folder**: `nextjs-app/shared/components/animations/TextReveal/`

```typescript
// TextReveal.tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap, useGSAP, SplitText } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./TextReveal.module.css";

type RevealType = "chars" | "words" | "lines";
type Animation = "fade" | "slide" | "wave";

interface TextRevealProps {
  children: string;
  type?: RevealType;
  animation?: Animation;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function TextReveal({
  children,
  type = "words",
  animation = "fade",
  delay = 0,
  duration = 0.6,
  stagger = 0.02,
  threshold = "top 85%",
  className = "",
  as: Component = "p",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(() => {
    if (!ref.current || typeof children !== "string") return;

    // Clean up previous split
    if (splitRef.current) {
      splitRef.current.revert();
    }

    // For reduced motion, just fade in the whole element
    if (motionPreference === "reduced") {
      gsap.from(ref.current, {
        opacity: 0,
        duration: 0.3,
        scrollTrigger: {
          trigger: ref.current,
          start: threshold,
        },
      });
      return;
    }

    // Split the text
    splitRef.current = new SplitText(ref.current, {
      type: type,
      linesClass: styles.line,
      wordsClass: styles.word,
      charsClass: styles.char,
    });

    const elements = splitRef.current[type] || splitRef.current.words;

    // Animation variants
    const animations: Record<Animation, gsap.TweenVars> = {
      fade: { opacity: 0, y: 20 },
      slide: { opacity: 0, y: 50, rotationX: -45 },
      wave: { opacity: 0, y: 30, scale: 0.8 },
    };

    gsap.from(elements, {
      ...animations[animation],
      duration,
      stagger,
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: threshold,
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref, dependencies: [children, type, animation, motionPreference] });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
      }
    };
  }, []);

  return (
    <Component ref={ref} className={`${styles.textReveal} ${className}`}>
      {children}
    </Component>
  );
}
```

```css
/* TextReveal.module.css */
.textReveal {
  overflow: hidden;
}

.line {
  display: block;
  overflow: hidden;
}

.word {
  display: inline-block;
  will-change: transform, opacity;
}

.char {
  display: inline-block;
  will-change: transform, opacity;
}
```

**Verification**: Text animates in by characters/words/lines

---

### Task 10: Create Parallax Component
**Action**: Create scroll-driven parallax wrapper

**Create folder**: `nextjs-app/shared/components/animations/Parallax/`

```typescript
// Parallax.tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/nextjs-app/shared/lib/gsap";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./Parallax.module.css";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // Negative = slower, Positive = faster
  className?: string;
}

export function Parallax({
  children,
  speed = -0.3,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(() => {
    if (!ref.current || !innerRef.current) return;

    // Disable parallax for reduced motion
    if (motionPreference === "reduced") return;

    const distance = 100 * speed;

    gsap.to(innerRef.current, {
      y: distance,
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: ref, dependencies: [speed, motionPreference] });

  return (
    <div ref={ref} className={`${styles.parallax} ${className}`}>
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
```

```css
/* Parallax.module.css */
.parallax {
  overflow: hidden;
  position: relative;
}

.inner {
  will-change: transform;
}
```

**Verification**: Content moves at different rate than scroll

---

### Task 11: Create Barrel Export for Animations
**Action**: Create central export for all animation components

**Create**: `nextjs-app/shared/components/animations/index.ts`

```typescript
export { FadeIn } from "./FadeIn";
export { SlideIn } from "./SlideIn";
export { TextReveal } from "./TextReveal";
export { Parallax } from "./Parallax";
```

**Verification**: Can import all animations from single path

---

### Task 12: Add Animation Demo to TailwindTest
**Action**: Extend TailwindTest component with animation showcase

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add new section demonstrating all animation primitives:

```typescript
// Add imports
import { FadeIn, SlideIn, TextReveal, Parallax } from "../animations";

// Add new section in the component:
{/* Animation Demo Section */}
<section className={styles.section}>
  <Title level={2} terminals="sans">Animation Primitives</Title>

  <div className={styles.animationDemo}>
    <FadeIn direction="up" delay={0.1}>
      <Card variant="elevated">
        <Title level={3} terminals="sans">FadeIn Up</Title>
        <Text as="p" terminals="sans">Fades in from below on scroll</Text>
      </Card>
    </FadeIn>

    <FadeIn direction="left" delay={0.2}>
      <Card variant="elevated">
        <Title level={3} terminals="sans">FadeIn Left</Title>
        <Text as="p" terminals="sans">Fades in from the left</Text>
      </Card>
    </FadeIn>

    <SlideIn direction="right" stagger={0.15}>
      <Card variant="elevated">
        <Title level={3} terminals="sans">SlideIn 1</Title>
      </Card>
      <Card variant="elevated">
        <Title level={3} terminals="sans">SlideIn 2</Title>
      </Card>
    </SlideIn>
  </div>

  <div className={styles.textDemo}>
    <TextReveal as="h2" type="words" animation="slide" className={styles.heroText}>
      Kinetic Typography Demo
    </TextReveal>

    <TextReveal as="p" type="chars" animation="wave" stagger={0.01}>
      Each character animates individually with a wave effect.
    </TextReveal>
  </div>

  <Parallax speed={-0.2}>
    <div className={styles.parallaxBox}>
      <Text as="p" terminals="sans">This content moves slower than scroll</Text>
    </div>
  </Parallax>
</section>
```

Add CSS for demo layout in `TailwindTest.module.css`.

**Verification**: Navigate to TailwindTest page, animations work on scroll

---

### Task 13: Update TypeScript Path Aliases
**Action**: Add path alias for animations if needed

**Check/Edit**: `tsconfig.json`

Ensure path alias works:
```json
{
  "compilerOptions": {
    "paths": {
      "@/nextjs-app/*": ["./nextjs-app/*"]
    }
  }
}
```

**Verification**: Imports resolve without errors

---

### Task 14: Verify and Test
**Action**: Run dev server and verify all functionality

**Commands**:
```bash
npm run dev
npm run typecheck
npm run lint
```

**Manual Testing**:
1. Open `http://localhost:3000` — smooth scroll works
2. Navigate to TailwindTest page — animations trigger on scroll
3. Enable reduced motion in OS — animations simplified/disabled
4. Check browser console — no errors or warnings

**Verification Checklist**:
- [ ] Smooth scroll active sitewide
- [ ] FadeIn animates on scroll
- [ ] SlideIn staggers children
- [ ] TextReveal splits and animates text
- [ ] Parallax creates depth effect
- [ ] Reduced motion respected
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] `gsap`, `@gsap/react`, `lenis` installed
- [ ] Central GSAP registration in `lib/gsap/`
- [ ] SmoothScrollProvider active in layout
- [ ] AnimationProvider with reduced motion support
- [ ] FadeIn component working
- [ ] SlideIn component working
- [ ] TextReveal component working
- [ ] Parallax component working
- [ ] Animation demo added to TailwindTest
- [ ] All animations respect `prefers-reduced-motion`
- [ ] TypeScript compiles without errors
- [ ] Dev server runs without console errors

---

## Output

After completion:
1. Commit all changes with message: `feat(03): add animation infrastructure with GSAP + Lenis`
2. Update `.planning/STATE.md` to mark Phase 03 in progress
3. Run `/gsd:verify-work` to test animations interactively

---

## Notes

- **Three.js deferred**: React Three Fiber compatibility issues with Next.js 15 + React 19. Revisit in later phase when @react-three/fiber@9 is stable.
- **SplitText cleanup**: Always revert SplitText instances on unmount to avoid DOM bloat.
- **ScrollTrigger refresh**: Call `ScrollTrigger.refresh()` after any layout changes (route transitions, accordion opens, etc.)

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 03-1`*
