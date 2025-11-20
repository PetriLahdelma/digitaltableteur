import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import PageLayout from "./PageLayout";

const meta: Meta<typeof PageLayout> = {
  title: "Patterns/PageLayout",
  component: PageLayout,
  parameters: {
    layout: "fullscreen",
    wip: { disabled: false }, // Keep WIP badge until a11y + visual verified
  },
  argTypes: {
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Maximum width constraint",
    },
    spacing: {
      control: "select",
      options: ["compact", "default", "comfortable", "spacious"],
      description: "Vertical spacing",
    },
    grid: {
      control: "boolean",
      description: "Enable 12-column grid system",
    },
    withMargins: {
      control: "boolean",
      description: "Apply page margins",
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
      color: "white",
      borderRadius: "8px",
      gridColumn,
      minHeight: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    Content Block
  </div>
);

export const Default: Story = {
  args: {
    maxWidth: "lg",
    spacing: "default",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h1 style={{ marginBlockEnd: "1rem" }}>Page Title</h1>
      <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
        This is a default page layout with standard spacing and a large
        max-width container. The content is automatically centered and has
        responsive margins.
      </p>
    </PageLayout>
  ),
};

export const SmallContainer: Story = {
  args: {
    maxWidth: "sm",
    spacing: "default",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h2 style={{ marginBlockEnd: "1rem" }}>Small Container (640px max)</h2>
      <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
        Ideal for focused content like blog posts or forms. The narrow width
        improves readability for long-form text.
      </p>
    </PageLayout>
  ),
};

export const MediumContainer: Story = {
  args: {
    maxWidth: "md",
    spacing: "comfortable",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h2 style={{ marginBlockEnd: "1rem" }}>Medium Container (960px max)</h2>
      <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
        Perfect for documentation, articles, and standard content pages.
        Comfortable spacing provides breathing room.
      </p>
    </PageLayout>
  ),
};

export const LargeContainer: Story = {
  args: {
    maxWidth: "lg",
    spacing: "spacious",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h2 style={{ marginBlockEnd: "1rem" }}>Large Container (1200px max)</h2>
      <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
        Suitable for dashboards, product showcases, and multi-column layouts.
        Spacious vertical rhythm creates a premium feel.
      </p>
    </PageLayout>
  ),
};

export const ExtraLargeContainer: Story = {
  args: {
    maxWidth: "xl",
    spacing: "default",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h2 style={{ marginBlockEnd: "1rem" }}>
        Extra Large Container (1440px max)
      </h2>
      <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
        For wide desktop displays and complex layouts requiring more horizontal
        space.
      </p>
    </PageLayout>
  ),
};

export const FullWidth: Story = {
  args: {
    maxWidth: "full",
    spacing: "default",
    withMargins: false,
  },
  render: (args) => (
    <PageLayout {...args}>
      <div style={{ padding: "var(--space-layout-32)" }}>
        <h2 style={{ marginBlockEnd: "1rem" }}>Full Width Layout</h2>
        <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
          Spans the entire viewport width. Useful for hero sections, image
          galleries, or immersive experiences.
        </p>
      </div>
    </PageLayout>
  ),
};

export const CompactSpacing: Story = {
  args: {
    maxWidth: "md",
    spacing: "compact",
    withMargins: true,
  },
  render: (args) => (
    <PageLayout {...args}>
      <h2>Compact Spacing</h2>
      <p style={{ lineHeight: "var(--line-height-normal)" }}>
        Minimal vertical padding for dense interfaces or components that manage
        their own spacing.
      </p>
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
  args: {
    maxWidth: "xl",
    spacing: "default",
    grid: true,
    withMargins: true,
  },
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
        <h2 style={{ marginBlockEnd: "1rem" }}>Responsive Grid System</h2>
        <p style={{ lineHeight: "var(--line-height-relaxed)" }}>
          • Desktop (≥1024px): 12 columns with 32px gaps
          <br />
          • Tablet (768-1023px): 8 columns with 24px gaps
          <br />• Mobile (&lt;768px): 4 columns with 16px gaps
        </p>
      </div>
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 6" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
      <DemoContent gridColumn="span 4" />
    </PageLayout>
  ),
};
