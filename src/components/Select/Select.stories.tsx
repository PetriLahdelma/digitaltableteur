import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import Select from "./Select";

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

const Template: StoryFn<typeof Select> = (args) => (
  <div style={{ maxWidth: "320px" }}>
    <Select {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  label: "Select an option",
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  value: "option1",
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled Select",
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  value: "option1",
  disabled: true,
};
