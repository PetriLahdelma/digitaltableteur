import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { CheckboxField } from "./CheckboxField";
import contract from "./CheckboxField.contract.json";

const defaultArgs = {
  label: "Subscribe to product updates",
  description: "Occasional notes — no spam",
  defaultChecked: false,
};

const meta = {
  title: "Molecules/CheckboxField",
  component: CheckboxField,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    label: { control: "text", description: "Checkbox label" },
    description: { control: "text", description: "Helper copy under label" },
    checked: { control: "boolean", description: "Controlled checked state" },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state (uncontrolled)",
    },
    onCheckedChange: {
      action: "checkedChange",
      description: "Change handler",
    },
    disabled: { control: "boolean", description: "Disabled state" },
    required: { control: "boolean", description: "Required indicator" },
    error: { control: "text", description: "Error message (role=alert)" },
    className: {
      control: "text",
      description: "Row wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Stable input id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <CheckboxField
      label="I agree to the privacy policy"
      description="Required to submit the contact form"
      required
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
