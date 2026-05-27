import contract from "./HomeHero.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeHero } from "./HomeHero";

const meta: Meta<typeof HomeHero> = {
  argTypes: {},
  title: "Patterns/HomeHero",
  component: HomeHero,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof HomeHero>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <HomeHero />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
