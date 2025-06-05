import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa"; // Add FaArrowLeft to the import
import Button from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: ["primary", "secondary", "tertiary", "error", "success", "info"],
      },
    },
    disabled: { control: "boolean" },
    tooltip: { control: "text" },
    accessibleName: { control: "text" },
    accessibleDescription: { control: "text" },
  },
} as Meta;

const Template: StoryFn = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: "Primary Button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: "Secondary Button",
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  variant: "tertiary",
  children: "Tertiary Button",
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
  children: "Error Button",
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
  children: "Success Button",
};

export const Info = Template.bind({});
Info.args = {
  variant: "info",
  children: "Info Button",
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: FaSearch, // Use JSX element for the icon
  tooltip: "Search",
};

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: FaArrowLeft, // Use JSX element for the icon
  children: "Left Icon",
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: FaArrowRight, // Use JSX element for the end icon
  children: "Right Icon",
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  children: "Disabled Button",
  disabled: true,
};
