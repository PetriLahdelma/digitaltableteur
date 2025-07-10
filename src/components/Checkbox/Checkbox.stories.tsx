import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/testing-library";
import Checkbox, { CheckboxProps } from "./Checkbox";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
} as Meta<CheckboxProps>;

const StoryLabel = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn<CheckboxProps> = (args: CheckboxProps) => (
  <Checkbox {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: <StoryLabel tKey="storyCheckboxDefault" />,
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const checkbox = await canvas.findByLabelText(/default checkbox/i);
  await userEvent.click(checkbox);
};

export const Checked = Template.bind({});
Checked.args = {
  label: <StoryLabel tKey="storyCheckboxChecked" />,
  checked: true,
};
Checked.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/checked checkbox/i);
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  label: <StoryLabel tKey="storyCheckboxIndeterminate" />,
  checked: false,
  indeterminate: true,
};
Indeterminate.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/indeterminate checkbox/i);
};
