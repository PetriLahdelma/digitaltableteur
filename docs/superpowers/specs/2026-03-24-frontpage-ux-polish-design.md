# Frontpage UX Polish — Design Spec

**Date:** 2026-03-24
**Author:** Claude + Petri Lahdelma
**Status:** Draft
**Scope:** Polish within existing structure — same 7 sections, same order, same content

---

## Problem

The frontpage has solid foundations (proper a11y, 100% i18n coverage, good component architecture) but suffers from **uniform visual weight**. Every section enters the same way, has similar padding, similar density. The page feels flat — no rhythm, no tension-and-release, no moments of delight.

## Goals

1. **Craft & precision** — The site itself should feel like a design artifact. Every micro-interaction, transition, and typographic choice signals mastery.
2. **Authority & proof** — Credibility signals land with confidence. The portfolio and client logos feel commanding, not incidental.
3. **Rhythm through contrast** — Adjacent sections never share the same visual density.
4. **A11y non-regression** — Audit and improve accessibility as we go. No regressions from current state.

## Design Strategy: Contrast Engine + Selective Narrative + Micro-Craft

Assign each section a density class (Cinematic, Dense, Airy) and alternate them. Layer scroll-driven narrative transitions and component-level micro-interactions where they earn their place.

### Rhythm Map

| # | Section | Density | Key Feeling |
|---|---------|---------|-------------|
| 1 | HomeHero | Cinematic | Depth + handoff |
| 2 | ServicesSection | Dense | Tight, interactive, hierarchical |
| 3 | DesignSprintsSection | Airy | Breathing room, type drama |
| 4 | HighlightSection | Dense | Billboard snap |
| 5 | WorkPreviewSection | Cinematic | Commanding proof |
| 6 | ClientLogoMarquee | Airy | Curated dignity |
| 7 | CTASection | Cinematic | Crescendo + conversion |

**Pattern:** Cinematic → Dense → Airy → Dense → Cinematic → Airy → Cinematic. No two adjacent sections share the same density.

---

## Section-by-Section Design

### 1. HomeHero — Cinematic

**Current:** Random gradient title (KineticTitle wave), TextReveal subtitle, FadeIn CTAs, ScrollIndicator. 75vh min-height.

**Changes:**

- **Scroll exit transition:** As user scrolls past ~60% of hero, content scales down (0.98) and fades slightly. Creates a "handing off" feeling. Use Framer Motion `useScroll` + `useTransform`.
- **Parallax depth:** Hero text scrolls at 0.9x, CTA buttons at 0.85x. 10-15% differential max. Subtle layered depth.
- **Scroll indicator upgrade:** Replace static chevron with gentle pulse animation that fades out after 100px scroll.
- **A11y:** Parallax layers are decorative — content remains in normal DOM flow. Scroll indicator fade respects `prefers-reduced-motion`. No layout shift from parallax.

**Files affected:** `HomeHero.tsx`, potentially new `useScrollParallax` hook.

### 2. ServicesSection — Dense

**Current:** Section title, 6 ServiceCards in 3-col auto-fit grid, all FadeIn upward with 0.1s stagger.

**Changes:**

- **Scroll-driven stagger:** Replace mount-triggered FadeIn with scroll-linked entrance. First row reveals, second row 100ms later. Use Framer Motion `useInView` with `amount: 0.3`.
- **Tighter grid gaps:** Reduce gap to make the grid feel like a cohesive unit.
- **Card hover micro-interactions:** Subtle lift (translateY -4px) with soft box-shadow expansion, spring easing. Service icon gets gentle scale pulse on hover.
- **Visual weight differentiation:** "Design Systems" and "AI Solutions" cards get a subtle accent (border-left or background tint) to create hierarchy within the grid.
- **A11y:** Hover effects are enhancement only. Focus states mirror hover lift for keyboard users. Card contrast preserved across all 4 themes.

**Files affected:** `ServicesSection.tsx`, `ServiceCard.tsx`, `ServiceCard.module.css`.

### 3. DesignSprintsSection — Airy

**Current:** 2-col layout (text left, 2x2 benefits grid right). FadeIn text, staggered benefits. SprintButton with rotating icon.

**Changes:**

- **Dramatic whitespace increase:** ~2x current padding-block. Density contrast with the tight Services grid above creates rhythm.
- **Type scale jump:** Section heading gets a size bump larger than Services' heading. Typographic drama between sections.
- **Asymmetric layout:** Shift from 50/50 to ~45/55 split. Text column benefits from tighter measure (~45ch), benefits grid gets more room.
- **Benefits diagonal sweep:** Reveal top-left → top-right → bottom-left → bottom-right sequentially on scroll. Slower than Services' entrance.
- **SprintButton spring physics:** Replace CSS rotation with Framer Motion spring (overshoot + settle).
- **A11y:** Larger padding improves cognitive breathing room. Sequential reveals respect `prefers-reduced-motion` (instant display). Spring animation is decorative.

**Files affected:** `DesignSprintsSection.tsx`, `DesignSprintsSection.module.css`.

### 4. HighlightSection — Dense

**Current:** GenAI Schema promo. "Dots" background, "comfortable" sizing (56px padding). Title, description, CTAs.

**Changes:**

- **Tighten vertical padding:** Compact and punchy. Counterpoint to DesignSprints' airiness above.
- **Snap entrance:** Scroll-linked fade + short slide-up (16px travel). Quick duration — this section snaps into place.
- **Background parallax:** Dots pattern scrolls at 0.95x. Barely perceptible depth.
- **CTA button hover:** Spring-based scale (1.03 with overshoot). Consistent with Services card vocabulary.
- **A11y:** Background parallax is decorative (CSS only, no layout shift). Reduced motion disables it. Verify button target sizes meet WCAG 2.2 (44x44) across all breakpoints.

**Files affected:** `HighlightSection.tsx`, `HighlightSection.module.css`.

### 5. WorkPreviewSection — Cinematic

**Current:** 3 EnhancedProjectCards in grid, staggered FadeIn. "View all work" hidden on mobile.

**Changes:**

- **Larger card presence:** More vertical space, larger thumbnail area. Fewer elements per viewport-height — work speaks louder.
- **Hover perspective tilt:** 3D rotation tracking cursor (±3deg max) with shadow shift. Apple TV card effect, restrained. `pointer: fine` only.
- **Slower scroll reveal:** ~200ms stagger (up from 100ms). Each card earns its moment.
- **Mobile "View all" fix:** Surface the "View all work" link below cards on mobile. Currently hidden, meaning mobile visitors may never discover full portfolio.
- **A11y:** Perspective tilt disabled for `pointer: coarse` and `prefers-reduced-motion`. Focus state gets a polished visible ring matching hover quality. Keyboard users get the same "this feels good" moment. Reduced motion: instant display, no stagger.

**Files affected:** `WorkPreviewSection.tsx`, `EnhancedProjectCard.tsx`, `EnhancedProjectCard.module.css`.

### 6. ClientLogoMarquee — Airy

**Current:** 18 logos, infinite horizontal scroll. Mobile: 2 staggered lanes. Desktop: single lane. Reduced motion: static grid. 200ms measurement delay.

**Changes:**

- **Generous vertical padding:** Significantly more space above and below. Logos feel curated, not crammed.
- **Opacity entrance:** Logos fade from 0.4 to 1.0 over 300ms on scroll into view. Marquee animation starts after fade. Softer than current hard cut.
- **Hover pause + highlight:** Desktop: hovering pauses marquee, logo under cursor scales to 1.08. Visitors can register individual logos.
- **Section label refinement:** "Selected clients" label gets letter-spacing increase or small-caps treatment.
- **A11y:** Hover-pause is a WCAG 2.1 SC 2.2.2 improvement — user mechanism to pause moving content beyond `prefers-reduced-motion`. Verify pause is keyboard-triggerable (focus within section pauses animation). Logo alt texts already in place. Static grid fallback preserved.

**Files affected:** `ClientLogoMarquee.tsx`, associated CSS (currently global selectors).

### 7. CTASection — Cinematic

**Current:** Heading, button, primary color background with SVG texture overlay.

**Changes:**

- **Viewport-aware entrance:** Heading springs from scale 0.95 → 1.0 at 30% viewport intersection. Button fades in 200ms after heading. Page has been building to this.
- **Magnetic button:** Button tracks cursor within ~40px radius (max 6px displacement). Snap-back on click. Signature micro-interaction.
- **Background gradient shift:** Slow, barely perceptible hue rotation on scroll (5-degree shift over full section). Background feels alive.
- **Generous top margin:** Clear visual chapter break from logo marquee.
- **A11y:** Magnetic displacement small enough to not interfere with click targets. Disabled for `pointer: coarse` and `prefers-reduced-motion`. Gradient shift is decorative. Focus state gets strong visible ring. Keyboard Enter triggers snap-back animation.

**Files affected:** `CTASection.tsx`, `CTASection.module.css`.

---

## Cross-Cutting Concerns

### Animation Framework
- Primary: Framer Motion (already in use) for scroll-driven animations, springs, and layout transitions.
- Secondary: CSS keyframes for decorative effects (background parallax, gradient shifts).
- All animations gated on `prefers-reduced-motion` via existing `useReducedMotion` hook.

### New Shared Utilities Needed
- `useScrollParallax(ref, speed)` — returns a `MotionValue` for parallax offset
- `useMagneticButton(ref, radius, maxDisplacement)` — returns cursor-tracking transform
- `usePerspectiveTilt(ref, maxDeg)` — returns 3D rotation values from cursor position
- Spring easing presets: `springSnappy` (stiffness: 300, damping: 30), `springGentle` (stiffness: 150, damping: 20)

### Performance Budget
- No additional JS bundle dependencies. All effects built with Framer Motion (already loaded) and CSS.
- Parallax and tilt effects use `transform` and `opacity` only (GPU-composited, no layout thrash).
- `will-change` applied judiciously — only on elements actively animating.

### Theme Compatibility
- All changes must work across 4 themes: Light, Dark, HCB, HCW.
- Accent borders/tints on service cards must be visible in all themes.
- Background gradient shift in CTA must remain accessible in all themes.

### Reduced Motion Behavior
Every animation degrades gracefully:
- Parallax → static positioning
- Staggered reveals → instant display
- Hover tilt/magnetic → standard hover states
- Gradient shifts → static gradient
- Spring physics → instant transitions
- Marquee → static grid (already implemented)

### A11y Audit Checklist
- [ ] WCAG 2.2 target sizes (44x44) on all interactive elements across breakpoints
- [ ] Focus indicators match hover state quality on all interactive cards/buttons
- [ ] Marquee pause mechanism keyboard-accessible
- [ ] No information gated behind hover-only states
- [ ] Heading hierarchy preserved (h1 → h2 progression)
- [ ] `prefers-reduced-motion` disables all new animations
- [ ] Color contrast maintained in accent treatments across all themes

---

## Out of Scope

- Content changes (copy, titles, descriptions)
- Section reordering or removal
- New content blocks (testimonials, metrics, etc.)
- Structural layout changes (section count, page routes)
- Mobile-specific redesigns beyond the "View all work" visibility fix

---

## Success Criteria

1. Scrolling through the page produces a perceptible rhythm — alternating density creates tension and release.
2. At least 3 micro-interactions feel "delightful" on first encounter (card tilt, magnetic button, spring rotations).
3. `prefers-reduced-motion` experience is still complete and usable — no functionality lost.
4. Lighthouse accessibility score maintained or improved.
5. No new runtime dependencies added to the bundle.
