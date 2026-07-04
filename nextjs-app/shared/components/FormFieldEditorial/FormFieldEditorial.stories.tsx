import { userEvent, within } from "storybook/test";
import { FormFieldEditorial } from "./FormFieldEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./FormFieldEditorial.contract.json";

const defaultArgs = {
  label: "Your name",
  type: "text" as const,
  required: true,
  placeholder: "Alex Example",
};

const meta = {
  title: "Site/FormFieldEditorial",
  component: FormFieldEditorial,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-form-field-editorial",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    label: { control: "text", description: "Uppercase field label" },
    type: {
      control: "select",
      options: ["text", "email", "tel", "textarea", "select"],
      description: "Control type",
      table: { defaultValue: { summary: "text" } },
    },
    error: { control: "text", description: "Error message (role=alert)" },
    required: { control: "boolean", description: "Required indicator" },
    placeholder: { control: "text", description: "Input placeholder" },
    className: {
      control: "text",
      description: "Field wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Stable id override",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof FormFieldEditorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (editorial contact field)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FormFieldEditorial
        label="Email"
        type="email"
        required
        placeholder="you@company.com"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
