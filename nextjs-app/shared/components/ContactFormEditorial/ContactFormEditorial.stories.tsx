import contract from "./ContactFormEditorial.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactFormEditorial } from "./ContactFormEditorial";

const meta: Meta<typeof ContactFormEditorial> = {
  argTypes: {},
  title: "Organisms/ContactFormEditorial",
  component: ContactFormEditorial,
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof ContactFormEditorial>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ContactFormEditorial />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
