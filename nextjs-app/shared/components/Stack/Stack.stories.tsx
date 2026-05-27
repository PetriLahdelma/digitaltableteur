import contract from "./Stack.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack";
import Text from "@dt/Text";

const meta: Meta<typeof Stack> = {
  title: "Atoms/Stack",
  component: Stack,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    direction: { control: "radio", options: ["vertical", "horizontal"] },

    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },

    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
    },

    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
    },

    wrap: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    direction: "vertical",
    gap: "md",
    children: (
      <>
        <Text as="p" terminals="sans">
          First block
        </Text>
        <Text as="p" terminals="sans">
          Second block
        </Text>
      </>
    ),
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction="vertical" gap="md">
      <Text as="p" terminals="sans">
        Stack rhythm used in HomeHero and forms.
      </Text>
      <Text as="p" terminals="sans">
        Tokenized gaps — no magic margins.
      </Text>
    </Stack>
  ),
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  ...Default,
};
