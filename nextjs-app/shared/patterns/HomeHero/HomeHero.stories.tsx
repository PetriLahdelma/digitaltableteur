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
  tags: ["beta", "!autodocs"],
  parameters: {
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
  },
  args: defaultArgs,
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  name: "Example (homepage hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <HomeHero scrollTargetId="services" />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
