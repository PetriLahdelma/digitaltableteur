import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import ChatHeader from "./ChatHeader";

const meta: Meta<typeof ChatHeader> = {
  title: "AI/Chat/ChatHeader",
  component: ChatHeader,
  args: {
    title: "Chat with Donny",
    description: "Brand-specific answers, no fluff.",
    onReset: fn(),
    onMinimize: fn(),
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
