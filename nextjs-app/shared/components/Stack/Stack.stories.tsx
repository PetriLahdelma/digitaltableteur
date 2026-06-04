import { Stack } from "./Stack";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Stack.contract.json";

const defaultArgs = {
  direction: "vertical" as const,
  gap: "md" as const,
  children: (
    <>
      <Text as="p" terminals="sans">
        First item
      </Text>
      <Text as="p" terminals="sans">
        Second item
      </Text>
    </>
  ),
};

const meta = {
  title: "Atoms/Stack",
  component: Stack,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-stack",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Stacked children" },
    direction: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Stack axis",
      table: { defaultValue: { summary: "vertical" } },
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Gap token between items",
      table: { defaultValue: { summary: "md" } },
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Cross-axis alignment",
      table: { defaultValue: { summary: "center" } },
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
      description: "Main-axis distribution",
    },
    wrap: {
      control: "boolean",
      description: "Allow wrapping on horizontal stacks",
    },
    className: {
      control: "text",
      description: "Stack class names",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic element",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Stack>;

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
    <Stack direction="vertical" gap="sm">
      <Text as="p" terminals="sans">
        Hero copy block
      </Text>
      <Text as="p" terminals="sans">
        Supporting line with consistent spacing
      </Text>
    </Stack>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
