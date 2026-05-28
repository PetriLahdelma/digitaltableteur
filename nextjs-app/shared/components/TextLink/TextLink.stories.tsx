import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { TextLink } from "./TextLink";
import contract from "./TextLink.contract.json";

const defaultArgs = {
  href: "/privacy-policy",
  children: "Privacy policy",
  variant: "muted" as const,
  underline: "hover" as const,
  external: false,
};

const meta = {
  title: "Atoms/TextLink",
  component: TextLink,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Destination URL",
    },
    children: {
      control: "text",
      description: "Link text (accessible name)",
    },
    variant: {
      control: "select",
      options: ["default", "muted", "accent"],
      description: "Color variant for inline prose",
      table: { defaultValue: { summary: "default" } },
    },
    underline: {
      control: "select",
      options: ["always", "hover", "none"],
      description: "Underline visibility",
      table: { defaultValue: { summary: "hover" } },
    },
    external: {
      control: "boolean",
      description: "Opens in a new tab with rel security attrs when true",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  name: "Example (footer legal row)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <nav
      aria-label="Legal"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem 1.5rem",
        fontSize: "0.875rem",
      }}
    >
      <TextLink href="/privacy-policy" variant="muted" underline="hover">
        Privacy policy
      </TextLink>
      <TextLink href="/imprint" variant="muted" underline="hover">
        Imprint
      </TextLink>
      <TextLink href="/ai-use" variant="muted" underline="hover">
        AI use
      </TextLink>
      <TextLink href="/accessibility" variant="muted" underline="hover">
        Accessibility
      </TextLink>
    </nav>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
