import contract from "./FormFieldEditorial.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormFieldEditorial } from "./FormFieldEditorial";

const meta: Meta<typeof FormFieldEditorial> = {
  title: "Molecules/FormFieldEditorial",
  component: FormFieldEditorial,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "tel", "textarea", "select"],
    },

    label: { control: "text" },

    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FormFieldEditorial>;

export const Default: Story = {
  args: {
    type: "text",
    label: "Your name",
    name: "name",
    required: true,
    placeholder: "Jane Doe",
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  args: Default.args,
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: Default.args,
};
