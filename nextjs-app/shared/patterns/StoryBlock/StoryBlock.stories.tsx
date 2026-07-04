import contract from "./StoryBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import StoryBlock from "./StoryBlock";
import Text from "@dt/Text";

const meta: Meta<typeof StoryBlock> = {
  title: "Patterns/StoryBlock",
  component: StoryBlock,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-story-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // composite-slot mapping presets live on the Playground story below.
};

export default meta;
type Story = StoryObj<typeof StoryBlock>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    subtitle: "Project Overview",
    title: "Building a Design System",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>
          Creating a comprehensive design system
        </span>{" "}
        requires careful planning, collaboration across teams, and a deep
        understanding of user needs and technical constraints.
      </Text>,
      <Text key="2" size="s">
        This project involved extensive research, stakeholder workshops, and
        iterative development to establish a scalable foundation for digital
        products.
      </Text>,
    ],
    imageLayout: "none",
    backgroundColor: "transparent",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const WithSingleImage: Story = {
  args: {
    subtitle: "Discovery Process",
    title: "Research and Analysis",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>The initial phase</span> focused on
        understanding the current state through stakeholder interviews, user
        research, and competitive analysis.
      </Text>,
      <Text key="2" size="s">
        Insights gathered during this phase informed the strategic direction and
        helped prioritize features for the minimum viable product.
      </Text>,
    ],
    images: {
      src: "/images/portfolio/helsinki-design-system/component-structure.png",
      alt: "System architecture diagram",
      width: 3934,
      height: 1816,
      caption: "Component structure and contribution workflow",
      mixBlendMode: "multiply",
    },
    imageLayout: "single",
    backgroundColor: "light",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const WithImageGrid: Story = {
  args: {
    subtitle: "Design Process",
    title: "Ideation and Prototyping",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>Collaborative workshops</span> brought
        together designers, developers, and stakeholders to explore different
        approaches and validate assumptions early in the process.
      </Text>,
      <Text key="2" size="s">
        Multiple concepts were prototyped and tested with real users to identify
        the most effective solutions before committing to full development.
      </Text>,
    ],
    images: [
      {
        src: "/images/portfolio/helsinki-design-system/research.png",
        alt: "Research findings and insights",
        width: 738,
        height: 506,
        caption: "Post-it findings from research sessions",
      },
      {
        src: "/images/portfolio/helsinki-design-system/goal-setting.png",
        alt: "Goal setting workshop",
        width: 738,
        height: 506,
        caption: "Benchmarking and goal-setting workshop",
      },
    ],
    imageLayout: "grid",
    backgroundColor: "transparent",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const TextOnly: Story = {
  args: {
    subtitle: "Implementation",
    title: "Development and Testing",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>The development phase</span> involved
        building reusable components, establishing coding standards, and
        creating comprehensive documentation for the team.
      </Text>,
      <Text key="2" size="s">
        Each component underwent rigorous testing for accessibility,
        performance, and cross-browser compatibility before being released to
        production.
      </Text>,
      <Text key="3" size="s">
        Continuous integration and deployment pipelines ensured that updates
        could be shipped quickly and reliably without disrupting existing
        services.
      </Text>,
    ],
    imageLayout: "none",
    backgroundColor: "light",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const WithLightBackground: Story = {
  args: {
    subtitle: "User Testing",
    title: "Validation and Refinement",
    content: [
      <Text key="1" size="s">
        User testing sessions revealed critical insights about navigation
        patterns, content hierarchy, and interaction preferences that shaped the
        final design.
      </Text>,
      <Text key="2" size="s">
        Iterative refinements based on real user feedback ensured the system met
        actual user needs rather than assumptions.
      </Text>,
    ],
    images: [
      {
        src: "/images/portfolio/helsinki-design-system/journey-map.png",
        alt: "User journey mapping",
        width: 738,
        height: 506,
        caption: "Persona creation illustration",
      },
      {
        src: "/images/portfolio/helsinki-design-system/prototype-detail.png",
        alt: "Prototype detail view",
        width: 738,
        height: 506,
        caption: "Journey mapping at a design workshop",
      },
    ],
    imageLayout: "grid",
    backgroundColor: "light",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const WideLayout: Story = {
  args: {
    subtitle: "Technical Architecture",
    title: "System Infrastructure",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>The technical foundation</span> was
        built on modern frameworks and tools that prioritize performance,
        maintainability, and developer experience.
      </Text>,
      <Text key="2" size="s">
        Modular architecture allows teams to adopt components incrementally
        while maintaining consistency across different projects and platforms.
      </Text>,
    ],
    images: {
      src: "/images/portfolio/helsinki-design-system/wireframes.png",
      alt: "System wireframes",
      width: 1204,
      height: 538,
      caption: "Early frontpage and information architecture wireframes",
      mixBlendMode: "multiply",
    },
    imageLayout: "single",
    backgroundColor: "transparent",
    maxWidth: "lg",
    spacing: "spacious",
  },
};

export const CompactSpacing: Story = {
  args: {
    subtitle: "Quick Overview",
    title: "Project Summary",
    content: [
      <Text key="1" size="s">
        A brief introduction to the project with compact spacing for dense
        content layouts.
      </Text>,
    ],
    imageLayout: "none",
    backgroundColor: "white",
    maxWidth: "sm",
    spacing: "compact",
  },
};

export const FullWidth: Story = {
  args: {
    subtitle: "Case Study",
    title: "Comprehensive Project Documentation",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>Full-width layouts</span> provide
        maximum space for content and images, ideal for detailed case studies
        and portfolio pieces.
      </Text>,
      <Text key="2" size="s">
        This format works particularly well for projects that require extensive
        visual documentation and detailed narrative explanations.
      </Text>,
    ],
    images: {
      src: "/images/portfolio/helsinki-design-system/components-page.png",
      alt: "Components page overview",
      width: 1184,
      height: 500,
      caption: "The Helsinki Design System components page",
      mixBlendMode: "multiply",
    },
    imageLayout: "single",
    backgroundColor: "light",
    maxWidth: "full",
    spacing: "spacious",
  },
};

export const MultipleImagesSingleLayout: Story = {
  args: {
    subtitle: "Visual Documentation",
    title: "Design Evolution",
    content: [
      <Text key="1" size="s">
        Even with multiple images in a single-column layout, content remains
        clear and easy to follow.
      </Text>,
    ],
    images: [
      {
        src: "/images/portfolio/helsinki-design-system/research.png",
        alt: "Research phase",
        width: 738,
        height: 506,
        caption: "Initial research findings",
      },
      {
        src: "/images/portfolio/helsinki-design-system/wireframes.png",
        alt: "Wireframe stage",
        width: 1204,
        height: 538,
        caption: "Low-fidelity wireframes",
        mixBlendMode: "multiply",
      },
    ],
    imageLayout: "single",
    backgroundColor: "transparent",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

export const RichContent: Story = {
  args: {
    subtitle: "Design Process",
    title: "Conclusion",
    content: [
      <Text key="1" size="s">
        <span style={{ fontWeight: 600 }}>The Helsinki Design System</span>{" "}
        represents a comprehensive, user-centered effort to unify and elevate
        the quality of digital services across the City of Helsinki.
      </Text>,
      <Text key="2" size="s">
        Through rigorous research, collaborative ideation, wireframing and an
        iterative component development pipeline, HDS establishes a foundation
        that is both accessible and scalable.
      </Text>,
      <Text key="3" size="s">
        The system enables teams throughout the city to build services that are
        consistent, intuitive, and aligned with Helsinki's values of equality,
        transparency, and inclusion.
      </Text>,
    ],
    imageLayout: "none",
    backgroundColor: "light",
    maxWidth: "md",
    spacing: "comfortable",
  },
};

// images seeded + imageLayout "single" so the image props have a live path.
export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    content: {
      control: { type: "select" },
      options: ["twoParagraphs", "oneParagraph"],
      mapping: {
        twoParagraphs: Default.args!.content,
        oneParagraph: Default.args!.content!.slice(0, 1),
      },
      description:
        "Story paragraphs (React nodes). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode[]" } },
    },
    images: {
      control: { type: "select" },
      options: ["none", "single"],
      mapping: {
        none: undefined,
        single: {
          src: "/images/portfolio/helsinki-design-system/component-structure.png",
          alt: "Component structure diagram",
        },
      },
      description:
        "Image or images to display. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "StoryImage | StoryImage[]" } },
    },
  },
  args: {
    ...Default.args,
    content: "twoParagraphs" as never,
    images: "single" as never,
    imageLayout: "single",
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
