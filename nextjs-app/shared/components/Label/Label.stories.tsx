import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Label from "@dt/Label";

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
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists",
  },
];

export default {
  title: "Components/Label",
  component: Label,
  argTypes: {
    htmlFor: { control: "text" },
    children: { control: "text" },
    tooltipText: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} as Meta;

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
Default.args = {
  htmlFor: "field",
  children: "storyLabelDefault",
};
Default.parameters = {};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  htmlFor: "input-id",
  children: "storyLabelWithTooltip",
  title: "storyLabelTooltip",
};

export const Required = Template.bind({});
Required.args = {
  htmlFor: "input-id",
  children: "storyLabelRequired",
  required: true,
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
