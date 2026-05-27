import contract from "./ContactPageContentEditorial.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactPageContentEditorial } from "./ContactPageContentEditorial";

const meta: Meta<typeof ContactPageContentEditorial> = {
  argTypes: {},
  title: "Patterns/ContactPageContentEditorial",
  component: ContactPageContentEditorial,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof ContactPageContentEditorial>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ContactPageContentEditorial />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
