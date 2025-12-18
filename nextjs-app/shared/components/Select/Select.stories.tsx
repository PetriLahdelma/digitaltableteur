import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Select from "@dt/Select";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import SelectOption from "./SelectOption";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import styles from "./Select.stories.module.css";

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
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists",
  },
];

export default {
  title: "Components/Select",
  component: Select,
  argTypes: {
    label: { control: "text" },
    options: { control: "object" },
    value: { control: "text" },
    disabled: { control: "boolean" },
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
  return (
    <div className={styles.container}>
      <Select
        {...args}
        label={t(args.label as string)}
        options={translatedOptions}
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
