import type { Meta, StoryObj } from "@storybook/react-vite";
import Radio from "./Radio";
import contract from "./Radio.contract.json";

const meta = {
  title: "Forms/Radio",
  component: Radio,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=372-27",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Option label",
      table: { category: "Content" },
    },
    value: {
      control: "text",
      description: "Submitted value when selected",
      table: { category: "Value" },
    },
    name: {
      control: "text",
      description: "Group name (must match siblings)",
      table: { category: "Form" },
    },
    checked: {
      control: "boolean",
      description: "Controlled checked state",
      table: { category: "State" },
    },
    disabled: {
      control: "boolean",
      description: "Disable this option",
      table: { category: "State", defaultValue: { summary: "false" } },
    },
    defaultChecked: {
      control: false,
      description: "Initial checked state (uncontrolled mode only)",
      table: { category: "State", disable: true },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Control hit area",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    showLabel: {
      control: "boolean",
      description: "Render visible label",
      table: { category: "Content", defaultValue: { summary: "true" } },
    },
    onCheckedChange: {
      description: "Fired when selection changes",
      action: "checkedChange",
      table: { category: "Events" },
    },
    className: {
      control: false,
      description: "Optional utility classes",
      table: { category: "Advanced" },
    },
  },
  args: {
    label: "Email updates",
    value: "email",
    name: "contact-pref",
    checked: true,
    size: "md",
    disabled: false,
    showLabel: true,
  },
} satisfies Meta<typeof Radio>;

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

export const InAnExclusiveSet: Story = {
  tags: ["example"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Radios sharing a name form the exclusive set; the browser enforces one selection. Prefer RadioGroup, which adds the legend and state handling.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Radio name="plan" value="starter" label="Starter" defaultChecked />
      <Radio name="plan" value="pro" label="Pro" />
      <Radio name="plan" value="enterprise" label="Enterprise" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    layout: "padded",
    docs: { description: { story: "sm, md and lg control sizes." } },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Radio name="size-demo-sm" value="sm" label="Small (sm)" size="sm" defaultChecked />
      <Radio name="size-demo-md" value="md" label="Medium (md)" size="md" defaultChecked />
      <Radio name="size-demo-lg" value="lg" label="Large (lg)" size="lg" defaultChecked />
    </div>
  ),
};

export const DisabledOptions: Story = {
  tags: ["example"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Disabled options stay visible so the set reads complete, but cannot be picked.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Radio name="tier" value="free" label="Free" defaultChecked />
      <Radio name="tier" value="team" label="Team (contact sales)" disabled />
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-internal-8)",
      }}
    >
      <Radio name="demo" value="a" label="Option A" defaultChecked />
      <Radio name="demo" value="b" label="Option B" />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
