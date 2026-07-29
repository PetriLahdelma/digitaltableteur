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
      description: "Runs the discrete cross-fade through the glyph pool.",
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
    cycle: {
      control: "boolean",
      description:
        "One row, one column: a single cell that steps through the whole glyph pool one formation at a time. Ignores rows.",
      table: {
        defaultValue: { summary: "false" },
        category: "Layout",
      },
    },
    className: { table: { disable: true } },
  },
  args: {
    animate: true,
    cycle: false,
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
          "One row of three cells; each cross-fades through its own slice of the pool, so the three show different glyphs at once.",
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
          "Nine cells across three rows, each cross-fading through its own slice of the pool on a staggered wave.",
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

export const SingleColumn: Story = {
  args: { cycle: true, size: "lg" },
  parameters: {
    docs: {
      description: {
        story:
          "One row, one column. A single glyph cell steps through the whole pool one formation at a time, starting with the D and T initials.",
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
