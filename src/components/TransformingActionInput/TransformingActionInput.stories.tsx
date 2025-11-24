import type { Meta, StoryObj } from "@storybook/react";
import TransformingActionInput from "./TransformingActionInput";

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
};

export const StartAsInput: Story = {
  args: {
    initialMode: "input",
    defaultValue: "Intent prompt",
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
