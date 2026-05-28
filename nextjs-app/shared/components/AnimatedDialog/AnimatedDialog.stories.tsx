import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import {
  AnimatedDialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./AnimatedDialog";
import contract from "./AnimatedDialog.contract.json";

function AnimatedDialogDemo(
  args: React.ComponentProps<typeof AnimatedDialog>,
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <AnimatedDialog {...args} open={open} onOpenChange={setOpen}>
        {args.children}
      </AnimatedDialog>
    </>
  );
}

const dialogBody = (
  <>
    <DialogHeader>
      <DialogTitle>Archive this project?</DialogTitle>
      <DialogDescription>
        You can restore archived work from settings within 30 days.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <button type="button" className="rounded border px-3 py-1 text-sm">
          Cancel
        </button>
      </DialogClose>
      <button type="button" className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">
        Archive
      </button>
    </DialogFooter>
  </>
);

const defaultArgs = {
  size: "md" as const,
  severity: "warning" as const,
  animationType: "scale" as const,
  children: dialogBody,
};

const meta = {
  title: "Molecules/AnimatedDialog",
  component: AnimatedDialog,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    open: { control: "boolean", description: "Controlled open state" },
    onOpenChange: {
      action: "openChange",
      description: "Open state change handler",
    },
    children: { control: false, description: "Dialog body composition" },
    trigger: { control: false, description: "Optional DialogTrigger node" },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Dialog width token",
      table: { defaultValue: { summary: "md" } },
    },
    severity: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      description: "Semantic accent color",
      table: { defaultValue: { summary: "default" } },
    },
    animationType: {
      control: "select",
      options: ["scale", "slide", "fade"],
      description: "GSAP entrance animation",
      table: { defaultValue: { summary: "scale" } },
    },
    className: {
      control: "text",
      description: "Dialog content class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof AnimatedDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <AnimatedDialogDemo {...args} />,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <AnimatedDialogDemo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <AnimatedDialogDemo {...defaultArgs} />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <AnimatedDialogDemo {...args} />,
};
