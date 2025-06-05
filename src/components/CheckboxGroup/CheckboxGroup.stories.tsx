import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import CheckboxGroup, { CheckboxGroupProps } from "./CheckboxGroup";

export default {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  argTypes: {
    label: { control: "text" },
    options: { control: "object" },
  },
} as Meta<CheckboxGroupProps>;

const Template: StoryFn<CheckboxGroupProps> = (args) => <CheckboxGroup {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Group Label",
  options: [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
    { label: "Option 4", value: "option4" },
    { label: "Option 5", value: "option5" },
  ],
};
