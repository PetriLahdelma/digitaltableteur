import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import Button from "@dt/Button";
import { ConfirmPopover } from "./ConfirmPopover";
import contract from "./ConfirmPopover.contract.json";

/* The production use: clearing the answers on one intake screen. */
const meta = {
  title: "Overlay/ConfirmPopover",
  component: ConfirmPopover,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: {
    title: "Clear the answers in this section?",
    description: "Everything you entered on this screen is removed. This cannot be undone.",
    confirmLabel: "Clear answers",
    tone: "error",
    onConfirm: () => {},
    children: <Button variant="tertiary">Clear answers</Button>,
  },
  argTypes: {
    children: { table: { disable: true } },
    onConfirm: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
  },
} satisfies Meta<typeof ConfirmPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Opens next to the trigger with focus on Cancel; Escape cancels and focus returns.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clear answers" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Clear the answers in this section?",
    });
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "Clear answers" })).toHaveFocus();
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
