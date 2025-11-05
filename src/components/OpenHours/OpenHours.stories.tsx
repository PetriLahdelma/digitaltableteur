import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import OpenHours from "./OpenHours";

const meta: Meta<typeof OpenHours> = {
  title: "Info/OpenHours",
  component: OpenHours,
  args: {},
};
export default meta;

type Story = StoryObj<typeof OpenHours>;

export const Default: Story = {
  args: {},
};

export const Compact: Story = {
  args: { compact: true },
};

export const TodayOnly: Story = {
  args: { showAllDays: false },
};

export const InjectedDate: Story = {
  args: { date: new Date("2025-11-01T10:30:00") },
  parameters: {
    docs: {
      description: {
        story: "Shows Saturday closed state based on injected date.",
      },
    },
  },
};
