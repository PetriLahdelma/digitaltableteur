# ProcessBlock

A reusable design system component for displaying project process phases in a multi-column grid layout. Commonly used in case studies and work pages to showcase methodology and workflow.

## Features

- **Flexible Column Layouts**: Support for 2, 3, or 4-column responsive grids
- **Customizable Phases**: Props-based configuration for titles and activities
- **Background Variants**: Light, white, or transparent background options
- **Rich Content Support**: String or React node descriptions
- **Responsive Design**: Mobile-first with breakpoint-based column adjustments
- **Accessibility**: Semantic HTML, ARIA labels, proper heading hierarchy
- **Design Token Integration**: Uses CSS variables for consistent spacing and colors
- **Progressive Enhancement**: Fallbacks for older browsers

## Installation

This component is part of the design system patterns. Import it directly:

```tsx
import ProcessBlock from "@/shared/patterns/ProcessBlock";
import type { ProcessPhase } from "@/shared/patterns/ProcessBlock";
```

## Basic Usage

### Minimal Example

```tsx
const phases = [
  {
    title: "Discover",
    activities: ["User Research", "Stakeholder Workshops"],
  },
  {
    title: "Define",
    activities: ["User Personas", "Journey Mapping"],
  },
];

<ProcessBlock phases={phases} />;
```

### Complete Example

```tsx
<ProcessBlock
  phases={[
    {
      title: "Discover",
      activities: [
        "Stakeholder Workshops",
        "User Research",
        "Benchmark Analysis",
      ],
    },
    {
      title: "Define",
      activities: ["User Personas", "Empathy Map", "User Journey Mapping"],
    },
    {
      title: "Ideate",
      activities: ["User Flows", "Wireframes", "Prototypes"],
    },
    {
      title: "Design",
      activities: ["Reusable Components", "Documentation", "Design Reviews"],
    },
  ]}
  sectionTitle="Our UX Process"
  description="We follow a human-centered design approach that puts users at the heart of every decision."
  backgroundColor="light"
  columns={4}
  maxWidth="lg"
  spacing="comfortable"
/>
```

## Props

### Core Props

| Prop           | Type              | Default      | Description                                               |
| -------------- | ----------------- | ------------ | --------------------------------------------------------- |
| `phases`       | `ProcessPhase[]`  | **Required** | Array of process phases with titles and activities        |
| `sectionTitle` | `string`          | `"Process"`  | Main title for the process section (empty string to hide) |
| `description`  | `React.ReactNode` | `undefined`  | Optional introduction text or rich content                |

### Customization Props

| Prop              | Type                                  | Default   | Description                         |
| ----------------- | ------------------------------------- | --------- | ----------------------------------- |
| `backgroundColor` | `"light" \| "white" \| "transparent"` | `"light"` | Background color variant            |
| `columns`         | `2 \| 3 \| 4`                         | `4`       | Number of columns in desktop layout |

### Layout Props

| Prop        | Type                                                    | Default         | Description                                 |
| ----------- | ------------------------------------------------------- | --------------- | ------------------------------------------- |
| `maxWidth`  | `"sm" \| "md" \| "lg" \| "xl" \| "full"`                | `"lg"`          | Maximum width constraint via PageLayout     |
| `spacing`   | `"compact" \| "default" \| "comfortable" \| "spacious"` | `"comfortable"` | Spacing variant via PageLayout              |
| `className` | `string`                                                | `""`            | Additional CSS class for custom styling     |
| `as`        | `"section" \| "article" \| "div"`                       | `"section"`     | Semantic HTML element to render             |
| `ariaLabel` | `string`                                                | `sectionTitle`  | Accessible label (defaults to sectionTitle) |

## Type Definitions

### ProcessPhase

```typescript
interface ProcessPhase {
  /** Phase name (e.g., "Discover", "Define", "Ideate", "Design") */
  title: string;
  /** List of activities or deliverables in this phase */
  activities: string[];
}
```

### ProcessBlockProps

```typescript
interface ProcessBlockProps {
  phases: ProcessPhase[];
  sectionTitle?: string;
  description?: React.ReactNode;
  backgroundColor?: "light" | "white" | "transparent";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  columns?: 2 | 3 | 4;
  className?: string;
  as?: "section" | "article" | "div";
  ariaLabel?: string;
}
```

## Usage Patterns

### Case Study Header

```tsx
<ProcessBlock
  phases={projectPhases}
  sectionTitle="Design Process"
  description="This project followed our comprehensive UX methodology."
  backgroundColor="white"
  columns={4}
/>
```

### Portfolio Project Page

```tsx
<ProcessBlock
  phases={workflowPhases}
  sectionTitle="Workflow"
  backgroundColor="light"
  columns={3}
  maxWidth="xl"
/>
```

### Development Workflow

```tsx
const devPhases = [
  {
    title: "Planning",
    activities: ["Requirements", "Architecture", "Sprint Planning"],
  },
  {
    title: "Development",
    activities: ["Component Dev", "Testing", "Code Reviews"],
  },
  {
    title: "Deployment",
    activities: ["CI/CD", "Production", "Monitoring"],
  },
];

<ProcessBlock
  phases={devPhases}
  sectionTitle="Development Workflow"
  columns={3}
/>;
```

### Agile Sprint Cycle

```tsx
const sprintPhases = [
  {
    title: "Sprint Planning",
    activities: ["Backlog Refinement", "Story Estimation", "Goal Definition"],
  },
  {
    title: "Sprint Execution",
    activities: ["Daily Standups", "Development", "Testing"],
  },
  {
    title: "Sprint Review",
    activities: ["Demo", "Feedback", "Acceptance"],
  },
  {
    title: "Retrospective",
    activities: ["Reflection", "Improvements", "Action Items"],
  },
];

<ProcessBlock
  phases={sprintPhases}
  sectionTitle="Agile Sprint Cycle"
  description="Our 2-week sprint cycle ensures rapid delivery and continuous improvement."
  columns={4}
/>;
```

### Simplified Two-Column Layout

```tsx
<ProcessBlock
  phases={[
    {
      title: "Research & Planning",
      activities: ["User Research", "Requirements", "Competitive Analysis"],
    },
    {
      title: "Design & Delivery",
      activities: ["Wireframing", "Visual Design", "User Testing"],
    },
  ]}
  sectionTitle="Our Approach"
  columns={2}
/>
```

### Without Section Title

```tsx
<ProcessBlock
  phases={phases}
  sectionTitle=""
  backgroundColor="transparent"
  columns={4}
/>
```

### With Rich Description

```tsx
<ProcessBlock
  phases={phases}
  sectionTitle="Methodology"
  description={
    <div>
      <Text size="M">
        We follow industry-leading practices that ensure quality and efficiency.
      </Text>
      <Text size="S">
        Each phase builds upon the previous, creating a cohesive workflow.
      </Text>
    </div>
  }
  columns={4}
/>
```

## Responsive Behavior

The component uses CSS Grid with breakpoint-based column adjustments:

- **Mobile (< 768px)**: Always 1 column
- **Tablet (768px - 1023px)**:
  - 2-column layout: 2 columns
  - 3-column layout: 2 columns
  - 4-column layout: 2 columns
- **Desktop (≥ 1024px)**:
  - 2-column layout: 2 columns
  - 3-column layout: 3 columns
  - 4-column layout: 4 columns

## Accessibility

### Semantic HTML

- Default `<section>` element with option for `<article>` or `<div>`
- Proper heading hierarchy (H2 for section title, H4 for phase titles)
- Uses `aria-label` for accessible section identification

### ARIA Attributes

```tsx
<ProcessBlock
  phases={phases}
  sectionTitle="Design Process"
  ariaLabel="Our comprehensive UX design process overview"
/>
```

### Keyboard Navigation

- All content is accessible via keyboard navigation
- Focus indicators follow design system standards
- No interactive elements require special keyboard handling

### Screen Reader Support

- Descriptive phase titles and activity lists
- Proper semantic structure ensures logical reading order
- ARIA labels provide context for assistive technologies

## Design Tokens

The component uses the following CSS variables:

### Spacing

- `--space-xl`: Section padding (default: 3rem)
- `--space-layout-l`: Title margin bottom (default: 4rem)
- `--space-layout-m`: Grid gap and description margin (default: 3rem)
- `--space-component-m`: Column internal spacing (default: 1rem)

### Colors

- `--color-light-bg`: Light background variant
- `--color-white`: White background variant
- `--color-text`: Primary text color
- `--color-text-secondary`: Secondary text color (activities)

## Progressive Enhancement

### Browser Support

- **Modern Browsers**: Full CSS Grid with `gap` support
- **Legacy Browsers**: Graceful fallback using margin-based spacing

### Fallback Strategies

```css
/* Modern browsers use gap */
@supports (gap: 3rem) {
  .grid4Col {
    gap: var(--space-layout-m, 3rem);
  }
}

/* Older browsers get margin fallback */
@supports not (gap: 3rem) {
  .grid4Col > .col:not(:last-child) {
    margin-block-end: var(--space-layout-m, 3rem);
  }
}
```

### Motion Preferences

Respects `prefers-reduced-motion` for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  .processBlock * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing

### Running Tests

```bash
# Unit tests
npm test ProcessBlock

# With coverage
npm test -- --coverage ProcessBlock

# Watch mode
npm test -- --watch ProcessBlock
```

### Test Coverage

The component includes comprehensive tests for:

- ✅ Basic rendering with required and optional props
- ✅ Phase titles and activities rendering
- ✅ Custom section titles and descriptions
- ✅ Layout variants (2, 3, 4 columns)
- ✅ Background color variants
- ✅ Semantic HTML element variants
- ✅ Accessibility features (ARIA labels, heading hierarchy)
- ✅ Edge cases (empty activities, many phases, long names)

## Storybook

View all variants in Storybook:

```bash
npm run storybook
```

Navigate to **Patterns > ProcessBlock** to see:

- Default (4 phases, 4 columns)
- DevelopmentProcess (3 phases, 3 columns)
- TwoColumnLayout (2 phases, 2 columns)
- NoTitle (without section title)
- WithDescription (with introduction text)
- CompactSpacing
- WideLayout
- ArticleVariant
- AgileSprint
- MinimalProcess
- ContentStrategy

## Best Practices

### Do ✅

- Provide clear, concise phase titles
- Keep activity lists focused and scannable
- Use 4 columns for comprehensive processes
- Use 2-3 columns for simplified workflows
- Include descriptions when context is needed
- Choose semantic HTML elements appropriately

### Don't ❌

- Don't use more than 6-8 activities per phase (consider splitting)
- Don't make phase titles too long (1-2 words ideal)
- Don't mix different levels of detail across phases
- Don't use ProcessBlock for non-process content
- Don't override grid styles without testing responsiveness

## Migration Guide

### From Inline JSX

**Before:**

```tsx
<section
  style={{ backgroundColor: "var(--color-light-bg)", paddingBlock: "3rem" }}
>
  <PageLayout maxWidth="lg" spacing="comfortable">
    <Title level={2} size="M">
      Process
    </Title>
    <div className={styles.grid4Col}>
      <div className={styles.col}>
        <Title size="XS" level={4}>
          Discover
        </Title>
        <List items={["User Research", "Workshops"]} size="S" />
      </div>
      {/* More phases... */}
    </div>
  </PageLayout>
</section>
```

**After:**

```tsx
<ProcessBlock
  phases={[
    { title: "Discover", activities: ["User Research", "Workshops"] },
    // More phases...
  ]}
  sectionTitle="Process"
  backgroundColor="light"
  columns={4}
/>
```

## Related Components

- **ServicesBlock**: Displays project metadata and services
- **PageLayout**: Provides consistent width and spacing constraints
- **Title**: Heading component with design system typography
- **Text**: Body text component
- **List**: Renders lists with consistent styling

## Contributing

When extending ProcessBlock:

1. Follow TypeScript strict mode
2. Add comprehensive tests for new features
3. Update Storybook stories
4. Document new props in this README
5. Ensure accessibility standards are maintained
6. Test responsive behavior across breakpoints

## Changelog

### Version 1.0.0 (December 2025)

- Initial release as reusable design system component
- Support for 2, 3, and 4-column layouts
- Background color variants (light, white, transparent)
- Rich content support for descriptions
- Comprehensive test coverage
- Full Storybook documentation
- Accessibility features (ARIA labels, semantic HTML, heading hierarchy)
