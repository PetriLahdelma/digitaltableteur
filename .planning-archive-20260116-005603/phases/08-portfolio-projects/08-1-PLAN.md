# Phase 08-1: Work Index Page Redesign

> **Phase**: 08 (Portfolio & Projects)
> **Plan**: 1 of 2
> **Scope**: Work index page with responsive grid, filters, and animations
> **Estimated Tasks**: 10

---

## Objective

Redesign the `/work` page to showcase portfolio projects with a modern, studio-aesthetic grid layout. Implement category filters, responsive grid with hover effects, and scroll-driven animations using the Tailwind + GSAP infrastructure from previous phases. Preserve i18n support and maintain backward compatibility with existing project detail pages.

---

## Execution Context

### Available Components (from Phases 01-07)
- **Layout**: `Container`, `Section`, `Stack`, `Spacer`, `PageLayout`
- **Typography**: `Title`, `Text`, `Heading`, `Display`
- **Animation**: `FadeIn`, `SlideIn`, `TextReveal`, `Parallax`
- **UI**: `Button`, `TextLink`, `Tag`, `Divider`
- **Patterns**: `HeroSection`, `WorkPreviewSection`, `ProjectCard`

### Current Work Index Analysis
Location: `nextjs-app/shared/components/pages/Work/WorkIndex/WorkIndexPage.tsx`
- Simple flexbox grid with 4 hardcoded projects
- CSS Modules for styling (`workIndex.module.css`)
- No filtering capability
- Basic hover effect (translateY)
- No section title or description
- Uses `PageLayout` pattern

### Project Data (Hardcoded)
Currently 4 projects:
1. Helsinki Design System (`/work/helsinki-design-system`)
2. New Things Co (`/work/new-things-co`)
3. Garage Junction (`/work/garage-junction`)
4. Illustrations (`/work/illustrations`)

---

## Context

### Design Direction
**Studio Aesthetic** (from PROJECT.md):
- Grid layouts with hover animations
- Scroll-triggered reveals
- Category filtering
- Mobile-responsive masonry or grid options
- Bold typography for section headers

### Roadmap Requirements (from Phase 08)
- Work index page (grid layout, filters)
- Sanity CMS integration (restyle, preserve schema)

**Note**: Sanity currently has no portfolio schema. Projects are hardcoded. This plan focuses on the frontend redesign with extensibility for future CMS integration.

---

## Tasks

### Task 1: Create WorkHero pattern
**File**: `nextjs-app/shared/patterns/WorkHero/WorkHero.tsx`

Build a hero section for the work page:
- Large title with TextReveal animation
- Optional description/subtitle
- Section anchor for scroll navigation
- Consistent with HeroSection but simpler

```tsx
interface WorkHeroProps {
  title?: string;
  description?: string;
  className?: string;
}
```

**Verification**: Hero renders with animation on page load.

---

### Task 2: Create category filter data structure
**File**: `nextjs-app/shared/data/projects.ts`

Extract project data into a central data file:
```tsx
export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail: string;
  thumbnailVideo?: string; // For video previews (e.g., Garage Junction)
  category: ProjectCategory;
  tags: string[];
  featured?: boolean;
  order?: number;
}

export type ProjectCategory =
  | "design-systems"
  | "ux-design"
  | "branding"
  | "illustration"
  | "all";

export const projects: Project[] = [
  {
    id: "helsinki-design-system",
    slug: "helsinki-design-system",
    title: "Helsinki Design System",
    description: "Enterprise design system for the City of Helsinki",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "design-systems",
    tags: ["Design System", "UX", "Accessibility"],
    featured: true,
    order: 1,
  },
  // ... other projects
];

export const categories: { value: ProjectCategory; labelKey: string }[] = [
  { value: "all", labelKey: "workFilterAll" },
  { value: "design-systems", labelKey: "workFilterDesignSystems" },
  { value: "ux-design", labelKey: "workFilterUXDesign" },
  { value: "branding", labelKey: "workFilterBranding" },
  { value: "illustration", labelKey: "workFilterIllustration" },
];
```

**Verification**: Data file exports typed project array.

---

### Task 3: Create CategoryFilter component
**File**: `nextjs-app/shared/components/CategoryFilter/CategoryFilter.tsx`

Build a filter bar for project categories:
- Horizontal pill/tag buttons
- Active state styling
- Click to filter
- "All" option included
- Mobile: horizontal scroll or dropdown

```tsx
interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}
```

**Verification**: Filter displays and active state updates on click.

---

### Task 4: Create EnhancedProjectCard component
**File**: `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.tsx`

Extend `ProjectCard` with additional features:
- Support for video thumbnails (autoplay on hover)
- Description reveal on hover
- GSAP scale/opacity animation
- Category badge display
- Loading skeleton state

```tsx
interface EnhancedProjectCardProps extends ProjectCardProps {
  description?: string;
  videoThumbnail?: string;
  showCategory?: boolean;
  animationDelay?: number;
}
```

**Verification**: Card renders with hover animation and video autoplay.

---

### Task 5: Create WorkGrid component
**File**: `nextjs-app/shared/components/WorkGrid/WorkGrid.tsx`

Build a responsive project grid:
- Configurable columns (2, 3, 4)
- Responsive breakpoints
- Staggered FadeIn animations
- Filter transition animations
- Empty state for no results

```tsx
interface WorkGridProps {
  projects: Project[];
  columns?: 2 | 3 | 4;
  layout?: "grid" | "masonry";
  animateItems?: boolean;
  className?: string;
}
```

**Verification**: Grid displays correctly at all breakpoints with animations.

---

### Task 6: Compose WorkIndexPage
**File**: `nextjs-app/shared/components/pages/Work/WorkIndex/WorkIndexPage.tsx`

Rewrite WorkIndexPage with new components:
1. `WorkHero` - Page title and description
2. `CategoryFilter` - Filter bar
3. `WorkGrid` - Project grid
4. Implement client-side filtering logic
5. Preserve nav prop for NextWorkNav integration

```tsx
export function WorkIndexPage({ nav }: { nav?: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const filteredProjects = filterProjects(projects, activeCategory);

  return (
    <main>
      {nav}
      <WorkHero title={t("workTitle")} description={t("workDescription")} />
      <Section>
        <Container>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <WorkGrid projects={filteredProjects} columns={3} />
        </Container>
      </Section>
    </main>
  );
}
```

**Verification**: Full page renders with working filter.

---

### Task 7: Add i18n translation keys
**Files**: Translation files for EN/FI/SV

Add keys:
```json
{
  "workTitle": "Our Work",
  "workDescription": "Explore our portfolio of design systems, UX design, and creative projects.",
  "workFilterAll": "All",
  "workFilterDesignSystems": "Design Systems",
  "workFilterUXDesign": "UX Design",
  "workFilterBranding": "Branding",
  "workFilterIllustration": "Illustration",
  "workNoResults": "No projects found for this category.",
  "workProjectCount": "{{count}} projects"
}
```

**Verification**: All translations complete for EN/FI/SV.

---

### Task 8: Create barrel exports
**Files**: Index files for new components

Create/update barrel exports:
- `nextjs-app/shared/components/CategoryFilter/index.ts`
- `nextjs-app/shared/components/EnhancedProjectCard/index.ts`
- `nextjs-app/shared/components/WorkGrid/index.ts`
- `nextjs-app/shared/patterns/WorkHero/index.ts`
- `nextjs-app/shared/data/index.ts`

**Verification**: All components importable from barrel exports.

---

### Task 9: Update app/work/page.tsx metadata
**File**: `app/work/page.tsx`

Update metadata with dynamic project count and better SEO:
```tsx
export const metadata: Metadata = {
  title: "Work & Portfolio | Digitaltableteur",
  description: "Explore our portfolio of design systems, UX design, and creative projects. See case studies from Helsinki Design System, New Things Co, and more.",
  // ... structured data for portfolio
};
```

**Verification**: Metadata renders correctly in production build.

---

### Task 10: Verify and test
**Actions**:
1. Run `npm run typecheck` - TypeScript compilation
2. Run `npm run lint` - Linting checks
3. Run `npm run dev` - Visual verification
4. Test filter functionality
5. Test all scroll animations
6. Test mobile responsive layouts
7. Test all three languages
8. Test reduced motion preference
9. Test video thumbnail autoplay

**Verification**: All checks pass, work index complete.

---

## Verification

### Automated Checks
```bash
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint + Stylelint
npm run test         # Unit tests (if added)
```

### Manual Checks
- [ ] WorkHero displays with animation
- [ ] CategoryFilter shows all categories
- [ ] Filter changes update grid immediately
- [ ] Project cards have hover animation
- [ ] Video thumbnails autoplay on hover
- [ ] Grid is responsive (3 cols → 2 → 1)
- [ ] Staggered animations work
- [ ] All three languages render correctly
- [ ] Reduced motion fallback works
- [ ] Empty state shows when no results

---

## Success Criteria

- [ ] WorkHero pattern created
- [ ] Project data structure defined
- [ ] CategoryFilter component working
- [ ] EnhancedProjectCard with video support
- [ ] WorkGrid with responsive columns
- [ ] WorkIndexPage composed with filtering
- [ ] i18n translations complete (EN/FI/SV)
- [ ] Barrel exports created
- [ ] Metadata updated
- [ ] All verification checks pass

---

## Output

### Files Created
- `nextjs-app/shared/patterns/WorkHero/WorkHero.tsx`
- `nextjs-app/shared/patterns/WorkHero/index.ts`
- `nextjs-app/shared/data/projects.ts`
- `nextjs-app/shared/data/index.ts`
- `nextjs-app/shared/components/CategoryFilter/CategoryFilter.tsx`
- `nextjs-app/shared/components/CategoryFilter/index.ts`
- `nextjs-app/shared/components/EnhancedProjectCard/EnhancedProjectCard.tsx`
- `nextjs-app/shared/components/EnhancedProjectCard/index.ts`
- `nextjs-app/shared/components/WorkGrid/WorkGrid.tsx`
- `nextjs-app/shared/components/WorkGrid/index.ts`

### Files Modified
- `nextjs-app/shared/components/pages/Work/WorkIndex/WorkIndexPage.tsx`
- `nextjs-app/shared/locales/en/translation.json`
- `nextjs-app/shared/locales/fi/translation.json`
- `nextjs-app/shared/locales/sv/translation.json`
- `app/work/page.tsx`

---

## Post-Completion

After Phase 08-1 is complete:
1. Proceed to Phase 08-2 (Project Detail Template)
2. Test integration with existing project detail pages
3. Consider future Sanity CMS migration for project data

---

*Created: 2026-01-14*
