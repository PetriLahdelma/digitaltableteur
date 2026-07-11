import contract from "./TextInput.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import TextInput from "@dt/TextInput";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";
const meta = {
  title: "Forms/TextInput",
  component: TextInput,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=374-10",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
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

TextInputStory.tags = ["example"];
TextInputStory.parameters = {
  docs: {
    description: {
      story: "The base field: label, control, and helper text in one component.",
    },
  },
};

export const EmailInput = Template.bind({});
EmailInput.args = {
  label: "storyInputEmailLabel",
  type: "email",
  placeholder: "storyInputEmailPlaceholder",
};

EmailInput.tags = ["example"];
EmailInput.parameters = {
  docs: {
    description: {
      story:
        "type=email validates as you type and suggests fixes for common domain typos (gamil.com and friends).",
    },
  },
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

InputWithError.tags = ["example"];
InputWithError.parameters = {
  docs: {
    description: {
      story:
        "error renders above the helper line, sets aria-invalid, and announces via role=alert.",
    },
  },
};

export const DisabledInput = Template.bind({});
DisabledInput.args = {
  label: "storyInputDisabledLabel",
  type: "text",
  placeholder: "storyInputDisabledPlaceholder",
  disabled: true,
};

export const Clearable: Story = {
  tags: ["beta-matrix"],
  args: {
    label: "storyInputTextLabel",
    type: "text",
    placeholder: "storyInputTextPlaceholder",
    clearable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "clearable renders a labelled ×-button inside the field while it has a value; activating it empties the field, fires onValueChange('') + onClear, and returns focus to the input.",
      },
    },
  },
  render: (args) => <InputStory {...args} />,
  // Play types but never clears: the settled state must keep the clear
  // button visible so AT capture records it in the accessibility tree.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText(/text input/i);
    await userEvent.type(input, "Hello");
    await canvas.findByRole("button", { name: /clear/i });
  },
};

export const Default = TextInputStory;
export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: {
    label: "storyInputTextLabel",
    type: "text",
    placeholder: "storyInputTextPlaceholder",
  },
  // defaultValue is consumed once at mount — remount on change so the control drives the canvas.
  render: (args) => (
    <InputStory key={`remount-${args.defaultValue ?? ""}`} {...args} />
  ),
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
