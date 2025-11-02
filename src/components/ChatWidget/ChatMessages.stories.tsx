import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatMessages from "./ChatMessages";
import type { Message } from "./ChatWidget.types";

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "intro",
    role: "assistant",
    content:
      "Hi! I’m Donny, the Digitaltableteur studio guide. Ask me about our work, services, or anything you see on the site.",
  },
  {
    id: "user-1",
    role: "user",
    content: "What services do you offer?",
  },
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "We blend strategic design, development, and content craft to ship end-to-end brand and digital experiences.",
  },
];

const meta: Meta<typeof ChatMessages> = {
  title: "AI/Chat/ChatMessages",
  component: ChatMessages,
  args: {
    messages: SAMPLE_MESSAGES,
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessages>;

export const Default: Story = {};
