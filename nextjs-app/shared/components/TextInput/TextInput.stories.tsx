import contract from "./TextInput.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import TextInput from "@dt/TextInput";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";
const meta = {
  title: "Atoms/TextInput",
  component: TextInput,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=374-10",
    },
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
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const InputStory: React.FC<React.ComponentProps<typeof TextInput>> = (args) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: "var(--size-width-md)" }}>
      <TextInput
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

const Template: StoryFn<typeof TextInput> = (args) => <InputStory {...args} />;

export const TextInputStory = Template.bind({});
TextInputStory.args = {
  label: "storyInputTextLabel",
  type: "text",
  placeholder: "storyInputTextPlaceholder",
};
TextInputStory.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
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

export const Default = TextInputStory;
export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: () => <InputStory {...TextInputStory.args} />,
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
  render: () => <InputStory {...TextInputStory.args} />,
};
