# Phase 07-1: Hero Section Redesign

> **Phase**: 07 (Homepage Redesign)
> **Plan**: 1 of 2
> **Scope**: Hero section with kinetic typography and scroll CTA
> **Estimated Tasks**: 8

---

## Objective

Redesign the homepage hero section with a bold, studio-aesthetic approach featuring kinetic typography using GSAP, scroll-driven animations, and a compelling value proposition. Replace the existing Framer Motion hero with a GSAP-powered, Tailwind-styled implementation.

---

## Execution Context

### Available Components (from Phases 01-06)
- **Typography**: `Title`, `Text`, `Heading`, `Display` (Syne + Satoshi)
- **Animation**: `FadeIn`, `SlideIn`, `TextReveal`, `Parallax` (GSAP-powered)
- **Layout**: `Container`, `Section`, `Stack`, `Spacer`, `Center`
- **UI**: `Button`, `TextLink`, `Tag`, `Divider`, `IconButton`
- **Interactive**: `Dialog`, `Accordion`, `Tabs`, `Toaster`
- **Navigation**: `SiteHeader`, `SiteFooter`, `NavLink`, `SkipLink`

### Design Tokens
- Fonts: `font-display` (Syne), `font-body` (Satoshi)
- Colors: `--color-primary`, `--color-foreground`, `--color-background`
- Spacing: `--space-*` tokens mapped to Tailwind

### Current Hero Analysis
- Location: `nextjs-app/shared/components/pages/Home/HomePage.tsx`
- Uses Framer Motion with spring physics
- CSS Modules for styling (`Home.module.css`)
- Animated gradient background
- i18n with dynamic title selection
- Two CTAs: Contact + About

---

## Context

### Design Direction
**Studio Aesthetic Goals** (from PROJECT.md):
- Bold typography (Syne display headings)
- Generous whitespace
- Kinetic animations (GSAP ScrollTrigger)
- Structured grids with asymmetric options
- Distinctive palette with texture/depth

### Hero Requirements (from ROADMAP.md)
- Kinetic typography effect
- Scroll CTA indicator
- Mobile responsive design
- Scroll-driven animations throughout

### Technical Constraints
- Replace Framer Motion with GSAP (consistency with Phase 03)
- Use Tailwind classes with `cn()` utility
- Preserve i18n support (EN/FI/SV)
- Maintain accessibility (reduced motion support)

---

## Tasks

### Task 1: Create HeroSection pattern component
**File**: `nextjs-app/shared/patterns/HeroSection/HeroSection.tsx`

Create a new Tailwind-first hero section pattern:
- Full viewport height with flexible content
- Support for gradient, solid, and image backgrounds
- Polymorphic (`as` prop) for semantic flexibility
- ARIA labels and accessibility attributes

```tsx
interface HeroSectionProps {
  children: ReactNode;
  background?: "gradient" | "solid" | "image" | "transparent";
  backgroundImage?: string;
  minHeight?: "screen" | "hero" | "half" | "auto";
  className?: string;
}
```

**Verification**: Component renders with correct background variants.

---

### Task 2: Create KineticTitle component
**File**: `nextjs-app/shared/components/animations/KineticTitle/KineticTitle.tsx`

Build a GSAP-powered animated title component:
- Word-by-word or character-by-character reveal
- ScrollTrigger integration for on-scroll activation
- Multiple animation presets: `fade`, `slide`, `wave`, `scramble`
- Configurable stagger, duration, and easing
- Reduced motion fallback

```tsx
interface KineticTitleProps {
  children: string;
  animation?: "fade" | "slide" | "wave" | "scramble";
  splitBy?: "chars" | "words" | "lines";
  stagger?: number;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}
```

**Verification**: Title animates on scroll with configurable presets.

---

### Task 3: Create ScrollIndicator component
**File**: `nextjs-app/shared/components/ScrollIndicator/ScrollIndicator.tsx`

Build an animated scroll CTA indicator:
- Bouncing arrow or custom icon
- GSAP infinite animation with pause on hover
- Click-to-scroll functionality (smooth scroll to next section)
- Optional text label
- Reduced motion: static or gentle pulse

```tsx
interface ScrollIndicatorProps {
  targetId?: string;
  label?: string;
  position?: "center" | "left" | "right";
  className?: string;
}
```

**Verification**: Indicator animates and scrolls to target on click.

---

### Task 4: Create HeroBackground component
**File**: `nextjs-app/shared/components/HeroBackground/HeroBackground.tsx`

Animated background with noise/grain texture:
- CSS gradient animation (existing `gradient-move` effect)
- Optional noise texture overlay
- Theme-aware color transitions
- Performance-optimized (GPU-accelerated)

```tsx
interface HeroBackgroundProps {
  variant?: "gradient" | "mesh" | "solid" | "noise";
  animate?: boolean;
  className?: string;
}
```

**Verification**: Background renders with smooth animation at 60fps.

---

### Task 5: Compose HomeHero section
**File**: `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx`

Compose the final homepage hero using the new components:
- `HeroSection` wrapper
- `HeroBackground` with animated gradient
- `KineticTitle` for main headline
- `TextReveal` for subtitle
- CTA buttons with staggered entrance
- `ScrollIndicator` at bottom

Structure:
```tsx
<HeroSection minHeight="screen" background="transparent">
  <HeroBackground variant="gradient" animate />
  <Container className="relative z-10">
    <Stack spacing="lg" align="center">
      <KineticTitle animation="wave" splitBy="words" as="h1">
        {t("homeHeroTitle")}
      </KineticTitle>
      <TextReveal animation="fade" as="p">
        {t("homeHeroSubtext")}
      </TextReveal>
      <FadeIn delay={0.8}>
        <Stack direction="horizontal" spacing="md">
          <Button href="/contact">{t("homeHeroContactCta")}</Button>
          <Button variant="outline" href="/about">{t("homeHeroAboutCta")}</Button>
        </Stack>
      </FadeIn>
    </Stack>
  </Container>
  <ScrollIndicator targetId="services" />
</HeroSection>
```

**Verification**: Hero displays correctly with all animations.

---

### Task 6: Add i18n translation keys
**Files**:
- `nextjs-app/shared/locales/en/translation.json`
- `nextjs-app/shared/locales/fi/translation.json`
- `nextjs-app/shared/locales/sv/translation.json`

Add/update translation keys for new hero:
- `homeHeroTitle` - Main headline
- `homeHeroSubtext` - Supporting description
- `homeHeroContactCta` - Primary CTA text
- `homeHeroAboutCta` - Secondary CTA text
- `homeHeroScrollLabel` - Scroll indicator label (optional)

**Verification**: All three languages have complete translations.

---

### Task 7: Create barrel export for patterns
**File**: `nextjs-app/shared/patterns/index.ts`

Create/update patterns barrel export:
```tsx
export { HeroSection } from "./HeroSection";
export { HomeHero } from "./HomeHero";
export { HighlightSection } from "./HighlightSection";
// ... other patterns
```

**Verification**: All patterns importable from single path.

---

### Task 8: Verify and test
**Actions**:
1. Run `npm run typecheck` - ensure no TypeScript errors
2. Run `npm run lint` - ensure no linting issues
3. Run `npm run dev` - verify hero renders correctly
4. Test scroll animations in browser
5. Test reduced motion preference
6. Test all three language variants
7. Check mobile responsiveness

**Verification**: All checks pass, hero functions correctly.

---

## Verification

### Automated Checks
```bash
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint + Stylelint
npm run test         # Unit tests (if added)
```

### Manual Checks
- [ ] Hero renders full viewport height
- [ ] KineticTitle animates on page load
- [ ] ScrollIndicator bounces and scrolls on click
- [ ] Reduced motion shows static fallback
- [ ] All three languages display correctly
- [ ] Mobile layout is responsive
- [ ] No layout shift during animation
- [ ] 60fps animation performance

---

## Success Criteria

- [ ] HeroSection pattern created with Tailwind styling
- [ ] KineticTitle component with GSAP animations
- [ ] ScrollIndicator with smooth scroll functionality
- [ ] HeroBackground with animated gradient
- [ ] HomeHero composed from new components
- [ ] i18n translations complete (EN/FI/SV)
- [ ] Patterns barrel export created
- [ ] All verification checks pass

---

## Output

### Files Created
- `nextjs-app/shared/patterns/HeroSection/HeroSection.tsx`
- `nextjs-app/shared/patterns/HeroSection/index.ts`
- `nextjs-app/shared/components/animations/KineticTitle/KineticTitle.tsx`
- `nextjs-app/shared/components/animations/KineticTitle/index.ts`
- `nextjs-app/shared/components/ScrollIndicator/ScrollIndicator.tsx`
- `nextjs-app/shared/components/ScrollIndicator/index.ts`
- `nextjs-app/shared/components/HeroBackground/HeroBackground.tsx`
- `nextjs-app/shared/components/HeroBackground/index.ts`
- `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx`
- `nextjs-app/shared/patterns/HomeHero/index.ts`
- `nextjs-app/shared/patterns/index.ts`

### Files Modified
- `nextjs-app/shared/locales/en/translation.json`
- `nextjs-app/shared/locales/fi/translation.json`
- `nextjs-app/shared/locales/sv/translation.json`

---

## Next Plan

After completing 07-1, proceed to **07-2: Services & Work Sections** which covers:
- Services grid section (6 service cards with icons)
- Work/portfolio preview section
- Final CTA section
- Integration into HomePage component

---

*Created: 2026-01-14*
