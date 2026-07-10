import contract from "./TextArea.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import TextArea from "@dt/TextArea";
import { useTranslation } from "react-i18next";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Forms/TextArea",
  component: TextArea,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=374-17",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // rows is a native passthrough (not on the contract) so it keeps a bespoke knob.
  argTypes: {
    rows: {
      control: { type: "number", min: 2, max: 20 },
      description: "Static row count (ignored when animateResize is on)",
      table: { defaultValue: { summary: "4" }, category: "Appearance" },
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

export const WithHelperCopy = Template.bind({});
WithHelperCopy.args = {
  label: "storyTextAreaLabel",
  placeholder: "storyTextAreaPlaceholder",
  rows: 4,
  helperText: "Keep it under 500 characters.",
};
WithHelperCopy.tags = ["example"];
WithHelperCopy.parameters = {
  docs: {
    description: {
      story: "Label, control, and helper text; rows sets the resting height and the hint states expectations up front.",
    },
  },
};

export const WithError = Template.bind({});
WithError.args = {
  label: "storyTextAreaErrorLabel",
  placeholder: "storyTextAreaPlaceholder",
  error: "storyTextAreaErrorText",
  rows: 4,
};

WithError.tags = ["example"];
WithError.parameters = {
  docs: {
    description: {
      story: "error replaces the helper line, sets aria-invalid, and announces via role=alert.",
    },
  },
};

export const AnimatedResize = Template.bind({});
AnimatedResize.args = {
  label: "storyTextAreaLabel",
  placeholder: "storyTextAreaPlaceholder",
  animateResize: true,
  minRows: 2,
  maxRows: 6,
};

AnimatedResize.tags = ["example"];
AnimatedResize.parameters = {
  docs: {
    description: {
      story: "animateResize grows the field smoothly with content, bounded by minRows and maxRows.",
    },
  },
};

/**
 * Keyboard contract, asserted by the play function: Tab moves focus into the
 * field and typed characters land in the value.
 */
export const KeyboardEntry: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The field is a native textarea: Tab focuses it and typing updates the value; onChange receives the raw string.",
      },
    },
  },
  render: () => <TextAreaStory {...Default.args} />,
  play: async ({ canvasElement }) => {
    const textbox = within(canvasElement).getByRole("textbox");
    await userEvent.tab();
    await expect(textbox).toHaveFocus();
    await userEvent.type(textbox, "Hello from the keyboard");
    await expect(textbox).toHaveValue("Hello from the keyboard");
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  // Animated defaults with overflowing content so minRows/maxRows visibly
  // drive the canvas (they only apply while animateResize is on).
  args: {
    label: "storyTextAreaLabel",
    placeholder: "storyTextAreaPlaceholder",
    animateResize: true,
    minRows: 3,
    maxRows: 6,
    value: Array.from({ length: 10 }, (_, i) => `Line ${i + 1}`).join("\n"),
  },
  render: (args) => <TextAreaStory {...args} />,
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
