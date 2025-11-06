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

export const Text: Story = { args: { variant: "text", lines: 4 } };
export const Card: Story = { args: { variant: "card" } };
export const Avatar: Story = { args: { variant: "avatar" } };
export const Circle: Story = { args: { variant: "circle" } };
export const Rect: Story = { args: { variant: "rect", height: 100 } };

export const Static: Story = {
  args: { variant: "text", animate: false, lines: 3 },
};
