import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import { within } from "@storybook/testing-library";
import Checkbox, { CheckboxProps } from "./Checkbox";

export default {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
} as Meta<CheckboxProps>;

const Template: StoryFn<CheckboxProps> = (args) => <Checkbox {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Default Checkbox",
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/default checkbox/i);
};

export const Checked = Template.bind({});
Checked.args = {
  label: "Checked Checkbox",
  checked: true,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  label: "Indeterminate Checkbox",
  checked: false,
  indeterminate: true,
};
