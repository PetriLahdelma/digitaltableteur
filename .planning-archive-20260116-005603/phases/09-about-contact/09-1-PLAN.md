# Phase 09-1: About Page Redesign

> **Phase**: 09 (About & Contact Pages)
> **Plan**: 1 of 2
> **Tasks**: 8

---

## Objective

Redesign the About page using the new design system patterns. Transform the current hero + content sections into a cohesive page with:
- Hero section with animated title
- Studio story/values sections using ContentSection
- Skills/expertise section
- Manifesto section with improved animation
- Consistent styling with Tailwind + design tokens

---

## Context

### Current State
- AboutPage exists at `nextjs-app/shared/components/pages/AboutPage/`
- Uses: PageLayout, Title, Text, Badge components
- Sections: Who (hero), What (purple hero), Design, Development, Collaboration, Manifesto
- Manifesto has interactive cycling highlights (11 phrases)
- Heavy CSS Modules styling in `AboutPage.module.css`

### Available Patterns (from prior phases)
- `HeroSection` / `ProjectHero` - animated hero patterns
- `ContentSection` - subtitle, title, content, images
- `Section` / `Container` - layout primitives
- `TextReveal` / `FadeIn` - animation components
- `CTASection` - call-to-action pattern

### Dependencies
- Phase 05: TextInput, TextArea form components
- Phase 06: Accordion, Tabs for potential skills display
- Phase 07: HeroSection, CTASection patterns

---

## Tasks

### Task 1: Create AboutHero pattern
**Files**: `patterns/AboutHero/AboutHero.tsx`, `patterns/AboutHero/index.ts`

Create a specialized hero for the About page:
- Full viewport height
- Large animated title using TextReveal ("About Petri Lahdelma" or similar)
- Optional subtitle with FadeIn
- Scroll indicator at bottom
- Support for background variants (gradient, image)

```tsx
interface AboutHeroProps {
  title: string;
  subtitle?: string;
  background?: "gradient" | "image" | "minimal";
  backgroundImage?: string;
  showScrollIndicator?: boolean;
}
```

**Verification**: Component renders with animation, scroll indicator works

---

### Task 2: Create ValueCard component
**Files**: `components/ValueCard/ValueCard.tsx`, `components/ValueCard/index.ts`

Create a card component for displaying studio values/expertise:
- Icon slot
- Title
- Description
- Hover effect (subtle scale or border highlight)
- Support for 3 variants: `default`, `bordered`, `elevated`

```tsx
interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: "default" | "bordered" | "elevated";
}
```

**Verification**: Card renders with all variants, hover effects work

---

### Task 3: Create ValuesSection pattern
**Files**: `patterns/ValuesSection/ValuesSection.tsx`, `patterns/ValuesSection/index.ts`

Grid section for displaying multiple ValueCards:
- Section title
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Staggered FadeIn animations
- Background variant support

```tsx
interface ValuesSectionProps {
  title: string;
  values: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
  background?: "default" | "muted" | "accent";
}
```

**Verification**: Grid layout responsive, animations stagger correctly

---

### Task 4: Create ManifestoSection pattern
**Files**: `patterns/ManifestoSection/ManifestoSection.tsx`, `patterns/ManifestoSection/index.ts`

Reimagine the manifesto section with Tailwind:
- Cycling highlight effect on phrases
- Gradient background (purple/cyan)
- Glassmorphism backdrop blur
- Accessible: respects prefers-reduced-motion
- Configurable timing interval

```tsx
interface ManifestoSectionProps {
  title: string;
  intro?: string;
  phrases: string[];
  separator?: string;
  intervalMs?: number;
}
```

**Verification**: Phrases cycle with highlight, reduced motion stops cycling

---

### Task 5: Create SkillsGrid component
**Files**: `components/SkillsGrid/SkillsGrid.tsx`, `components/SkillsGrid/index.ts`

A visual grid for displaying skills/tools:
- Icon + label for each skill
- Hover tooltip with description
- Responsive layout
- Optional grouping by category

```tsx
interface Skill {
  icon: ReactNode;
  name: string;
  description?: string;
  category?: string;
}

interface SkillsGridProps {
  skills: Skill[];
  showCategories?: boolean;
  columns?: 4 | 6 | 8;
}
```

**Verification**: Grid renders, tooltips show on hover, responsive layout

---

### Task 6: Compose AboutPageContent component
**Files**: `patterns/AboutPageContent/AboutPageContent.tsx`, `patterns/AboutPageContent/index.ts`

Compose the full About page using new patterns:
- AboutHero
- ContentSection for "What I Do" (Design, Development, Collaboration)
- ValuesSection or SkillsGrid for expertise
- ManifestoSection
- Optional CTASection at end

```tsx
interface AboutPageContentProps {
  showCTA?: boolean;
}
```

**Verification**: Full page renders with all sections, scroll animations work

---

### Task 7: Add i18n translation keys
**Files**: `locales/en/translation.json`, `locales/fi/translation.json`, `locales/sv/translation.json`

Add any new translation keys needed:
- `aboutHeroSubtitle`
- `aboutValuesTitle`
- `aboutSkillsTitle`
- Value titles and descriptions
- Any new labels

**Verification**: All strings display correctly in EN/FI/SV

---

### Task 8: Update AboutPage to use new patterns
**Files**: `components/pages/AboutPage/AboutPage.tsx`

Refactor existing AboutPage to use AboutPageContent:
- Replace old markup with composed pattern
- Remove unused CSS classes
- Preserve metadata generation in app/about/page.tsx
- Ensure i18n keys are backwards compatible

**Verification**: About page renders correctly, no visual regressions for existing content

---

## Success Criteria

- [ ] AboutHero renders with animated title and scroll indicator
- [ ] ValueCard component has 3 working variants
- [ ] ValuesSection displays responsive grid with staggered animations
- [ ] ManifestoSection cycling works, respects reduced motion
- [ ] SkillsGrid shows skills with tooltips
- [ ] AboutPageContent composes all sections
- [ ] i18n keys added for EN/FI/SV
- [ ] AboutPage refactored to use new patterns
- [ ] No TypeScript errors
- [ ] Existing i18n keys preserved (backwards compatible)

---

## Output

```
patterns/
  AboutHero/
    AboutHero.tsx
    index.ts
  ValuesSection/
    ValuesSection.tsx
    index.ts
  ManifestoSection/
    ManifestoSection.tsx
    index.ts
  AboutPageContent/
    AboutPageContent.tsx
    index.ts

components/
  ValueCard/
    ValueCard.tsx
    index.ts
  SkillsGrid/
    SkillsGrid.tsx
    index.ts

Updated:
  components/pages/AboutPage/AboutPage.tsx
  locales/{en,fi,sv}/translation.json
  patterns/index.ts (barrel exports)
```

---

*Created: 2026-01-14*
