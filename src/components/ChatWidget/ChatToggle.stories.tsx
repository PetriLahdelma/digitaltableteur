import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatToggle from "./ChatToggle";

const meta: Meta<typeof ChatToggle> = {
  title: "AI/Chat/ChatToggle",
  component: ChatToggle,
  args: {
    isOpen: false,
  },
};

export default meta;

type Story = StoryObj<typeof ChatToggle>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);
    return (
      <ChatToggle
        {...args}
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      />
    );
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
  },
};
