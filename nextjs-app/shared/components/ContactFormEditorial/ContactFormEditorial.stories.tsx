import { userEvent, within } from "storybook/test";
import { ContactFormEditorial } from "./ContactFormEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ContactFormEditorial.contract.json";

const defaultArgs = {};

const meta = {
  title: "Organisms/ContactFormEditorial",
  component: ContactFormEditorial,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    onSuccess: { action: "success", description: "Called after successful submit" },
    onError: { action: "error", description: "Called when submit fails" },
    className: { control: "text", description: "Form wrapper class names", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof ContactFormEditorial>;

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
  name: "Example (contact page form)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ContactFormEditorial />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
