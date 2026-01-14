# Phase 10-2: Blog Article Template

> **Phase**: 10 (Blog Redesign)
> **Plan**: 2 of 2
> **Tasks**: 12

---

## Objective

Redesign the blog article page using the new design system patterns. Create a rich article template with:
- Article hero with featured image
- Enhanced typography for content
- Author component with bio
- Table of contents (for long articles)
- Social share functionality
- Related posts section
- Consistent styling with Tailwind + design tokens

---

## Context

### Current State
- BlogArticlePage at `nextjs-app/shared/components/pages/Blog/BlogArticlePage.tsx`
- Uses: MDXProvider, Author, AuthorBio, CodeSnippet, SocialShare, Title, Text
- MDX components: Embed, img, figcaption, pre, code
- Similar reads section with 3 Card components
- Heavy CSS Modules in `BlogArticle.module.css`
- Rich text rendering with custom components

### Available Patterns (from prior phases)
- `ProjectHero` - hero with image (can adapt for articles)
- `ContentSection` - styled content sections
- `RelatedProjects` - similar pattern for related posts
- `TextReveal` / `FadeIn` - animation components
- `Prose` - from Phase 05 for rich text styling

### MDX Support (preserve functionality)
- Embed component (YouTube, Vimeo iframes)
- AuthorBio inline component
- Custom code blocks with CodeSnippet
- Image with figcaption support
- Language aliases for syntax highlighting

### Data Layer
- Posts have: title, excerpt, publishedAt, readTime, authorName, authorSlug, mainImageUrl, mainImageAlt, mainImageCaption, tags, legacyUrl
- Authors: name, slug, imageUrl, bio
- MDX Component stored per post

---

## Tasks

### Task 1: Create ArticleHero pattern
**Files**: `patterns/ArticleHero/ArticleHero.tsx`, `patterns/ArticleHero/index.ts`

Create a hero specific to article pages:
- Full-width featured image (with parallax option)
- Article title with TextReveal
- Author component with avatar
- Published date
- Read time
- Tags display
- Responsive layout

```tsx
interface ArticleHeroProps {
  title: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  author?: {
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
  variant?: "full-width" | "contained" | "minimal";
  className?: string;
}
```

**Verification**: Hero renders with image and metadata

---

### Task 2: Create ArticleContent component
**Files**: `components/ArticleContent/ArticleContent.tsx`, `components/ArticleContent/index.ts`

Create a wrapper for article body content:
- Max-width prose container
- Typography scale for articles
- Proper spacing between elements
- Responsive padding
- Uses Prose component styling

```tsx
interface ArticleContentProps {
  children: React.ReactNode;
  className?: string;
}
```

**Verification**: Content renders with proper typography

---

### Task 3: Create TableOfContents component
**Files**: `components/TableOfContents/TableOfContents.tsx`, `components/TableOfContents/index.ts`

Create a table of contents for long articles:
- Extract headings from content (h2, h3)
- Sticky positioning option
- Active section highlighting
- Smooth scroll to section
- Collapsible on mobile

```tsx
interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
  sticky?: boolean;
  className?: string;
}
```

**Verification**: TOC navigates, active state highlights

---

### Task 4: Create useTableOfContents hook
**Files**: `hooks/useTableOfContents.ts`

Create a hook for TOC functionality:
- Extract headings from rendered content
- Track scroll position for active heading
- Handle smooth scroll navigation

```tsx
interface UseTableOfContentsOptions {
  containerRef: RefObject<HTMLElement>;
  headingSelector?: string;
}

interface UseTableOfContentsReturn {
  items: TOCItem[];
  activeId: string | null;
  scrollTo: (id: string) => void;
}
```

**Verification**: Hook extracts headings and tracks scroll

---

### Task 5: Create EnhancedAuthorCard component
**Files**: `components/EnhancedAuthorCard/EnhancedAuthorCard.tsx`, `components/EnhancedAuthorCard/index.ts`

Create an enhanced author display:
- Larger avatar
- Author name with link to author page
- Short bio preview
- Social links (optional)
- "More from author" link

```tsx
interface EnhancedAuthorCardProps {
  name: string;
  slug?: string;
  imageUrl?: string;
  bio?: string;
  socials?: { platform: string; url: string }[];
  showMoreLink?: boolean;
  variant?: "inline" | "card" | "minimal";
  className?: string;
}
```

**Verification**: Author card renders with all variants

---

### Task 6: Create RelatedPosts component
**Files**: `patterns/RelatedPosts/RelatedPosts.tsx`, `patterns/RelatedPosts/index.ts`

Create a related posts section:
- 2-3 related posts based on shared tags
- Uses EnhancedArticleCard (compact variant)
- Excludes current article
- FadeIn animation
- Section header

```tsx
interface RelatedPostsProps {
  currentSlug: string;
  maxPosts?: number;
  title?: string;
  className?: string;
}
```

**Verification**: Related posts display based on shared tags

---

### Task 7: Create ArticleShareSection component
**Files**: `components/ArticleShareSection/ArticleShareSection.tsx`, `components/ArticleShareSection/index.ts`

Enhance social share with new styling:
- Section title
- Social buttons (Twitter, LinkedIn, Facebook, Copy link)
- Hover effects
- Optional vertical/horizontal layout

```tsx
interface ArticleShareSectionProps {
  url: string;
  title: string;
  layout?: "horizontal" | "vertical";
  showTitle?: boolean;
  className?: string;
}
```

**Verification**: Share buttons work, copy link copies to clipboard

---

### Task 8: Create ReadingProgress component
**Files**: `components/ReadingProgress/ReadingProgress.tsx`, `components/ReadingProgress/index.ts`

Create a reading progress indicator:
- Progress bar at top of page (fixed)
- Shows percentage read
- Smooth animation
- Optional: time remaining estimate

```tsx
interface ReadingProgressProps {
  targetRef: RefObject<HTMLElement>;
  showPercentage?: boolean;
  className?: string;
}
```

**Verification**: Progress bar updates on scroll

---

### Task 9: Create ArticleLayout pattern
**Files**: `patterns/ArticleLayout/ArticleLayout.tsx`, `patterns/ArticleLayout/index.ts`

Create the article page layout:
- Navigation slot (BlogNav)
- ArticleHero
- Main content area (with optional sidebar for TOC)
- RelatedPosts section
- ReadingProgress indicator

```tsx
interface ArticleLayoutProps {
  nav?: React.ReactNode;
  hero: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  relatedPosts?: React.ReactNode;
  showReadingProgress?: boolean;
  className?: string;
}
```

**Verification**: Layout renders with proper structure

---

### Task 10: Compose ArticlePageTemplate component
**Files**: `patterns/ArticlePageTemplate/ArticlePageTemplate.tsx`, `patterns/ArticlePageTemplate/index.ts`

Compose the full article page:
- ArticleLayout
- ArticleHero with post data
- ArticleContent with MDX
- EnhancedAuthorCard
- ArticleShareSection
- RelatedPosts
- Preserves existing MDX component mappings

```tsx
interface ArticlePageTemplateProps {
  post: BlogPostEntry;
  nav?: React.ReactNode;
  shareBaseUrl?: string;
  showTOC?: boolean;
  showRelated?: boolean;
}
```

**Verification**: Full article renders with all sections

---

### Task 11: Add i18n translation keys and update BlogArticlePage
**Files**: Translation files and BlogArticlePage.tsx

Add translation keys:
```json
{
  "articleTOCTitle": "Table of Contents",
  "articleShareTitle": "Share this article",
  "articleAboutAuthor": "About the author",
  "articleRelatedTitle": "Related Articles",
  "articleCopyLink": "Copy link",
  "articleLinkCopied": "Link copied!",
  "articleReadingProgress": "{{percent}}% read",
  "articleMinutesLeft": "{{minutes}} min left"
}
```

Refactor BlogArticlePage:
- Use ArticlePageTemplate
- Preserve MDX component mappings
- Preserve metadata generation logic
- Remove unused CSS

**Verification**: All translations work, article page renders correctly

---

### Task 12: Create barrel exports and verify
**Actions**:
1. Create index files for all new components
2. Update patterns/index.ts with article patterns
3. Update components barrel export
4. Run `npm run typecheck`
5. Run `npm run lint`
6. Test article rendering with MDX content
7. Test TOC navigation
8. Test social sharing
9. Test related posts filtering
10. Test reading progress
11. Test all three languages
12. Test mobile responsive layouts
13. Test code blocks render correctly

**Verification**: All exports work, no TypeScript/lint errors

---

## Success Criteria

- [ ] ArticleHero renders with image and metadata
- [ ] ArticleContent provides proper typography
- [ ] TableOfContents extracts headings and navigates
- [ ] useTableOfContents hook tracks active section
- [ ] EnhancedAuthorCard has working variants
- [ ] RelatedPosts displays based on shared tags
- [ ] ArticleShareSection works with copy link
- [ ] ReadingProgress updates on scroll
- [ ] ArticleLayout provides proper structure
- [ ] ArticlePageTemplate composes all sections
- [ ] MDX components preserved (Embed, CodeSnippet, etc.)
- [ ] i18n keys added for EN/FI/SV
- [ ] BlogArticlePage refactored to use template
- [ ] No TypeScript errors
- [ ] Mobile responsive

---

## Output

```
patterns/
  ArticleHero/
    ArticleHero.tsx
    index.ts
  ArticleLayout/
    ArticleLayout.tsx
    index.ts
  ArticlePageTemplate/
    ArticlePageTemplate.tsx
    index.ts
  RelatedPosts/
    RelatedPosts.tsx
    index.ts

components/
  ArticleContent/
    ArticleContent.tsx
    index.ts
  TableOfContents/
    TableOfContents.tsx
    index.ts
  EnhancedAuthorCard/
    EnhancedAuthorCard.tsx
    index.ts
  ArticleShareSection/
    ArticleShareSection.tsx
    index.ts
  ReadingProgress/
    ReadingProgress.tsx
    index.ts

hooks/
  useTableOfContents.ts

Updated:
  components/pages/Blog/BlogArticlePage.tsx
  components/pages/Blog/BlogArticle.module.css
  locales/{en,fi,sv}/translation.json
  patterns/index.ts
```

---

## Post-Completion

After Phase 10-2 is complete:
1. Update `.planning/STATE.md` to mark Phase 10 complete
2. Consider updating AuthorPage with new patterns
3. Run `/gsd:verify-work` to test the full blog experience
4. Proceed to Phase 11 (Theme & Accessibility Polish)

---

## Preservation Notes

### MDX Component Mappings (must preserve)
```tsx
const mdxComponents = {
  Embed,           // YouTube/Vimeo iframes
  AuthorBio,       // Inline author bio
  img: MdxImage,   // Image wrapper
  figcaption,      // Caption styling
  pre: MdxPre,     // Code blocks with CodeSnippet
  code: MdxCode,   // Inline code with CodeSnippet
};
```

### Language Aliases (must preserve)
```tsx
const languageAliases = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  bash: "bash",
  py: "python",
  go: "go",
  rs: "rust",
  md: "markdown",
  html: "html",
  xml: "xml",
};
```

---

*Created: 2026-01-14*
