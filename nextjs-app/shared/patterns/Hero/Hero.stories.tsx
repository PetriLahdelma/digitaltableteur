import contract from "./Hero.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Hero from "./Hero";
import { ThemeProvider } from "@dt/ThemeProvider";
import { t } from "i18next";

const meta: Meta<typeof Hero> = {
  title: "Patterns/Hero",
  component: Hero,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-hero",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this complex pattern component
    },
    wip: { disabled: false }, // Keep WIP badge until a11y + visual verified
    docs: {
      description: {
        component:
          "Reusable hero pattern for page headers with title, subtitle, description, image, and CTA buttons. Supports multiple layout variants and background styles.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    title: { control: "text", description: "Hero title text (required)" },

    titleLevel: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6],
      description: "Semantic heading level for title",
    },

    subtitle: { control: "text", description: "Optional subtitle text" },

    description: { control: "text", description: "Optional body description" },

    imageSrc: { control: "text", description: "Hero image source URL" },

    imageAlt: {
      control: "text",
      description: "Image alt text for accessibility",
    },

    variant: {
      control: { type: "select" },
      options: ["default", "centered", "split", "minimal"],
      description: "Layout variant",
      table: { defaultValue: { summary: "default" } },
    },

    background: {
      control: { type: "select" },
      options: ["light", "dark", "gradient", "image"],
      description: "Background style",
    },

    align: {
      control: { type: "select" },
      options: ["left", "center", "right"],
      description: "Content alignment",
      table: { defaultValue: { summary: "center" } },
    },

    maxWidth: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Maximum content width",
    },

    spacing: {
      control: { type: "select" },
      options: ["compact", "default", "comfortable", "spacious"],
      description: "Vertical spacing",
    },
    actions: {
      description: "CTA buttons configuration",
      control: false,
      table: { disable: true },
    },
    imageWidth: {
      description: "Explicit image width (internal)",
      control: false,
      table: { disable: true },
    },
    imageHeight: {
      description: "Explicit image height (internal)",
      control: false,
      table: { disable: true },
    },
      ariaLabel: { control: "text", description: "ARIA label for hero section", table: { category: "Accessibility" } },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Custom CSS class for styling extensions", table: { category: "Advanced" } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;
type Story = StoryObj<typeof Hero>;

// Default Story
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    title: "Welcome to Digitaltableteur",
    subtitle: "Creative Development & Design",
    description:
      "Building digital experiences that combine aesthetic excellence with functional innovation. We specialize in design systems, web development, and brand strategy.",
    variant: "default",
    background: "light",
    align: "left",
    maxWidth: "lg",
    spacing: "comfortable",
  },
};

// Centered Layout
export const Centered: Story = {
  args: {
    title: "Centered Hero Layout",
    subtitle: "Perfect for Landing Pages",
    description:
      "This centered layout creates a focal point for your content with balanced alignment and clear visual hierarchy.",
    variant: "centered",
    background: "light",
    align: "center",
    maxWidth: "md",
    spacing: "spacious",
  },
};

// With CTA Buttons
export const WithActions: Story = {
  args: {
    title: "Get Started Today",
    subtitle: "Transform Your Digital Presence",
    description:
      "Join hundreds of successful projects and bring your vision to life with our expert team.",
    variant: "centered",
    background: "gradient",
    align: "center",
    maxWidth: "lg",
    spacing: "comfortable",
    actions: [
      {
        key: "start",
        label: "Start a Project",
        href: "/contact",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
      {
        key: "secondary",
        label: "View Our Work",
        href: "/work",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Split Layout with Image
export const SplitWithImage: Story = {
  args: {
    title: "Design That Speaks",
    subtitle: "Creative Excellence",
    description:
      "We craft digital experiences that tell your story through thoughtful design and seamless interaction.",
    imageSrc: "/placeholder.png",
    imageAlt: "Design portfolio showcase",
    variant: "split",
    background: "light",
    align: "left",
    maxWidth: "xl",
    spacing: "comfortable",
    actions: [
      {
        key: "explore",
        label: "Explore Projects",
        href: "/work",
        variant: "primary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Dark Background
export const DarkBackground: Story = {
  args: {
    title: "Premium Digital Solutions",
    subtitle: "Elevate Your Brand",
    description:
      "End-to-end digital services from strategy to execution. We help ambitious brands stand out in the digital landscape.",
    variant: "centered",
    background: "dark",
    align: "center",
    maxWidth: "lg",
    spacing: "spacious",
    actions: [
      {
        key: "contact",
        label: "Get in Touch",
        href: "/contact",
        variant: "primary",
        size: "l",
        inverse: true,
      },
      {
        key: "learn",
        label: "Learn More",
        href: "/about",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Gradient Background
export const GradientBackground: Story = {
  args: {
    title: "Innovation Meets Design",
    subtitle: "The Future of Digital",
    description:
      "Pushing boundaries with cutting-edge technology and creative vision. Let's build something extraordinary together.",
    variant: "centered",
    background: "gradient",
    align: "center",
    maxWidth: "md",
    spacing: "spacious",
    actions: [
      {
        key: "start",
        label: "Start Your Journey",
        href: "/contact",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Minimal Variant
export const Minimal: Story = {
  args: {
    title: "Simplicity in Design",
    description:
      "Sometimes less is more. This minimal hero focuses attention on your core message without distraction.",
    variant: "minimal",
    background: "light",
    align: "left",
    maxWidth: "md",
    spacing: "compact",
  },
};

// With Image Only (No Actions)
export const ImageOnly: Story = {
  args: {
    title: "Portfolio Showcase",
    subtitle: "Helsinki Design System",
    imageSrc: "/placeholder.png",
    imageAlt: "Helsinki Design System project showcase",
    variant: "default",
    background: "light",
    align: "left",
    maxWidth: "lg",
    spacing: "comfortable",
  },
};

// Right Aligned
export const RightAligned: Story = {
  args: {
    title: "Aligned to the Right",
    subtitle: "Alternative Layout Option",
    description:
      "Content can be aligned to the right for unique visual compositions and asymmetric layouts.",
    variant: "default",
    background: "light",
    align: "right",
    maxWidth: "lg",
    spacing: "comfortable",
    actions: [
      {
        key: "action",
        label: "Take Action",
        onClick: () => alert("Action clicked!"),
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    title: "Full Viewport Width",
    subtitle: "Maximum Impact",
    description:
      "Span the entire viewport for maximum visual impact. Perfect for immersive landing pages and hero sections.",
    variant: "centered",
    background: "gradient",
    align: "center",
    maxWidth: "full",
    spacing: "spacious",
    actions: [
      {
        key: "cta",
        label: "Explore More",
        href: "/work",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Small Width (Article Hero)
export const SmallWidth: Story = {
  args: {
    title: "Blog Article Title",
    subtitle: "Published December 3, 2025",
    description:
      "Narrower width perfect for blog articles and long-form content where readability is paramount.",
    variant: "default",
    background: "light",
    align: "left",
    maxWidth: "sm",
    spacing: "comfortable",
  },
};

// Compact Spacing
export const CompactSpacing: Story = {
  args: {
    title: "Compact Vertical Spacing",
    subtitle: "Dense Layout",
    description: "Reduced vertical spacing for content-heavy pages.",
    variant: "minimal",
    background: "light",
    align: "left",
    maxWidth: "md",
    spacing: "compact",
  },
};

// Spacious Layout
export const SpaciousLayout: Story = {
  args: {
    title: "Generous Spacing",
    subtitle: "Breathing Room",
    description:
      "Ample vertical spacing creates a sense of luxury and allows content to breathe.",
    variant: "centered",
    background: "light",
    align: "center",
    maxWidth: "lg",
    spacing: "spacious",
  },
};

// Multiple Actions
export const MultipleActions: Story = {
  args: {
    title: "Choose Your Path",
    subtitle: "Multiple Call-to-Actions",
    description:
      "Provide users with multiple entry points to different sections of your site or application.",
    variant: "centered",
    background: "dark",
    align: "center",
    maxWidth: "lg",
    spacing: "comfortable",
    actions: [
      {
        key: "primary",
        label: "Primary Action",
        href: "/contact",
        variant: "primary",
        size: "l",
        inverse: true,
      },
      {
        key: "secondary",
        label: "Secondary Action",
        href: "/about",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
      {
        key: "tertiary",
        label: "Tertiary Action",
        href: "/blog",
        variant: "tertiary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Split with Right-Side Image
export const SplitImageRight: Story = {
  args: {
    title: "Content on the Left",
    subtitle: "Image on the Right",
    description:
      "The split layout naturally places content on the left and image on the right in the DOM order, creating a balanced composition.",
    imageSrc: "/placeholder.png",
    imageAlt: "Visual showcase",
    variant: "split",
    background: "light",
    align: "left",
    maxWidth: "xl",
    spacing: "comfortable",
  },
};

// Real-World Example: Portfolio Project
export const PortfolioProject: Story = {
  args: {
    title: "Helsinki Design System",
    subtitle: "Design System · 2024",
    description:
      "A comprehensive design system for the city of Helsinki, featuring accessible components, design tokens, and documentation.",
    imageSrc: "/placeholder.png",
    imageAlt: "Helsinki Design System showcase",
    variant: "split",
    background: "light",
    align: "left",
    maxWidth: "xl",
    spacing: "comfortable",
    actions: [
      {
        key: "view",
        label: "View Case Study",
        href: "/work/helsinki-design-system",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
      {
        key: "visit",
        label: "Visit Live Site",
        href: "https://example.com",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

// Real-World Example: Service Landing
export const ServiceLanding: Story = {
  args: {
    title: "Brand Strategy & Identity",
    subtitle: "Stand Out in a Crowded Market",
    description:
      "We help businesses define their unique voice and visual identity. From strategy to execution, we create brands that resonate.",
    variant: "centered",
    background: "gradient",
    align: "center",
    maxWidth: "lg",
    spacing: "spacious",
    actions: [
      {
        key: "consult",
        label: "Book Free Consultation",
        href: "/contact",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
      {
        key: "portfolio",
        label: "See Our Work",
        href: "/work",
        variant: "secondary",
        size: "l",
        inverse: true,
      },
    ],
  },
};

export const Playground = Default;
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
