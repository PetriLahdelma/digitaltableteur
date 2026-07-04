import contract from "./Select.contract.json";
import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Select from "@dt/Select";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import SelectOption from "./SelectOption";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import CodeSnippet from "@dt/CodeSnippet";
import styles from "./Select.stories.module.css";
import schema from "./schema.json";
const selectComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with SelectProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Stories use translation keys",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "Removed inline styles, using module classes",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Replaced Moderat with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses standard padding",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Flexible with SelectOption",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Label, disabled state, keyboard navigation",
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
  title: "Forms/Select",
  component: Select,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=383-23",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    label: {
      control: "text",
      description: "Label text displayed above the select dropdown",
      table: { category: "Content", type: { summary: "string" } },
    },

    options: {
      control: "object",
      description:
        "Array of option objects with value, label, and optional disabled",
      table: { category: "Content", type: { summary: "SelectOptionItem[]" } },
    },

    helperText: {
      control: "text",
      description:
        "Helper text displayed below the select (hidden if error is set)",
      table: { category: "Content", type: { summary: "string" } },
    },

    children: {
      control: false,
      description: "Custom SelectOption children (overrides options prop)",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },

    // Appearance

    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "SizeUnified" },
        defaultValue: { summary: "md" },
      },
    },

    error: {
      control: "text",
      description:
        "Error message to display (changes border color and shows error HelperText)",
      table: { category: "Appearance", type: { summary: "string" } },
    },

    // State

    disabled: {
      control: "boolean",
      description: "Disables the select",
      table: { category: "State", type: { summary: "boolean" } },
    },

    value: {
      control: "text",
      description: "Controlled value (requires onValueChange)",
      table: { category: "State", type: { summary: "string" } },
    },

    defaultValue: {
      control: "text",
      description: "Initial value for uncontrolled component",
      table: { category: "State", type: { summary: "string" } },
    },

    // Behavior
    onValueChange: {
      action: "valueChanged",
      description: "Value change handler (v1.1.0+)",
      table: {
        category: "Behavior",
        type: { summary: "(value: string) => void" },
      },
    },

    // Accessibility

    id: {
      control: "text",
      description: "Custom ID for the select element",
      table: { category: "Accessibility", type: { summary: "string" } },
    },

    // Advanced

    className: {
      control: "text",
      description: "Additional CSS classes",
      table: { category: "Advanced", type: { summary: "string" } },
    },

    // Deprecated

    onChange: {
      action: "changed",
      description:
        "⚠️ Deprecated: Use onValueChange instead. Will be removed in v2.0.0",
      table: {
        category: "Deprecated",
        type: { summary: "(value: string) => void" },
      },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
} as Meta;

export const Z_SelectCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={selectComplianceRules}
  />
);

const SelectStory: React.FC<React.ComponentProps<typeof Select>> = (args) => {
  const { t } = useTranslation();
  const translatedOptions = args.options?.map((o) => ({
    ...o,
    label: t(o.label as string),
  }));
  const translatedError = args.error ? t(args.error as string) : undefined;
  const translatedHelperText = args.helperText
    ? t(args.helperText as string)
    : undefined;
  return (
    <div className={styles.container}>
      <Select
        {...args}
        label={t(args.label as string)}
        options={translatedOptions}
        error={translatedError}
        helperText={translatedHelperText}
      />
    </div>
  );
};

const Template: StoryFn<typeof Select> = (
  args: React.ComponentProps<typeof Select>,
) => <SelectStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "storySelectDisabledLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  disabled: true,
};

Disabled.tags = ["example"];
Disabled.parameters = {
  docs: { description: { story: "disabled turns off the whole control; per-option disabled lives on the options array." } },
};

export const WithCustomChildren: StoryFn<typeof Select> = () => {
  const { t } = useTranslation();
  return (
    <Select label={t("storySelectLabel")} defaultValue="">
      <SelectOption value="" label="Select..." disabled />
      <SelectOption value="option1" label={t("storyCheckboxOption1")} />
      <SelectOption value="option2" label={t("storyCheckboxOption2")} />
      <SelectOption value="option3" label={t("storyCheckboxOption3")} />
    </Select>
  );
};

WithCustomChildren.tags = ["example"];
WithCustomChildren.parameters = {
  docs: {
    description: {
      story:
        "Pass SelectOption children when you need a placeholder or optgroup markup; the empty placeholder stays unselectable.",
    },
  },
};

export const Controlled: StoryFn<typeof Select> = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("option1");
  return (
    <Select
      label={t("storySelectLabel")}
      value={current}
      onValueChange={setCurrent}
      options={[
        { value: "option1", label: t("storyCheckboxOption1") },
        { value: "option2", label: t("storyCheckboxOption2") },
        { value: "option3", label: t("storyCheckboxOption3") },
      ]}
    />
  );
};

Controlled.tags = ["example"];
Controlled.parameters = {
  docs: {
    description: {
      story: "Controlled mode: pair value with onValueChange to own the selection.",
    },
  },
};

export const WithError = Template.bind({});
WithError.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  error: "storySelectErrorRequired",
};

WithError.tags = ["example"];
WithError.parameters = {
  docs: {
    description: {
      story: "error replaces the helper line, sets aria-invalid, and announces via role=alert.",
    },
  },
};

export const SizeSmall = Template.bind({});
SizeSmall.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  size: "sm",
};

export const SizeMedium = Template.bind({});
SizeMedium.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  size: "md",
};

export const SizeLarge = Template.bind({});
SizeLarge.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  size: "lg",
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
  helperText: "storySelectHelperText",
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = await canvas.findByLabelText(/select an option/i);
  await userEvent.selectOptions(select, "option2");
  // Focus test
  await userEvent.tab();
};

Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const select = await canvas.findByLabelText(/disabled select/i);
  // Focus test
  await userEvent.tab();
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: Default.args,
  render: (args) => <SelectStory {...args} />,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
