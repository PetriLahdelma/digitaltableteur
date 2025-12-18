import type { Meta, StoryObj } from "@storybook/react";
import TransformingActionInput from "@dt/TransformingActionInput";
import { within, userEvent, waitFor } from "@storybook/testing-library";

declare const expect: (typeof import("vitest"))["expect"];

const meta: Meta<typeof TransformingActionInput> = {
  title: "Components/TransformingActionInput",
  component: TransformingActionInput,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TransformingActionInput>;

export const Default: Story = {
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
  args: {
    initialMode: "input",
    defaultValue: "Intent prompt",
  },
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
  args: {
    helperTextKey: "transformingActionInput.helper",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
