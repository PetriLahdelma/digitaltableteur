import React from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import Input from "./Inputs";

export default {
  title: "Components/Inputs",
  component: Input,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: ["text", "number", "email", "password", "search", "select"],
      },
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    options: { control: { type: "object" } }, // Fix type mismatch
  },
} as Meta;

const Template: StoryFn<typeof Input> = (args) => (
  <div style={{ maxWidth: "320px" }}>
    <Input {...args} />
  </div>
);

export const TextInput = Template.bind({});
TextInput.args = {
  label: "Text Input",
  type: "text",
  placeholder: "Enter text",
};

export const NumberInput = Template.bind({});
NumberInput.args = {
  label: "Number Input",
  type: "number",
  placeholder: "Enter number",
};

export const EmailInput = Template.bind({});
EmailInput.args = {
  label: "Email Input",
  type: "email",
  placeholder: "Enter email",
};

export const PasswordInput = Template.bind({});
PasswordInput.args = {
  label: "Password Input",
  type: "password",
  placeholder: "Enter password",
};

export const SearchInput = Template.bind({});
SearchInput.args = {
  label: "Search Input",
  type: "search",
  placeholder: "Search...",
};

export const InputWithError = Template.bind({});
InputWithError.args = {
  label: "Input with Error",
  type: "text",
  placeholder: "Enter text",
  error: "This field is required",
};

export const DisabledInput = Template.bind({});
DisabledInput.args = {
  label: "Disabled Input",
  type: "text",
  placeholder: "This input is disabled",
  disabled: true,
};
