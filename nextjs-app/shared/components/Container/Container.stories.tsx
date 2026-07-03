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
  title: "Layout/Container",
  component: Container,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-container",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Page content inside the width constraint",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Max-width token",
      table: { defaultValue: { summary: "lg" } },
    },
    center: {
      control: "boolean",
      description: "Center the container horizontally",
    },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic element",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Container>;

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
    <Container size="lg">
      <Text as="p" terminals="sans">
        Canonical page gutter — matches marketing and app shells.
      </Text>
    </Container>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
