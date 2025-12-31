import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HighlightSection from "./HighlightSection";

const meta: Meta<typeof HighlightSection> = {
  title: "Patterns/HighlightSection",
  component: HighlightSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A reusable call-to-action section component with gradient, pattern, or solid backgrounds. Designed for showcasing key actions or downloads.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Main headline text for the section",
    },
    overline: {
      control: "text",
      description: "Optional small text above the title",
    },
    description: {
      control: "text",
      description: "Supporting description text",
    },
    variant: {
      control: "select",
      options: ["gradient", "pattern", "solid"],
      description: "Background style variant",
    },
    size: {
      control: "radio",
      options: ["compact", "comfortable", "spacious"],
      description: "Section spacing size",
    },
    cta: {
      control: "object",
      description: "Call-to-action button configuration",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
    ariaLabel: {
      control: "text",
      description: "ARIA label for screen readers",
    },
  },
};

export default meta;
type Story = StoryObj<typeof HighlightSection>;

/**
 * Default HighlightSection with pattern background (inspired by Figma export)
 */
export const Default: Story = {
  args: {
    title: "Download my component schema template for GenAI Design System creation",
    description:
      "Supercharge your AI driven design system and guide it to deliver everything up-to-spec. Ensure all new components are following the same prop structure, naming and brand.",
    cta: {
      label: "Download Schema",
      onClick: () => alert("Download initiated!"),
    },
    variant: "pattern",
    size: "comfortable",
  },
};

/**
 * Gradient background variant
 */
export const GradientVariant: Story = {
  args: {
    ...Default.args,
    variant: "gradient",
  },
};

/**
 * Solid background variant
 */
export const SolidVariant: Story = {
  args: {
    ...Default.args,
    variant: "solid",
  },
};

/**
 * Compact size with less padding
 */
export const CompactSize: Story = {
  args: {
    ...Default.args,
    size: "compact",
    title: "Quick Action Section",
    description: "A more compact version for tighter layouts.",
  },
};

/**
 * Spacious size with generous padding
 */
export const SpaciousSize: Story = {
  args: {
    ...Default.args,
    size: "spacious",
    title: "Premium Feature Showcase",
    description:
      "A spacious layout perfect for hero sections or premium feature highlights.",
  },
};

/**
 * With overline text
 */
export const WithOverline: Story = {
  args: {
    ...Default.args,
    overline: "New Release",
    title: "Design System 2.0 is Here",
    description:
      "Experience the next generation of our design system with enhanced accessibility and performance.",
  },
};

/**
 * CTA with external link
 */
export const WithExternalLink: Story = {
  args: {
    ...Default.args,
    title: "Explore Our Documentation",
    description:
      "Comprehensive guides and API references for building with our design system.",
    cta: {
      label: "View Docs",
      href: "https://digitaltableteur.com",
      target: "_blank",
    },
  },
};

/**
 * Without CTA button
 */
export const WithoutCTA: Story = {
  args: {
    title: "Information Section",
    description:
      "Sometimes you just need to communicate information without a call-to-action.",
    variant: "gradient",
    size: "comfortable",
  },
};

/**
 * Short content example
 */
export const ShortContent: Story = {
  args: {
    title: "Subscribe Now",
    description: "Get the latest updates delivered to your inbox.",
    cta: {
      label: "Subscribe",
      onClick: () => alert("Subscription form opened"),
    },
    variant: "solid",
    size: "compact",
  },
};

/**
 * Long content example
 */
export const LongContent: Story = {
  args: {
    overline: "Comprehensive Guide",
    title:
      "Everything You Need to Know About Building Accessible, Performant, and Beautiful User Interfaces",
    description:
      "Our design system provides a comprehensive set of reusable components, design tokens, and guidelines that help you build consistent, accessible, and high-performance user interfaces. With support for multiple themes, internationalization, and responsive design out of the box, you can focus on creating amazing user experiences without worrying about the underlying infrastructure. The system is built with modern web standards and follows industry best practices for accessibility and performance.",
    cta: {
      label: "Get Started Today",
      onClick: () => alert("Onboarding started"),
    },
    variant: "gradient",
    size: "spacious",
  },
};

/**
 * Kitchen Sink - All variants displayed together
 */
export const KitchenSink: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <HighlightSection
        title="Pattern Variant"
        description="Default pattern background with dot grid."
        variant="pattern"
        size="compact"
        cta={{ label: "Action", onClick: () => {} }}
      />
      <HighlightSection
        title="Gradient Variant"
        description="Smooth gradient background effect."
        variant="gradient"
        size="compact"
        cta={{ label: "Action", onClick: () => {} }}
      />
      <HighlightSection
        title="Solid Variant"
        description="Clean solid background color."
        variant="solid"
        size="compact"
        cta={{ label: "Action", onClick: () => {} }}
      />
    </div>
  ),
};
