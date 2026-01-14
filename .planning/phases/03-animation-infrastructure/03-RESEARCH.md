# Phase 03: Animation Infrastructure — Research

> **Researched**: 2026-01-14
> **Domain**: Animation libraries, smooth scrolling, scroll-driven effects
> **Confidence**: High (well-documented ecosystem, recent major updates)

---

## Executive Summary

The animation ecosystem underwent major changes in 2025:

1. **GSAP is now 100% free** — All plugins including SplitText, MorphSVG, ScrollSmoother are free for commercial use (Webflow acquisition, April 2025)
2. **Lenis + GSAP ScrollTrigger** is the recommended stack — Combines lightweight smooth scroll with powerful scroll animations
3. **React Three Fiber has Next.js 15 compatibility issues** — Defer 3D integration to later phase
4. **Accessibility is critical** — Built-in `prefers-reduced-motion` support via `gsap.matchMedia()`

### Recommended Stack

| Component | Library | Version | Rationale |
|-----------|---------|---------|-----------|
| Core Animation | GSAP | 3.12+ | Industry standard, now free, excellent React support |
| React Integration | @gsap/react | 2.1+ | Official hook with automatic cleanup |
| Scroll Animation | ScrollTrigger | (bundled) | Native GSAP integration, free |
| Text Animation | SplitText | (bundled) | Kinetic typography, now free |
| Smooth Scroll | Lenis | 1.2+ | Lightweight (2KB), preserves native scroll |
| 3D (Optional) | React Three Fiber | — | **Defer** — compatibility issues with Next.js 15 |

---

## 1. GSAP Ecosystem

### 1.1 Licensing (Critical Update 2025)

As of **April 30, 2025**, GSAP became completely free for all uses:

- **Commercial use**: ✅ Allowed
- **All plugins**: ✅ Free (SplitText, MorphSVG, ScrollSmoother, Physics2D, etc.)
- **AI-generated code**: ✅ Explicitly permitted

**Only restriction**: Cannot use in no-code visual animation builders that compete with Webflow.

> Sources: [GSAP Licensing](https://gsap.com/licensing/), [CSS-Tricks Announcement](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)

### 1.2 Core Plugins (Now Free)

| Plugin | Purpose | Bundle Size |
|--------|---------|-------------|
| **ScrollTrigger** | Scroll-driven animations | ~13KB |
| **SplitText** | Text character/word/line splitting | ~5KB (50% smaller in v3.13) |
| **MorphSVG** | SVG shape morphing | ~8KB |
| **ScrollSmoother** | GSAP's smooth scroll solution | ~26KB |
| **Physics2D** | Physics-based motion | ~10KB |
| **CustomEase** | Custom easing functions | ~3KB |

### 1.3 React Integration (@gsap/react)

**Installation:**
```bash
npm install gsap @gsap/react
```

**Critical Pattern — useGSAP Hook:**
```tsx
"use client";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.element', {
      opacity: 0,
      y: 50,
      scrollTrigger: {
        trigger: '.element',
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
}
```

**Key Benefits:**
- Automatic cleanup via `gsap.context()`
- Handles React Strict Mode (which calls effects TWICE)
- SSR-safe with `"use client"` directive
- Scoped selectors via `scope` option

**Context-Safe Animations (Event Handlers):**
```tsx
const { contextSafe } = useGSAP({ scope: container });

const handleClick = contextSafe(() => {
  gsap.to('.box', { rotation: 360 });
});
```

> Source: [GSAP React Documentation](https://gsap.com/resources/React/)

---

## 2. Smooth Scroll Solutions

### 2.1 Comparison Matrix

| Feature | Lenis | GSAP ScrollSmoother | Locomotive Scroll |
|---------|-------|---------------------|-------------------|
| Bundle Size | **2.13KB** | 26.08KB | 12.33KB |
| License | MIT | Webflow (free) | MIT |
| CSS Sticky | ✅ Works | ❌ Workarounds needed | ❌ Broken |
| Fixed Position | ✅ Works | ⚠️ Must be outside container | ❌ Broken |
| Native Scrollbar | ✅ Yes | ✅ Yes | ❌ No |
| ScrollTrigger Compat | ✅ Excellent | ✅ Native | ⚠️ Conflicts |
| Touch Performance | ✅ Good | ✅ Good | ⚠️ Issues |

### 2.2 Recommendation: Lenis + ScrollTrigger

**Why this combination:**
1. Lenis handles smooth scrolling with minimal footprint (2KB)
2. ScrollTrigger handles scroll-driven animations
3. No CSS sticky/fixed position conflicts
4. Better performance than all-in-one solutions

**Installation:**
```bash
npm install lenis
```

**Next.js App Router Integration:**
```tsx
// providers/SmoothScrollProvider.tsx
"use client";

import { ReactLenis } from 'lenis/react';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false, // Better mobile performance
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

**Connect Lenis to ScrollTrigger:**
```tsx
import { useLenis } from 'lenis/react';

function ScrollConnector() {
  useLenis(({ scroll }) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return null;
}
```

> Sources: [Lenis + Next.js Guide](https://bridger.to/lenis-nextjs), [Born Digital Comparison](https://www.borndigital.be/blog/our-smooth-scrolling-libraries)

---

## 3. SplitText for Kinetic Typography

### 3.1 Basic Usage

```tsx
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

useGSAP(() => {
  const split = new SplitText('.hero-title', {
    type: 'chars,words,lines',
    linesClass: 'line',
  });

  gsap.from(split.chars, {
    opacity: 0,
    y: 50,
    stagger: 0.02,
    ease: 'power2.out',
  });

  // Clean up after animation
  return () => split.revert();
}, { scope: containerRef });
```

### 3.2 Known Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| Lines split incorrectly | Font not loaded when splitting | Use `autoSplit: true` or wait for fonts |
| Poor accessibility | Screen readers read letter-by-letter | SplitText 3.13+ adds `aria-hidden` automatically |
| Performance lag | Too many DOM elements | Use `immediateRender: false`, revert after animation |
| Responsive breaks | Lines don't reflow | Enable `autoSplit` with ResizeObserver |

### 3.3 Responsive-Safe Pattern

```tsx
const split = new SplitText('.title', {
  type: 'lines,words',
  autoSplit: true, // Auto re-split on resize/font load
  onSplit: (self) => {
    // Animate fresh elements after each split
    gsap.from(self.lines, {
      opacity: 0,
      y: 100,
      stagger: 0.1,
    });
  },
});
```

> Sources: [SplitText Rewrite Blog](https://webflow.com/blog/gsap-splittext-rewrite), [GSAP SplitText Docs](https://gsap.com/docs/v3/Plugins/SplitText/)

---

## 4. Accessibility

### 4.1 Reduced Motion Support

**Critical Requirement**: Respect `prefers-reduced-motion` system preference.

```tsx
// lib/gsap/motion-safe.ts
import gsap from 'gsap';

export function setupReducedMotion() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Full animations
    gsap.config({ autoSleep: 60 });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    // Disable or simplify animations
    gsap.globalTimeline.timeScale(0);
    // Or use simpler opacity-only transitions
  });

  return mm;
}
```

### 4.2 Best Practices

1. **Provide UI toggle** — Not all users know about OS settings
2. **Simplify, don't remove** — Functional animations (progress) should remain
3. **Avoid triggers** — No flashing >3 times/second, no sudden large motions
4. **Test with screen readers** — SplitText elements need proper ARIA handling

### 4.3 SplitText Accessibility

SplitText 3.13+ automatically:
- Adds `aria-label` to parent element
- Adds `aria-hidden="true"` to split children
- Screen readers read the label, not individual letters

> Source: [GSAP Accessibility Guide](https://gsap.com/resources/a11y/)

---

## 5. Three.js / React Three Fiber

### 5.1 Current Status

**Defer to later phase** — There are known compatibility issues with Next.js 15 and React 19:

> "TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')"

**Cause**: React Three Fiber v8 pairs with React 18, v9 pairs with React 19. Version alignment required.

### 5.2 When Ready (Future Phase)

- Use `@react-three/fiber@9` with React 19
- Official starter: [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next)
- Use `drei` for common helpers

---

## 6. Animation Architecture

### 6.1 Project Structure

```
nextjs-app/shared/
├── lib/
│   └── gsap/
│       ├── index.ts           # Central plugin registration
│       ├── motion-safe.ts     # Reduced motion handling
│       └── defaults.ts        # Global animation defaults
├── hooks/
│   ├── useScrollAnimation.ts  # Reusable scroll reveal
│   ├── useSplitText.ts        # Text animation wrapper
│   └── useParallax.ts         # Parallax effect
├── components/
│   ├── animations/
│   │   ├── FadeIn/            # Fade reveal primitive
│   │   ├── SlideIn/           # Slide reveal primitive
│   │   ├── TextReveal/        # Kinetic text component
│   │   └── Parallax/          # Parallax wrapper
│   └── ...
└── providers/
    └── SmoothScrollProvider/  # Lenis wrapper
```

### 6.2 Central Plugin Registration

```tsx
// lib/gsap/index.ts
"use client";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register all plugins once
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Set global defaults
gsap.defaults({
  duration: 0.8,
  ease: 'power2.out',
});

export { gsap, useGSAP, ScrollTrigger, SplitText };
```

### 6.3 Reusable Animation Primitives

```tsx
// components/animations/FadeIn/FadeIn.tsx
"use client";

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap';
import styles from './FadeIn.module.css';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  threshold?: string; // e.g., "top 80%"
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  threshold = 'top 80%',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const from = {
      opacity: 0,
      ...(direction === 'up' && { y: 50 }),
      ...(direction === 'down' && { y: -50 }),
      ...(direction === 'left' && { x: -50 }),
      ...(direction === 'right' && { x: 50 }),
    };

    gsap.from(ref.current, {
      ...from,
      delay,
      duration,
      scrollTrigger: {
        trigger: ref.current,
        start: threshold,
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={styles.fadeIn}>
      {children}
    </div>
  );
}
```

---

## 7. Common Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| ScrollTrigger console warnings in Next.js | Wrap in `"use client"`, ensure DOM ready |
| Hydration mismatch with animations | Use `useLayoutEffect` via `useGSAP` |
| Animations not reverting on unmount | Use `useGSAP` hook, not raw `useEffect` |
| Maximum update depth exceeded (Lenis) | Don't include options object in deps array |
| SplitText breaks on font load | Use `autoSplit: true` |
| Fixed elements jump with smooth scroll | Lenis preserves fixed positioning (unlike ScrollSmoother) |
| React Strict Mode doubles animations | `useGSAP` handles this automatically |

---

## 8. Performance Considerations

### 8.1 Bundle Impact

| Package | Gzipped Size |
|---------|--------------|
| gsap (core) | ~23KB |
| @gsap/react | ~2KB |
| ScrollTrigger | ~13KB |
| SplitText | ~5KB |
| Lenis | ~2KB |
| **Total** | **~45KB** |

*Compare to Framer Motion alone at ~32KB with less capability.*

### 8.2 Runtime Optimizations

1. **Lazy load animation components** — Don't hydrate animations above the fold
2. **Revert SplitText after animation** — Reduces DOM node count
3. **Use `will-change` sparingly** — Only during active animation
4. **Batch ScrollTrigger refreshes** — Call `ScrollTrigger.refresh()` once after layout changes

---

## 9. Next Steps

1. **Plan Phase 03** — Create execution plan based on this research
2. **Install packages** — `gsap @gsap/react lenis`
3. **Set up provider structure** — SmoothScrollProvider, GSAP registration
4. **Create animation primitives** — FadeIn, SlideIn, TextReveal, Parallax
5. **Implement reduced motion** — `gsap.matchMedia()` integration
6. **Defer Three.js** — Wait for React Three Fiber v9 stable

---

## 10. References

### Official Documentation
- [GSAP Documentation](https://gsap.com/docs/)
- [GSAP + React Guide](https://gsap.com/resources/React/)
- [GSAP Accessibility](https://gsap.com/resources/a11y/)
- [Lenis Documentation](https://github.com/darkroomengineering/lenis)

### Articles & Guides
- [GSAP Now Free Announcement (CSS-Tricks)](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)
- [GSAP + Next.js 2025 Setup (Medium)](https://medium.com/@thomasaugot/setting-up-gsap-with-next-js-2025-edition-bcb86e48eab6)
- [Smooth Scroll Libraries Comparison](https://www.borndigital.be/blog/our-smooth-scrolling-libraries)
- [Lenis + Next.js Integration](https://bridger.to/lenis-nextjs)
- [SplitText Rewrite (Webflow)](https://webflow.com/blog/gsap-splittext-rewrite)

### Community Resources
- [GSAP Community Forums](https://gsap.com/community/)
- [Basement Studio GSAP Setup](https://basement.studio/post/gsap-and-nextjs-setup-the-bsmnt-way)

---

*Research completed: 2026-01-14*
*Ready for planning with `/gsd:plan-phase 03`*
