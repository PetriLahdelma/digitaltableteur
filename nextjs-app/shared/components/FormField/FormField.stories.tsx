import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import { TextInput } from "../TextInput/TextInput";
import contract from "./FormField.contract.json";

const defaultArgs = {
  label: "Email address",
  helperText: "We reply within two business days",
  required: true,
  children: <TextInput type="email" placeholder="you@company.com" />,
};

const meta = {
  title: "Molecules/FormField",
  component: FormField,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    label: { control: "text", description: "Visible field label" },
    children: {
      control: false,
      description: "Single form control (input, select, textarea)",
    },
    error: { control: "text", description: "Submit-time error message" },
    helperText: { control: "text", description: "Hint text wired via aria-describedby" },
    required: { control: "boolean", description: "Required field indicator" },
    disabled: { control: "boolean", description: "Disabled fieldset styling" },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Stable id override",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Full name" required helperText="As on your business card">
        <TextInput placeholder="Alex Example" />
      </FormField>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
