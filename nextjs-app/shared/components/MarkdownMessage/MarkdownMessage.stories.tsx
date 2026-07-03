import contract from "./MarkdownMessage.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MarkdownMessage from "@dt/MarkdownMessage";

const meta: Meta<typeof MarkdownMessage> = {
  argTypes: {
    density: {
      control: "select",
      options: ["default", "chat"],
      description:
        "Typography density for chat bubbles vs default markdown blocks",
      table: { defaultValue: { summary: "default" } },
    },
  },
  title: "Site/Chat/MarkdownMessage",
  component: MarkdownMessage,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-markdown-message",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
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
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
