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
  title: "Atoms/Grid",
  component: Grid,
  tags: ["beta", "!autodocs"],
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
