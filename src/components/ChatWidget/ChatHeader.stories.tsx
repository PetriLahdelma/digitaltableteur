import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatHeader from "./ChatHeader";

const noop = () => {};

const meta: Meta<typeof ChatHeader> = {
  title: "AI/Chat/ChatHeader",
  component: ChatHeader,
  args: {
    title: "Chat with Donny",
    description: "DT-specific answers, no fluff.",
    onReset: noop,
    onMinimize: noop,
    isSending: false,
  },
};

export default meta;

type Story = StoryObj<typeof ChatHeader>;

export const Default: Story = {};

export const Sending: Story = {
  args: {
    isSending: true,
  },
};
