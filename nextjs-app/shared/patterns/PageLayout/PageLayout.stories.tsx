import contract from "./PageLayout.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import PageLayout from "./PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import TitleStories from "@dt/Title/Title.stories";

const meta: Meta<typeof PageLayout> = {
  title: "Patterns/PageLayout",
  component: PageLayout,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-page-layout",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this complex pattern component
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot), `as` a semantic
  // element radio (worth choosing even though plumbing-class props are
  // otherwise hidden).
  argTypes: {
    children: { control: "text", description: "Page content" },
    as: {
      control: { type: "inline-radio" },
      options: ["div", "main", "section", "article"],
      description: "Semantic HTML element to use for the container",
      table: { category: "Advanced", defaultValue: { summary: "\"div\"" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageLayout>;

// Demo content component for visualization
const DemoContent = ({ gridColumn }: { gridColumn?: string }) => (
  <div
    style={{
      padding: "1.5rem",
      background: "var(--color-primary)",
      color: "var(--inverted-text-color)",
      borderRadius: "8px",
      gridColumn,
      minHeight: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-text)",
    }}
  >
    Content Block
  </div>
);

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { maxWidth: "lg", spacing: "default", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Page Title
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-relaxed)" }}
      >
        This is a default page layout with standard spacing and a large
        max-width container. The content is automatically centered and has
        responsive margins.
      </Text>
    </PageLayout>
  ),
};

export const SmallContainer: Story = {
  args: { maxWidth: "sm", spacing: "default", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Small Container (640px max)
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-relaxed)" }}
      >
        Ideal for focused content like blog posts or forms. The narrow width
        improves readability for long-form text.
      </Text>
    </PageLayout>
  ),
};

export const MediumContainer: Story = {
  args: { maxWidth: "md", spacing: "comfortable", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Medium Container (960px max)
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-relaxed)" }}
      >
        Perfect for documentation, articles, and standard content pages.
        Comfortable spacing provides breathing room.
      </Text>
    </PageLayout>
  ),
};

export const LargeContainer: Story = {
  args: { maxWidth: "lg", spacing: "spacious", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Large Container (1200px max)
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-relaxed)" }}
      >
        Suitable for dashboards, product showcases, and multi-column layouts.
        Spacious vertical rhythm creates a premium feel.
      </Text>
    </PageLayout>
  ),
};

export const ExtraLargeContainer: Story = {
  args: { maxWidth: "xl", spacing: "default", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Extra Large Container (1440px max)
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-relaxed)" }}
      >
        For wide desktop displays and complex layouts requiring more horizontal
        space.
      </Text>
    </PageLayout>
  ),
};

export const FullWidth: Story = {
  args: { maxWidth: "full", spacing: "default", withMargins: false },
  render: (args) => (
    <PageLayout {...args}>
      <div style={{ padding: "var(--space-layout-32)" }}>
        <Title style={{ marginBlockEnd: "1rem" }}>
          Full Width Layout
        </Title>
        <Text
          style={{ lineHeight: "var(--line-height-relaxed)" }}
        >
          Spans the entire viewport width. Useful for hero sections, image
          galleries, or immersive experiences.
        </Text>
      </div>
    </PageLayout>
  ),
};

export const CompactSpacing: Story = {
  args: { maxWidth: "md", spacing: "compact", withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <Title style={{ marginBlockEnd: "1rem" }}>
        Compact Spacing
      </Title>
      <Text
        style={{ lineHeight: "var(--line-height-normal)" }}
      >
        Minimal vertical padding for dense interfaces or components that manage
        their own spacing.
      </Text>
    </PageLayout>
  ),
};

export const TwoColumnGrid: Story = {
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
    </PageLayout>
  ),
};

export const ThreeColumnGrid: Story = {
  args: { maxWidth: "xl", spacing: "default", grid: true, withMargins: true },
  render: (args) => (
    <PageLayout {...args}>
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
  ),
};

export const AsymmetricGrid: Story = {
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <DemoContent gridColumn="span 8" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
  ),
};

export const ComplexGrid: Story = {
  args: {
    maxWidth: "xl",
    spacing: "comfortable",
    grid: true,
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <DemoContent gridColumn="span 12" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
      <DemoContent gridColumn="span 3" />
    </PageLayout>
  ),
};

export const ResponsiveShowcase: Story = {
  args: {
    maxWidth: "lg",
    spacing: "comfortable",
    grid: true,
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <div
        style={{
          gridColumn: "span 12",
          padding: "1.5rem",
          background: "var(--color-light-bg)",
          borderRadius: "8px",
        }}
      >
        <Title style={{ marginBlockEnd: "1rem" }}>
          Responsive Grid System
        </Title>
        <Text style={{ lineHeight: "var(--line-height-relaxed)" }}>
          • Desktop (≥1024px): 12 columns with 32px gaps
          <br />
          • Tablet (768-1023px): 8 columns with 24px gaps
          <br />• Mobile (&lt;768px): 4 columns with 16px gaps
        </Text>
      </div>
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
  ),
};

// Args-driven children plus grid seeded ON so the columns knob has a live
// path (columns only applies when grid=true).
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    maxWidth: "lg",
    spacing: "default",
    withMargins: true,
    grid: true,
    columns: 12,
    children: "Content laid out inside the page container.",
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
