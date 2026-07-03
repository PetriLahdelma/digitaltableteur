import contract from "./TransformingActionInput.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import TransformingActionInput from "@dt/TransformingActionInput";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta: Meta<typeof TransformingActionInput> = {
  argTypes: {},
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
  args: { initialMode: "input", defaultValue: "Intent prompt" },
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

export const Playground = Default;
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
