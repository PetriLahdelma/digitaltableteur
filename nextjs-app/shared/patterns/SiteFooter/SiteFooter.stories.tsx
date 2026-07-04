import contract from "./SiteFooter.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteFooter } from "./SiteFooter";

const meta: Meta<typeof SiteFooter> = {
  title: "Patterns/SiteFooter",
  component: SiteFooter,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=477-6",
    },
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
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
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
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <SiteFooter />,
};
export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
