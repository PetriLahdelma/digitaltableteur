import { Container } from "./Container";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Container.contract.json";

const defaultArgs = {
  size: "lg" as const,
  center: true,
  children: (
    <Text as="p" terminals="sans">
      Content constrained to the production max-width with responsive padding.
    </Text>
  ),
};

const meta = {
  title: "Atoms/Container",
  component: Container,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Page content inside the width constraint" },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Max-width token",
      table: { defaultValue: { summary: "lg" } },
    },
    center: { control: "boolean", description: "Center the container horizontally" },
    className: { control: "text", description: "Wrapper class names", table: { disable: true } },
    as: { control: "text", description: "Polymorphic element", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };


export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Container size="lg">
      <Text as="p" terminals="sans">
        Canonical page gutter — matches marketing and app shells.
      </Text>
    </Container>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
