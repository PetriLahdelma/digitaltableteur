import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Input from "./Inputs";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

import TextArea from "./TextArea";

export default {
  title: "Components/Inputs",
  component: Input,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: ["text", "number", "email", "password", "search", "tel"],
      },
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    options: { control: { type: "object" } }, // Fix type mismatch
  },
} as Meta;

const InputStory: React.FC<React.ComponentProps<typeof Input>> = (args) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: "var(--size-width-md)" }}>
      <Input
        {...args}
        label={t(args.label as string)}
        placeholder={t(args.placeholder as string)}
        error={args.error ? t(args.error) : undefined}
      />
    </div>
  );
};

const Template: StoryFn<typeof Input> = (
  args: React.ComponentProps<typeof Input>,
) => <InputStory {...args} />;

export const TextInput = Template.bind({});
TextInput.args = {
  label: "storyInputTextLabel",
  type: "text",
  placeholder: "storyInputTextPlaceholder",
};
TextInput.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText(/text input/i);
  await userEvent.type(input, "Hello");
};

export const NumberInput = Template.bind({});
NumberInput.args = {
  label: "storyInputNumberLabel",
  type: "number",
  placeholder: "storyInputNumberPlaceholder",
};

export const EmailInput = Template.bind({});
EmailInput.args = {
  label: "storyInputEmailLabel",
  type: "email",
  placeholder: "storyInputEmailPlaceholder",
};

export const PasswordInput = Template.bind({});
PasswordInput.args = {
  label: "storyInputPasswordLabel",
  type: "password",
  placeholder: "storyInputPasswordPlaceholder",
};

export const SearchInput = Template.bind({});
SearchInput.args = {
  label: "storyInputSearchLabel",
  type: "search",
  placeholder: "storyInputSearchPlaceholder",
};

export const PhoneInput = Template.bind({});
PhoneInput.args = {
  label: "storyInputPhoneLabel",
  type: "tel",
  placeholder: "storyInputPhonePlaceholder",
};
PhoneInput.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText(/phone input/i);
  await userEvent.type(input, "+358456574469");
};

export const InputWithError = Template.bind({});
InputWithError.args = {
  label: "storyInputErrorLabel",
  type: "text",
  placeholder: "storyInputTextPlaceholder",
  error: "storyInputErrorText",
};

export const DisabledInput = Template.bind({});
DisabledInput.args = {
  label: "storyInputDisabledLabel",
  type: "text",
  placeholder: "storyInputDisabledPlaceholder",
  disabled: true,
};

const TextAreaStory: React.FC<React.ComponentProps<typeof TextArea>> = (
  args,
) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: "var(--size-width-md)" }}>
      <TextArea
        {...args}
        label={t(args.label as string)}
        placeholder={
          args.placeholder ? t(args.placeholder as string) : undefined
        }
        error={args.error ? t(args.error) : undefined}
      />
    </div>
  );
};

const TextAreaTemplate: StoryFn<typeof TextArea> = (
  args: React.ComponentProps<typeof TextArea>,
) => <TextAreaStory {...args} />;

export const DefaultTextArea = TextAreaTemplate.bind({});
DefaultTextArea.args = {
  label: "storyTextAreaLabel",
  placeholder: "storyTextAreaPlaceholder",
  rows: 4,
};

export const TextAreaWithError = TextAreaTemplate.bind({});
TextAreaWithError.args = {
  label: "storyTextAreaErrorLabel",
  placeholder: "storyTextAreaPlaceholder",
  error: "storyTextAreaErrorText",
  rows: 4,
};
