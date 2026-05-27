import contract from "./AboutPageContent.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AboutPageContent } from "./AboutPageContent";

const meta: Meta<typeof AboutPageContent> = {
  argTypes: {},
  title: "Patterns/AboutPageContent",
  component: AboutPageContent,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof AboutPageContent>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <AboutPageContent />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
