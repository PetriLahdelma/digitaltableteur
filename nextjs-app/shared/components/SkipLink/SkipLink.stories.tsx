import contract from "./SkipLink.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkipLink } from "./SkipLink";

const meta: Meta<typeof SkipLink> = {
  title: "Atoms/SkipLink",
  component: SkipLink,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    href: { control: "text" },

    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SkipLink />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
