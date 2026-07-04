import { userEvent, within } from "storybook/test";
import { HomeHero } from "./HomeHero";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./HomeHero.contract.json";

const defaultArgs = {
  scrollTargetId: "services",
};

const meta = {
  title: "Patterns/HomeHero",
  component: HomeHero,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-home-hero",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    scrollTargetId: {
      control: "text",
      description: "ID of the section targeted by the scroll indicator",
      table: { defaultValue: { summary: "services" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <HomeHero scrollTargetId="services" />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
