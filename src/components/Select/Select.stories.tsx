import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Select from "./Select";
import { within, userEvent } from "@storybook/testing-library";

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

const Template: StoryFn<typeof Select> = (
  args: React.ComponentProps<typeof Select>,
) => (
  <div style={{ maxWidth: "var(--size-width-md)" }}>
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
