import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UIMessage } from "ai";
import ChatMessages from "./ChatMessages";

const SAMPLE_MESSAGES: UIMessage[] = [
  {
    id: "intro",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! I’m Donny, the Digitaltableteur studio guide. Ask me about our work, services, or anything you see on the site.",
      },
    ],
  },
  {
    id: "user-1",
    role: "user",
    parts: [
      {
        type: "text",
        text: "What services do you offer?",
      },
    ],
  },
  {
    id: "assistant-1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "We blend strategic design, development, and content craft to ship end-to-end brand and digital experiences.",
      },
    ],
  },
];

const meta: Meta<typeof ChatMessages> = {
  title: "AI/Chat/ChatMessages",
  component: ChatMessages,
  args: {
    messages: SAMPLE_MESSAGES,
    isStreaming: false,
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessages>;

export const Default: Story = {};
