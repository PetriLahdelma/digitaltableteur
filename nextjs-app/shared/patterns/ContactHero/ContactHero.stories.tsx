import contract from "./ContactHero.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactHero } from "./ContactHero";

const meta: Meta<typeof ContactHero> = {
  argTypes: {},
  title: "Patterns/ContactHero",
  component: ContactHero,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof ContactHero>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ContactHero />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
