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
  options: [
    { label: "storyCheckboxOption1", value: "option1" },
    { label: "storyCheckboxOption2", value: "option2" },
    { label: "storyCheckboxOption3", value: "option3" },
    { label: "storyCheckboxOption4", value: "option4" },
    { label: "storyCheckboxOption5", value: "option5" },
  ],
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/group label/i);
};
