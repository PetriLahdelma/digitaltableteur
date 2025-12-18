import type { Meta, StoryObj } from "@storybook/react";
import AdaptiveLoadingButton from "@dt/AdaptiveLoadingButton";
import { within, userEvent } from "@storybook/testing-library";

declare const expect: (typeof import("vitest"))["expect"];

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /submit/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
  },
};

export const Loading: Story = {
  args: {
    children: "Saving",
    loading: true,
    variant: "primary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/working/i);
  },
};

export const WithProgress: Story = {
  args: {
    children: "Generating",
    loading: true,
    progress: 42,
    variant: "secondary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/42%/i);
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
