import type { Meta, StoryObj } from "@storybook/react-vite";
import Progress from "./Progress";
import Text from "@dt/Text";
import contract from "./Progress.contract.json";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=369-15",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // value/max keep bespoke bounded knobs (range with sane limits beats a bare
  // number field for a 0..max quantity).
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Maximum value",
    },
  },
  args: {
    value: 45,
    max: 100,
    label: "Upload progress",
    size: "md",
    state: "info",
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

/** Known completion: value against max drives the fill. */
export const Determinate: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Measurable work: value against max (default 100) scales the fill; aria-valuenow tracks it for assistive tech.",
      },
    },
  },
  render: () => (
    <div style={{ inlineSize: "min(20rem, 100%)" }}>
      <Progress value={45} label="Upload progress" />
    </div>
  ),
};

/** Unknown duration: a sweeping bar instead of a fill. */
export const Indeterminate: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Unknown duration: the bar sweeps instead of filling and aria-valuenow is omitted. Reduced motion slows the sweep rather than freezing it.",
      },
    },
  },
  render: () => (
    <div style={{ inlineSize: "min(20rem, 100%)" }}>
      <Progress indeterminate label="Loading panel" />
    </div>
  ),
};

/** Compose a visible label and value with Text; the bar alone shows proportion, not numbers. */
export const WithLabel: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "When precision matters, compose a visible Text label and value above the bar; the label prop still names the work for assistive tech.",
      },
    },
  },
  render: () => (
    <div style={{ inlineSize: "min(20rem, 100%)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBlockEnd: "0.25rem",
        }}
      >
        <Text size="s">
          Uploading portfolio.pdf
        </Text>
        <Text size="s">
          72%
        </Text>
      </div>
      <Progress value={72} label="Uploading portfolio.pdf" />
    </div>
  ),
};

/** Track heights: sm, md, lg. */
export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Three track heights. sm suits dense UI (table rows, cards); lg reads at page level.",
      },
    },
  },
  render: () => (
    <div
      style={{
        inlineSize: "min(20rem, 100%)",
        display: "grid",
        gap: "0.75rem",
      }}
    >
      <Progress value={60} size="sm" label="Small track" />
      <Progress value={60} size="md" label="Medium track" />
      <Progress value={60} size="lg" label="Large track" />
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Completion state in context: a finished measure recolored with state=success.",
      },
    },
  },
  render: () => (
    <div style={{ inlineSize: "min(20rem, 100%)" }}>
      <Progress value={72} state="success" label="Profile completeness" />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
