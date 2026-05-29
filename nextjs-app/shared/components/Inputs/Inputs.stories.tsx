import contract from "./Inputs.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import Inputs from "@dt/Inputs";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import TextArea from "@dt/Inputs/TextArea";
const meta = {
  title: "Atoms/Inputs",
  component: Inputs,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size token (v1.1.0+)",
      table: { defaultValue: { summary: "md" } },
    },

    type: {
      control: {
        type: "select",
        options: ["text", "number", "email", "password", "search", "tel"],
      },
      description: "HTML input type",
      table: { defaultValue: { summary: "text" } },
    },

    label: { control: "text", description: "Visible field label" },

    placeholder: { control: "text", description: "Placeholder text" },

    error: { control: "text", description: "Validation error message" },

    helperText: { control: "text", description: "Helper copy below the field" },

    isDisabled: {
      control: "boolean",
      description: "Disables the input",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof Inputs>;

export default meta;
type Story = StoryObj<typeof meta>;

const InputStory: React.FC<React.ComponentProps<typeof Inputs>> = (args) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: "var(--size-width-md)" }}>
      <Inputs
        {...args}
        label={t(args.label as string)}
        placeholder={
          args.placeholder ? t(args.placeholder as string) : undefined
        }
        error={args.error ? t(args.error) : undefined}
        helperText={args.helperText ? t(args.helperText as string) : undefined}
      />
    </div>
  );
};

const Template: StoryFn<typeof Inputs> = (args) => <InputStory {...args} />;

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
  isDisabled: true,
};

export const Default = TextInput;
export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: () => <InputStory {...TextInput.args} />,
};
export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <InputStory {...InputWithError.args} />,
};
export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <InputStory {...TextInput.args} />,
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

const TextAreaTemplate: StoryFn<typeof TextArea> = (args) => (
  <TextAreaStory {...args} />
);

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
