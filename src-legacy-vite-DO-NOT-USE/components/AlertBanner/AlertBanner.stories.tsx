import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import AlertBanner from "./AlertBanner";

const meta: Meta<typeof AlertBanner> = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Info: Story = {
  args: {
    tone: "info",
    title: "Heads up",
    description: "This is an informational message.",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Check details",
    description: "There might be something you need to review.",
  },
};

export const Dismissible: Story = {
  args: {
    tone: "success",
    title: "Saved",
    description: "Your changes have been stored.",
    dismissible: true,
  },
};
