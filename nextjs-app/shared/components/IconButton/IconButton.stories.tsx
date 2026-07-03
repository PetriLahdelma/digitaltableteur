import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { List, Moon } from "@phosphor-icons/react";
import { IconButton } from "./IconButton";
import contract from "./IconButton.contract.json";

const defaultArgs = {
  icon: <Moon weight="bold" className="size-5" aria-hidden />,
  label: "Toggle dark mode",
  variant: "ghost" as const,
  size: "md" as const,
  disabled: false,
};

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-icon-button",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    icon: {
      control: false,
      description: "Decorative icon glyph (aria-hidden in component)",
    },
    label: {
      control: "text",
      description: "Required accessible name (aria-label)",
    },
    variant: {
      control: "select",
      options: ["default", "ghost", "outline"],
      description: "Visual button variant",
      table: { defaultValue: { summary: "ghost" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Circular hit-target size",
      table: { defaultValue: { summary: "md" } },
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (site header toolbar)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      <IconButton {...defaultArgs} />
      <IconButton
        icon={<List weight="bold" className="size-5" aria-hidden />}
        label="Open navigation menu"
        variant="ghost"
        size="md"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
