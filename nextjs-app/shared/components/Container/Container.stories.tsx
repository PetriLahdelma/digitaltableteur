import contract from "./Container.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";
import Text from "@dt/Text";

const meta: Meta<typeof Container> = {
  title: "Atoms/Container",
  component: Container,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },

    center: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    size: "lg",
    children: (
      <Text as="p" terminals="sans">
        Content constrained to the production max-width with responsive padding.
      </Text>
    ),
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
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
  args: Default.args,
};
