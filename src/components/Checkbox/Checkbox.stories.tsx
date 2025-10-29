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

const Template: StoryFn<CheckboxProps> = (args: CheckboxProps) => {
  // If label is provided as a translation key string, render via StoryLabel
  const label =
    typeof args.label === "string" ? (
      <StoryLabel tKey={args.label} />
    ) : (
      args.label
    );

  return <Checkbox {...args} label={label as any} />;
};

export const Default = Template.bind({});
Default.args = {
  label: "Default checkbox",
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const checkbox = await canvas.findByLabelText(/default checkbox/i);
  await userEvent.click(checkbox);
};

export const Checked = Template.bind({});
Checked.args = {
  label: "Checked checkbox",
  checked: true,
};
Checked.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(/checked checkbox/i);
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  label: "Indeterminate checkbox",
  // Indeterminate means neither checked nor unchecked visually.
  // Keep checked false and set indeterminate true so CSS shows the indeterminate variant.
  checked: false,
  indeterminate: true,
};
Indeterminate.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  // Just ensure the indeterminate checkbox renders; don't click it here so it stays indeterminate
  await canvas.findByLabelText(/indeterminate checkbox/i);
};
