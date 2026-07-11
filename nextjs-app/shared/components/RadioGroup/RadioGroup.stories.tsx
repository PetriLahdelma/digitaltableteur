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
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1227-2963",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // only the composite options slot needs an authored mapping preset.
  argTypes: {
    options: {
      control: { type: "select" },
      options: ["expertise", "delivery", "plans"],
      mapping: {
        expertise: OPTIONS,
        delivery: [
          { value: "standard", label: "Standard (3-5 days)" },
          { value: "express", label: "Express (1-2 days)" },
          { value: "pickup", label: "Pickup point" },
        ],
        plans: [
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise (contact sales)", disabled: true },
        ],
      },
      description:
        "Radio options array. Pick a preset here; compose your own in code.",
      table: { category: "Content" },
    },
  },
  args: {
    legend: "Primary expertise",
    options: OPTIONS,
    defaultValue: "design",
    orientation: "vertical",
    size: "md",
    helperText: "Choose the closest match.",
    disabled: false,
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    options: "expertise" as unknown as typeof OPTIONS,
  },
  // defaultValue is consumed once at mount — remount on change so the control drives the canvas.
  render: (args) => (
    <RadioGroup key={`remount-${args.defaultValue ?? ""}`} {...args} />
  ),
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

export const Basic: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The legend asks the question, the options answer it; defaultValue preselects the recommended choice.",
      },
    },
  },
  render: () => (
    <RadioGroup
      legend="Delivery speed"
      options={[
        { value: "standard", label: "Standard (3-5 days)" },
        { value: "express", label: "Express (1-2 days)" },
        { value: "pickup", label: "Pickup point" },
      ]}
      defaultValue="standard"
    />
  ),
};

export const Horizontal: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story: "Horizontal orientation for a few short options that fit one line on mobile.",
      },
    },
  },
  args: { orientation: "horizontal" },
};

export const WithError: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The group owns its error and helper text; the error announces via role=alert and sets aria-invalid on the fieldset.",
      },
    },
  },
  args: {
    error: "Select an option to continue.",
    helperText: undefined,
    value: "",
  },
};

export const DisabledOption: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story: "Per-option disabled keeps the choice visible so the set reads complete.",
      },
    },
  },
  render: () => (
    <RadioGroup
      legend="Plan"
      options={[
        { value: "free", label: "Free" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise (contact sales)", disabled: true },
      ]}
      defaultValue="free"
    />
  ),
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
