import contract from "./TextArea.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import TextArea from "@dt/TextArea";
import { useTranslation } from "react-i18next";

const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=374-17",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    label: { control: "text", description: "Visible field label" },
    placeholder: { control: "text", description: "Placeholder text" },
    error: { control: "text", description: "Validation error message" },
    helperText: { control: "text", description: "Helper copy below the field" },
    rows: {
      control: { type: "number", min: 2, max: 20 },
      description: "Static row count (ignored when animateResize is on)",
      table: { defaultValue: { summary: "4" } },
    },
    animateResize: {
      control: "boolean",
      description: "Enable smooth animated auto-growing",
      table: { defaultValue: { summary: "false" } },
    },
    minRows: {
      control: { type: "number", min: 1, max: 10 },
      description: "Minimum rows when animateResize is enabled",
      table: { defaultValue: { summary: "2" } },
    },
    maxRows: {
      control: { type: "number", min: 1, max: 20 },
      description: "Maximum rows when animateResize is enabled",
      table: { defaultValue: { summary: "10" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables the textarea",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

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
        helperText={
          args.helperText ? t(args.helperText as string) : undefined
        }
      />
    </div>
  );
};

const Template: StoryFn<typeof TextArea> = (args) => (
  <TextAreaStory {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: "storyTextAreaLabel",
  placeholder: "storyTextAreaPlaceholder",
  rows: 4,
};

export const WithError = Template.bind({});
WithError.args = {
  label: "storyTextAreaErrorLabel",
  placeholder: "storyTextAreaPlaceholder",
  error: "storyTextAreaErrorText",
  rows: 4,
};

export const AnimatedResize = Template.bind({});
AnimatedResize.args = {
  label: "storyTextAreaLabel",
  placeholder: "storyTextAreaPlaceholder",
  animateResize: true,
  minRows: 2,
  maxRows: 6,
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: () => <TextAreaStory {...Default.args} />,
};
export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <TextAreaStory {...WithError.args} />,
};
export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <TextAreaStory {...Default.args} />,
};
