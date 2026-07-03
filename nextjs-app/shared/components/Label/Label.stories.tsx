import contract from "./Label.contract.json";
import React from "react";
import { Meta, StoryFn, type StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Label from "@dt/Label";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const labelComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing",
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
    details: "No inline styles",
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
    details: "margin-inline-start used",
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
    details: "Reusable form label",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "htmlFor linking, required indicator",
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
  title: "Atoms/Label",
  component: Label,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=371-6",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID of the associated form control (for/id pairing)",
    },

    children: {
      control: "text",
      description: "Visible label text (translation key in stories)",
    },

    tooltipText: {
      control: "text",
      description: "Optional tooltip content beside the label",
    },

    required: {
      control: "boolean",
      description: "Shows the required indicator when true",
      table: { defaultValue: { summary: "false" } },
    },

    disabled: {
      control: "boolean",
      description: "Muted style when the labeled control is disabled",
      table: { defaultValue: { summary: "false" } },
    },
  },
} as Meta;

type Story = StoryObj<typeof Label>;

const LabelStory: React.FC<React.ComponentProps<typeof Label>> = (args) => {
  const { t } = useTranslation();
  return <Label {...args}>{t(args.children as string)}</Label>;
};

const Template: StoryFn<typeof Label> = (
  args: React.ComponentProps<typeof Label>,
) => <LabelStory {...args} />;

export const Z_LabelCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={labelComplianceRules}
  />
);

export const Default = Template.bind({});
export const Playground = Template.bind({});
Playground.args = Default.args;

Default.args = { htmlFor: "field", children: "storyLabelDefault" };
Default.parameters = {};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  htmlFor: "input-id",
  children: "storyLabelWithTooltip",
  title: "storyLabelTooltip",
};

WithTooltip.tags = ["example"];
WithTooltip.parameters = {
  ...(WithTooltip as { parameters?: object }).parameters,
  docs: { description: { story: "tooltipText maps to the native title attribute; keep critical guidance in HelperText." } },
};

export const Required = Template.bind({});
Required.args = {
  htmlFor: "input-id",
  children: "storyLabelRequired",
  required: true,
};

Required.tags = ["example"];
Required.parameters = {
  ...(Required as { parameters?: object }).parameters,
  docs: { description: { story: "required adds the aria-hidden asterisk plus screen-reader-only (required) text." } },
};

export const Disabled = Template.bind({});
Disabled.args = {
  htmlFor: "input-id",
  children: "storyLabelDisabled",
  disabled: true,
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/default label/i);
};

WithTooltip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const label = await canvas.findByText(/label with tooltip/i);
  await userEvent.hover(label);
  // Optionally, check for tooltip appearance if implemented
};

Required.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/required label/i);
};

Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const label = await canvas.findByText(/disabled label/i);
  // Optionally, check for disabled state if implemented
};

Disabled.tags = ["example"];
Disabled.parameters = {
  ...(Disabled as { parameters?: object }).parameters,
  docs: { description: { story: "Visual mute for a disabled field; the input must also be disabled." } },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <LabelStory htmlFor="email" required>
      storyLabelRequired
    </LabelStory>
  ),
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
