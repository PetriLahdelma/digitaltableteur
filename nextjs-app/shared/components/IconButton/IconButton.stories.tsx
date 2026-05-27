import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, Moon } from "@phosphor-icons/react";
import { IconButton } from "./IconButton";
import contract from "./IconButton.contract.json";

/** Mirrors `SiteHeader` — theme toggle + mobile menu triggers. */
const headerToolbarArgs = {
  icon: <Moon weight="bold" className="size-5" aria-hidden />,
  label: "Toggle dark mode",
  variant: "ghost" as const,
  size: "md" as const,
};

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    label: { control: "text", table: { category: "Accessibility" } },
    variant: {
      control: "select",
      options: ["default", "ghost", "outline"],
      table: { defaultValue: { summary: "ghost" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
    disabled: { control: "boolean" },
  },
  args: headerToolbarArgs,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {};

export const Example: Story = {
  name: "Example (site header toolbar)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      <IconButton {...headerToolbarArgs} />
      <IconButton
        icon={<List weight="bold" className="size-5" aria-hidden />}
        label="Open navigation menu"
        variant="ghost"
        size="md"
      />
    </div>
  ),
};

export const OutlineDisabled: Story = {
  args: {
    ...headerToolbarArgs,
    variant: "outline",
    disabled: true,
  },
};
