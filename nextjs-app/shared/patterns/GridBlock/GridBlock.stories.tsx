import contract from "./GridBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import GridBlock from "./GridBlock";
import Text from "@dt/Text";

const meta: Meta<typeof GridBlock> = {
  title: "Patterns/GridBlock",
  component: GridBlock,
  tags: ["beta", "!autodocs"],
  parameters: {
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
            <Text size="L">Design Philosophy</Text>
            <Text size="S">
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
            <Text size="L">Development Process</Text>
            <Text size="S">
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
            <Text size="L">Mobile-First Design</Text>
            <Text size="S">
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
            <Text size="L">Responsive Excellence</Text>
            <Text size="S">
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
            <Text size="XL">Project Overview</Text>
            <Text size="M">
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
            <Text size="L">Research Phase</Text>
            <Text size="S">
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
            <Text size="M">Discover</Text>
            <Text size="S">
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
            <Text size="M">Define</Text>
            <Text size="S">
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
            <Text size="M">Deliver</Text>
            <Text size="S">
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
            <Text size="L">Seamless Layout</Text>
            <Text size="S">
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
            <Text size="L">Flexible Spacing</Text>
            <Text size="S">
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
            <Text size="S">Compact design for tight layouts</Text>
          </>
        ),
      },
      {
        type: "text",
        innerPadding: true,
        content: (
          <>
            <Text size="S">Minimal spacing between elements</Text>
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
            <Text size="L">Component Architecture</Text>
            <Text size="S">
              A well-structured component library ensures consistency and
              maintainability across the entire design system.
            </Text>
            <Text size="S">
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
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = { globals: { forcedColors: "active" }, ...Default };
