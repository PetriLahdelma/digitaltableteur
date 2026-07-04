import Grid from "./Grid";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Grid.contract.json";

const defaultArgs = {
  columns: 2,
  gap: "1rem",
  children: (
    <>
      <div>
        <Text as="p" terminals="sans">
          Cell A
        </Text>
      </div>
      <div>
        <Text as="p" terminals="sans">
          Cell B
        </Text>
      </div>
      <div>
        <Text as="p" terminals="sans">
          Cell C
        </Text>
      </div>
      <div>
        <Text as="p" terminals="sans">
          Cell D
        </Text>
      </div>
    </>
  ),
};

const meta = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-grid",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Grid cells (supports span on child props)",
    },
    columns: { control: "number", description: "Column count or template" },
    rows: {
      control: "text",
      description: "Row count or template",
      table: { disable: true },
    },
    gap: {
      control: "text",
      description: "Grid gap",
      table: { defaultValue: { summary: "1rem" } },
    },
    rowGap: {
      control: "text",
      description: "Row gap override",
      table: { disable: true },
    },
    colGap: {
      control: "text",
      description: "Column gap override",
      table: { disable: true },
    },
    align: {
      control: "text",
      description: "align-items",
      table: { disable: true, defaultValue: { summary: "inherit" } },
    },
    justify: {
      control: "text",
      description: "justify-items",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Grid class names",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Grid columns={3} gap="1.5rem" style={{ maxWidth: 720 }}>
      <div>
        <Text as="p" terminals="sans">
          Services
        </Text>
      </div>
      <div>
        <Text as="p" terminals="sans">
          Work
        </Text>
      </div>
      <div>
        <Text as="p" terminals="sans">
          About
        </Text>
      </div>
    </Grid>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** Numeric columns make equal tracks — the workhorse card-wall setup. */
export const EqualTracks: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Numeric columns make equal tracks — the workhorse card-wall setup. Gaps take CSS strings; prefer space tokens." } },
  },
  render: () => (
    <Grid columns={3} gap="1rem">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Cell {i + 1}
        </div>
      ))}
    </Grid>
  ),
};

/** Grid. */
export const SpannedFeature: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Grid.Item with span promotes one child to a feature slot without touching the column template." } },
  },
  render: () => (
    <Grid columns={3} gap="1rem">
      <Grid.Item span={2}>
        <div style={{ border: "2px solid var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Featured (span 2)
        </div>
      </Grid.Item>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Cell
        </div>
      ))}
    </Grid>
  ),
};

/** A template string when tracks genuinely differ — sidebar plus content here. */
export const CustomTemplate: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "A template string when tracks genuinely differ — sidebar plus content here. Numbers for equal tracks, strings for everything else." } },
  },
  render: () => (
    <Grid columns="200px 1fr" gap="1rem">
      <div style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem" }}>Sidebar</div>
      <div style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem" }}>Content</div>
    </Grid>
  ),
};
