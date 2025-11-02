import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatComposer from "./ChatComposer";

const noop = () => {};

const meta: Meta<typeof ChatComposer> = {
  title: "AI/Chat/ChatComposer",
  component: ChatComposer,
  args: {
    inputId: "donny-input",
    placeholder: "Ask about a project, service, or approach…",
    isSending: false,
    onSubmit: noop,
    maxLength: 1_000,
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ChatComposer>;

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("How can Donny help today?");
    return (
      <ChatComposer
        {...args}
        value={value}
        onValueChange={setValue}
        onSubmit={(event) => {
          event.preventDefault();
          args.onSubmit?.(event);
        }}
      />
    );
  },
};

export const SendingState: Story = {
  render: (args) => (
    <ChatComposer {...args} value="" onValueChange={() => {}} />
  ),
  args: {
    isSending: true,
  },
};
