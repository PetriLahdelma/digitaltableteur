# TeamBlock

A reusable design system component for displaying team members in a multi-column grid layout. Commonly used in case studies and work pages to showcase project teams, company staff, or collaborators.

## Features

- **Flexible Column Layouts**: Support for 2-6 column responsive grids
- **Team Member Cards**: Display name, title/role, and profile image
- **Customizable Images**: Support for round or square images with custom dimensions
- **Optional Links**: Make team members clickable with external profile links
- **Rich Content Support**: String or React node descriptions
- **Responsive Design**: Mobile-first with adaptive column counts per breakpoint
- **Accessibility**: Semantic HTML, ARIA labels, proper heading hierarchy, alt text
- **Design Token Integration**: Uses CSS variables for consistent spacing and colors
- **Progressive Enhancement**: Fallbacks for older browsers, respects motion preferences

## Installation

This component is part of the design system patterns. Import it directly:

```tsx
import TeamBlock from "@/shared/patterns/TeamBlock";
import type { TeamMember } from "@/shared/patterns/TeamBlock";
```

## Basic Usage

### Minimal Example

```tsx
const team = [
  {
    name: "Laura Karhu",
    title: "Project Lead",
    image: "/images/team/laura.png",
  },
  {
    name: "Petri Lahdelma",
    title: "Senior UX Designer",
    image: "/images/team/petri.png",
  },
];

<TeamBlock members={team} />;
```

### Complete Example

```tsx
<TeamBlock
  members={[
    {
      name: "Laura Karhu",
      title: "Project Lead (PM/PO)",
      image: "/images/team/laura.png",
      imageAlt: "Portrait of Laura Karhu",
      link: "https://linkedin.com/in/laurakarhu",
    },
    {
      name: "Petri Lahdelma",
      title: "Senior UX Designer",
      image: "/images/team/petri.png",
      imageWidth: 120,
      imageHeight: 120,
    },
    // More team members...
  ]}
  sectionTitle="Project Team"
  description="A multidisciplinary team working together to create exceptional experiences."
  columns={5}
  backgroundColor="light"
  roundImages={true}
  maxWidth="lg"
  spacing="comfortable"
/>
```

## Props

### Core Props

| Prop           | Type              | Default      | Description                                            |
| -------------- | ----------------- | ------------ | ------------------------------------------------------ |
| `members`      | `TeamMember[]`    | **Required** | Array of team members to display                       |
| `sectionTitle` | `string`          | `"Team"`     | Main title for the team section (empty string to hide) |
| `description`  | `React.ReactNode` | `undefined`  | Optional introduction text or rich content             |

### Layout Props

| Prop              | Type                                                    | Default         | Description                             |
| ----------------- | ------------------------------------------------------- | --------------- | --------------------------------------- |
| `columns`         | `2 \| 3 \| 4 \| 5 \| 6`                                 | `5`             | Number of columns in desktop layout     |
| `backgroundColor` | `"light" \| "white" \| "transparent"`                   | `"transparent"` | Background color variant                |
| `maxWidth`        | `"sm" \| "md" \| "lg" \| "xl" \| "full"`                | `"lg"`          | Maximum width constraint via PageLayout |
| `spacing`         | `"compact" \| "default" \| "comfortable" \| "spacious"` | `"comfortable"` | Spacing variant via PageLayout          |

### Styling Props

| Prop          | Type                              | Default        | Description                                                 |
| ------------- | --------------------------------- | -------------- | ----------------------------------------------------------- |
| `roundImages` | `boolean`                         | `false`        | Display member images as circles instead of rounded squares |
| `className`   | `string`                          | `""`           | Additional CSS class for custom styling                     |
| `as`          | `"section" \| "article" \| "div"` | `"section"`    | Semantic HTML element to render                             |
| `ariaLabel`   | `string`                          | `sectionTitle` | Accessible label (defaults to sectionTitle)                 |

## Type Definitions

### TeamMember

```typescript
interface TeamMember {
  /** Member's full name */
  name: string;
  /** Member's role or job title */
  title: string;
  /** Path to member's image */
  image: string;
  /** Alt text for the image (defaults to name if not provided) */
  imageAlt?: string;
  /** Image width in pixels (default: 112) */
  imageWidth?: number;
  /** Image height in pixels (default: 112) */
  imageHeight?: number;
  /** Optional link to member's profile or LinkedIn */
  link?: string;
}
```

### TeamBlockProps

```typescript
interface TeamBlockProps {
  members: TeamMember[];
  sectionTitle?: string;
  description?: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  backgroundColor?: "light" | "white" | "transparent";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  className?: string;
  as?: "section" | "article" | "div";
  ariaLabel?: string;
  roundImages?: boolean;
}
```

## Usage Patterns

### Case Study Team Section

```tsx
<TeamBlock
  members={projectTeam}
  sectionTitle="Project Team"
  description="The talented individuals who brought this project to life."
  columns={5}
  backgroundColor="white"
/>
```

### Company About Page

```tsx
<TeamBlock
  members={companyTeam}
  sectionTitle="Meet Our Team"
  description="Passionate professionals dedicated to innovation and excellence."
  columns={4}
  backgroundColor="light"
  maxWidth="xl"
  roundImages={true}
/>
```

### Small Leadership Team

```tsx
<TeamBlock
  members={[
    { name: "Jane Doe", title: "CEO", image: "/team/jane.png" },
    { name: "John Smith", title: "CTO", image: "/team/john.png" },
  ]}
  sectionTitle="Leadership"
  columns={2}
  backgroundColor="white"
/>
```

### Large Team Grid

```tsx
<TeamBlock
  members={allEmployees}
  sectionTitle="Our People"
  columns={6}
  maxWidth="full"
  spacing="compact"
/>
```

### Team with LinkedIn Links

```tsx
const teamWithLinks = [
  {
    name: "Laura Karhu",
    title: "Project Lead",
    image: "/team/laura.png",
    link: "https://linkedin.com/in/laurakarhu",
  },
  {
    name: "Petri Lahdelma",
    title: "Senior UX Designer",
    image: "/team/petri.png",
    link: "https://linkedin.com/in/petrilahdelma",
  },
];

<TeamBlock
  members={teamWithLinks}
  sectionTitle="Connect With Us"
  columns={2}
/>;
```

### Design Team with Round Images

```tsx
<TeamBlock
  members={designTeam}
  sectionTitle="Design Team"
  description="Creative minds shaping exceptional user experiences."
  columns={4}
  roundImages={true}
  backgroundColor="light"
/>
```

### Without Section Title

```tsx
<TeamBlock
  members={team}
  sectionTitle=""
  columns={3}
  backgroundColor="transparent"
/>
```

### Custom Image Sizes

```tsx
const teamWithCustomImages = [
  {
    name: "Sarah Johnson",
    title: "Creative Director",
    image: "/team/sarah.png",
    imageWidth: 150,
    imageHeight: 150,
  },
];

<TeamBlock members={teamWithCustomImages} columns={3} />;
```

## Responsive Behavior

The component uses CSS Grid with breakpoint-based column adjustments:

### 2-Column Layout

- **Mobile (< 640px)**: 1 column
- **Desktop (≥ 640px)**: 2 columns

### 3-Column Layout

- **Mobile (< 640px)**: 1 column
- **Tablet (640px - 1023px)**: 2 columns
- **Desktop (≥ 1024px)**: 3 columns

### 4-Column Layout

- **Mobile (< 640px)**: 1 column
- **Tablet (640px - 1023px)**: 2 columns
- **Desktop (≥ 1024px)**: 4 columns

### 5-Column Layout

- **Mobile (< 640px)**: 1 column
- **Small Tablet (640px - 767px)**: 2 columns
- **Large Tablet (768px - 1023px)**: 3 columns
- **Desktop (≥ 1024px)**: 5 columns

### 6-Column Layout

- **Mobile (< 640px)**: 1 column
- **Small Tablet (640px - 767px)**: 2 columns
- **Large Tablet (768px - 1023px)**: 3 columns
- **Desktop (≥ 1024px)**: 6 columns

## Accessibility

### Semantic HTML

- Default `<section>` element with option for `<article>` or `<div>`
- Proper heading hierarchy (H2 for section title, H4 for member names)
- Uses `aria-label` for accessible section identification

### Image Accessibility

```tsx
<TeamBlock
  members={[
    {
      name: "Laura Karhu",
      title: "Project Lead",
      image: "/team/laura.png",
      imageAlt: "Professional portrait of Laura Karhu in business attire",
    },
  ]}
/>
```

### Link Accessibility

When members have `link` property:

- Links open in new tab with `target="_blank"`
- Security: `rel="noopener noreferrer"` automatically applied
- Hover effects with visual feedback
- Focus indicators for keyboard navigation

### ARIA Attributes

```tsx
<TeamBlock
  members={team}
  sectionTitle="Project Team"
  ariaLabel="Complete list of project team members and their roles"
/>
```

### Motion Preferences

Respects `prefers-reduced-motion` for accessibility:

- Disables hover animations when reduced motion is preferred
- Maintains full functionality without motion effects

## Design Tokens

The component uses the following CSS variables:

### Spacing

- `--space-xl`: Section padding (default: 3rem)
- `--space-layout-l`: Title margin bottom (default: 4rem)
- `--space-layout-m`: Grid gap and description margin (default: 3rem)

### Colors

- `--color-light-bg`: Light background variant
- `--color-white`: White background variant
- `--color-text`: Primary text color (names)
- `--color-text-secondary`: Secondary text color (titles/roles)
- `--color-primary`: Focus outline color

### Border Radius

- `--radius-m`: Image border radius (default: 8px)

## Progressive Enhancement

### Browser Support

- **Modern Browsers**: Full CSS Grid with `gap` support, hover transforms
- **Legacy Browsers**: Graceful fallback using margin-based spacing

### Fallback Strategies

```css
/* Modern browsers use gap */
@supports (gap: 3rem) {
  .grid5Col {
    gap: var(--space-layout-m, 3rem);
  }
}

/* Older browsers get margin fallback */
@supports not (gap: 3rem) {
  .grid5Col > .col:not(:last-child) {
    margin-block-end: var(--space-layout-m, 3rem);
  }
}
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  .memberLink {
    transition-duration: 0.01ms !important;
  }

  .memberLink:hover {
    transform: none;
  }
}
```

### High Contrast

```css
@media (prefers-contrast: high) {
  .memberName {
    font-weight: 700;
  }

  .memberLink:focus-visible {
    outline-width: 3px;
  }
}
```

## Testing

### Running Tests

```bash
# Unit tests
npm test TeamBlock

# With coverage
npm test -- --coverage TeamBlock

# Watch mode
npm test -- --watch TeamBlock
```

### Test Coverage

The component includes comprehensive tests for:

- ✅ Basic rendering with required and optional props
- ✅ Team member names, titles, and images
- ✅ Custom section titles and descriptions
- ✅ Layout variants (2-6 columns)
- ✅ Background color variants
- ✅ Round vs square image variants
- ✅ Member links with proper attributes
- ✅ Semantic HTML element variants
- ✅ Accessibility features (ARIA labels, alt text, heading hierarchy)
- ✅ Custom image dimensions
- ✅ Edge cases (special characters, long names, long titles)

## Storybook

View all variants in Storybook:

```bash
npm run storybook
```

Navigate to **Patterns > TeamBlock** to see:

- Default (5-person Helsinki team)
- SmallTeam (3 members, 3 columns)
- LargeTeam (8 members, 4 columns)
- TwoColumnLayout
- SixColumnLayout
- RoundImages
- WithDescription
- NoTitle
- CompactSpacing
- WideLayout
- WithLinks (clickable member profiles)
- ArticleVariant
- DesignTeam
- DevelopmentTeam
- MinimalTeam

## Best Practices

### Do ✅

- Provide high-quality profile images (recommended: 200x200px or larger)
- Use descriptive alt text for images
- Keep member titles concise (1-3 words ideal)
- Choose column count based on team size (3-5 columns for most cases)
- Use round images for consistent style with avatars
- Include links to LinkedIn or portfolio sites when appropriate
- Test responsive behavior at all breakpoints

### Don't ❌

- Don't use low-resolution or pixelated images
- Don't omit alt text (it defaults to name but custom text is better)
- Don't make titles too long or verbose
- Don't use 6 columns unless you have a very large team
- Don't mix square and round images in the same component
- Don't link to internal pages (use external profile links only)
- Don't override grid styles without testing mobile layout

## Migration Guide

### From Inline JSX

**Before:**

```tsx
<PageLayout maxWidth="lg" spacing="comfortable">
  <Title level={2} size="M">
    Team
  </Title>
  <div className={styles.grid5Col}>
    <div className={styles.col}>
      <Image src="/laura.png" alt="Laura" width={112} height={112} />
      <Title level={4} size="XS">
        Laura Karhu
      </Title>
      <Text size="S">Project Lead</Text>
    </div>
    {/* More members... */}
  </div>
</PageLayout>
```

**After:**

```tsx
<TeamBlock
  members={[
    { name: "Laura Karhu", title: "Project Lead", image: "/laura.png" },
    // More members...
  ]}
  sectionTitle="Team"
  columns={5}
/>
```

## Related Components

- **ProcessBlock**: Displays project process phases
- **ServicesBlock**: Displays project metadata and services
- **PageLayout**: Provides consistent width and spacing constraints
- **Title**: Heading component with design system typography
- **Text**: Body text component
- **Image**: Next.js optimized image component

## Contributing

When extending TeamBlock:

1. Follow TypeScript strict mode
2. Add comprehensive tests for new features
3. Update Storybook stories
4. Document new props in this README
5. Ensure accessibility standards are maintained
6. Test responsive behavior across all breakpoints
7. Consider performance implications for large teams

## Performance Considerations

- Uses Next.js `Image` component for automatic optimization
- Images lazy-load by default
- Grid layout uses CSS Grid (hardware-accelerated)
- Minimal JavaScript - primarily static rendering
- For very large teams (>20 members), consider pagination or virtualization

## Changelog

### Version 1.0.0 (December 2025)

- Initial release as reusable design system component
- Support for 2-6 column layouts
- Background color variants (light, white, transparent)
- Round and square image variants
- Optional member profile links
- Rich content support for descriptions
- Comprehensive test coverage
- Full Storybook documentation
- Accessibility features (ARIA labels, semantic HTML, alt text, keyboard navigation)
- Custom image dimensions support
