import contract from "./SiteFooter.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "./SiteFooter";

const meta: Meta<typeof SiteFooter> = {
  title: "Patterns/SiteFooter",
  component: SiteFooter,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Optional wrapper class",
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};
export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <SiteFooter />,
};
export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
