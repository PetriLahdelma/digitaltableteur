import contract from "./Section.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section } from "./Section";
import Text from "@dt/Text";

const meta: Meta<typeof Section> = {
  title: "Atoms/Section",
  component: Section,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    spacing: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },

    background: {
      control: "select",
      options: ["default", "muted", "accent", "inverse"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    spacing: "md",
    background: "default",
    children: (
      <Text as="p" terminals="sans">
        Section spacing and background match marketing pages.
      </Text>
    ),
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section spacing="md" background="muted">
      <Text as="p" terminals="sans">
        Canonical section wrapper — used inside patterns across the site.
      </Text>
    </Section>
  ),
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  ...Default,
};
