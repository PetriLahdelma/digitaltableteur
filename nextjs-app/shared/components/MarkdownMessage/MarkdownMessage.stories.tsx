import contract from "./MarkdownMessage.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MarkdownMessage from "@dt/MarkdownMessage";

const meta: Meta<typeof MarkdownMessage> = {
  argTypes: {},
  title: "Molecules/Chat/MarkdownMessage",
  component: MarkdownMessage,
  tags: ["beta", "!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  args: {
    content:
      "# Heading\n\nSome **bold** text, _italics_, and a list:\n\n- Item one\n- Item two\n\n`inline code`\n\n```js\nconsole.log('block code');\n```\n\n> Blockquote example\n\nA table:\n\n| Col A | Col B |\n|-------|-------|\n| 1     | 2     |\n| 3     | 4     |\n",
  },
};

export default meta;

type Story = StoryObj<typeof MarkdownMessage>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

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

export const Playground = Default;
export const Example = {
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = { globals: { forcedColors: "active" }, ...Default };
