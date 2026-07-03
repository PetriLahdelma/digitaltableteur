import contract from "./Accordion.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Accordion from "./Accordion";
import { userEvent, waitFor, within } from "storybook/test";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const meta: Meta<typeof Accordion> = {
  title: "Layout/Accordion",
  component: Accordion,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=381-17",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Accordion sections (id, title, content)",
    },

    defaultOpenId: {
      control: "text",
      description: "Initially expanded item id",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: {
    items: [
      {
        id: "one",
        title: "What is Digitaltableteur?",
        content: "We are a design and engineering studio.",
      },
      {
        id: "two",
        title: "Do you work with AI?",
        content: "Yes, responsibly—with human oversight.",
      },
      {
        id: "three",
        title: "How can I contact you?",
        content: "Email mail@digitaltableteur.com.",
      },
    ],
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Click first accordion item to expand
  const firstButton = canvas.getByRole("button", {
    name: /what is digitaltableteur/i,
  });
  await userEvent.click(firstButton);

  // Wait for content to appear
  await waitFor(() => {
    const content = canvas.queryByText(/design and engineering studio/i);
    return content !== null;
  });

  // Click second accordion item
  const secondButton = canvas.getByRole("button", {
    name: /do you work with ai/i,
  });
  await userEvent.click(secondButton);

  // Wait for second content
  await waitFor(() => {
    const content = canvas.queryByText(/responsibly/i);
    return content !== null;
  });
};

const defaultItems = Default.args?.items ?? [];

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: { items: defaultItems },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { items: defaultItems },
};
