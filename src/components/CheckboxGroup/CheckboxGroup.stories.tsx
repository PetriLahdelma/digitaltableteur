import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { within } from "@storybook/testing-library";
import CheckboxGroup, { CheckboxGroupProps } from "./CheckboxGroup";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  argTypes: {
    label: { control: "text" },
    options: { control: "object" },
    id: { control: "text" },
    showMasterCheckbox: { control: "boolean" },
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
      options={translatedOptions}
    />
  );
};

const Template: StoryFn<CheckboxGroupProps> = (args: CheckboxGroupProps) => (
  <CheckboxGroupStory {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: "storyCheckboxGroupLabel",
  showMasterCheckbox: true,
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
    { label: "storyCheckboxOption5", value: "option5" },
  ],
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
  // Click two slave checkboxes by their translated labels so the master becomes indeterminate
  const opt1 = await canvas.findByLabelText(/story checkbox option 1/i);
  const opt2 = await canvas.findByLabelText(/story checkbox option 2/i);
  await opt1.click();
  await opt2.click();
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText("Group Label");
};
