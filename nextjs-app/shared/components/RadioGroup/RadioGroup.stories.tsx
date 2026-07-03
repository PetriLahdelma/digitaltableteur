import type { Meta, StoryObj } from "@storybook/react-vite";
import RadioGroup from "./RadioGroup";
import contract from "./RadioGroup.contract.json";

const OPTIONS = [
  { value: "design", label: "Design systems" },
  { value: "product", label: "Product design" },
  { value: "research", label: "UX research" },
];

const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=383-36",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    legend: {
      control: "text",
      description: "Group label (fieldset legend)",
      table: { category: "Content" },
    },
    options: {
      control: false,
      description: "Radio options array",
      table: { category: "Content" },
    },
    value: {
      control: "text",
      description: "Controlled selected value",
      table: { category: "Value" },
    },
    name: {
      control: "text",
      description: "Native form field name for the group",
      table: { category: "Form" },
    },
    defaultValue: {
      control: "text",
      description: "Initial value when uncontrolled",
      table: { category: "Value" },
    },
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal"],
      description: "Stack direction",
      table: { category: "Layout", defaultValue: { summary: "vertical" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Radio control size",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    helperText: {
      control: "text",
      description: "Helper copy below the group",
      table: { category: "Content" },
    },
    error: {
      control: "text",
      description: "Error message",
      table: { category: "Validation" },
    },
    isDisabled: {
      control: "boolean",
      description: "Disable entire group",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    onValueChange: {
      description: "On Value Change",
      action: "valueChanged",
      table: { category: "Events" },
    },
    className: {
      description: "Class Name",
      control: false,
      table: { category: "Advanced" },
    },
  },
  args: {
    legend: "Primary expertise",
    options: OPTIONS,
    defaultValue: "design",
    orientation: "vertical",
    size: "md",
    helperText: "Choose the closest match.",
    isDisabled: false,
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

export const Horizontal: Story = { args: { orientation: "horizontal" } };

export const WithError: Story = {
  args: {
    error: "Select an option to continue.",
    helperText: undefined,
    value: "",
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup
      legend="Contact preference"
      options={OPTIONS}
      defaultValue="product"
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
