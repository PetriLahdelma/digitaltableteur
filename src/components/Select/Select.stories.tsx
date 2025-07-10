import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Select from "./Select";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

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

const SelectStory: React.FC<React.ComponentProps<typeof Select>> = (args) => {
  const { t } = useTranslation();
  const translatedOptions = args.options?.map((o) => ({
    ...o,
    label: t(o.label as string),
  }));
  return (
    <div style={{ maxWidth: "var(--size-width-md)" }}>
      <Select
        {...args}
        label={t(args.label as string)}
        options={translatedOptions}
      />
    </div>
  );
};

const Template: StoryFn<typeof Select> = (
  args: React.ComponentProps<typeof Select>,
) => <SelectStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "storySelectLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
  ],
  value: "option1",
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "storySelectDisabledLabel",
  options: [
    { value: "option1", label: "storyCheckboxOption1" },
    { value: "option2", label: "storyCheckboxOption2" },
    { value: "option3", label: "storyCheckboxOption3" },
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
