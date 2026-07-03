import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatToggle from "./ChatToggle";

const meta: Meta<typeof ChatToggle> = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
  },
  title: "Site/Chat/ChatToggle",
  component: ChatToggle,
  tags: ["autodocs"],
  args: { isOpen: false },
};

export default meta;

type Story = StoryObj<typeof ChatToggle>;

const ToggleRender: React.FC<React.ComponentProps<typeof ChatToggle>> = (
  args,
) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  return (
    <ChatToggle
      {...args}
      isOpen={isOpen}
      onToggle={() => setIsOpen((prev) => !prev)}
    />
  );
};

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <ToggleRender {...args} />,
};

export const Open: Story = { args: { isOpen: true } };
