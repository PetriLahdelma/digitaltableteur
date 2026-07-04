import contract from "./CheckboxGroup.contract.json";
import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import CheckboxGroup, { CheckboxGroupProps } from "@dt/CheckboxGroup";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const checkboxGroupComplianceRules: ComplianceRule[] = [
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
    details: "Exported interface",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation in stories",
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
    details: "Uses CSS variables",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "CSS uses logical properties",
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
    details: "Uses Checkbox, GroupLabel",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Proper checkbox semantics",
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
  title: "Forms/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=383-24",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite options and defaultSelected slots keep authored mapping presets.
  argTypes: {
    options: {
      control: { type: "select" },
      options: ["five", "four", "two"],
      mapping: {
        five: [
          { label: "storyCheckboxOption1", value: "option1" },
          { label: "storyCheckboxOption2", value: "option2" },
          { label: "storyCheckboxOption3", value: "option3" },
          { label: "storyCheckboxOption4", value: "option4" },
          { label: "storyCheckboxOption5", value: "option5" },
        ],
        four: [
          { label: "storyCheckboxOption1", value: "option1" },
          { label: "storyCheckboxOption2", value: "option2" },
          { label: "storyCheckboxOption3", value: "option3" },
          { label: "storyCheckboxOption4", value: "option4" },
        ],
        two: [
          { label: "storyCheckboxOption1", value: "option1" },
          { label: "storyCheckboxOption2", value: "option2" },
        ],
      },
      description:
        "Checkbox options (label, value). Pick a preset here; compose your own in code.",
      table: { category: "Content" },
    },
    defaultSelected: {
      control: { type: "select" },
      options: ["none", "firstTwo", "first"],
      mapping: {
        none: [],
        firstTwo: ["option1", "option2"],
        first: ["option1"],
      },
      description: "Initially selected option values (uncontrolled).",
      table: { category: "Content" },
    },
  },
} as Meta<CheckboxGroupProps>;

const CheckboxGroupStory: React.FC<CheckboxGroupProps> = (args) => {
  const { t } = useTranslation();
  const translatedOptions = args.options?.map((o) => ({
    ...o,
    label: t(o.label as string),
  }));
  return (
    <CheckboxGroup
      {...args}
      label={t(args.label as string)}
      masterLabel={args.masterLabel ? t(args.masterLabel) : undefined}
      options={translatedOptions}
    />
  );
};

const Template: StoryFn<CheckboxGroupProps> = (args: CheckboxGroupProps) => (
  <CheckboxGroupStory {...args} />
);

export const Z_CheckboxGroupCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={checkboxGroupComplianceRules}
  />
);

export const Default = Template.bind({});
Default.args = {
  id: "interests",
  label: "storyCheckboxGroupLabel",
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
    { label: "storyCheckboxOption5", value: "option5" },
  ],
};
Default.parameters = {};

export const WithMasterCheckbox = Template.bind({});
WithMasterCheckbox.args = {
  id: "channels",
  label: "storyCheckboxGroupLabel",
  showMasterCheckbox: true,
  masterLabel: "storyCheckboxGroupMasterLabel",
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
  ],
};
WithMasterCheckbox.tags = ["example"];
WithMasterCheckbox.parameters = {
  docs: {
    description: {
      story:
        "The full pattern: fieldset legend, options, and a master select-all that goes indeterminate while the set is mixed.",
    },
  },
};

export const WithoutMasterCheckbox = Template.bind({});
WithoutMasterCheckbox.args = {
  label: "storyCheckboxGroupLabel",
  showMasterCheckbox: false,
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
    { label: "storyCheckboxOption5", value: "option5" },
  ],
};
WithoutMasterCheckbox.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const checkboxes = await canvas.findAllByRole("checkbox");
  // Click first two checkboxes
  if (checkboxes[0]) await userEvent.click(checkboxes[0]);
  if (checkboxes[1]) await userEvent.click(checkboxes[1]);
};

WithoutMasterCheckbox.tags = ["example"];
WithoutMasterCheckbox.parameters = {
  docs: {
    description: {
      story: "Small sets usually skip the master checkbox; the legend still names every option.",
    },
  },
};

export const WithIndeterminateState = Template.bind({});
WithIndeterminateState.args = {
  label: "storyCheckboxGroupLabel",
  showMasterCheckbox: true,
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
    { label: "storyCheckboxOption5", value: "option5" },
  ],
  // Pre-select option1 and option2 so the master checkbox starts as indeterminate
  defaultSelected: ["option1", "option2"],
};

WithIndeterminateState.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const checkboxes = await canvas.findAllByRole("checkbox");
  const [, firstOption, secondOption] = checkboxes;
  if (firstOption) await firstOption.click();
  if (secondOption) await secondOption.click();
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findAllByRole("checkbox");
};

WithIndeterminateState.tags = ["example"];
WithIndeterminateState.parameters = {
  docs: {
    description: {
      story:
        "Seeded via defaultSelected: the master checkbox reads indeterminate until the set is uniform.",
    },
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  // options/defaultSelected args are mapping keys resolved by the presets above.
  args: {
    id: "interests",
    label: "storyCheckboxGroupLabel",
    masterLabel: "storyCheckboxGroupMasterLabel",
    showMasterCheckbox: true,
    options: "five" as unknown as CheckboxGroupProps["options"],
    defaultSelected: "firstTwo" as unknown as CheckboxGroupProps["defaultSelected"],
  },
  render: (args) => <CheckboxGroupStory {...args} />,
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: Template,
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
