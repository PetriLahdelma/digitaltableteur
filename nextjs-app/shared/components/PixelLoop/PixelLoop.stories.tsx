import type { Meta, StoryObj } from "@storybook/react-vite";
import { PixelLoop } from "./PixelLoop";
import contract from "./PixelLoop.contract.json";

const meta = {
  title: "Display/PixelLoop",
  component: PixelLoop,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    design: {
      type: "figma",
      url: contract.figma,
    },
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  tags: ["alpha", "!autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Glyph and gap scale.",
      table: {
        defaultValue: { summary: "md" },
        category: "Appearance",
      },
    },
    animate: {
      control: "boolean",
      description: "Runs the discrete six-frame perimeter orbit.",
      table: {
        defaultValue: { summary: "true" },
        category: "Motion",
      },
    },
    variant: {
      control: "radio",
      options: ["dots", "strokes"],
      description: "Rounded dots or 45-degree vector strokes.",
      table: {
        defaultValue: { summary: "dots" },
        category: "Appearance",
      },
    },
    rows: {
      control: "radio",
      options: [1, 2, 3],
      description: "One, two, or three rows of three 5x5 glyph grids.",
      table: {
        defaultValue: { summary: "2" },
        category: "Layout",
      },
    },
    className: { table: { disable: true } },
  },
  args: {
    animate: true,
    rows: 2,
    size: "md",
    variant: "dots",
  },
} satisfies Meta<typeof PixelLoop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "grid",
        minInlineSize: "min(42rem, 85vw)",
        minBlockSize: "20rem",
        placeItems: "center",
        background: "var(--color-surface)",
        color: "var(--color-text)",
      }}
    >
      <PixelLoop size="lg" />
    </div>
  ),
};

export const Paused: Story = {
  args: { animate: false },
  parameters: {
    docs: {
      description: {
        story:
          "Static first frame used when motion is intentionally disabled. Reduced-motion preferences produce the same result.",
      },
    },
  },
};

export const OneRow: Story = {
  args: { rows: 1, size: "lg" },
  parameters: {
    docs: {
      description: {
        story:
          "Three 5x5 glyph grids in one row, cycling horizontally on a 600ms loop.",
      },
    },
  },
};

export const ThreeRows: Story = {
  args: { rows: 3 },
  parameters: {
    docs: {
      description: {
        story:
          "Nine 5x5 glyph grids across three rows, with each row offset by one animation beat.",
      },
    },
  },
};

export const VectorStrokes: Story = {
  args: { size: "lg", variant: "strokes" },
  parameters: {
    docs: {
      description: {
        story:
          "An alternate drawing language made from short, round-capped vector strokes set at 45 degrees.",
      },
    },
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-layout-48)",
      }}
    >
      <PixelLoop size="sm" />
      <PixelLoop rows={1} size="md" variant="strokes" />
      <PixelLoop rows={3} size="lg" />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: {
    docs: {
      description: {
        story:
          "The loop inherits CanvasText so every glyph remains visible when author colors are replaced.",
      },
    },
  },
};
