import React from "react";
import Skeleton from "./Skeleton";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: { variant: "text", lines: 4, animate: true },
};
export const Card: Story = { args: { variant: "card" } };
export const Avatar: Story = { args: { variant: "avatar" } };
export const Circle: Story = { args: { variant: "circle" } };
export const Rect: Story = { args: { variant: "rect", height: 100 } };

export const Static: Story = {
  args: { variant: "text", animate: false, lines: 3 },
};

export const Animated: Story = {
  args: { variant: "text", animate: true, lines: 3 },
};

export const DebugAnimation: Story = {
  args: { variant: "text", animate: true, lines: 1, width: "300px" },
  parameters: {
    docs: {
      description: {
        story: "Single line skeleton to easily see animation shimmer effect",
      },
    },
  },
};
