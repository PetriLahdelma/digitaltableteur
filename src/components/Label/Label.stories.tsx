import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import Label from "./Label";

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

const Template: StoryFn<typeof Label> = (args) => <Label {...args} />;

export const Default = Template.bind({});
Default.args = {
  htmlFor: "input-id",
  children: "Default Label",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  htmlFor: "input-id",
  children: "Label with Tooltip",
  title: "This is a tooltip",
};

export const Required = Template.bind({});
Required.args = {
  htmlFor: "input-id",
  children: "Required Label",
  required: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  htmlFor: "input-id",
  children: "Disabled Label",
  disabled: true,
};
