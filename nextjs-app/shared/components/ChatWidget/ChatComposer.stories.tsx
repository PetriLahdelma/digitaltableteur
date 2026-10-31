import React, { useState } from "react";
import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";
import ChatComposer from "./ChatComposer";
import Icon from "@dt/Icon";
import { expect, userEvent, waitFor, within } from "storybook/test";

const noop = () => {};

const meta: Meta<typeof ChatComposer> = {
  title: "Site/Chat/ChatComposer",
  component: ChatComposer,
  tags: ["autodocs"],
  args: {
    inputId: "donny-input",
    placeholder: "Ask about open hours, service, or approach…",
    isSending: false,
    onSubmit: noop,
    maxLength: 1_000,
    footer: (
      <>
        Answers draw on site content and may be wrong.{" "}
        <a href="/ai-use">About this AI</a>
      </>
    ),
  },
  argTypes: {
    footer: { table: { disable: true } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ChatComposer>;

const InteractiveRender: React.FC<React.ComponentProps<typeof ChatComposer>> = (
  args,
) => {
  const [value, setValue] = useState("");
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
};

export const Interactive: Story = {
  tags: ["beta-matrix"],
  render: (args) => <InteractiveRender {...args} />,
  parameters: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Hello, how can I help?");
    expect(textarea).toHaveValue("Hello, how can I help?");

    const sendButton = canvas.getByRole("button", { name: /send/i });
    await userEvent.click(sendButton);
  },
};

export const SendingState: Story = {
  render: (args) => (
    <ChatComposer {...args} value="" onValueChange={() => {}} />
  ),
  args: { isSending: true },
};

