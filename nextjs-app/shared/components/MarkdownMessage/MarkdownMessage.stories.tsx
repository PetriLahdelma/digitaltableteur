import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MarkdownMessage from "@dt/MarkdownMessage";

const meta: Meta<typeof MarkdownMessage> = {
  title: "Components/AI/Chat/MarkdownMessage",
  component: MarkdownMessage,
  tags: ["autodocs"],
  args: {
    content:
      "# Heading\n\nSome **bold** text, _italics_, and a list:\n\n- Item one\n- Item two\n\n`inline code`\n\n```js\nconsole.log('block code');\n```\n\n> Blockquote example\n\nA table:\n\n| Col A | Col B |\n|-------|-------|\n| 1     | 2     |\n| 3     | 4     |\n",
  },
};

export default meta;

type Story = StoryObj<typeof MarkdownMessage>;

export const Default: Story = {};

export const Fallback: Story = {
  args: {
    content: "",
    fallback: "Thinking…",
    "data-role": "assistant" as const,
  },
};

export const LinkAndImage: Story = {
  args: {
    content:
      "Here is a [link](https://example.com) and an image placeholder!\n\n![Alt text](https://via.placeholder.com/100)",
  },
};
