import FlexBox from "./FlexBox";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./FlexBox.contract.json";

const defaultArgs = {
  direction: "row" as const,
  gap: "1rem",
  align: "center" as const,
  children: (
    <>
      <Text as="span" terminals="sans">
        Alpha
      </Text>
      <Text as="span" terminals="sans">
        Beta
      </Text>
      <Text as="span" terminals="sans">
        Gamma
      </Text>
    </>
  ),
};

const meta = {
  title: "Layout/FlexBox",
  component: FlexBox,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-flex-box",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Flex items" },
    direction: {
      control: "select",
      options: ["row", "row-reverse", "column", "column-reverse"],
      description: "flex-direction",
      table: { defaultValue: { summary: "row" } },
    },
    wrap: {
      control: "select",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "flex-wrap",
      table: { defaultValue: { summary: "nowrap" } },
    },
    justify: {
      control: "select",
      options: [
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      description: "justify-content",
    },
    align: {
      control: "select",
      options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
      description: "align-items",
      table: { defaultValue: { summary: "stretch" } },
    },
    gap: { control: "text", description: "Shorthand gap" },
    rowGap: {
      control: "text",
      description: "Row gap override",
      table: { disable: true },
    },
    columnGap: {
      control: "text",
      description: "Column gap override",
      table: { disable: true },
    },
    alignContent: {
      control: "text",
      description: "align-content",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    style: {
      control: "object",
      description: "Inline style override",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FlexBox>;

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
    <FlexBox
      direction="column"
      gap="0.75rem"
      align="stretch"
      style={{ maxWidth: 320 }}
    >
      <Text as="p" terminals="sans">
        Stacked editorial row
      </Text>
      <Text as="p" terminals="sans">
        Second line with deliberate rhythm
      </Text>
    </FlexBox>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
