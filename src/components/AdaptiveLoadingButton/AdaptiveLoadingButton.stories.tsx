import type { Meta, StoryObj } from "@storybook/react";
import AdaptiveLoadingButton from "./AdaptiveLoadingButton";

const meta: Meta<typeof AdaptiveLoadingButton> = {
  title: "Components/AdaptiveLoadingButton",
  component: AdaptiveLoadingButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdaptiveLoadingButton>;

export const Idle: Story = {
  args: {
    children: "Submit",
    variant: "primary",
  },
};

export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
    variant: "primary",
  },
};

export const WithProgress: Story = {
  args: {
    children: "Generating",
    loading: true,
    progress: 42,
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
