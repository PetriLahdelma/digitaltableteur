import contract from "./TransformingActionInput.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import TransformingActionInput from "@dt/TransformingActionInput";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta: Meta<typeof TransformingActionInput> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/TransformingActionInput",
  component: TransformingActionInput,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-transforming-action-input",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["beta", "!autodocs"],
};

export default meta;
type Story = StoryObj<typeof TransformingActionInput>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      const input = canvas.queryByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  },
};

export const StartAsInput: Story = {
  // value: undefined un-seeds the autogen's value:"" — `value` is the
  // CONTROLLED prop, and a seeded "" locks the input to controlled-empty
  // (defaultValue ignored, typing dead).
  args: { initialMode: "input", defaultValue: "Intent prompt", value: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toHaveValue("Intent prompt");

    await userEvent.clear(input);
    await userEvent.type(input, "New text");
    expect(input).toHaveValue("New text");
  },
};

export const WithHelper: Story = {
  args: { helperTextKey: "transformingActionInput.helper" },
};

export const Disabled: Story = { args: { disabled: true } };

// Args-driven with a remount key: initialMode and defaultValue seed useState,
// so keying the render on them makes those controls drive the canvas. Seeded
// into INPUT mode so the richer branch (label + placeholder + helper) renders
// and those *Key text controls are effective. Real i18n keys seeded so they
// show meaningful labels (a perturbed missing key falls back to the raw key
// string — a visible change). actionLabelKey renders only in the button branch
// and value/defaultValue are the input value PROPERTY — all effect-exempt.
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => (
    <TransformingActionInput
      key={`${args.initialMode}-${args.defaultValue}`}
      {...args}
    />
  ),
  args: {
    initialMode: "input",
    actionLabelKey: "transformingActionInput.trigger",
    inputLabelKey: "transformingActionInput.inputLabel",
    placeholderKey: "transformingActionInput.placeholder",
    helperTextKey: "transformingActionInput.helper",
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
