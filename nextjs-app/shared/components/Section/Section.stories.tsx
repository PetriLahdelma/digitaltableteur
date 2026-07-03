import { Section } from "./Section";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Section.contract.json";

const defaultArgs = {
  spacing: "md" as const,
  background: "default" as const,
  children: (
    <Text as="p" terminals="sans">
      Semantic section with tokenized vertical spacing.
    </Text>
  ),
};

const meta = {
  title: "Layout/Section",
  component: Section,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-section",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Section content" },
    spacing: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl", "hero", "follow"],
      description: "Block padding scale",
      table: { defaultValue: { summary: "md" } },
    },
    background: {
      control: "select",
      options: ["default", "muted", "accent", "inverse"],
      description: "Surface background token",
      table: { defaultValue: { summary: "default" } },
    },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Section id",
      table: { disable: true },
    },
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Section>;

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
    <Section spacing="lg" background="muted" id="example-section">
      <Text as="p" terminals="sans">
        Used across marketing patterns for vertical rhythm.
      </Text>
    </Section>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
