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
        text: "Hi! I’m Donny, the Digitaltableteur studio guide. Feel free to ask about our work or anything you notice on the site.",
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
  title: "Components/AI/Chat/ChatMessages",
  component: ChatMessages,
  args: {
    messages: SAMPLE_MESSAGES,
    isStreaming: false,
    emailWorkflow: { step: "idle" },
    dispatchEmailWorkflow: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessages>;

export const Default: Story = {};
