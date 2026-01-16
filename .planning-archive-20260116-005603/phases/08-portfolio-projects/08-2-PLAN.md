# Phase 08-2: Project Detail Template

> **Phase**: 08 (Portfolio & Projects)
> **Plan**: 2 of 2
> **Scope**: Project detail page template, gallery, navigation, related projects
> **Estimated Tasks**: 12

---

## Objective

Create a reusable project detail template in case study format. Build project gallery component, update next/previous navigation with Tailwind styling, and add related projects section. Refactor existing project pages (Helsinki Design System, New Things Co, etc.) to use the new template while preserving their unique content.

---

## Execution Context

### Available Components (from Phases 01-08-1)
- **Layout**: `Container`, `Section`, `Stack`, `Spacer`, `PageLayout`
- **Typography**: `Title`, `Text`, `Heading`, `Display`
- **Animation**: `FadeIn`, `SlideIn`, `TextReveal`, `Parallax`
- **Patterns**: `Hero`, `ProcessBlock`, `ServicesBlock`, `TeamBlock`, `StoryBlock`, `GridBlock`
- **From 08-1**: `WorkHero`, `EnhancedProjectCard`, `WorkGrid`, project data structure

### Current Project Detail Analysis
Location: `nextjs-app/shared/components/pages/Work/*/`

**HelsinkiDesignSystemPage** (most complete):
- Uses: `Hero`, `ServicesBlock`, `ProcessBlock`, `TeamBlock`, `StoryBlock`, `GridBlock`
- Pattern: Hero → Services → Process → Team → Story sections → Conclusion
- CSS Modules for page-specific styles
- `WorkNav` for navigation (legacy), `NextWorkNav` for Next.js

**Other pages** (NewThingsCo, GarageJunction, Illustrations):
- Simpler structure
- Less standardized
- All use `WorkNav`/`NextWorkNav`

### Current NextWorkNav Analysis
Location: `app/work/NextWorkNav.tsx`
- Hardcoded array of 4 project paths
- Uses legacy `Button` and `Icon` components
- CSS Modules styling
- Back to work + Previous/Next buttons

---

## Context

### Design Direction
**Studio Aesthetic** (from PROJECT.md):
- Case study format with clear sections
- Image galleries with lightbox
- Scroll-triggered animations
- Bold section headers
- Team/process showcasing

### Roadmap Requirements (from Phase 08)
- Project detail template (case study format)
- Project gallery component
- Next/Previous project navigation
- Related projects section

---

## Tasks

### Task 1: Create ProjectDetailLayout component
**File**: `nextjs-app/shared/patterns/ProjectDetailLayout/ProjectDetailLayout.tsx`

Build a flexible container for project detail pages:
- Consistent padding and spacing
- Navigation slot (top)
- Hero slot
- Content sections slot
- Related projects slot
- Scroll progress indicator

```tsx
interface ProjectDetailLayoutProps {
  nav?: React.ReactNode;
  hero: React.ReactNode;
  children: React.ReactNode;
  relatedProjects?: React.ReactNode;
  showScrollProgress?: boolean;
  className?: string;
}
```

**Verification**: Layout renders with proper spacing and slots.

---

### Task 2: Create ProjectHero component
**File**: `nextjs-app/shared/patterns/ProjectHero/ProjectHero.tsx`

Build a hero specific to project detail pages:
- Large project title with TextReveal
- Project description/tagline
- Full-width or contained hero image
- Project metadata (category, date, tags)
- Scroll indicator

```tsx
interface ProjectHeroProps {
  title: string;
  description?: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  category?: string;
  tags?: string[];
  date?: string;
  variant?: "full-width" | "contained" | "split";
  className?: string;
}
```

**Verification**: Hero renders with animation and image.

---

### Task 3: Create ProjectGallery component
**File**: `nextjs-app/shared/components/ProjectGallery/ProjectGallery.tsx`

Build an image gallery for project pages:
- Grid of thumbnails
- Click to open lightbox
- Keyboard navigation in lightbox
- GSAP animations for grid items
- Optional captions
- Responsive columns

```tsx
interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

interface ProjectGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  aspectRatio?: "square" | "video" | "mixed";
  enableLightbox?: boolean;
  className?: string;
}
```

**Verification**: Gallery renders with working lightbox.

---

### Task 4: Create ProjectMetaSection component
**File**: `nextjs-app/shared/patterns/ProjectMetaSection/ProjectMetaSection.tsx`

Build a section for project metadata (replaces ServicesBlock usage):
- Services/skills list
- Project duration
- Tools used
- Team overview (optional)
- Client logo (optional)

```tsx
interface ProjectMetaSectionProps {
  services: string[];
  duration?: string;
  tools?: { icon: React.ReactNode; name: string }[];
  team?: { name: string; role: string; image?: string }[];
  client?: { name: string; logo?: string };
  overview?: React.ReactNode;
  className?: string;
}
```

**Verification**: Metadata displays in clean layout.

---

### Task 5: Restyle ProjectNav component
**File**: `nextjs-app/shared/components/ProjectNav/ProjectNav.tsx`

Create Tailwind-first project navigation:
- Back to work button
- Previous/Next project links
- Uses project data from `data/projects.ts`
- Dynamically determines prev/next
- Responsive layout
- Keyboard navigation support

```tsx
interface ProjectNavProps {
  currentSlug: string;
  className?: string;
}
```

**Verification**: Navigation shows correct prev/next projects.

---

### Task 6: Create RelatedProjects component
**File**: `nextjs-app/shared/patterns/RelatedProjects/RelatedProjects.tsx`

Build a related projects section:
- 2-3 related project cards
- Based on shared category/tags
- Excludes current project
- FadeIn animation
- Section header

```tsx
interface RelatedProjectsProps {
  currentSlug: string;
  maxItems?: number;
  title?: string;
  className?: string;
}
```

**Verification**: Related projects display based on shared tags.

---

### Task 7: Create ContentSection component
**File**: `nextjs-app/shared/patterns/ContentSection/ContentSection.tsx`

Standardize content sections (simplify StoryBlock pattern):
- Subtitle (optional)
- Title
- Rich text content
- Images (single, grid, or none)
- Background variants
- Configurable spacing

```tsx
interface ContentSectionProps {
  subtitle?: string;
  title: string;
  content: React.ReactNode;
  images?: ContentImage | ContentImage[];
  imageLayout?: "single" | "grid" | "side-by-side" | "none";
  background?: "default" | "muted" | "accent";
  className?: string;
}
```

**Verification**: Section renders with proper styling.

---

### Task 8: Create ProjectDetailTemplate component
**File**: `nextjs-app/shared/patterns/ProjectDetailTemplate/ProjectDetailTemplate.tsx`

Build the complete project detail template:
- Composes all project detail patterns
- Provides structured slots for content
- Handles common patterns automatically

```tsx
interface ProjectDetailTemplateProps {
  project: Project;
  hero: {
    image: ImageProps;
    variant?: "full-width" | "contained";
  };
  meta: {
    services: string[];
    duration?: string;
    tools?: ToolItem[];
    overview?: React.ReactNode;
  };
  sections: ContentSectionProps[];
  gallery?: GalleryImage[];
  relatedEnabled?: boolean;
  nav?: React.ReactNode;
}
```

**Verification**: Template renders complete project page.

---

### Task 9: Refactor HelsinkiDesignSystemPage
**File**: `nextjs-app/shared/components/pages/Work/HelsinkiDesignSystem/HelsinkiDesignSystemPage.tsx`

Migrate to new template while preserving content:
- Replace individual pattern imports with template
- Convert existing sections to ContentSection format
- Add RelatedProjects
- Remove legacy WorkNav, use ProjectNav
- Preserve all existing content/text

**Verification**: Page renders identically with new template.

---

### Task 10: Add i18n translation keys
**Files**: Translation files for EN/FI/SV

Add keys:
```json
{
  "projectBackToWork": "Back to work",
  "projectPrevious": "Previous project",
  "projectNext": "Next project",
  "projectRelatedTitle": "Related Projects",
  "projectServicesTitle": "Services",
  "projectDurationLabel": "Duration",
  "projectToolsLabel": "Tools",
  "projectOverviewLabel": "Overview",
  "projectScrollToTop": "Scroll to top"
}
```

**Verification**: All translations complete for EN/FI/SV.

---

### Task 11: Create barrel exports and update patterns/index.ts
**Files**: Index files for new components

Create/update barrel exports:
- `nextjs-app/shared/patterns/ProjectDetailLayout/index.ts`
- `nextjs-app/shared/patterns/ProjectHero/index.ts`
- `nextjs-app/shared/patterns/ProjectMetaSection/index.ts`
- `nextjs-app/shared/patterns/RelatedProjects/index.ts`
- `nextjs-app/shared/patterns/ContentSection/index.ts`
- `nextjs-app/shared/patterns/ProjectDetailTemplate/index.ts`
- `nextjs-app/shared/components/ProjectGallery/index.ts`
- `nextjs-app/shared/components/ProjectNav/index.ts`
- Update `nextjs-app/shared/patterns/index.ts`

**Verification**: All patterns/components importable from barrel exports.

---

### Task 12: Verify and test
**Actions**:
1. Run `npm run typecheck` - TypeScript compilation
2. Run `npm run lint` - Linting checks
3. Run `npm run dev` - Visual verification
4. Test HelsinkiDesignSystemPage renders correctly
5. Test ProjectNav shows correct prev/next
6. Test RelatedProjects excludes current
7. Test ProjectGallery lightbox
8. Test all scroll animations
9. Test mobile responsive layouts
10. Test all three languages
11. Test keyboard navigation (lightbox, nav)
12. Test reduced motion preference

**Verification**: All checks pass, project detail complete.

---

## Verification

### Automated Checks
```bash
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint + Stylelint
npm run test         # Unit tests (if added)
```

### Manual Checks
- [ ] ProjectDetailLayout provides proper structure
- [ ] ProjectHero displays with animation
- [ ] ProjectGallery lightbox works
- [ ] ProjectMetaSection shows services/tools
- [ ] ProjectNav shows correct prev/next
- [ ] RelatedProjects displays 2-3 related items
- [ ] ContentSection variants work
- [ ] HelsinkiDesignSystemPage content preserved
- [ ] All animations smooth (60fps)
- [ ] Mobile layouts are responsive
- [ ] All three languages render correctly
- [ ] Keyboard navigation works

---

## Success Criteria

- [ ] ProjectDetailLayout pattern created
- [ ] ProjectHero pattern created
- [ ] ProjectGallery with lightbox working
- [ ] ProjectMetaSection pattern created
- [ ] ProjectNav with dynamic prev/next
- [ ] RelatedProjects pattern created
- [ ] ContentSection pattern created
- [ ] ProjectDetailTemplate composing all patterns
- [ ] HelsinkiDesignSystemPage refactored
- [ ] i18n translations complete (EN/FI/SV)
- [ ] Barrel exports created/updated
- [ ] All verification checks pass

---

## Output

### Files Created
- `nextjs-app/shared/patterns/ProjectDetailLayout/ProjectDetailLayout.tsx`
- `nextjs-app/shared/patterns/ProjectDetailLayout/index.ts`
- `nextjs-app/shared/patterns/ProjectHero/ProjectHero.tsx`
- `nextjs-app/shared/patterns/ProjectHero/index.ts`
- `nextjs-app/shared/patterns/ProjectMetaSection/ProjectMetaSection.tsx`
- `nextjs-app/shared/patterns/ProjectMetaSection/index.ts`
- `nextjs-app/shared/patterns/RelatedProjects/RelatedProjects.tsx`
- `nextjs-app/shared/patterns/RelatedProjects/index.ts`
- `nextjs-app/shared/patterns/ContentSection/ContentSection.tsx`
- `nextjs-app/shared/patterns/ContentSection/index.ts`
- `nextjs-app/shared/patterns/ProjectDetailTemplate/ProjectDetailTemplate.tsx`
- `nextjs-app/shared/patterns/ProjectDetailTemplate/index.ts`
- `nextjs-app/shared/components/ProjectGallery/ProjectGallery.tsx`
- `nextjs-app/shared/components/ProjectGallery/index.ts`
- `nextjs-app/shared/components/ProjectNav/ProjectNav.tsx`
- `nextjs-app/shared/components/ProjectNav/index.ts`

### Files Modified
- `nextjs-app/shared/components/pages/Work/HelsinkiDesignSystem/HelsinkiDesignSystemPage.tsx`
- `nextjs-app/shared/patterns/index.ts`
- `nextjs-app/shared/locales/en/translation.json`
- `nextjs-app/shared/locales/fi/translation.json`
- `nextjs-app/shared/locales/sv/translation.json`

---

## Post-Completion

After Phase 08-2 is complete:
1. Update `.planning/STATE.md` to mark Phase 08 complete
2. Optionally refactor other project pages (NewThingsCo, GarageJunction, Illustrations)
3. Consider creating Sanity schema for future CMS migration
4. Run `/gsd:verify-work` to test the full portfolio experience
5. Proceed to Phase 09 (About & Contact Pages)

---

## Future Considerations

### Sanity CMS Migration (Out of Scope for This Phase)
When ready to migrate project data to Sanity:
1. Create `project` schema with fields matching `Project` interface
2. Create GROQ queries for project fetching
3. Update data layer to fetch from Sanity instead of static file
4. Preserve existing static data as fallback

### Additional Project Pages
After template is proven with Helsinki Design System:
- NewThingsCoPage → Use ProjectDetailTemplate
- GarageJunctionPage → Use ProjectDetailTemplate
- IllustrationsPage → Use ProjectDetailTemplate

---

*Created: 2026-01-14*
