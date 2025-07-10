import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/testing-library";
import Label from "./Label";
import { useTranslation } from "react-i18next";

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

const LabelStory: React.FC<React.ComponentProps<typeof Label>> = (args) => {
  const { t } = useTranslation();
  return <Label {...args}>{t(args.children as string)}</Label>;
};

const Template: StoryFn<typeof Label> = (
  args: React.ComponentProps<typeof Label>,
) => <LabelStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  htmlFor: "input-id",
  children: "storyLabelDefault",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  htmlFor: "input-id",
  children: "storyLabelWithTooltip",
  title: "storyLabelTooltip",
};

export const Required = Template.bind({});
Required.args = {
  htmlFor: "input-id",
  children: "storyLabelRequired",
  required: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  htmlFor: "input-id",
  children: "storyLabelDisabled",
  disabled: true,
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/default label/i);
};

WithTooltip.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const label = await canvas.findByText(/label with tooltip/i);
  await userEvent.hover(label);
  // Optionally, check for tooltip appearance if implemented
};

Required.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/required label/i);
};

Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const label = await canvas.findByText(/disabled label/i);
  // Optionally, check for disabled state if implemented
};
