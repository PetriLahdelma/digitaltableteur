import contract from "./GridBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import GridBlock from "./GridBlock";
import Text from "@dt/Text";

const meta: Meta<typeof GridBlock> = {
  title: "Patterns/GridBlock",
  component: GridBlock,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-grid-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this complex pattern component
    },
  },
  argTypes: {
    cells: {
      description: "Grid cell definitions (text or image)",
      control: false,
      table: { disable: true },
    },

    columns: {
      control: { type: "select" },
      options: [1, 2, 3, 4],
      description: "Number of columns in the grid",
    },

    gap: {
      control: { type: "select" },
      options: ["none", "small", "medium", "large"],
      description: "Gap between grid cells",
    },

    backgroundColor: {
      control: { type: "select" },
      options: ["light", "white", "transparent"],
      description: "Background color variant",
    },

    maxWidth: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Maximum width constraint",
    },

    spacing: {
      control: { type: "select" },
      options: ["compact", "default", "comfortable", "spacious"],
      description: "Spacing variant",
    },
      as: { control: { type: "inline-radio" }, options: ["section", "div", "article"], description: "Semantic HTML element to use", table: { category: "Advanced" } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Additional CSS class", table: { category: "Advanced" } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;
type Story = StoryObj<typeof GridBlock>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    columns: 2,
    gap: "medium",
    backgroundColor: "transparent",
    maxWidth: "md",
    spacing: "comfortable",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Design Philosophy</Text>
            <Text size="s">
              Our approach combines user-centered design with technical
              excellence to create meaningful digital experiences that solve
              real problems.
            </Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Development Process</Text>
            <Text size="s">
              We follow an iterative methodology that emphasizes collaboration,
              testing, and continuous improvement throughout the development
              lifecycle.
            </Text>
          </>
        ),
      },
    ],
  },
};

export const TextAndImages: Story = {
  args: {
    columns: 2,
    gap: "none",
    backgroundColor: "transparent",
    maxWidth: "md",
    spacing: "comfortable",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Mobile-First Design</Text>
            <Text size="s">
              Every interface is crafted with mobile users in mind, ensuring
              seamless experiences across all device sizes and contexts.
            </Text>
          </>
        ),
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/phonemock.png",
        alt: "Mobile interface example",
        width: 1184,
        height: 500,
        mixBlendMode: "multiply",
        caption: "Mobile interface example",
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/lappymock.png",
        alt: "Desktop interface example",
        width: 1184,
        height: 500,
        mixBlendMode: "multiply",
        caption: "Desktop interface example",
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Responsive Excellence</Text>
            <Text size="s">
              Interfaces adapt intelligently to different screen sizes,
              maintaining usability and aesthetic quality across platforms.
            </Text>
          </>
        ),
      },
    ],
  },
};

export const SingleColumn: Story = {
  args: {
    columns: 1,
    gap: "medium",
    backgroundColor: "light",
    maxWidth: "lg",
    spacing: "comfortable",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="xl">Project Overview</Text>
            <Text size="m">
              This comprehensive case study explores the design and development
              process behind a major digital transformation initiative.
            </Text>
          </>
        ),
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/wireframes.png",
        alt: "Project wireframes",
        width: 1204,
        height: 538,
        mixBlendMode: "multiply",
        caption: "Early wireframes and information architecture",
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Research Phase</Text>
            <Text size="s">
              Initial research involved stakeholder interviews, user testing,
              and competitive analysis to establish a solid foundation for the
              project.
            </Text>
          </>
        ),
      },
    ],
  },
};

export const ImagesOnly: Story = {
  args: {
    columns: 2,
    gap: "small",
    backgroundColor: "white",
    maxWidth: "lg",
    spacing: "default",
    cells: [
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/research.png",
        alt: "Research findings",
        width: 738,
        height: 506,
        caption: "Research and discovery phase",
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/goal-setting.png",
        alt: "Goal setting workshop",
        width: 738,
        height: 506,
        caption: "Collaborative goal setting",
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/journey-map.png",
        alt: "User journey map",
        width: 738,
        height: 506,
        caption: "User journey mapping",
      },
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/prototype-detail.png",
        alt: "Prototype detail",
        width: 738,
        height: 506,
        caption: "High-fidelity prototype",
      },
    ],
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: "medium",
    backgroundColor: "transparent",
    maxWidth: "xl",
    spacing: "comfortable",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="m">Discover</Text>
            <Text size="s">
              Research and understand user needs through interviews and
              analysis.
            </Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="m">Define</Text>
            <Text size="s">
              Synthesize insights to define problems and opportunities.
            </Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="m">Deliver</Text>
            <Text size="s">
              Build, test, and iterate on solutions with real users.
            </Text>
          </>
        ),
      },
    ],
  },
};

export const NoGap: Story = {
  args: {
    columns: 2,
    gap: "none",
    backgroundColor: "light",
    maxWidth: "md",
    spacing: "comfortable",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Seamless Layout</Text>
            <Text size="s">
              Content blocks can be arranged without gaps for a more compact,
              unified appearance.
            </Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Flexible Spacing</Text>
            <Text size="s">
              The gap property controls spacing between cells, with options from
              none to large.
            </Text>
          </>
        ),
      },
    ],
  },
};

export const CompactSpacing: Story = {
  args: {
    columns: 2,
    gap: "small",
    backgroundColor: "white",
    maxWidth: "sm",
    spacing: "compact",
    cells: [
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="s">Compact design for tight layouts</Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="s">Minimal spacing between elements</Text>
          </>
        ),
      },
    ],
  },
};

export const MixedContent: Story = {
  args: {
    columns: 2,
    gap: "medium",
    backgroundColor: "light",
    maxWidth: "lg",
    spacing: "comfortable",
    cells: [
      {
        type: "image",
        src: "/images/portfolio/helsinki-design-system/component-structure.png",
        alt: "Component structure diagram",
        width: 3934,
        height: 1816,
        caption: "System architecture overview",
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="l">Component Architecture</Text>
            <Text size="s">
              A well-structured component library ensures consistency and
              maintainability across the entire design system.
            </Text>
            <Text size="s">
              Each component is built with accessibility, performance, and
              reusability in mind.
            </Text>
          </>
        ),
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
