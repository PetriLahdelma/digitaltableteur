# Phase 10-1: Blog Index Redesign

> **Phase**: 10 (Blog Redesign)
> **Plan**: 1 of 2
> **Tasks**: 10

---

## Objective

Redesign the blog index page using the new design system patterns. Transform the current simple article list into a visually compelling, filterable blog listing with:
- Hero section with animated title
- Category/tag filtering
- Enhanced article cards with featured images
- Pagination support
- Consistent styling with Tailwind + design tokens

---

## Context

### Current State
- BlogPage exists at `nextjs-app/shared/components/pages/Blog/BlogPage.tsx`
- Uses: PageLayout, HelsinkiClock, Title, ArticleCard
- Simple grid layout with `auto-fit` columns
- No filtering or pagination
- ArticleCard shows title, lead, readTime
- Blog posts loaded from `data/blogPosts.ts` (MDX-based)

### Available Patterns (from prior phases)
- `HeroSection` / `WorkHero` - animated hero patterns
- `TextReveal` / `FadeIn` - animation components
- `CategoryFilter` - from Phase 08 (pills/underline/minimal variants)
- `Section` / `Container` - layout primitives
- `EnhancedProjectCard` - card with image support

### Data Layer
- Posts have: slug, title, excerpt, readTime, publishedAt, authorName, authorSlug, mainImageUrl, tags
- Currently no category field - will use tags for filtering
- Authors stored in `data/authors.ts`

### Dependencies
- Phase 05: Core UI components
- Phase 06: Interactive components
- Phase 07: Hero patterns
- Phase 08: CategoryFilter component

---

## Tasks

### Task 1: Create BlogHero pattern
**Files**: `patterns/BlogHero/BlogHero.tsx`, `patterns/BlogHero/index.ts`

Create a hero section for the blog index:
- Full viewport height (optional, can be short)
- Animated title using TextReveal ("Blog" or "Articles")
- Optional subtitle with FadeIn
- Category filter integrated into hero or below
- Scroll indicator at bottom

```tsx
interface BlogHeroProps {
  title: string;
  subtitle?: string;
  showScrollIndicator?: boolean;
  variant?: "full" | "compact";
  className?: string;
}
```

**Verification**: Component renders with animation, matches design system

---

### Task 2: Create EnhancedArticleCard component
**Files**: `components/EnhancedArticleCard/EnhancedArticleCard.tsx`, `components/EnhancedArticleCard/index.ts`

Enhance ArticleCard with image support and new styling:
- Featured image slot (optional)
- Title with hover effect
- Excerpt/lead text
- Author avatar + name
- Published date (formatted)
- Read time
- Tags display
- Hover animation (subtle scale or border)
- Support for featured (large) and default (standard) variants

```tsx
interface EnhancedArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  image?: {
    src: string;
    alt: string;
  };
  author?: {
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
  variant?: "default" | "featured" | "compact";
  className?: string;
}
```

**Verification**: Card renders with all variants, hover effects work

---

### Task 3: Create BlogGrid component
**Files**: `components/BlogGrid/BlogGrid.tsx`, `components/BlogGrid/index.ts`

Create a responsive grid for article cards:
- Masonry-style or standard grid options
- Featured article at top (optional)
- Staggered FadeIn animations
- Responsive columns (1 mobile, 2 tablet, 3 desktop)
- Empty state for no results

```tsx
interface BlogGridProps {
  articles: EnhancedArticleCardProps[];
  featuredSlug?: string;
  layout?: "standard" | "featured-first" | "masonry";
  columns?: { sm?: number; md?: number; lg?: number };
  className?: string;
}
```

**Verification**: Grid layout responsive, animations stagger correctly

---

### Task 4: Create BlogCategoryFilter component
**Files**: `components/BlogCategoryFilter/BlogCategoryFilter.tsx`, `components/BlogCategoryFilter/index.ts`

Adapt CategoryFilter for blog tags:
- "All" option
- Extract unique tags from posts
- URL query param support (?tag=design)
- Count display (optional)
- Three variants: pills, underline, minimal

```tsx
interface BlogCategoryFilterProps {
  tags: string[];
  selectedTag?: string;
  onTagChange: (tag: string | null) => void;
  showCounts?: boolean;
  tagCounts?: Record<string, number>;
  variant?: "pills" | "underline" | "minimal";
  className?: string;
}
```

**Verification**: Filter changes update URL and grid

---

### Task 5: Create useBlogFilter hook
**Files**: `hooks/useBlogFilter.ts`

Create a hook for blog filtering logic:
- Get/set tag from URL query params
- Filter posts by tag
- Sort by date (newest first)
- Return filtered posts and tag state

```tsx
interface UseBlogFilterOptions {
  posts: BlogPostEntry[];
}

interface UseBlogFilterReturn {
  filteredPosts: BlogPostEntry[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  tagCounts: Record<string, number>;
}
```

**Verification**: Hook filters correctly, URL syncs with state

---

### Task 6: Create Pagination component
**Files**: `components/Pagination/Pagination.tsx`, `components/Pagination/index.ts`

Create a pagination component for blog:
- Page numbers
- Previous/Next buttons
- Current page highlight
- "..." for large page counts
- Accessible keyboard navigation

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}
```

**Verification**: Pagination navigates correctly, keyboard accessible

---

### Task 7: Compose BlogIndexContent component
**Files**: `patterns/BlogIndexContent/BlogIndexContent.tsx`, `patterns/BlogIndexContent/index.ts`

Compose the full blog index page:
- BlogHero
- BlogCategoryFilter
- BlogGrid with EnhancedArticleCards
- Pagination (if needed)
- Loading states

```tsx
interface BlogIndexContentProps {
  postsPerPage?: number;
  showHero?: boolean;
  heroVariant?: "full" | "compact";
}
```

**Verification**: Full page renders with all sections, filtering works

---

### Task 8: Add i18n translation keys
**Files**: `locales/en/translation.json`, `locales/fi/translation.json`, `locales/sv/translation.json`

Add translation keys:
```json
{
  "blogHeroTitle": "Blog",
  "blogHeroSubtitle": "Thoughts on design, development, and everything in between",
  "blogAllPosts": "All Posts",
  "blogNoPostsFound": "No articles found",
  "blogFilterByTag": "Filter by topic",
  "blogPublished": "Published",
  "blogPrevPage": "Previous",
  "blogNextPage": "Next",
  "blogPage": "Page"
}
```

**Verification**: All strings display correctly in EN/FI/SV

---

### Task 9: Update BlogPage to use new patterns
**Files**: `components/pages/Blog/BlogPage.tsx`

Refactor existing BlogPage:
- Replace old markup with BlogIndexContent
- Preserve metadata in app/blog/page.tsx
- Remove unused CSS from Blog.module.css
- Ensure backwards compatibility

**Verification**: Blog index page renders correctly, no regressions

---

### Task 10: Create barrel exports and verify
**Actions**:
1. Create index files for new components
2. Update patterns/index.ts with BlogHero, BlogIndexContent
3. Update components barrel export
4. Run `npm run typecheck`
5. Run `npm run lint`
6. Test filtering, pagination, animations
7. Test all three languages
8. Test mobile responsive layouts

**Verification**: All exports work, no TypeScript/lint errors

---

## Success Criteria

- [ ] BlogHero renders with animated title
- [ ] EnhancedArticleCard has working variants with images
- [ ] BlogGrid displays responsive layout with animations
- [ ] BlogCategoryFilter filters by tag with URL sync
- [ ] useBlogFilter hook manages filter state
- [ ] Pagination component works with keyboard
- [ ] BlogIndexContent composes all sections
- [ ] i18n keys added for EN/FI/SV
- [ ] BlogPage refactored to use new patterns
- [ ] No TypeScript errors
- [ ] Mobile responsive

---

## Output

```
patterns/
  BlogHero/
    BlogHero.tsx
    index.ts
  BlogIndexContent/
    BlogIndexContent.tsx
    index.ts

components/
  EnhancedArticleCard/
    EnhancedArticleCard.tsx
    index.ts
  BlogGrid/
    BlogGrid.tsx
    index.ts
  BlogCategoryFilter/
    BlogCategoryFilter.tsx
    index.ts
  Pagination/
    Pagination.tsx
    index.ts

hooks/
  useBlogFilter.ts

Updated:
  components/pages/Blog/BlogPage.tsx
  components/pages/Blog/Blog.module.css
  locales/{en,fi,sv}/translation.json
  patterns/index.ts
```

---

*Created: 2026-01-14*
