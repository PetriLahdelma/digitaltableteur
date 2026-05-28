import { ContactPageContentEditorial } from "./ContactPageContentEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ContactPageContentEditorial.contract.json";

const defaultArgs = {};

const meta = {
  title: "Patterns/ContactPageContentEditorial",
  component: ContactPageContentEditorial,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Page wrapper class names", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof ContactPageContentEditorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };


export const Example: Story = {
  globals: { forcedColors: "none" },
  name: "Example (contact page layout)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ContactPageContentEditorial />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
