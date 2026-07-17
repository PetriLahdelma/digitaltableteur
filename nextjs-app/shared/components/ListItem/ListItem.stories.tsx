import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListItem } from "./ListItem";
import contract from "./ListItem.contract.json";

const meta = {
  title: "Content/ListItem",
  component: ListItem,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  // Custom MDX docs pages exist for all catalog entries; do not also enable autodocs
  // or Storybook will treat it as conflicting sources of truth for the docs page.
  tags: ["!autodocs"],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ListItem>Example composition</ListItem>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: {
    docs: {
      description: {
        story: "Forced-colors verification story.",
      },
    },
  },
};
