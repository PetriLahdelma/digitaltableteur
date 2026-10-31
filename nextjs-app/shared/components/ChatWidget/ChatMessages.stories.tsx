import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UIMessage } from "ai";
import Icon from "@dt/Icon";
import ChatMessages from "./ChatMessages";
import { expect, waitFor, within } from "storybook/test";

const SAMPLE_MESSAGES: UIMessage[] = [
  {
    id: "intro",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! I'm Donny, the Digitaltableteur studio guide. Feel free to ask about our work or anything you notice on the site.",
      },
    ],
  },
  {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text: "What services do you offer?" }],
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

const LONG_CONVERSATION: UIMessage[] = [
  ...SAMPLE_MESSAGES,
  {
    id: "user-2",
    role: "user",
    parts: [
      { type: "text", text: "Can you tell me more about your design process?" },
    ],
  },
  {
    id: "assistant-2",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Our design process is collaborative and iterative. We start with discovery workshops to understand your goals, then move through wireframing, prototyping, and user testing before final implementation.",
      },
    ],
  },
  {
    id: "user-3",
    role: "user",
    parts: [{ type: "text", text: "What technologies do you work with?" }],
  },
  {
    id: "assistant-3",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "We specialize in modern web technologies including React, TypeScript, Next.js, and cutting-edge CSS. We also work with headless CMS solutions and serverless architectures.",
      },
    ],
  },
];

const meta: Meta<typeof ChatMessages> = {
  title: "Site/Chat/ChatMessages",
  component: ChatMessages,
  tags: ["autodocs"],
  args: { messages: SAMPLE_MESSAGES },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessages>;

export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/I'm Donny, the Digitaltableteur/i)).toBeInTheDocument();
      expect(
        canvas.getByText(/What services do you offer/i),
      ).toBeInTheDocument();
    });
  },
};

export const LongConversation: Story = {
  args: { messages: LONG_CONVERSATION },
};

export const Streaming: Story = {
  args: { messages: SAMPLE_MESSAGES, isStreaming: true },
};

export const EmptyState: Story = {
  args: { messages: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const messages = canvas.queryAllByRole("article");
      expect(messages.length).toBe(0);
    });
  },
};
