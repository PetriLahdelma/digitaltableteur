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
    arrow: false,
    shortcut: [],
    onConfirm: () => {},
    children: <Button variant="tertiary">Clear answers</Button>,
  },
  argTypes: {
    children: { table: { disable: true } },
    onConfirm: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    choices: { table: { disable: true } },
    arrow: {
      control: "boolean",
      description: "Pointer from the popover's edge to the trigger, like a speech bubble",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    shortcut: {
      control: { type: "inline-check" },
      options: ["⌘", "⇧", "⌥", "⌃", "⌫", "↵", "K"],
      description: "Keys that run the action without the popover, shown under the description",
      table: { category: "Content", defaultValue: { summary: "none" } },
    },
  },
} satisfies Meta<typeof ConfirmPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
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

export const WithChoices: Story = {
  args: {
    title: "What do you want to clear?",
    description: "",
    choices: [
      {
        id: "section",
        label: "Clear this section",
        title: "Clear the answers in this section?",
        description: "Everything you entered on this screen is removed. This cannot be undone.",
        confirmLabel: "Clear this section",
      },
      {
        id: "all",
        label: "Clear all",
        title: "Clear every answer in the form?",
        description: "Every part of the form starts empty again. This cannot be undone.",
        confirmLabel: "Clear all answers",
      },
    ],
    children: <Button variant="tertiary">Clear</Button>,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Pick an action first, then confirm it; Cancel closes from either step.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await screen.findByRole("alertdialog", { name: "What do you want to clear?" });
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Clear every answer in the form?",
    });
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
};

/* The chat's New chat button: opens to the left with a pointer and names the
   shortcut that skips the question next time. */
export const WithArrowAndShortcut: Story = {
  args: {
    title: "Start a new chat?",
    description: "This conversation will be cleared.",
    confirmLabel: "New chat",
    tone: "neutral",
    side: "left",
    arrow: true,
    shortcut: ["⌘", "⇧", "⌫"],
    children: <Button variant="tertiary">New chat</Button>,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "arrow draws a pointer to the trigger; shortcut shows the keys that run the action without asking.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "New chat" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Start a new chat?" });
    await expect(dialog.querySelectorAll("kbd")).toHaveLength(3);
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
