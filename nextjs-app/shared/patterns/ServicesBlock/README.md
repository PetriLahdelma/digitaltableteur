# ServicesBlock Pattern Component

A reusable pattern component for displaying project metadata, services, tools, and overview content. Designed as a building block for case studies and work pages in the design system.

## Features

- **Responsive Two-Column Layout**: Metadata sidebar and overview content (stacks on mobile)
- **Flexible Content**: All sections are optional except overview
- **Rich Content Support**: Overview accepts both string and React nodes
- **Icon Integration**: Built-in support for tool/technology icons with accessibility
- **Design Token Integration**: Uses spacing, typography, and color tokens
- **Semantic HTML**: Configurable element types (section, article, div)
- **Accessibility**: Proper ARIA labels, heading hierarchy, and screen reader support
- **Progressive Enhancement**: Fallbacks for modern CSS features

## Installation

```tsx
import ServicesBlock from "@/shared/patterns/ServicesBlock";
import type {
  ServicesBlockProps,
  ServiceItem,
  ToolIcon,
} from "@/shared/patterns/ServicesBlock";
```

## Basic Usage

### Minimal Example (Overview Only)

```tsx
<ServicesBlock overview="A focused design sprint to reimagine the user onboarding experience, resulting in a 40% increase in completion rates." />
```

### Complete Example

```tsx
import { SiFigma, SiReact, SiGithub } from "react-icons/si";

<ServicesBlock
  services={[
    { label: "UX Design" },
    { label: "UI Design" },
    { label: "Frontend Development" },
  ]}
  duration="January 2024–June 2024"
  tools={[
    { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
    { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
    { key: "github", icon: <SiGithub size={24} />, ariaLabel: "GitHub" },
  ]}
  overview={
    <>
      <Text size="S">
        <strong>The Challenge:</strong> A growing e-commerce platform needed to
        scale its design language across web, mobile, and native apps.
      </Text>
      <br />
      <Text size="S">
        <strong>The Result:</strong> Reduced design-to-development time by 50%
        and achieved WCAG AAA compliance.
      </Text>
    </>
  }
/>;
```

## Props

### Core Props

| Prop       | Type              | Default      | Description                                   |
| ---------- | ----------------- | ------------ | --------------------------------------------- |
| `overview` | `React.ReactNode` | **Required** | Main overview content (string or React nodes) |
| `services` | `ServiceItem[]`   | `[]`         | List of services provided                     |
| `duration` | `string`          | `undefined`  | Project timeline or duration                  |
| `tools`    | `ToolIcon[]`      | `[]`         | Tool/technology icons with labels             |

### Customization Props

| Prop            | Type     | Default      | Description                |
| --------------- | -------- | ------------ | -------------------------- |
| `overviewTitle` | `string` | `"Overview"` | Title for overview section |
| `servicesTitle` | `string` | `"Services"` | Title for services section |
| `durationTitle` | `string` | `"Duration"` | Title for duration section |
| `toolsTitle`    | `string` | `"Tools"`    | Title for tools section    |

### Layout Props

| Prop        | Type                                                    | Default         | Description                             |
| ----------- | ------------------------------------------------------- | --------------- | --------------------------------------- |
| `maxWidth`  | `"sm" \| "md" \| "lg" \| "xl" \| "full"`                | `"md"`          | Maximum content width                   |
| `spacing`   | `"compact" \| "default" \| "comfortable" \| "spacious"` | `"comfortable"` | Vertical spacing preset                 |
| `className` | `string`                                                | `undefined`     | Custom CSS class for styling extensions |
| `as`        | `"section" \| "article" \| "div"`                       | `"section"`     | Semantic HTML element to render         |
| `ariaLabel` | `string`                                                | `undefined`     | ARIA label for screen readers           |

## Type Definitions

### ServiceItem

```tsx
interface ServiceItem {
  /** Service name or description */
  label: string;
}
```

### ToolIcon

```tsx
interface ToolIcon {
  /** Unique identifier */
  key: string;
  /** Icon component (typically from react-icons) */
  icon: React.ReactNode;
  /** Accessible label for screen readers */
  ariaLabel: string;
}
```

## Usage Patterns

### Case Study Header

```tsx
<ServicesBlock
  services={[
    { label: "UX Research" },
    { label: "Service Design" },
    { label: "Prototyping" },
  ]}
  duration="Q1 2024–Q3 2024"
  tools={[
    { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
    { key: "miro", icon: <SiMiro size={24} />, ariaLabel: "Miro" },
  ]}
  overview={
    <Text size="S">
      Redesigned the customer onboarding flow for a fintech startup, reducing
      dropout rates by 35% and improving user satisfaction scores.
    </Text>
  }
  maxWidth="lg"
/>
```

### Portfolio Project

```tsx
<ServicesBlock
  services={[
    { label: "Brand Identity" },
    { label: "Web Design" },
    { label: "Development" },
  ]}
  duration="2-month project"
  tools={[
    { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
    { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
    { key: "nextjs", icon: <SiNextdotjs size={24} />, ariaLabel: "Next.js" },
  ]}
  overview="Complete brand and web presence for a sustainable fashion startup, including logo, style guide, and e-commerce site."
  as="article"
/>
```

### Multilingual Support

```tsx
<ServicesBlock
  services={[
    { label: "Käyttöliittymäsuunnittelu" },
    { label: "Käytettävyystestaus" },
  ]}
  duration="Tammikuu–Maaliskuu 2024"
  tools={[{ key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" }]}
  overview="Suunnittelimme käyttäjäystävällisen mobiilisovelluksen."
  servicesTitle="Palvelut"
  durationTitle="Kesto"
  toolsTitle="Työkalut"
  overviewTitle="Yleiskatsaus"
/>
```

## Responsive Behavior

- **Mobile (< 768px)**: Single column, metadata stacks above overview
- **Tablet/Desktop (≥ 768px)**: Two columns (1:2 ratio), metadata sidebar left, overview right

## Accessibility

- **Semantic HTML**: Uses proper `<section>`, `<article>`, or `<div>` based on context
- **Heading Hierarchy**: All section titles are `<h3>` (adjust parent heading levels accordingly)
- **ARIA Labels**: Tool icons have `aria-label` attributes via `ariaLabel` prop
- **List Structure**: Tools use proper `role="list"` and `role="listitem"` for screen readers
- **Keyboard Navigation**: All interactive elements are keyboard accessible

### Recommended Usage

```tsx
// In a page with h1 and h2 headings already used
<h1>Case Study: Helsinki Design System</h1>
<h2>Project Overview</h2>
<ServicesBlock
  // h3 titles work well here
  services={services}
  overview={content}
/>
```

## Design Tokens

Uses design system tokens for consistent spacing and typography:

- **Spacing**: `--space-layout-{s,m,l}`, `--space-component-{xs,s,m}`
- **Colors**: `--color-text`, `--color-primary`
- **Typography**: `--font-size-s`, `--line-height-relaxed`
- **Borders**: `--radius-md`

## Progressive Enhancement

### Gap Property Fallback

```css
/* Modern browsers */
.grid {
  display: grid;
  gap: var(--space-layout-m);
}

/* Fallback for older browsers */
@supports not (gap: 1rem) {
  .grid > * + * {
    margin-block-start: var(--space-layout-m);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .toolsIcons > div {
    transition: none;
  }
}
```

## Testing

Run tests with:

```bash
npm test ServicesBlock
```

Test coverage includes:

- Basic rendering
- Conditional section display
- Custom titles
- Accessibility attributes
- Rich content support
- Responsive behavior

## Storybook

Preview all variants in Storybook:

```bash
npm run storybook
```

Navigate to **Patterns → ServicesBlock** to see:

- Complete examples
- Minimal configurations
- Tech-focused projects
- Design-only projects
- Multilingual variants
- Layout variations

## Best Practices

### ✅ Do

- **Provide Rich Overview Content**: Use React nodes with formatted text for better readability
- **Use Descriptive ARIA Labels**: Ensure tool icons have clear, unique labels
- **Match Heading Hierarchy**: Adjust parent page headings to work with h3 section titles
- **Leverage Layout Props**: Use `maxWidth` and `spacing` for consistent layouts
- **Include All Relevant Sections**: Show services, duration, and tools when available

### ❌ Don't

- **Don't Use Inline Styles**: Use `className` prop and CSS Modules instead
- **Don't Hard-Code Tool Icons**: Pass them as props for flexibility
- **Don't Skip ARIA Labels**: Every tool icon needs an `ariaLabel`
- **Don't Nest Headings Improperly**: Ensure page hierarchy supports h3 titles
- **Don't Omit Overview**: It's the only required prop for a reason

## Migration from Legacy Pattern

If migrating from the old inline JSX pattern:

**Before**:

```tsx
<PageLayout maxWidth="md" spacing="comfortable" as="section">
  <div className={styles.grid2Col}>
    <div className={styles.col}>
      <Title>Services</Title>
      <List items={["UX", "UI"]} />
    </div>
    {/* ... */}
  </div>
</PageLayout>
```

**After**:

```tsx
<ServicesBlock
  services={[{ label: "UX" }, { label: "UI" }]}
  overview="Project overview content"
/>
```

## Related Components

- **Hero**: Page hero pattern with title, subtitle, and actions
- **PageLayout**: Layout wrapper with max-width and spacing
- **Title**: Typography component for headings
- **Text**: Typography component for body text
- **List**: List component used internally for services

## Contributing

When making changes to ServicesBlock:

1. Update component, CSS, types, tests, stories
2. Run `npm test` and `npm run lint:all`
3. Update this README with new features or examples
4. Add Storybook stories for new variants
5. Ensure accessibility standards are maintained

## Changelog

- **v1.0.0** (2025-12-03): Initial reusable component creation
  - Converted from inline JSX to proper component
  - Added TypeScript types and props
  - Created comprehensive test suite
  - Added Storybook stories
  - Implemented responsive layout
  - Added accessibility features
