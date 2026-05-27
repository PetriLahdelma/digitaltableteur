import contract from "./AdaptiveLoadingButton.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import AdaptiveLoadingButton from "@dt/AdaptiveLoadingButton";
import { expect, userEvent, within } from "storybook/test";

const meta: Meta<typeof AdaptiveLoadingButton> = {
  argTypes: {},
  title: "Molecules/AdaptiveLoadingButton",
  component: AdaptiveLoadingButton,
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  tags: ["!autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdaptiveLoadingButton>;

export const Idle: Story = {
  args: { children: "Submit", variant: "primary" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /submit/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
  },
};

export const Loading: Story = {
  args: { children: "Saving", loading: true, variant: "primary" },
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
  args: { children: "Disabled", disabled: true },
};

export const Default = {};
export const Playground = {};
export const Example = { parameters: { controls: { disable: true } } };
export const ForcedColors = { globals: { forcedColors: "active" } };
