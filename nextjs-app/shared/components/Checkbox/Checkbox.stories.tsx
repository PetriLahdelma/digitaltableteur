import contract from "./Checkbox.contract.json";
import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Checkbox, { CheckboxProps } from "@dt/Checkbox";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const checkboxComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Exported interface, forwardRef",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "StoryLabel pattern for i18n",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "Removed all inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Uses CSS variables throughout",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "border-inline-start used",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties adapt",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Native input, proper labels",
  },
  {
    id: "progressive-enhancement",
    rule: "Progressive enhancement",
    status: "pass",
    details: "@supports for accent-color",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export default {
  title: "Forms/Checkbox",
  component: Checkbox,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=372-14",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    label: {
      control: "text",
      description: "Label text displayed next to the checkbox",
      table: { category: "Content", type: { summary: "string" } },
    },

    error: {
      control: "text",
      description: "Error message under the control; wires aria-invalid + role=alert.",
      table: { category: "State", type: { summary: "string" } },
    },
    helperText: {
      control: "text",
      description: "Supporting text under the control; suppressed while error is set.",
      table: { category: "Content", type: { summary: "string" } },
    },
    showLabel: {
      control: "boolean",
      description: "Whether to show the label text",
      table: {
        category: "Content",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },

    // State (v1.1.0)

    checked: {
      control: "boolean",
      description: "Checked state (controlled) (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    indeterminate: {
      control: "boolean",
      description: "Indeterminate state (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    disabled: {
      control: "boolean",
      description: "Disables the checkbox (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    defaultChecked: {
      control: "boolean",
      description: "Initial checked state for uncontrolled component (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    // Appearance

    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },

    // Behavior
    onCheckedChange: {
      action: "checkedChanged",
      description: "Checked change handler (v1.1.0+)",
      table: {
        category: "Behavior",
        type: { summary: "(checked: boolean) => void" },
      },
    },

    // Accessibility

    id: {
      control: "text",
      description: "Custom ID for the checkbox element",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      isChecked: { table: { disable: true } },
      isDisabled: { table: { disable: true } },
      isIndeterminate: { table: { disable: true } },
      name: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      value: { table: { disable: true } }
},
} as Meta<CheckboxProps>;

const StoryLabel = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn<CheckboxProps> = (args: CheckboxProps) => {
  // If label is provided as a translation key string, render via StoryLabel
  const label =
    typeof args.label === "string" ? (
      <StoryLabel tKey={args.label} />
    ) : (
      args.label
    );

  return <Checkbox {...args} label={label as any} />;
};

export const Default = Template.bind({});
Default.args = { id: "newsletter", label: "storyCheckboxLabel" };
Default.parameters = {};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const checkbox = await canvas.findByLabelText(/default checkbox/i);
  await userEvent.click(checkbox);
};

export const Checked = Template.bind({});
Checked.args = { label: "Checked checkbox", checked: true };
Checked.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/checked checkbox/i);
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  label: "Indeterminate checkbox",
  // Indeterminate means neither checked nor unchecked visually.
  // Keep checked false and set indeterminate true so CSS shows the indeterminate variant.
  checked: false,
  indeterminate: true,
};
Indeterminate.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  // Just ensure the indeterminate checkbox renders; don't click it here so it stays indeterminate
  await canvas.findByLabelText(/indeterminate checkbox/i);
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled checkbox",
  checked: false,
  disabled: true,
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  label: "Disabled checked",
  checked: true,
  disabled: true,
};

export const AllStates: StoryFn = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <Checkbox label="Unchecked" checked={false} onCheckedChange={() => {}} />
    <Checkbox label="Checked" checked={true} onCheckedChange={() => {}} />
    <Checkbox
      label="Indeterminate"
      checked={false}
      indeterminate={true}
      onCheckedChange={() => {}}
    />
    <Checkbox
      label="Disabled unchecked"
      checked={false}
      disabled={true}
      onCheckedChange={() => {}}
    />
    <Checkbox
      label="Disabled checked"
      checked={true}
      disabled={true}
      onCheckedChange={() => {}}
    />
  </div>
);

// v1.1.0 Showcase Stories
AllStates.tags = ["example"];
AllStates.parameters = {
  docs: {
    description: {
      story:
        "Unchecked, checked, indeterminate, and the disabled pair. Indeterminate is for select-all parents whose children are mixed.",
    },
  },
};

export const SizeSmall = Template.bind({});
SizeSmall.args = { label: "Small checkbox", checked: true, size: "sm" };

export const SizeMedium = Template.bind({});
SizeMedium.args = {
  label: "Medium checkbox (default)",
  checked: true,
  size: "md",
};

export const SizeLarge = Template.bind({});
SizeLarge.args = { label: "Large checkbox", checked: true, size: "lg" };

export const AllSizes: StoryFn = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <Checkbox label="Small (sm)" checked={true} size="sm" />
    <Checkbox label="Medium (md)" checked={true} size="md" />
    <Checkbox label="Large (lg)" checked={true} size="lg" />
  </div>
);

AllSizes.tags = ["example"];
AllSizes.parameters = {
  docs: { description: { story: "sm, md and lg control sizes." } },
};

const ValidationContent: React.FC = () => {
  const [accepted, setAccepted] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 420 }}>
      <Checkbox
        label="I accept the terms of service"
        checked={accepted}
        onCheckedChange={(next) => setAccepted(next)}
        error={submitted && !accepted ? "You must accept the terms to continue" : undefined}
        helperText="Required to create an account"
      />
      <div>
        <Button variant="secondary" size="sm" clickAction={() => setSubmitted(true)}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export const Validation: StoryFn = () => <ValidationContent />;
Validation.tags = ["example"];
Validation.parameters = {
  docs: {
    description: {
      story:
        "The control owns its error and helper text: error wires aria-invalid and announces via role=alert, replacing the hint until it clears.",
    },
  },
};

const SelectAllContent: React.FC = () => {
  const [picked, setPicked] = React.useState<string[]>(["email"]);
  const all = ["email", "sms", "push"];
  const toggle = (value: string) => (next: boolean) =>
    setPicked((prev) => (next ? [...prev, value] : prev.filter((v) => v !== value)));
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Checkbox
        label="All channels"
        checked={picked.length === all.length}
        indeterminate={picked.length > 0 && picked.length < all.length}
        onCheckedChange={(next) => setPicked(next ? all : [])}
      />
      <div style={{ display: "grid", gap: "0.5rem", paddingInlineStart: "1.5rem" }}>
        <Checkbox label="Email" checked={picked.includes("email")} onCheckedChange={toggle("email")} />
        <Checkbox label="SMS" checked={picked.includes("sms")} onCheckedChange={toggle("sms")} />
        <Checkbox label="Push" checked={picked.includes("push")} onCheckedChange={toggle("push")} />
      </div>
    </div>
  );
};

export const SelectAllParent: StoryFn = () => <SelectAllContent />;
SelectAllParent.tags = ["example"];
SelectAllParent.parameters = {
  docs: {
    description: {
      story:
        "Composition in context: a select-all parent showing indeterminate while the set is mixed (CheckboxGroup packages this pattern).",
    },
  },
};

export const Z_CheckboxCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={checkboxComplianceRules}
  />
);
Z_CheckboxCompliance.parameters = { docs: { disable: true } };
export const Playground = Default;

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <Checkbox
      label="Accept terms"
      checked={false}
      onCheckedChange={() => undefined}
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  tags: ["beta-matrix"],
  render: () => (
    <Checkbox
      label="Accept terms"
      checked={false}
      onCheckedChange={() => undefined}
    />
  ),
};
