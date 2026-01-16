# Phase 07-2: Services, Work & CTA Sections

> **Phase**: 07 (Homepage Redesign)
> **Plan**: 2 of 2
> **Scope**: Services grid, work preview, contact CTA sections
> **Estimated Tasks**: 10

---

## Objective

Complete the homepage redesign by building the Services section (6 cards with icons), Work/Portfolio preview section (featured projects with hover effects), and final Contact CTA section. Replace existing sections with GSAP-animated, Tailwind-styled implementations while preserving i18n support.

---

## Execution Context

### Available Components (from Phases 01-06 + 07-1)
- **From 07-1**: `HeroSection`, `KineticTitle`, `ScrollIndicator`, `HeroBackground`, `HomeHero`
- **Typography**: `Title`, `Text`, `Heading`, `Display`
- **Animation**: `FadeIn`, `SlideIn`, `TextReveal`, `Parallax`
- **Layout**: `Container`, `Section`, `Stack`, `Spacer`, `Center`
- **UI**: `Button`, `TextLink`, `Tag`, `Divider`, `Card`
- **Interactive**: `Dialog`, `Tabs`, `Accordion`

### Current Services Section Analysis
- 6 service cards in responsive grid
- Uses Card component from design system
- i18n translation keys for titles/descriptions
- CSS Modules with `auto-fit` grid

### Current HighlightSection
- Promotional CTA with pattern background
- 2 CTAs for external links
- Already Tailwind-compatible

---

## Context

### Design Direction
**Studio Aesthetic** (from PROJECT.md):
- Service cards with hover animations
- Asymmetric grid options
- Scroll-triggered reveals
- Work preview with project thumbnails
- Bold CTA with distinctive background

### Section Requirements (from ROADMAP.md)
- Services section (Design & Development above the fold)
- Work preview (portfolio highlights with hover effects)
- Contact CTA section
- Scroll-driven animations throughout
- Mobile responsive design

---

## Tasks

### Task 1: Create ServiceCard component
**File**: `nextjs-app/shared/components/ServiceCard/ServiceCard.tsx`

Build a Tailwind-first service card with:
- Icon slot (top or left position)
- Title and description
- Hover animation (lift + shadow)
- Optional link/CTA
- Theme-aware colors

```tsx
interface ServiceCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  href?: string;
  variant?: "default" | "bordered" | "elevated" | "minimal";
  className?: string;
}
```

**Verification**: Card renders with hover animation.

---

### Task 2: Create ServicesSection pattern
**File**: `nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx`

Compose services grid section:
- Section header with title
- Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Staggered FadeIn animation for cards
- Optional lead text

```tsx
interface ServicesSectionProps {
  title?: string;
  description?: string;
  services: ServiceItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

interface ServiceItem {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
}
```

**Verification**: Grid displays correctly at all breakpoints.

---

### Task 3: Create service icons
**File**: `nextjs-app/shared/components/icons/service-icons.tsx`

Create or import icons for 6 services:
1. UX & Interfaces - `Layout` or custom
2. Creative & Development - `Code2` or custom
3. Branding & Strategy - `Compass` or custom
4. Editorial & Illustration - `PenTool` or custom
5. AI Solutions - `Brain` or `Sparkles`
6. Design Systems - `Layers` or `Component`

Use lucide-react icons, optionally with custom wrappers.

**Verification**: All icons render correctly.

---

### Task 4: Create ProjectCard component
**File**: `nextjs-app/shared/components/ProjectCard/ProjectCard.tsx`

Build a portfolio project card:
- Thumbnail image with aspect ratio
- Title overlay or below
- Hover effect (scale image, reveal title)
- Link to project detail page
- Category/tag display

```tsx
interface ProjectCardProps {
  title: string;
  slug: string;
  thumbnail: string;
  category?: string;
  tags?: string[];
  className?: string;
}
```

**Verification**: Card renders with hover animation on image.

---

### Task 5: Create WorkPreviewSection pattern
**File**: `nextjs-app/shared/patterns/WorkPreviewSection/WorkPreviewSection.tsx`

Compose featured work section:
- Section header with title and "View all work" link
- Grid of 3-4 featured projects
- Asymmetric grid option (1 large + 2 small)
- Scroll-triggered staggered reveal

```tsx
interface WorkPreviewSectionProps {
  title?: string;
  projects: ProjectItem[];
  layout?: "grid" | "asymmetric" | "masonry";
  showViewAll?: boolean;
  className?: string;
}
```

**Verification**: Projects display with correct layout and animations.

---

### Task 6: Create CTASection pattern
**File**: `nextjs-app/shared/patterns/CTASection/CTASection.tsx`

Build final call-to-action section:
- Full-width background (primary color or gradient)
- Large centered headline
- CTA button(s)
- Optional decorative elements

```tsx
interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction: ActionItem;
  secondaryAction?: ActionItem;
  background?: "primary" | "gradient" | "dark";
  className?: string;
}

interface ActionItem {
  label: string;
  href?: string;
  onClick?: () => void;
}
```

**Verification**: CTA renders with correct background and contrast.

---

### Task 7: Compose full HomePage
**File**: `nextjs-app/shared/components/pages/Home/HomePage.tsx`

Integrate all new sections into HomePage:
1. `HomeHero` (from 07-1)
2. `ServicesSection` with 6 services
3. `HighlightSection` (existing - GenAI schema promo)
4. `WorkPreviewSection` with featured projects
5. `CTASection` for contact

Replace existing Framer Motion code with GSAP-based components.

**Verification**: Full homepage renders with all sections.

---

### Task 8: Add i18n translation keys
**Files**: Translation files for all three languages

Add/update keys:
- `homeServicesTitle` - Services section header
- `homeService1Title`, `homeService1Desc` - Service 1 (UX)
- `homeService2Title`, `homeService2Desc` - Service 2 (Creative)
- `homeService3Title`, `homeService3Desc` - Service 3 (Branding)
- `homeService4Title`, `homeService4Desc` - Service 4 (Editorial)
- `homeService5Title`, `homeService5Desc` - Service 5 (AI)
- `homeService6Title`, `homeService6Desc` - Service 6 (Design Systems)
- `homeWorkTitle` - Work section header
- `homeWorkViewAll` - "View all work" link
- `homeCtaTitle` - CTA headline
- `homeCtaButton` - CTA button text

**Verification**: All translations complete for EN/FI/SV.

---

### Task 9: Update patterns barrel export
**File**: `nextjs-app/shared/patterns/index.ts`

Add new patterns to barrel export:
```tsx
export { ServicesSection } from "./ServicesSection";
export { WorkPreviewSection } from "./WorkPreviewSection";
export { CTASection } from "./CTASection";
```

**Verification**: All patterns importable from `@/patterns`.

---

### Task 10: Verify and test
**Actions**:
1. Run `npm run typecheck` - TypeScript compilation
2. Run `npm run lint` - Linting checks
3. Run `npm run dev` - Visual verification
4. Test all scroll animations
5. Test mobile responsive layouts
6. Test all three languages
7. Test reduced motion preference
8. Browser compatibility (Chrome, Firefox, Safari)

**Verification**: All checks pass, homepage complete.

---

## Verification

### Automated Checks
```bash
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint + Stylelint
npm run test         # Unit tests
```

### Manual Checks
- [ ] Services section shows 6 cards in grid
- [ ] Cards have hover animation
- [ ] Work preview shows featured projects
- [ ] Project cards have image hover effect
- [ ] CTA section has correct background
- [ ] All scroll animations trigger correctly
- [ ] Mobile layouts are responsive
- [ ] Reduced motion fallback works
- [ ] All three languages render correctly

---

## Success Criteria

- [ ] ServiceCard component created
- [ ] ServicesSection pattern with 6 services
- [ ] Service icons created/configured
- [ ] ProjectCard component created
- [ ] WorkPreviewSection pattern with grid layouts
- [ ] CTASection pattern created
- [ ] HomePage composed with all new sections
- [ ] i18n translations complete (EN/FI/SV)
- [ ] Patterns barrel export updated
- [ ] All verification checks pass

---

## Output

### Files Created
- `nextjs-app/shared/components/ServiceCard/ServiceCard.tsx`
- `nextjs-app/shared/components/ServiceCard/index.ts`
- `nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx`
- `nextjs-app/shared/patterns/ServicesSection/index.ts`
- `nextjs-app/shared/components/icons/service-icons.tsx`
- `nextjs-app/shared/components/ProjectCard/ProjectCard.tsx`
- `nextjs-app/shared/components/ProjectCard/index.ts`
- `nextjs-app/shared/patterns/WorkPreviewSection/WorkPreviewSection.tsx`
- `nextjs-app/shared/patterns/WorkPreviewSection/index.ts`
- `nextjs-app/shared/patterns/CTASection/CTASection.tsx`
- `nextjs-app/shared/patterns/CTASection/index.ts`

### Files Modified
- `nextjs-app/shared/components/pages/Home/HomePage.tsx`
- `nextjs-app/shared/patterns/index.ts`
- `nextjs-app/shared/locales/en/translation.json`
- `nextjs-app/shared/locales/fi/translation.json`
- `nextjs-app/shared/locales/sv/translation.json`

---

## Post-Completion

After Phase 07 is complete:
1. Update `.planning/STATE.md` to mark Phase 07 complete
2. Run `/gsd:verify-work` to test the full homepage
3. Proceed to Phase 08 (Portfolio & Projects) or Phase 09 (About & Contact)

---

*Created: 2026-01-14*
